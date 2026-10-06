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

def find_item_by_context(ctx: str):
    if not ctx:
        return None
    ctx_clean = str(ctx).strip().lower()

    # 1. Check Marketplace
    try:
        from routers.marketplace import MARKET_CACHE, get_listings
        items = MARKET_CACHE["data"] or get_listings()
        for item in items:
            if str(item.id).lower() == ctx_clean or str(item.title).lower() == ctx_clean:
                return {
                    "id": item.id,
                    "title": item.title,
                    "price": item.price,
                    "category": item.category,
                    "imageUrl": item.imageUrl,
                    "condition": item.condition
                }
    except Exception:
        pass

    # 2. Check Donations
    try:
        from routers.recycle import RECYCLE_CACHE, get_recycle_data
        donations = RECYCLE_CACHE["donations"] or get_recycle_data().donations
        for item in donations:
            if str(item.id).lower() == ctx_clean or str(item.title).lower() == ctx_clean:
                return {
                    "id": item.id,
                    "title": item.title,
                    "price": 0,
                    "category": item.category,
                    "imageUrl": item.imageUrl,
                    "condition": "Percuma"
                }
    except Exception:
        pass

    # 3. Check Help Requests
    try:
        from routers.help import HELP_CACHE, get_help_requests
        helps = HELP_CACHE["data"] or get_help_requests()
        for item in helps:
            if str(item.id).lower() == ctx_clean or str(item.title).lower() == ctx_clean:
                return {
                    "id": item.id,
                    "title": item.title,
                    "price": None,
                    "category": item.category,
                    "imageUrl": item.imageUrl or "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
                    "condition": item.type
                }
    except Exception:
        pass

    # Fallback with title
    return {
        "id": ctx,
        "title": ctx,
        "price": None,
        "category": "Barangan",
        "imageUrl": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
        "condition": "Terpakai"
    }

@router.get("/conversations/{user_id}")
def get_conversations(user_id: str):
    messages = get_cached_messages()
    users = get_cached_users()
    users_dict = {u["id"]: u for u in users if "id" in u}
    
    # Filter messages involving this user
    user_msgs = [m for m in messages if m.get("user1_id") == user_id or m.get("user2_id") == user_id]
    
    # Group by conversation (the OTHER user id + item context, ensuring 1 chat per item)
    convos = {}
    for m in user_msgs:
        other_user_id = m.get("user2_id") if m.get("user1_id") == user_id else m.get("user1_id")
        if not other_user_id:
            continue
            
        ctx = str(m.get("context_id") or "").strip()
        conv_key = f"conv_{other_user_id}_{ctx}" if ctx else f"conv_{other_user_id}"
            
        if conv_key not in convos:
            other_user = users_dict.get(other_user_id, {})
            p_name = f"@{other_user.get('username')}" if other_user.get('username') else other_user.get("name", "Unknown")
            item_info = find_item_by_context(ctx) if ctx else None
            
            convos[conv_key] = {
                "id": conv_key,
                "participantId": other_user_id,
                "participantName": p_name,
                "participantAvatar": other_user.get("avatarUrl", "https://ui-avatars.com/api/?name=Unknown"),
                "participantPhone": other_user.get("phone", ""),
                "itemContextId": item_info["id"] if item_info else (ctx or None),
                "itemContextTitle": item_info["title"] if item_info else (ctx or ""),
                "itemContextPrice": item_info["price"] if item_info else None,
                "itemContextCategory": item_info["category"] if item_info else "",
                "itemContextImage": item_info["imageUrl"] if item_info else None,
                "itemContextCondition": item_info["condition"] if item_info else None,
                "messages": [],
                "unreadCount": 0
            }
            
        sender_user = users_dict.get(m.get("sender_id"), {})
        s_name = f"@{sender_user.get('username')}" if sender_user.get('username') else sender_user.get("name", "Unknown")
        is_me = (m.get("sender_id") == user_id)
        
        is_read_val = (m.get("is_read") is True or str(m.get("is_read")).strip().upper() == "TRUE")
        if not is_me and not is_read_val:
            convos[conv_key]["unreadCount"] += 1

        convos[conv_key]["messages"].append({
            "id": str(m.get("id")),
            "conversationId": conv_key,
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
    context_id: Optional[str] = None

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
        
        if req.context_id:
            m_ctx = str(m.get("context_id", "")).strip().lower()
            req_ctx = req.context_id.strip().lower()
            if m_ctx != req_ctx:
                is_convo = False

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

