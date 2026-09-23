import time
import uuid
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["Chat System"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

class SendMessageRequest(BaseModel):
    user1_id: str
    user2_id: str
    sender_id: str
    context_id: str = ""
    message: str

@router.get("/conversations/{user_id}")
def get_conversations(user_id: str):
    # Fetch all messages
    try:
        msg_resp = requests.get(APPS_SCRIPT_URL, params={"sheet": "Messages"}, timeout=60.0)
        messages = msg_resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gagal menghubungi pangkalan data mesej")
        
    # Fetch all users for participant info
    try:
        user_resp = requests.get(APPS_SCRIPT_URL, params={"sheet": "Users"}, timeout=60.0)
        users = user_resp.json()
    except Exception as e:
        users = []
        
    users_dict = {u["id"]: u for u in users if "id" in u}
    
    # Filter messages involving this user
    user_msgs = [m for m in messages if m.get("user1_id") == user_id or m.get("user2_id") == user_id]
    
    # Group by conversation (the OTHER user id)
    convos = {}
    for m in user_msgs:
        other_user_id = m.get("user2_id") if m.get("user1_id") == user_id else m.get("user1_id")
        
        if other_user_id not in convos:
            other_user = users_dict.get(other_user_id, {})
            convos[other_user_id] = {
                "id": f"conv_{other_user_id}",
                "participantId": other_user_id,
                "participantName": other_user.get("name", "Unknown"),
                "participantAvatar": other_user.get("avatarUrl", "https://ui-avatars.com/api/?name=Unknown"),
                "participantPhone": other_user.get("phone", ""),
                "itemContextTitle": m.get("context_id", ""),
                "itemContextPrice": None,
                "itemContextCategory": "",
                "messages": [],
                "unreadCount": 0
            }
            
        convos[other_user_id]["messages"].append({
            "id": str(m.get("id")),
            "conversationId": f"conv_{other_user_id}",
            "senderId": m.get("sender_id"),
            "senderName": users_dict.get(m.get("sender_id"), {}).get("name", "Unknown"),
            "text": m.get("message"),
            "timestamp": str(m.get("created_at")),
            "isMe": m.get("sender_id") == user_id
        })
        
    # Sort messages and set last message info
    res = []
    for c_id, conv in convos.items():
        # sort messages by timestamp
        conv["messages"] = sorted(conv["messages"], key=lambda x: x["timestamp"])
        if conv["messages"]:
            last = conv["messages"][-1]
            conv["lastMessage"] = last["text"]
            # Extract time part if possible, otherwise use string
            ts = last["timestamp"]
            conv["lastMessageTime"] = ts.split("T")[1][:5] if "T" in ts else ts
        res.append(conv)
        
    # Sort conversations by latest message first
    res = sorted(res, key=lambda x: x.get("lastMessageTime", ""), reverse=True)
    return res

@router.post("/messages")
def send_message(req: SendMessageRequest):
    new_id = f"msg_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%dT%H:%M:%S")
    
    payload = {
        "sheet": "Messages",
        "data": {
            "id": new_id,
            "user1_id": req.user1_id,
            "user2_id": req.user2_id,
            "sender_id": req.sender_id,
            "context_id": req.context_id,
            "message": req.message,
            "is_read": "FALSE",
            "created_at": created_at
        }
    }
    
    try:
        resp = requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
        return {"success": True, "message": "Mesej dihantar", "id": new_id, "timestamp": created_at}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gagal menghantar mesej")
