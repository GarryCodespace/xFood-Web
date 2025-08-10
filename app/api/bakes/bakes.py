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
from app.schemas.bake import BakeCreate, BakeUpdate, Bake, BakeList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/", response_model=Bake, status_code=status.HTTP_201_CREATED)
async def create_bake(
    bake_data: BakeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new bake post"""
    # Create new bake
    db_bake = Bake(
        **bake_data.dict(),
        creator_id=current_user.id
    )
    
    db.add(db_bake)
    db.commit()
    db.refresh(db_bake)
    
    return db_bake


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
    
    if difficulty:
        query = query.filter(Bake.difficulty == difficulty)
    
    if creator_id:
        query = query.filter(Bake.creator_id == creator_id)
    
    # Order by creation date (newest first)
    query = query.order_by(Bake.created_at.desc())
    
    bakes = query.offset(skip).limit(limit).all()
    return bakes


@router.get("/my-bakes", response_model=List[Bake])
async def get_my_bakes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bakes created by the current user"""
    bakes = db.query(Bake).filter(Bake.creator_id == current_user.id).order_by(Bake.created_at.desc()).all()
    return bakes


@router.get("/{bake_id}", response_model=Bake)
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


@router.put("/{bake_id}", response_model=Bake)
async def update_bake(
    bake_id: int,
    bake_data: BakeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    if not verify_user_permission(current_user, bake, "creator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update this bake"
        )
    
    # Update bake fields
    for field, value in bake_data.dict(exclude_unset=True).items():
        setattr(bake, field, value)
    
    db.commit()
    db.refresh(bake)
    
    return bake


@router.delete("/{bake_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bake(
    bake_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    if not verify_user_permission(current_user, bake, "creator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can delete this bake"
        )
    
    db.delete(bake)
    db.commit()
    
    return None


@router.post("/{bake_id}/like", response_model=Bake)
async def like_bake(
    bake_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a bake"""
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    if bake.creator_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot like your own bake"
        )
    
    # Check if already liked
    # This would depend on your likes implementation
    
    # Increment like count
    bake.like_count += 1
    
    db.commit()
    db.refresh(bake)
    
    return bake


@router.post("/{bake_id}/unlike", response_model=Bake)
async def unlike_bake(
    bake_id: int,
    current_user: User = Depends(get_current_user),
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
