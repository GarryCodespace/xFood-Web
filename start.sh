#!/bin/bash
set -e

# Get port from environment variable or default to 8000
PORT=${PORT:-8000}

echo "Starting xFood API server on port $PORT"

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
