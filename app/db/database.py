"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_test_db():
    """Dependency to get test database session"""
    if not settings.DATABASE_TEST_URL:
        raise ValueError("Test database URL not configured")
    
    test_engine = create_engine(settings.DATABASE_TEST_URL)
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        db.close()


