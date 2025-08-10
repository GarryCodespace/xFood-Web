"""
Main FastAPI application for the xFood platform
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from app.core.config import settings
from app.api import auth, users, recipes, bakes, circles, messages, reviews, comments, likes, upload, checkout, webhooks
from app.db.database import engine
from app.models import user, recipe, bake, circle, message, review, comment, like, purchase, subscription


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting xFood Community Baking Platform Backend...")
    
    # Create database tables
    try:
        from app.db.database import Base
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not create database tables: {e}")
    
    yield
    # Shutdown
    print("🛑 Shutting down xFood Backend...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Backend API for xFood Community Baking Platform",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "Something went wrong"
        }
    )


# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{settings.API_PREFIX}/users", tags=["Users"])
app.include_router(recipes.router, prefix=f"{settings.API_PREFIX}/recipes", tags=["Recipes"])
app.include_router(bakes.router, prefix=f"{settings.API_PREFIX}/bakes", tags=["Bakes"])
app.include_router(circles.router, prefix=f"{settings.API_PREFIX}/circles", tags=["Circles"])
app.include_router(messages.router, prefix=f"{settings.API_PREFIX}/messages", tags=["Messages"])
app.include_router(reviews.router, prefix=f"{settings.API_PREFIX}/reviews", tags=["Reviews"])
app.include_router(comments.router, prefix=f"{settings.API_PREFIX}/comments", tags=["Comments"])
app.include_router(likes.router, prefix=f"{settings.API_PREFIX}/likes", tags=["Likes"])
app.include_router(upload.router, prefix=f"{settings.API_PREFIX}/upload", tags=["File Upload"])
app.include_router(checkout.router, prefix=f"{settings.API_PREFIX}/checkout", tags=["Checkout"])
app.include_router(webhooks.router, prefix=f"{settings.API_PREFIX}/webhooks", tags=["Webhooks"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to xFood Community Baking Platform API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
