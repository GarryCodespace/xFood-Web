"""
Comment model for commenting on recipes and bakes
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Comment(Base):
    """Comment model for recipes and bakes"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    bake_id = Column(Integer, ForeignKey("bakes.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="comments")
    recipe = relationship("Recipe", back_populates="comments")
    bake = relationship("Bake", back_populates="comments")
    
    def __repr__(self):
        return f"<Comment(id={self.id}, user_id={self.user_id}, content='{self.content[:50]}...')>"


