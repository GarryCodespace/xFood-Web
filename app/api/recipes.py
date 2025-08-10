"""
Recipes API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.core.deps import get_current_user, get_current_baker
from app.db.database import get_db
from app.models.user import User
from app.models.recipe import Recipe
from app.schemas.recipe import RecipeCreate, RecipeUpdate, Recipe as RecipeSchema, RecipeList, RecipeSearch

router = APIRouter()


@router.post("/", response_model=RecipeSchema, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new recipe"""
    db_recipe = Recipe(
        **recipe_data.dict(),
        created_by=current_user.id
    )
    
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.get("/", response_model=List[RecipeList])
async def get_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    tags: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_prep_time: Optional[int] = None,
    max_cook_time: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get recipes with filtering and search"""
    query = db.query(Recipe)
    
    # Search by title or description
    if search:
        query = query.filter(
            or_(
                Recipe.title.ilike(f"%{search}%"),
                Recipe.description.ilike(f"%{search}%")
            )
        )
    
    # Filter by category
    if category:
        query = query.filter(Recipe.category == category)
    
    # Filter by difficulty
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    
    # Filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Recipe.tags.contains([tag]))
    
    # Filter by minimum rating
    if min_rating is not None:
        query = query.filter(Recipe.rating >= min_rating)
    
    # Filter by maximum prep time
    if max_prep_time is not None:
        query = query.filter(Recipe.prep_time <= max_prep_time)
    
    # Filter by maximum cook time
    if max_cook_time is not None:
        query = query.filter(Recipe.cook_time <= max_cook_time)
    
    # Order by creation date (newest first)
    query = query.order_by(Recipe.created_at.desc())
    
    recipes = query.offset(skip).limit(limit).all()
    return recipes


@router.get("/{recipe_id}", response_model=RecipeSchema)
async def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get recipe by ID"""
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
    recipe_update: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Only creator or admin can update recipe
    if recipe.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update recipe fields
    update_data = recipe_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recipe, field, value)
    
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}")
async def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete recipe"""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Only creator or admin can delete recipe
    if recipe.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}


@router.get("/user/{user_id}", response_model=List[RecipeList])
async def get_user_recipes(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get recipes by user ID"""
    recipes = db.query(Recipe).filter(
        Recipe.created_by == user_id
    ).order_by(Recipe.created_at.desc()).offset(skip).limit(limit).all()
    
    return recipes


@router.get("/categories/list")
async def get_recipe_categories():
    """Get list of available recipe categories"""
    categories = [
        "pastries", "cakes", "breads", "cookies", 
        "cupcakes", "pies", "other"
    ]
    return {"categories": categories}


@router.get("/difficulties/list")
async def get_recipe_difficulties():
    """Get list of available recipe difficulties"""
    difficulties = ["easy", "medium", "hard"]
    return {"difficulties": difficulties}


@router.get("/tags/popular")
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get popular recipe tags"""
    # This is a simplified version - in production you might want to count tag usage
    popular_tags = [
        "vegan", "gluten-free", "dairy-free", "sugar-free", 
        "keto", "organic", "quick", "healthy", "seasonal",
        "holiday", "birthday", "wedding", "party", "comfort",
        "gourmet", "traditional", "modern", "fusion"
    ]
    return {"tags": popular_tags[:limit]}
