#!/usr/bin/env python3
"""
Startup script for xFood API
"""
import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting xFood API server on port {port}")
    
    # Start the FastAPI server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
