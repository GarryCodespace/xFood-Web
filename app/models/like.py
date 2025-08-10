"""
Like model for liking recipes and bakes
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Like(Base):
    """Like model for recipes and bakes"""
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    bake_id = Column(Integer, ForeignKey("bakes.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="likes")
    recipe = relationship("Recipe", back_populates="likes")
    bake = relationship("Bake", back_populates="likes")
    
    def __repr__(self):
        return f"<Like(id={self.id}, user_id={self.user_id}, recipe_id={self.recipe_id}, bake_id={self.bake_id})>"
