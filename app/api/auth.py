"""
Authentication API endpoints
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import httpx
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, verify_token, is_refresh_token
)
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, TokenData, GoogleAuthRequest, AppleAuthRequest
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


@router.post("/demo", response_model=Token)
async def demo_login(db: Session = Depends(get_db)):
    """Demo login for testing purposes"""
    # Check if demo user exists
    demo_email = "demo@xfood.com"
    user = db.query(User).filter(User.email == demo_email).first()
    
    if not user:
        # Create demo user
        user = User(
            email=demo_email,
            full_name="Demo User",
            hashed_password="",  # No password for demo user
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
            location="Demo Location",
            bio="This is a demo account for testing xFood Community Baking Platform",
            dietary_preferences=["vegetarian"],
            is_active=True,
            is_verified=True,
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/apple", response_model=Token)
async def apple_auth(request: AppleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Apple Sign-In"""
    try:
        # For now, we'll create a simplified Apple auth that works with the JWT token
        # In production, you would validate the Apple ID token with Apple's servers
        
        # This is a simplified implementation - in production you should:
        # 1. Validate the Apple ID token with Apple's public keys
        # 2. Extract user information from the verified token
        # 3. Handle user creation/update properly
        
        # For demo purposes, we'll create a user based on the token
        import jwt
        import json
        
        try:
            # Decode without verification for demo (DO NOT do this in production!)
            decoded = jwt.decode(request.id_token, options={"verify_signature": False})
            email = decoded.get('email', f'apple_user_{decoded.get("sub", "unknown")}@appleid.com')
            name = decoded.get('name', 'Apple User')
        except:
            # If JWT decode fails, create a generic Apple user
            email = "apple_user@appleid.com"
            name = "Apple User"
        
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new Apple user
            user = User(
                email=email,
                full_name=name,
                hashed_password="",  # No password for Apple users
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=apple",
                location="Unknown",
                bio="User authenticated via Apple Sign-In",
                dietary_preferences=[],
                is_active=True,
                is_verified=True,  # Apple users are pre-verified
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate tokens
        access_token = create_access_token(subject=user.email)
        refresh_token = create_refresh_token(subject=user.email)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        print(f"Apple auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apple authentication failed"
        )


@router.post("/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate user with Google OAuth"""
    try:
        # Verify the Google ID token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={request.id_token}"
            )
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        token_info = response.json()
        google_email = token_info.get("email")
        
        if not google_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in Google token"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == google_email).first()
        
        if not user:
            # Create new user from Google data
            user = User(
                email=google_email,
                full_name=token_info.get("name", "Google User"),
                hashed_password="",  # No password for Google OAuth users
                avatar_url=token_info.get("picture"),
                location="",
                bio="",
                dietary_preferences=[],
                is_active=True,
                is_verified=True,
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive"
            )
        
        # Generate tokens
        access_token = create_access_token(subject=user.email)
        refresh_token = create_refresh_token(subject=user.email)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify Google token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
