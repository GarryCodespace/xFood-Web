"""
File Upload API endpoints for xFood platform
"""
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
from app.core.security import verify_file_type, verify_file_size
import boto3
from PIL import Image
import io

router = APIRouter()

# Initialize S3 client if AWS credentials are provided
s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL
    )


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an image file"""
    # Verify file type
    if not verify_file_type(file.content_type, settings.ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Verify file size
    if not verify_file_size(file.size, settings.MAX_FILE_SIZE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    
    try:
        # Process image (resize if needed, optimize)
        image = Image.open(io.BytesIO(await file.read()))
        
        # Resize if too large (max 1920x1080)
        max_size = (1920, 1080)
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Save optimized image
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        if s3_client:
            # Upload to S3
            s3_client.upload_fileobj(
                output,
                settings.AWS_S3_BUCKET,
                f"images/{filename}",
                ExtraArgs={'ContentType': 'image/jpeg'}
            )
            file_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/images/{filename}"
        else:
            # Save locally
            upload_dir = "uploads/images"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as f:
                f.write(output.getvalue())
            
            file_url = f"/uploads/images/{filename}"
        
        return {
            "filename": filename,
            "url": file_url,
            "size": len(output.getvalue()),
            "content_type": "image/jpeg"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )


@router.post("/avatar", status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar image"""
    # Verify file type
    if not verify_file_type(file.content_type, settings.ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Verify file size (smaller limit for avatars)
    max_avatar_size = 5 * 1024 * 1024  # 5MB
    if not verify_file_size(file.size, max_avatar_size):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"avatar_{current_user.id}_{uuid.uuid4()}{file_extension}"
    
    try:
        # Process image (resize to square, optimize)
        image = Image.open(io.BytesIO(await file.read()))
        
        # Resize to square (400x400)
        target_size = (400, 400)
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Save optimized image
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        if s3_client:
            # Upload to S3
            s3_client.upload_fileobj(
                output,
                settings.AWS_S3_BUCKET,
                f"avatars/{filename}",
                ExtraArgs={'ContentType': 'image/jpeg'}
            )
            file_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/avatars/{filename}"
        else:
            # Save locally
            upload_dir = "uploads/avatars"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as f:
                f.write(output.getvalue())
            
            file_url = f"/uploads/avatars/{filename}"
        
        # Update user avatar URL in database
        current_user.avatar_url = file_url
        db.commit()
        
        return {
            "filename": filename,
            "url": file_url,
            "size": len(output.getvalue()),
            "content_type": "image/jpeg"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing avatar: {str(e)}"
        )


@router.get("/images/{filename}")
async def get_image(filename: str):
    """Get uploaded image file"""
    if s3_client:
        # Get from S3
        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=f"images/{filename}"
            )
            return FileResponse(
                io.BytesIO(response['Body'].read()),
                media_type=response['ContentType']
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
    else:
        # Get from local storage
        file_path = f"uploads/images/{filename}"
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        return FileResponse(file_path)


@router.get("/avatars/{filename}")
async def get_avatar(filename: str):
    """Get uploaded avatar file"""
    if s3_client:
        # Get from S3
        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=f"avatars/{filename}"
            )
            return FileResponse(
                io.BytesIO(response['Body'].read()),
                media_type=response['ContentType']
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avatar not found"
            )
    else:
        # Get from local storage
        file_path = f"uploads/avatars/{filename}"
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avatar not found"
            )
        return FileResponse(file_path)


@router.delete("/images/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete uploaded image file"""
    try:
        if s3_client:
            # Delete from S3
            s3_client.delete_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=f"images/{filename}"
            )
        else:
            # Delete from local storage
            file_path = f"uploads/images/{filename}"
            if os.path.exists(file_path):
                os.remove(file_path)
        
        return None
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
