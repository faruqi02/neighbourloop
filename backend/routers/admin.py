from fastapi import APIRouter, HTTPException, Query
from typing import List
import httpx
import uuid
from schemas import User, AdminStatsResponse
from database import USERS_DB, LISTINGS_DB, DONATIONS_DB, HELP_REQUESTS_DB, RECYCLE_CENTERS_DB, NOTICES_DB

router = APIRouter(prefix="/admin", tags=["Supervisor & Admin Dashboard"])
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

@router.get("/dashboard", response_model=AdminStatsResponse)
async def get_admin_dashboard_metrics():
    """
    Endpoint for FYP Supervisor: Aggregated system metrics and platform health.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.get(f"{APPS_SCRIPT_URL}?action=get_all", follow_redirects=True)
            data = res.json()
            return AdminStatsResponse(
                totalUsers=len(data.get("users", [])),
                totalListings=len(data.get("listings", [])),
                totalDonations=len(data.get("donations", [])),
                totalHelpRequests=len(data.get("helpRequests", [])),
                totalCenters=len(data.get("recycleCenters", [])),
                totalNotices=len(data.get("notices", [])),
                systemStatus="Online & Healthy"
            )
        except Exception:
            return AdminStatsResponse(totalUsers=0, totalListings=0, totalDonations=0, totalHelpRequests=0, totalCenters=0, totalNotices=0, systemStatus="Offline")

@router.get("/users")
async def get_admin_user_data():
    """
    Endpoint for Supervisor to view full user records and contact information.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(f"{APPS_SCRIPT_URL}?action=get_all", follow_redirects=True)
        data = res.json()
        return data.get("users", [])

@router.post("/users")
def create_admin_user(user: dict):
    user_id = "u_" + str(uuid.uuid4())[:8]
    payload = {
        "action": "create_user",
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "location": user.get("neighborhood"),
        "role": user.get("role", "User")
    }
    try:
        import requests
        res = requests.post(APPS_SCRIPT_URL, json=payload, allow_redirects=True, timeout=30.0)
        res_data = res.json()
        if "error" in res_data:
            raise HTTPException(status_code=400, detail=res_data["error"])
        return res_data.get("user", {})
    except HTTPException:
        raise
    except Exception as e:
        print("Error creating user:", e)
        raise HTTPException(status_code=500, detail="Failed to create user in Apps Script")

@router.patch("/users/{user_id}/status", response_model=User)
def toggle_user_status(user_id: str, status: str = Query("Aktif", pattern="^(Aktif|Digantung)$")):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = status
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    if user_id in USERS_DB:
        del USERS_DB[user_id]
        return {"success": True, "message": f"User {user_id} removed"}
    raise HTTPException(status_code=404, detail="User not found")
