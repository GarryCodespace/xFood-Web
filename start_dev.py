#!/usr/bin/env python3
"""
Development startup script for xFood backend
"""
import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("Please copy env.example to .env and configure your settings")
        return False
    print("✅ .env file found")
    return True

def check_database():
    """Check database connection"""
    try:
        from app.db.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your DATABASE_URL in .env file")
        return False

def start_server():
    """Start the development server"""
    print("🚀 Starting xFood backend development server...")
    
    # Set development environment
    os.environ["DEBUG"] = "true"
    
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("=" * 50)
    print("xFood Backend Development Startup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_dependencies():
        return 1
    
    if not check_env_file():
        return 1
    
    # Skip database check for development
    # if not check_database():
    #     return 1
    
    print("\n🎯 All checks passed! Starting server...")
    print("📖 API documentation will be available at: http://localhost:8000/docs")
    print("🌐 Server will be running at: http://localhost:8000")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Start server
    if start_server():
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())
