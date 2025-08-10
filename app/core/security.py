"""
Security utilities for authentication and authorization
"""
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT refresh token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return subject"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        subject: str = payload.get("sub")
        if subject is None:
            return None
        return subject
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def is_refresh_token(token: str) -> bool:
    """Check if token is a refresh token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_type = payload.get("type")
        return token_type == "refresh"
    except JWTError:
        return False


def verify_file_type(content_type: str, allowed_types: list) -> bool:
    """Verify if file type is allowed"""
    return content_type in allowed_types


def verify_file_size(file_size: int, max_size: int) -> bool:
    """Verify if file size is within limit"""
    return file_size <= max_size


def verify_user_permission(user: Any, resource: Any, permission_type: str) -> bool:
    """Verify if user has permission to access/modify a resource"""
    if permission_type == "creator":
        return user.id == resource.creator_id
    elif permission_type == "owner":
        return user.id == resource.user_id
    elif permission_type == "admin":
        return user.role == "admin"
    elif permission_type == "moderator":
        return user.role in ["admin", "moderator"]
    else:
        return False


