from fastapi import APIRouter, HTTPException, Query
from typing import List
from schemas import User, AdminStatsResponse
from database import USERS_DB, LISTINGS_DB, DONATIONS_DB, HELP_REQUESTS_DB, RECYCLE_CENTERS_DB, NOTICES_DB

router = APIRouter(prefix="/admin", tags=["Supervisor & Admin Dashboard"])

@router.get("/dashboard", response_model=AdminStatsResponse)
def get_admin_dashboard_metrics():
    """
    Endpoint for FYP Supervisor: Aggregated system metrics and platform health.
    """
    return AdminStatsResponse(
        totalUsers=len(USERS_DB),
        totalListings=len(LISTINGS_DB),
        totalDonations=len(DONATIONS_DB),
        totalHelpRequests=len(HELP_REQUESTS_DB),
        totalCenters=len(RECYCLE_CENTERS_DB),
        totalNotices=len(NOTICES_DB),
        systemStatus="Online & Healthy"
    )

@router.get("/users", response_model=List[User])
def get_admin_user_data():
    """
    Endpoint for Supervisor to view full user records and contact information.
    """
    return list(USERS_DB.values())

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
