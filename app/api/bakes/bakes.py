"""
Bakes API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.bake import Bake
from app.schemas.bake import BakeCreate, BakeUpdate, Bake as BakeResponse, BakeList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/", response_model=BakeResponse, status_code=status.HTTP_201_CREATED)
async def create_bake(
    bake_data: BakeCreate,
    # current_user: User = Depends(get_current_user),  # Commented out for now - anyone can post
    db: Session = Depends(get_db)
):
    """Create a new bake post"""
    try:
        # Convert price from dollars to cents
        price_cents = int(float(bake_data.price) * 100)
        
        # Create new bake with proper field mapping
        db_bake = Bake(
            title=bake_data.title,
            description=bake_data.description,
            category=bake_data.category,
            tags=bake_data.tags or [],
            allergens=bake_data.allergens or [],
            price_cents=price_cents,
            available_for_order=bake_data.available_for_order if hasattr(bake_data, 'available_for_order') else True,
            pickup_location=bake_data.pickup_location,
            full_address=bake_data.full_address,
            phone_number=bake_data.phone_number,
            circle_id=bake_data.circle_id,
            created_by=1  # Default user ID for anonymous posts
        )
        
        db.add(db_bake)
        db.commit()
        db.refresh(db_bake)
        
        return db_bake
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create bake: {str(e)}"
        )


@router.get("/", response_model=List[BakeList])
async def list_bakes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    creator_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """List all bakes with optional filtering"""
    query = db.query(Bake)
    
    if search:
        query = query.filter(Bake.title.ilike(f"%{search}%"))
    
    if category:
        query = query.filter(Bake.category == category)
    
    if creator_id:
        query = query.filter(Bake.created_by == creator_id)
    
    # Order by creation date (newest first)
    query = query.order_by(Bake.created_at.desc())
    
    bakes = query.offset(skip).limit(limit).all()
    return bakes


@router.get("/my-bakes", response_model=List[BakeResponse])
async def get_my_bakes(
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Get bakes created by the current user"""
    # For now, return all bakes since we don't have user authentication
    bakes = db.query(Bake).order_by(Bake.created_at.desc()).all()
    return bakes


@router.get("/{bake_id}", response_model=BakeResponse)
async def get_bake(
    bake_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific bake by ID"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    return bake


@router.put("/{bake_id}", response_model=BakeResponse)
async def update_bake(
    bake_id: int,
    bake_data: BakeUpdate,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Update a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Commented out permission check for now
    # if not verify_user_permission(current_user, bake, "creator"):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only the creator can update this bake"
    #     )
    
    # Update bake fields
    for field, value in bake_data.dict(exclude_unset=True).items():
        if field == 'price' and value is not None:
            # Convert price to cents
            setattr(bake, 'price_cents', int(float(value) * 100))
        else:
            setattr(bake, field, value)
    
    db.commit()
    db.refresh(bake)
    
    return bake


@router.delete("/{bake_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bake(
    bake_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Delete a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Commented out permission check for now
    # if not verify_user_permission(current_user, bake, "creator"):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only the creator can delete this bake"
    #         )
    
    db.delete(bake)
    db.commit()
    
    return None


@router.post("/{bake_id}/like", response_model=BakeResponse)
async def like_bake(
    bake_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Like a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Commented out self-like check for now
    # if bake.creator_id == current_user.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot like your own bake"
    #     )
    
    # Check if already liked
    # This would depend on your likes implementation
    
    # Increment like count
    bake.like_count += 1
    
    db.commit()
    db.refresh(bake)
    
    return bake


@router.post("/{bake_id}/unlike", response_model=BakeResponse)
async def unlike_bake(
    bake_id: int,
    # current_user: User = Depends(get_current_user),  # Commented out for now
    db: Session = Depends(get_db)
):
    """Unlike a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Check if already liked
    # This would depend on your likes implementation
    
    # Decrement like count
    if bake.like_count > 0:
        bake.like_count -= 1
    
    db.commit()
    db.refresh(bake)
    
    return bake


@router.get("/trending", response_model=List[BakeList])
async def get_trending_bakes(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get trending bakes based on likes and comments"""
    # Simple trending algorithm: order by likes + comments
    bakes = db.query(Bake).order_by(
        (Bake.like_count + Bake.comment_count).desc()
    ).limit(limit).all()
    
    return bakes
