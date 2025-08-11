"""
Circles API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.circle import Circle
from app.schemas.circle import CircleCreate, CircleUpdate, Circle as CircleSchema, CircleList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/", response_model=CircleSchema, status_code=status.HTTP_201_CREATED)
async def create_circle(
    circle_data: CircleCreate,
    # current_user: User = Depends(get_current_user),  # Commented out for now - anyone can post
    db: Session = Depends(get_db)
):
    """Create a new baking circle"""
    # Commented out duplicate check for now
    # existing_circle = db.query(Circle).filter(
    #     Circle.name == circle_data.name,
    #     Circle.creator_id == current_user.id
    # ).first()
    
    # if existing_circle:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You already have a circle with this name"
    #     )
    
    # Create new circle with default creator ID
    db_circle = Circle(
        **circle_data.dict(),
        creator_id=1  # Default user ID for anonymous posts
    )
    
    db.add(db_circle)
    db.commit()
    db.refresh(db_circle)
    
    return db_circle


@router.get("/", response_model=List[CircleList])
async def list_circles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all public circles with optional filtering"""
    query = db.query(Circle).filter(Circle.is_public == True)
    
    if search:
        query = query.filter(Circle.name.ilike(f"%{search}%"))
    
    if category:
        query = query.filter(Circle.category == category)
    
    if location:
        query = query.filter(Circle.location.ilike(f"%{location}%"))
    
    circles = query.offset(skip).limit(limit).all()
    return circles


@router.get("/my-circles", response_model=List[CircleSchema])
async def get_my_circles(
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Get circles created by the current user"""
    # For now, return all circles since we don't have user authentication
    circles = db.query(Circle).all()
    return circles


@router.get("/{circle_id}", response_model=CircleSchema)
async def get_circle(
    circle_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific circle by ID"""
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    
    if not circle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Circle not found"
        )
    
    if not circle.is_public and not circle.creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return circle


@router.put("/{circle_id}", response_model=CircleSchema)
async def update_circle(
    circle_id: int,
    circle_data: CircleUpdate,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Update a circle"""
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    
    if not circle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Circle not found"
        )
    
    # Commented out permission check for now
    # if not verify_user_permission(current_user, circle, "creator"):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only the creator can update this circle"
    #     )
    
    # Update circle fields
    for field, value in circle_data.dict(exclude_unset=True).items():
        setattr(circle, field, value)
    
    db.commit()
    db.refresh(circle)
    
    return circle


@router.delete("/{circle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_circle(
    circle_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Delete a circle"""
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    
    if not circle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Circle not found"
        )
    
    # Commented out permission check for now
    # if not verify_user_permission(current_user, circle, "creator"):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only the creator can delete this circle"
    #         )
    
    db.delete(circle)
    db.commit()
    
    return None


@router.post("/{circle_id}/join", response_model=CircleSchema)
async def join_circle(
    circle_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Join a circle"""
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    
    if not circle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Circle not found"
        )
    
    if not circle.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This circle is not public"
        )
    
    # Commented out self-join check for now
    # if circle.creator_id == current_user.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot join your own circle"
    #     )
    
    # Add user to circle members (if you have a members relationship)
    # This would depend on your specific implementation
    
    return circle


@router.post("/{circle_id}/leave", response_model=CircleSchema)
async def leave_circle(
    circle_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Leave a circle"""
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    
    if not circle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Circle not found"
        )
    
    # Commented out self-leave check for now
    # if circle.creator_id == current_user.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot leave your own circle"
    #         )
    
    # Remove user from circle members (if you have a members relationship)
    # This would depend on your specific implementation
    
    return circle
