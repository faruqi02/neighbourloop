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
    telegram: Optional[str] = None,
    contact_notes: Optional[str] = None,
    preferred_method: Optional[str] = None
):
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if phone is not None:
        user.phone = phone
    if telegram is not None:
        user.telegram = telegram
    if contact_notes is not None:
        user.contactNotes = contact_notes
    if preferred_method is not None:
        user.preferredContactMethod = preferred_method
    return user
