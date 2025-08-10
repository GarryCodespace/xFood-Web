"""
Comments API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.comment import Comment
from app.models.bake import Bake
from app.models.recipe import Recipe
from app.schemas.comment import CommentCreate, CommentUpdate, Comment
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/bake/{bake_id}", response_model=Comment, status_code=status.HTTP_201_CREATED)
async def create_bake_comment(
    bake_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a bake"""
    # Check if bake exists
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    # Create comment
    db_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        bake_id=bake_id
    )
    
    db.add(db_comment)
    
    # Update bake comment count
    bake.comment_count += 1
    
    db.commit()
    db.refresh(db_comment)
    
    return db_comment


@router.post("/recipe/{recipe_id}", response_model=Comment, status_code=status.HTTP_201_CREATED)
async def create_recipe_comment(
    recipe_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a recipe"""
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Create comment
    db_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    
    db.add(db_comment)
    
    # Update recipe comment count
    recipe.comment_count += 1
    
    db.commit()
    db.refresh(db_comment)
    
    return db_comment


@router.get("/bake/{bake_id}", response_model=List[Comment])
async def get_bake_comments(
    bake_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get comments for a specific bake"""
    # Check if bake exists
    bake = db.query(Bake).filter(Bake.id == bake_id).first()
    if not bake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bake not found"
        )
    
    comments = db.query(Comment).filter(
        Comment.bake_id == bake_id
    ).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments


@router.get("/recipe/{recipe_id}", response_model=List[Comment])
async def get_recipe_comments(
    recipe_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get comments for a specific recipe"""
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    comments = db.query(Comment).filter(
        Comment.recipe_id == recipe_id
    ).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments


@router.put("/{comment_id}", response_model=Comment)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if not verify_user_permission(current_user, comment, "owner"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the comment author can update this comment"
        )
    
    # Update comment
    comment.content = comment_data.content
    db.commit()
    db.refresh(comment)
    
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if not verify_user_permission(current_user, comment, "owner"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the comment author can delete this comment"
        )
    
    # Update parent comment count
    if comment.bake_id:
        bake = db.query(Bake).filter(Bake.id == comment.bake_id).first()
        if bake and bake.comment_count > 0:
            bake.comment_count -= 1
    elif comment.recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == comment.recipe_id).first()
        if recipe and recipe.comment_count > 0:
            recipe.comment_count -= 1
    
    db.delete(comment)
    db.commit()
    
    return None


@router.get("/my-comments", response_model=List[Comment])
async def get_my_comments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comments created by the current user"""
    comments = db.query(Comment).filter(
        Comment.user_id == current_user.id
    ).order_by(Comment.created_at.desc()).all()
    
    return comments
