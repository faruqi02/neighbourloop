from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import ChatConversation, ChatMessage, SendMessageRequest
from database import CONVERSATIONS_DB, USERS_DB
import uuid
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Direct Chat & Messaging"])

@router.get("/conversations", response_model=List[ChatConversation])
def get_user_conversations(user_id: str = Query("u1")):
    return CONVERSATIONS_DB

@router.post("/send", response_model=ChatMessage)
def send_chat_message(data: SendMessageRequest):
    new_msg = ChatMessage(
        id=f"m_{uuid.uuid4().hex[:6]}",
        conversationId=data.conversationId,
        senderId=data.senderId,
        senderName=data.senderName,
        text=data.text,
        timestamp=datetime.now().strftime("%I:%M %p"),
        isMe=True
    )

    # Find conversation or create new
    conv = next((c for c in CONVERSATIONS_DB if c.id == data.conversationId), None)
    if conv:
        conv.messages.append(new_msg)
        conv.lastMessage = data.text
        conv.lastMessageTime = "Baru sahaja"
    return new_msg
