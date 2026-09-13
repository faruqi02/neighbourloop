from fastapi import APIRouter, HTTPException, Query
from typing import List
from schemas import User, ActivityItem
from database import USERS_DB, ACTIVITIES_DB

router = APIRouter(prefix="/users", tags=["Users & Community Activity"])

@router.get("/activities", response_model=List[ActivityItem])
def get_recent_activities(limit: int = 10):
    return ACTIVITIES_DB[:limit]

@router.post("/update-location", response_model=User)
def update_user_location(user_id: str, location: str, radius_km: int = 5):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.location = location
    user.radiusKm = radius_km
    return user

@router.post("/add-points", response_model=User)
def add_green_points(user_id: str, points: int):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.greenPoints += points
    return user

