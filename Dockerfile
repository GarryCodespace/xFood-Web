FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and startup script
COPY app/ ./app/
COPY start.py ./
COPY .env .

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "start.py"]
