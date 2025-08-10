"""
Recipe model for the xFood platform
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ARRAY, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Recipe(Base):
    """Recipe model"""
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    ingredients = Column(ARRAY(Text), nullable=False)
    instructions = Column(ARRAY(Text), nullable=False)
    prep_time = Column(Integer, nullable=True)  # in minutes
    cook_time = Column(Integer, nullable=True)  # in minutes
    servings = Column(Integer, nullable=True)
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    category = Column(String(100), nullable=False)
    tags = Column(ARRAY(String), default=[])
    is_premium = Column(Boolean, default=False)
    price_cents = Column(Integer, nullable=True)  # Price in cents for premium recipes
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="recipes")
    reviews = relationship("Review", back_populates="recipe")
    comments = relationship("Comment", back_populates="recipe")
    likes = relationship("Like", back_populates="recipe")
    
    def __repr__(self):
        return f"<Recipe(id={self.id}, title='{self.title}', created_by={self.created_by})>"


