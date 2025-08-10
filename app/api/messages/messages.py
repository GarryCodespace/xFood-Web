"""
Messages API endpoints for xFood platform
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.message import Message
from app.schemas.message import MessageCreate, Message, MessageList
from app.core.security import verify_user_permission

router = APIRouter()


@router.post("/", response_model=Message, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to another user"""
    # Check if recipient exists
    recipient = db.query(User).filter(User.id == message_data.receiver_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Check if trying to send message to self
    if message_data.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send message to yourself"
        )
    
    # Create message
    db_message = Message(
        content=message_data.content,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message


@router.get("/inbox", response_model=List[MessageList])
async def get_inbox(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get received messages"""
    messages = db.query(Message).filter(
        Message.receiver_id == current_user.id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    return messages


@router.get("/sent", response_model=List[MessageList])
async def get_sent_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sent messages"""
    messages = db.query(Message).filter(
        Message.sender_id == current_user.id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    return messages


@router.get("/conversation/{user_id}", response_model=List[Message])
async def get_conversation(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation with a specific user"""
    # Check if other user exists
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get messages between current user and other user
    messages = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    return messages


@router.get("/{message_id}", response_model=Message)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user is sender or receiver
    if message.sender_id != current_user.id and message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Mark as read if receiver is viewing
    if message.receiver_id == current_user.id and not message.is_read:
        message.is_read = True
        db.commit()
        db.refresh(message)
    
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only sender can delete message
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the sender can delete this message"
        )
    
    db.delete(message)
    db.commit()
    
    return None


@router.post("/{message_id}/read", response_model=Message)
async def mark_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only receiver can mark as read
    if message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiver can mark this message as read"
        )
    
    message.is_read = True
    db.commit()
    db.refresh(message)
    
    return message


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread messages"""
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).count()
    
    return {"unread_count": count}


@router.get("/conversations", response_model=List[dict])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of conversations for current user"""
    # Get unique users with whom current user has conversations
    conversations = []
    
    # Get conversations where current user is sender
    sent_conversations = db.query(Message.receiver_id).filter(
        Message.sender_id == current_user.id
    ).distinct().all()
    
    # Get conversations where current user is receiver
    received_conversations = db.query(Message.sender_id).filter(
        Message.receiver_id == current_user.id
    ).distinct().all()
    
    # Combine and get unique user IDs
    user_ids = set()
    for conv in sent_conversations:
        user_ids.add(conv[0])
    for conv in received_conversations:
        user_ids.add(conv[0])
    
    # Get user details and last message for each conversation
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            last_message = db.query(Message).filter(
                ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
                ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
            ).order_by(Message.created_at.desc()).first()
            
            unread_count = db.query(Message).filter(
                Message.sender_id == user_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            ).count()
            
            conversations.append({
                "user_id": user.id,
                "user_name": user.full_name,
                "avatar_url": user.avatar_url,
                "last_message": last_message.content if last_message else None,
                "last_message_time": last_message.created_at if last_message else None,
                "unread_count": unread_count
            })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message_time"] or 0, reverse=True)
    
    return conversations
