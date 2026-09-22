from fastapi import APIRouter, HTTPException, Query
from typing import List
import httpx
import uuid
from schemas import User, AdminStatsResponse
from database import USERS_DB, LISTINGS_DB, DONATIONS_DB, HELP_REQUESTS_DB, RECYCLE_CENTERS_DB, NOTICES_DB

router = APIRouter(prefix="/admin", tags=["Supervisor & Admin Dashboard"])
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

import time

CACHE = {
    "dashboard": {"data": None, "timestamp": 0},
    "users": {"data": None, "timestamp": 0}
}
CACHE_TTL = 180  # 3 minutes

@router.get("/dashboard", response_model=AdminStatsResponse)
def get_admin_dashboard_metrics():
    """
    Endpoint for FYP Supervisor: Aggregated system metrics and platform health.
    """
    now = time.time()
    if CACHE["dashboard"]["data"] and (now - CACHE["dashboard"]["timestamp"] < CACHE_TTL):
        return CACHE["dashboard"]["data"]
        
    try:
        import requests
        res = requests.get(f"{APPS_SCRIPT_URL}?action=get_all", timeout=60.0)
        data = res.json()
        result = AdminStatsResponse(
            totalUsers=len(data.get("users", [])),
            totalListings=len(data.get("listings", [])),
            totalDonations=len(data.get("donations", [])),
            totalHelpRequests=len(data.get("helpRequests", [])),
            totalCenters=len(data.get("recycleCenters", [])),
            totalNotices=len(data.get("notices", [])),
            systemStatus="Online & Healthy"
        )
        CACHE["dashboard"]["data"] = result
        CACHE["dashboard"]["timestamp"] = now
        return result
    except Exception as e:
        print(f"Error in dashboard: {e}")
        if CACHE["dashboard"]["data"]:
            return CACHE["dashboard"]["data"]
        return AdminStatsResponse(totalUsers=0, totalListings=0, totalDonations=0, totalHelpRequests=0, totalCenters=0, totalNotices=0, systemStatus="Offline")

@router.get("/users")
def get_admin_user_data():
    """
    Endpoint for Supervisor to view full user records and contact information.
    """
    now = time.time()
    if CACHE["users"]["data"] and (now - CACHE["users"]["timestamp"] < CACHE_TTL):
        return CACHE["users"]["data"]
        
    try:
        import requests
        res = requests.get(f"{APPS_SCRIPT_URL}?sheet=Users", timeout=60.0)
        data = res.json()
        if not isinstance(data, list):
            data = []
        CACHE["users"]["data"] = data
        CACHE["users"]["timestamp"] = now
        return data
    except Exception as e:
        print(f"Error in GET /admin/users: {e}")
        if CACHE["users"]["data"]:
            return CACHE["users"]["data"]
        raise HTTPException(status_code=500, detail=str(e))

def format_phone(phone: str) -> str:
    if not phone: return phone
    phone = phone.strip()
    if phone.startswith("'"):
        phone = phone[1:]
    
    if phone.startswith('+6'):
        return "'" + phone
    if phone.startswith('60'):
        return "'+" + phone
    if phone.startswith('0'):
        return "'+6" + phone
    if not phone.startswith('+'):
        return "'+60" + phone
    return "'" + phone

@router.post("/users")
def create_admin_user(user: dict):
    from routers.auth import hash_password
    
    user_id = "u_" + str(uuid.uuid4())[:8]
    payload = {
        "action": "create_user",
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": format_phone(user.get("phone")),
        "location": user.get("neighborhood"),
        "role": user.get("role", "User")
    }
    
    if user.get("password"):
        payload["password_hash"] = hash_password(user["password"])
        
    try:
        import requests
        res = requests.post(APPS_SCRIPT_URL, json=payload, allow_redirects=True, timeout=60.0)
        
        CACHE["users"]["timestamp"] = 0
        CACHE["dashboard"]["timestamp"] = 0
        
        res_data = res.json()
        if "error" in res_data:
            raise HTTPException(status_code=400, detail=res_data["error"])
        return res_data.get("user", {})
    except HTTPException:
        raise
    except Exception as e:
        print("Error creating user:", e)
        raise HTTPException(status_code=500, detail="Failed to create user in Apps Script")

@router.put("/users/{user_id}")
def update_user(user_id: str, user: dict):
    from routers.auth import hash_password
    
    update_data = {
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": format_phone(user.get("phone")),
        "location": user.get("neighborhood") or user.get("location"),
        "role": user.get("role")
    }
    
    # Only update password if provided
    if user.get("newPassword"):
        update_data["password_hash"] = hash_password(user["newPassword"])
        
    payload = {
        "action": "update",
        "sheet": "Users",
        "id": user_id,
        "data": update_data
    }
    try:
        import requests
        res = requests.post(APPS_SCRIPT_URL, json=payload, allow_redirects=True, timeout=60.0)
        
        CACHE["users"]["timestamp"] = 0
        CACHE["dashboard"]["timestamp"] = 0
        
        res_data = res.json()
        if "error" in res_data:
            raise HTTPException(status_code=400, detail=res_data["error"])
        return {"success": True, "message": f"User {user_id} updated"}
    except Exception as e:
        print("Error updating user:", e)
        raise HTTPException(status_code=500, detail="Failed to update user in Apps Script")

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    payload = {
        "action": "delete",
        "sheet": "Users",
        "id": user_id
    }
    try:
        import requests
        res = requests.post(APPS_SCRIPT_URL, json=payload, allow_redirects=True, timeout=60.0)
        
        CACHE["users"]["timestamp"] = 0
        CACHE["dashboard"]["timestamp"] = 0
        
        res_data = res.json()
        if "error" in res_data:
            raise HTTPException(status_code=400, detail=res_data["error"])
        return {"success": True, "message": f"User {user_id} removed"}
    except Exception as e:
        print("Error deleting user:", e)
        raise HTTPException(status_code=500, detail="Failed to delete user in Apps Script")
