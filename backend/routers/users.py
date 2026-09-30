import time
import requests
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import User, UserProfileUpdate
from database import USERS_DB
from routers.auth import APPS_SCRIPT_URL, format_phone, hash_password

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[User])
def get_all_users():
    return list(USERS_DB.values())

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str):
    # Try fetching from Apps Script
    try:
        res = requests.get(f"{APPS_SCRIPT_URL}?sheet=Users&id={user_id}", timeout=60.0)
        u = res.json()
        if isinstance(u, dict) and "id" in u:
            raw_lat = u.get("lat")
            raw_lng = u.get("lng")
            raw_radius = u.get("radiusKm")
            email = u.get("email", "")
            return User(
                id=str(u.get("id", user_id)),
                name=str(u.get("name", "")),
                username=str(u.get("username", "") or (email.split("@")[0] if email else "")),
                email=str(email),
                phone=str(u.get("phone", "")),
                location=str(u.get("location", "")),
                lat=float(raw_lat) if raw_lat not in [None, ""] else None,
                lng=float(raw_lng) if raw_lng not in [None, ""] else None,
                radiusKm=int(raw_radius) if raw_radius not in [None, ""] else 5,
                avatarUrl=u.get("avatarUrl") or None,
                role=str(u.get("role", "User")),
                status=str(u.get("status", "Aktif"))
            )
    except Exception as e:
        print("Error fetching user from Apps Script:", e)

    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/update-profile", response_model=User)
@router.put("/profile/{user_id}", response_model=User)
def update_profile(data: UserProfileUpdate, user_id: Optional[str] = None):
    target_id = user_id or data.user_id
    if not target_id:
        raise HTTPException(status_code=400, detail="ID Pengguna diperlukan")

    # If base64 avatar is provided, upload it to Google Drive first
    uploaded_avatar_url = None
    base64_img = data.avatarBase64
    if not base64_img and data.avatarUrl and (data.avatarUrl.startswith("data:image") or len(data.avatarUrl) > 300):
        base64_img = data.avatarUrl

    if base64_img:
        try:
            upload_payload = {
                "action": "upload_file",
                "base64": base64_img,
                "filename": f"avatar_{target_id}_{int(time.time())}.jpg",
                "mimeType": "image/jpeg",
                "userId": target_id
            }
            up_res = requests.post(APPS_SCRIPT_URL, json=upload_payload, timeout=60.0)
            up_json = up_res.json()
            if isinstance(up_json, dict):
                if up_json.get("url"):
                    uploaded_avatar_url = up_json["url"]
                elif up_json.get("fileId"):
                    uploaded_avatar_url = f"https://lh3.googleusercontent.com/d/{up_json['fileId']}"
        except Exception as e:
            print("Error uploading avatar to Google Drive via Apps Script:", e)

    update_data = {}
    if data.name:
        update_data["name"] = data.name.strip()
    if data.username is not None:
        update_data["username"] = data.username.strip().lstrip('@')
    if data.email:
        update_data["email"] = data.email.strip()
    if data.phone is not None:
        update_data["phone"] = format_phone(data.phone)
    if data.location is not None:
        update_data["location"] = data.location.strip()
    if data.lat is not None:
        update_data["lat"] = data.lat
    if data.lng is not None:
        update_data["lng"] = data.lng
    if data.radiusKm is not None:
        update_data["radiusKm"] = data.radiusKm
    if uploaded_avatar_url:
        update_data["avatarUrl"] = uploaded_avatar_url
    elif data.avatarUrl and not data.avatarUrl.startswith("data:image"):
        update_data["avatarUrl"] = data.avatarUrl
    if data.newPassword and len(data.newPassword.strip()) >= 6:
        update_data["password_hash"] = hash_password(data.newPassword.strip())

    payload = {
        "action": "update",
        "sheet": "Users",
        "id": target_id,
        "data": update_data
    }

    try:
        res = requests.post(APPS_SCRIPT_URL, json=payload, allow_redirects=True, timeout=60.0)
        # Clear admin cache so dashboard reflects updates immediately
        try:
            from routers.admin import CACHE
            CACHE["users"]["timestamp"] = 0
            CACHE["dashboard"]["timestamp"] = 0
        except Exception:
            pass
    except Exception as e:
        print("Error updating user in Apps Script:", e)
        raise HTTPException(status_code=500, detail="Gagal mengemaskini data ke pangkalan data")

    # Update in-memory user if present
    if target_id in USERS_DB:
        mem_user = USERS_DB[target_id]
        if data.name: mem_user.name = data.name
        if data.username is not None: mem_user.username = data.username.strip().lstrip('@')
        if data.email: mem_user.email = data.email
        if data.phone is not None: mem_user.phone = data.phone
        if data.location is not None: mem_user.location = data.location
        if data.lat is not None: mem_user.lat = data.lat
        if data.lng is not None: mem_user.lng = data.lng
        if data.radiusKm is not None: mem_user.radiusKm = data.radiusKm
        if "avatarUrl" in update_data: mem_user.avatarUrl = update_data["avatarUrl"]

    # Fetch fresh user from DB
    return get_user(target_id)

@router.post("/update-location", response_model=User)
def update_user_location(user_id: str, location: str, radius_km: int = 5, lat: Optional[float] = None, lng: Optional[float] = None):
    return update_profile(data=UserProfileUpdate(user_id=user_id, location=location, radiusKm=radius_km, lat=lat, lng=lng), user_id=user_id)

@router.post("/update-contact", response_model=User)
def update_contact_details(
    user_id: str,
    phone: Optional[str] = None,
    username: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
):
    return update_profile(
        data=UserProfileUpdate(user_id=user_id, phone=phone, username=username, location=location, lat=lat, lng=lng),
        user_id=user_id
    )
