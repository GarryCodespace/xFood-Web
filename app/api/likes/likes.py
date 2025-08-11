"""
Likes API endpoints for xFood platform
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.like import Like
from app.models.bake import Bake
from app.models.recipe import Recipe
from app.schemas.like import Like as LikeSchema

router = APIRouter()


@router.post("/bake/{bake_id}", response_model=LikeSchema, status_code=status.HTTP_201_CREATED)
async def like_bake(
    bake_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a bake"""
    # Check if bake exists
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.bake_id == bake_id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already liked this bake"
        )
    
    # Create like
    db_like = Like(
        user_id=current_user.id,
        bake_id=bake_id
    )
    
    db.add(db_like)
    
    # Update bake like count
    bake.like_count += 1
    
    db.commit()
    db.refresh(db_like)
    
    return db_like


@router.post("/recipe/{recipe_id}", response_model=LikeSchema, status_code=status.HTTP_201_CREATED)
async def like_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a recipe"""
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.recipe_id == recipe_id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already liked this recipe"
        )
    
    # Create like
    db_like = Like(
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    
    db.add(db_like)
    
    # Update recipe like count
    recipe.like_count += 1
    
    db.commit()
    db.refresh(db_like)
    
    return db_like


@router.delete("/bake/{bake_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_bake(
    bake_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a bake"""
    # Find existing like
    like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.bake_id == bake_id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    # Delete like
    db.delete(like)
    
    # Update bake like count
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    if bake and bake.like_count > 0:
        bake.like_count -= 1
    
    db.commit()
    
    return None


@router.delete("/recipe/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a recipe"""
    # Find existing like
    like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.recipe_id == recipe_id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    # Delete like
    db.delete(like)
    
    # Update recipe like count
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if recipe and recipe.like_count > 0:
        recipe.like_count -= 1
    
    db.commit()
    
    return None


@router.get("/bake/{bake_id}/check")
async def check_bake_like(
    bake_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a bake"""
    like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.bake_id == bake_id
    ).first()
    
    return {"liked": like is not None}


@router.get("/recipe/{recipe_id}/check")
async def check_recipe_like(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a recipe"""
    like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.recipe_id == recipe_id
    ).first()
    
    return {"liked": like is not None}


@router.get("/my-likes", response_model=List[LikeSchema])
async def get_my_likes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get likes created by the current user"""
    likes = db.query(Like).filter(
        Like.user_id == current_user.id
    ).order_by(Like.created_at.desc()).all()
    
    return likes


@router.get("", response_model=List[LikeSchema])
async def get_likes(
    bake_id: int = None,
    recipe_id: int = None,
    user_email: str = None,
    db: Session = Depends(get_db)
):
    """Get likes with optional filters"""
    query = db.query(Like)
    
    if bake_id:
        query = query.filter(Like.bake_id == bake_id)
    if recipe_id:
        query = query.filter(Like.recipe_id == recipe_id)
    if user_email:
        # Find user by email and filter by user_id
        user = db.query(User).filter(User.email == user_email).first()
        if user:
            query = query.filter(Like.user_id == user.id)
    
    likes = query.order_by(Like.created_at.desc()).all()
    return likes


@router.post("", response_model=LikeSchema, status_code=status.HTTP_201_CREATED)
async def create_like(
    like_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a like"""
    bake_id = like_data.get("bake_id")
    recipe_id = like_data.get("recipe_id")
    user_email = like_data.get("user_email")
    
    if not bake_id and not recipe_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either bake_id or recipe_id must be provided"
        )
    
    # Check for existing like
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.bake_id == bake_id if bake_id else None,
        Like.recipe_id == recipe_id if recipe_id else None
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already liked this item"
        )
    
    # Create like
    db_like = Like(
        user_id=current_user.id,
        bake_id=bake_id,
        recipe_id=recipe_id
    )
    
    db.add(db_like)
    
    # Update like count
    if bake_id:
        bake = db.query(Bake).filter(Bake.id == bake_id).first()
        if bake:
            bake.like_count += 1
    elif recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if recipe:
            recipe.like_count += 1
    
    db.commit()
    db.refresh(db_like)
    
    return db_like


@router.delete("/{like_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_like(
    like_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a like by ID"""
    like = db.query(Like).filter(
        Like.id == like_id,
        Like.user_id == current_user.id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    # Update like count
    if like.bake_id:
        bake = db.query(Bake).filter(Bake.id == like.bake_id).first()
        if bake and bake.like_count > 0:
            bake.like_count -= 1
    elif like.recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == like.recipe_id).first()
        if recipe and recipe.like_count > 0:
            recipe.like_count -= 1
    
    db.delete(like)
    db.commit()
    
    return None
