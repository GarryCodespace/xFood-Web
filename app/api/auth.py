"""
Authentication API endpoints
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, verify_token, is_refresh_token
)
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, TokenData
from app.core.deps import get_current_user

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        location=user_data.location,
        bio=user_data.bio,
        dietary_preferences=user_data.dietary_preferences or []
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate tokens
    access_token = create_access_token(subject=user_data.email)
    refresh_token = create_refresh_token(subject=user_data.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return tokens"""
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Generate tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    # Verify refresh token
    if not is_refresh_token(refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    email = verify_token(refresh_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check if user exists and is active
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Generate new tokens
    new_access_token = create_access_token(subject=email)
    new_refresh_token = create_refresh_token(subject=email)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "location": current_user.location,
        "bio": current_user.bio,
        "rating": current_user.rating,
        "review_count": current_user.review_count,
        "is_verified": current_user.is_verified,
        "role": current_user.role,
        "dietary_preferences": current_user.dietary_preferences,
        "join_date": current_user.join_date
    }
