"""
Reviews API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.recipe import Recipe
from app.schemas.review import ReviewCreate, ReviewUpdate, Review, ReviewList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/recipe/{recipe_id}", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    recipe_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for a recipe"""
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Check if user already reviewed this recipe
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.recipe_id == recipe_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this recipe"
        )
    
    # Create review
    db_review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        user_id=current_user.id,
        recipe_id=recipe_id
    )
    
    db.add(db_review)
    
    # Update recipe review count and rating
    recipe.review_count += 1
    
    # Recalculate average rating
    all_reviews = db.query(Review).filter(Review.recipe_id == recipe_id).all()
    total_rating = sum(review.rating for review in all_reviews) + review_data.rating
    recipe.rating = total_rating / (recipe.review_count)
    
    db.commit()
    db.refresh(db_review)
    
    return db_review


@router.get("/recipe/{recipe_id}", response_model=List[ReviewList])
async def get_recipe_reviews(
    recipe_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get reviews for a specific recipe"""
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    reviews = db.query(Review).filter(
        Review.recipe_id == recipe_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    return reviews


@router.get("/{review_id}", response_model=Review)
async def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific review by ID"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return review


@router.put("/{review_id}", response_model=Review)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if not verify_user_permission(current_user, review, "owner"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the review author can update this review"
        )
    
    # Store old rating for recalculation
    old_rating = review.rating
    
    # Update review
    review.rating = review_data.rating
    review.comment = review_data.comment
    
    # Recalculate recipe rating
    recipe = db.query(Recipe).filter(Recipe.id == review.recipe_id).first()
    if recipe:
        all_reviews = db.query(Review).filter(Review.recipe_id == review.recipe_id).all()
        total_rating = sum(review.rating for review in all_reviews)
        recipe.rating = total_rating / len(all_reviews) if all_reviews else 0
    
    db.commit()
    db.refresh(review)
    
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if not verify_user_permission(current_user, review, "owner"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the review author can delete this review"
        )
    
    # Update recipe review count and rating
    recipe = db.query(Recipe).filter(Recipe.id == review.recipe_id).first()
    if recipe:
        recipe.review_count -= 1
        
        # Recalculate average rating
        remaining_reviews = db.query(Review).filter(
            Review.recipe_id == review.recipe_id,
            Review.id != review_id
        ).all()
        
        if remaining_reviews:
            total_rating = sum(r.rating for r in remaining_reviews)
            recipe.rating = total_rating / len(remaining_reviews)
        else:
            recipe.rating = 0.0
    
    db.delete(review)
    db.commit()
    
    return None


@router.get("/my-reviews", response_model=List[Review])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get reviews created by the current user"""
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews


@router.get("/recipe/{recipe_id}/my-review")
async def get_my_recipe_review(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's review for a specific recipe"""
    review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.recipe_id == recipe_id
    ).first()
    
    if not review:
        return {"review": None}
    
    return {"review": review}
