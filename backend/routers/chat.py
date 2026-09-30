import time
import uuid
import requests
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["Chat System"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfZ19MpaNnKrMmgkwDGFhnZQ1Kjuo4n4UDM3rWcdHscIU9WesFKILxEGNlyH_hkJQv/exec"

class SendMessageRequest(BaseModel):
    user1_id: str
    user2_id: str
    sender_id: str
    context_id: str = ""
    message: str

# In-memory caches for high-speed responsiveness
_USERS_CACHE = {"data": [], "timestamp": 0.0}
_MESSAGES_CACHE = {"data": [], "timestamp": 0.0}
_LOCAL_MESSAGES = []  # Recent sent messages queue before or during Google Sheets sync

def get_cached_users():
    now = time.time()
    if (now - _USERS_CACHE["timestamp"] < 60.0) and _USERS_CACHE["data"]:
        return _USERS_CACHE["data"]
    try:
        user_resp = requests.get(APPS_SCRIPT_URL, params={"sheet": "Users"}, timeout=15.0)
        users = user_resp.json()
        if isinstance(users, list):
            _USERS_CACHE["data"] = users
            _USERS_CACHE["timestamp"] = now
            return users
    except Exception as e:
        print("Failed to fetch users for chat:", e)
    return _USERS_CACHE["data"]

def sync_message_to_sheets(payload: dict):
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
    except Exception as e:
        print("Background sync message to Google Sheets error:", e)

def get_cached_messages(force_refresh: bool = False):
    global _LOCAL_MESSAGES
    now = time.time()
    # Micro-cache: If fetched within 2.5 seconds and not force_refresh, return immediately
    if not force_refresh and (now - _MESSAGES_CACHE["timestamp"] < 2.5) and _MESSAGES_CACHE["data"]:
        # Merge any local uncommitted messages
        existing_ids = {str(m.get("id")) for m in _MESSAGES_CACHE["data"] if m.get("id")}
        pending = [m for m in _LOCAL_MESSAGES if str(m.get("id")) not in existing_ids]
        return _MESSAGES_CACHE["data"] + pending

    try:
        msg_resp = requests.get(APPS_SCRIPT_URL, params={"sheet": "Messages"}, timeout=15.0)
        raw_msgs = msg_resp.json()
        if isinstance(raw_msgs, list):
            existing_ids = {str(m.get("id")) for m in raw_msgs if m.get("id")}
            pending = [m for m in _LOCAL_MESSAGES if str(m.get("id")) not in existing_ids]
            
            # Prune committed local messages
            _LOCAL_MESSAGES = pending[-50:]
            
            combined = raw_msgs + pending
            _MESSAGES_CACHE["data"] = combined
            _MESSAGES_CACHE["timestamp"] = now
            return combined
    except Exception as e:
        print("Failed to fetch messages from Google Sheets:", e)

    # Fallback to cache + local
    existing_ids = {str(m.get("id")) for m in _MESSAGES_CACHE["data"] if m.get("id")}
    pending = [m for m in _LOCAL_MESSAGES if str(m.get("id")) not in existing_ids]
    return _MESSAGES_CACHE["data"] + pending

@router.get("/conversations/{user_id}")
def get_conversations(user_id: str):
    messages = get_cached_messages()
    users = get_cached_users()
    users_dict = {u["id"]: u for u in users if "id" in u}
    
    # Filter messages involving this user
    user_msgs = [m for m in messages if m.get("user1_id") == user_id or m.get("user2_id") == user_id]
    
    # Group by conversation (the OTHER user id)
    convos = {}
    for m in user_msgs:
        other_user_id = m.get("user2_id") if m.get("user1_id") == user_id else m.get("user1_id")
        if not other_user_id:
            continue
            
        if other_user_id not in convos:
            other_user = users_dict.get(other_user_id, {})
            p_name = f"@{other_user.get('username')}" if other_user.get('username') else other_user.get("name", "Unknown")
            convos[other_user_id] = {
                "id": f"conv_{other_user_id}",
                "participantId": other_user_id,
                "participantName": p_name,
                "participantAvatar": other_user.get("avatarUrl", "https://ui-avatars.com/api/?name=Unknown"),
                "participantPhone": other_user.get("phone", ""),
                "itemContextTitle": m.get("context_id", ""),
                "itemContextPrice": None,
                "itemContextCategory": "",
                "messages": [],
                "unreadCount": 0
            }
            
        sender_user = users_dict.get(m.get("sender_id"), {})
        s_name = f"@{sender_user.get('username')}" if sender_user.get('username') else sender_user.get("name", "Unknown")
        is_me = (m.get("sender_id") == user_id)
        
        is_read_val = (m.get("is_read") is True or str(m.get("is_read")).strip().upper() == "TRUE")
        if not is_me and not is_read_val:
            convos[other_user_id]["unreadCount"] += 1

        convos[other_user_id]["messages"].append({
            "id": str(m.get("id")),
            "conversationId": f"conv_{other_user_id}",
            "senderId": m.get("sender_id"),
            "senderName": s_name,
            "text": m.get("message"),
            "timestamp": str(m.get("created_at")),
            "isMe": is_me,
            "isRead": is_read_val
        })
        
    # Sort messages and set last message info
    res = []
    for c_id, conv in convos.items():
        conv["messages"] = sorted(conv["messages"], key=lambda x: str(x.get("timestamp", "")))
        if conv["messages"]:
            last = conv["messages"][-1]
            conv["lastMessage"] = last["text"]
            ts = last["timestamp"]
            conv["lastMessageTime"] = ts.split("T")[1][:5] if "T" in ts else ts
        res.append(conv)
        
    # Sort conversations by latest message first
    res = sorted(res, key=lambda x: x.get("lastMessageTime", ""), reverse=True)
    return res

@router.post("/messages")
def send_message(req: SendMessageRequest, background_tasks: BackgroundTasks):
    new_id = f"msg_{uuid.uuid4().hex[:8]}"
    created_at = time.strftime("%Y-%m-%dT%H:%M:%S")
    
    msg_dict = {
        "id": new_id,
        "user1_id": req.user1_id,
        "user2_id": req.user2_id,
        "sender_id": req.sender_id,
        "context_id": req.context_id,
        "message": req.message,
        "is_read": "FALSE",
        "created_at": created_at
    }
    
    # Immediately store in in-memory queues so both sender and recipient get it instantly
    _LOCAL_MESSAGES.append(msg_dict)
    if _MESSAGES_CACHE["data"]:
        _MESSAGES_CACHE["data"].append(msg_dict)
    
    payload = {
        "action": "create",
        "sheet": "Messages",
        "data": msg_dict
    }
    
    # Save asynchronously to Google Sheets in background
    background_tasks.add_task(sync_message_to_sheets, payload)
    
    return {"success": True, "message": "Mesej dihantar", "id": new_id, "timestamp": created_at}

class MarkReadRequest(BaseModel):
    user_id: str
    other_user_id: str

def sync_mark_read_to_sheets(message_ids: List[str]):
    for mid in message_ids:
        try:
            requests.post(
                APPS_SCRIPT_URL,
                json={"action": "update", "sheet": "Messages", "id": mid, "data": {"is_read": "TRUE"}},
                timeout=15.0
            )
        except Exception as e:
            print(f"Error marking message {mid} as read in Google Sheets:", e)

@router.post("/read")
def mark_read(req: MarkReadRequest, background_tasks: BackgroundTasks):
    messages = get_cached_messages()
    unread_ids = []
    
    for m in messages:
        u1 = str(m.get("user1_id", ""))
        u2 = str(m.get("user2_id", ""))
        sender = str(m.get("sender_id", ""))
        is_convo = (u1 == req.other_user_id and u2 == req.user_id) or (u1 == req.user_id and u2 == req.other_user_id)
        
        # If it's a message from the other user and not yet read
        if is_convo and sender != req.user_id:
            current_read = (m.get("is_read") is True or str(m.get("is_read")).strip().upper() == "TRUE")
            if not current_read:
                m["is_read"] = True
                unread_ids.append(str(m.get("id")))
                
    # Also update _LOCAL_MESSAGES
    for lm in _LOCAL_MESSAGES:
        if str(lm.get("id")) in unread_ids:
            lm["is_read"] = True
            
    if unread_ids:
        # Run update in background task to Google Sheets
        background_tasks.add_task(sync_mark_read_to_sheets, unread_ids)
        
    return {"success": True, "marked_count": len(unread_ids)}

