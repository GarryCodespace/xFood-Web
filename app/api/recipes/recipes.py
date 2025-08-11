"""
Recipes API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeCreate, RecipeUpdate, Recipe as RecipeSchema, RecipeList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/", response_model=RecipeSchema, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    # current_user: User = Depends(get_current_user),  # Commented out for now - anyone can post
    db: Session = Depends(get_db)
):
    """Create a new recipe"""
    # Create new recipe with default creator ID
    db_recipe = Recipe(
        **recipe_data.dict(),
        created_by=1  # Default user ID for anonymous posts
    )
    
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe


@router.get("/", response_model=List[RecipeList])
async def list_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    cooking_time: Optional[int] = Query(None),
    creator_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """List all recipes with optional filtering"""
    query = db.query(Recipe)
    
    if search:
        query = query.filter(Recipe.title.ilike(f"%{search}%"))
    
    if category:
        query = query.filter(Recipe.category == category)
    
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    
    if cooking_time:
        query = query.filter(Recipe.cook_time <= cooking_time)
    
    if creator_id:
        query = query.filter(Recipe.created_by == creator_id)
    
    # Order by creation date (newest first)
    query = query.order_by(Recipe.created_at.desc())
    
    recipes = query.offset(skip).limit(limit).all()
    return recipes


@router.get("/my-recipes", response_model=List[RecipeSchema])
async def get_my_recipes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recipes created by the current user"""
    recipes = db.query(Recipe).filter(Recipe.created_by == current_user.id).order_by(Recipe.created_at.desc()).all()
    return recipes


@router.get("/{recipe_id}", response_model=RecipeSchema)
async def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific recipe by ID"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    return recipe


@router.put("/{recipe_id}", response_model=RecipeSchema)
async def update_recipe(
    recipe_id: int,
    recipe_data: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    if not verify_user_permission(current_user, recipe, "creator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update this recipe"
        )
    
    # Update recipe fields
    for field, value in recipe_data.dict(exclude_unset=True).items():
        setattr(recipe, field, value)
    
    db.commit()
    db.refresh(recipe)
    
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    if not verify_user_permission(current_user, recipe, "creator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can delete this recipe"
        )
    
    db.delete(recipe)
    db.commit()
    
    return None


@router.post("/{recipe_id}/favorite", response_model=RecipeSchema)
async def favorite_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add recipe to favorites"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    if recipe.created_by == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot favorite your own recipe"
        )
    
    # Check if already favorited
    # This would depend on your favorites implementation
    
    # Increment favorite count
    recipe.favorite_count += 1
    
    db.commit()
    db.refresh(recipe)
    
    return recipe


@router.post("/{recipe_id}/unfavorite", response_model=RecipeSchema)
async def unfavorite_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove recipe from favorites"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Check if already favorited
    # This would depend on your favorites implementation
    
    # Decrement favorite count
    if recipe.favorite_count > 0:
        recipe.favorite_count -= 1
    
    db.commit()
    db.refresh(recipe)
    
    return recipe


@router.get("/popular", response_model=List[RecipeList])
async def get_popular_recipes(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get popular recipes based on favorites and views"""
    recipes = db.query(Recipe).order_by(
        (Recipe.favorite_count + Recipe.view_count).desc()
    ).limit(limit).all()
    
    return recipes


@router.get("/quick", response_model=List[RecipeList])
async def get_quick_recipes(
    max_time: int = Query(30, ge=1, le=180),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get quick recipes under specified time"""
    recipes = db.query(Recipe).filter(
        Recipe.cook_time <= max_time
    ).order_by(Recipe.cook_time.asc()).limit(limit).all()
    
    return recipes
