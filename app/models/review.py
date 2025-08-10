"""
Review model for rating recipes and bakes
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Review(Base):
    """Review model for rating recipes and bakes"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, nullable=False)  # ID of recipe or bake
    item_type = Column(String(50), nullable=False)  # "recipe" or "bake"
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    recipe = relationship("Recipe", back_populates="reviews")
    bake = relationship("Bake", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review(id={self.id}, user_id={self.user_id}, item_type='{self.item_type}', rating={self.rating})>"


