from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import User
from database import USERS_DB

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[User])
def get_all_users():
    return list(USERS_DB.values())

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/update-location", response_model=User)
def update_user_location(user_id: str, location: str, radius_km: int = 5):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.location = location
    user.radiusKm = radius_km
    return user

@router.post("/update-contact", response_model=User)
def update_contact_details(
    user_id: str,
    phone: Optional[str] = None,
    username: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if phone is not None:
        user.phone = phone
    if username is not None:
        user.username = username
    if location is not None:
        user.location = location
    if lat is not None:
        user.lat = lat
    if lng is not None:
        user.lng = lng
    return user
