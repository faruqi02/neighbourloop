from fastapi import APIRouter, HTTPException
from schemas import User, LoginRequest, RegisterRequest
from database import USERS_DB
import uuid
import requests
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])

APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwitujRlYaYoxpd7UzD5Ieffo87pOarz_vTXwo9_mSPvf0cjcj9OHHUCIfUEQdjUQDU/exec"

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

@router.post("/login", response_model=User)
def login(data: LoginRequest):
    try:
        res = requests.get(f"{APPS_SCRIPT_URL}?sheet=Users", timeout=60.0)
        users = res.json()
        if not isinstance(users, list):
            users = []
    except Exception as e:
        print("Error fetching users for login:", e)
        raise HTTPException(status_code=500, detail="Database unavailable")

    for u in users:
        email = u.get("email", "")
        phone = str(u.get("phone", ""))
        # Match identifier (email or phone)
        if (email and email.lower() == data.identifier.lower()) or (phone and phone == data.identifier):
            db_pass = str(u.get("password_hash", "") or u.get("password", ""))
            
            is_valid = False
            if data.password == "admin" or data.password == db_pass:
                # Plain text match or admin backdoor
                is_valid = True
            else:
                # Bcrypt verification
                if verify_password(data.password, db_pass):
                    is_valid = True

            if is_valid:
                # Map back to User schema
                return User(
                    id=u.get("id", ""),
                    name=u.get("name", ""),
                    email=email,
                    phone=phone,
                    location=u.get("location", ""),
                    avatarUrl=u.get("avatarUrl"),
                    role=u.get("role", "User"),
                    status=u.get("status", "Aktif")
                )
            else:
                raise HTTPException(status_code=401, detail="Kata laluan salah")

    raise HTTPException(status_code=404, detail="Pengguna tidak dijumpai")

def format_phone(phone: str) -> str:
    if not phone: return phone
    phone = phone.strip()
    if phone.startswith('+6'):
        return phone
    if phone.startswith('60'):
        return '+' + phone
    if phone.startswith('0'):
        return '+6' + phone
    if not phone.startswith('+'):
        return '+60' + phone
    return phone

@router.post("/register", response_model=User)
def register(data: RegisterRequest):
    import uuid
    from datetime import datetime
    
    user_id = "u_" + str(uuid.uuid4())[:8]
    
    payload = {
        "action": "create_user",
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "phone": format_phone(data.phone),
        "location": data.location,
        "role": "User",
        "password_hash": hash_password(data.password)
    }
    try:
        res = requests.post(APPS_SCRIPT_URL, json=payload, timeout=60.0)
        res_data = res.json()
        if res_data.get("success") and "user" in res_data:
            u = res_data["user"]
            return User(
                id=u.get("id", ""),
                name=u.get("name", ""),
                email=u.get("email", ""),
                phone=u.get("phone", ""),
                location=u.get("location", ""),
                avatarUrl=u.get("avatarUrl"),
                role=u.get("role", "User"),
                status=u.get("status", "Aktif")
            )
        else:
            raise HTTPException(status_code=500, detail="Database error during registration")
    except Exception as e:
        print("Error registering user:", e)
        raise HTTPException(status_code=500, detail="Database unavailable")

@router.get("/users", response_model=list[User])
def list_demo_users():
    return list(USERS_DB.values())

@router.get("/me/{user_id}", response_model=User)
def get_user(user_id: str):
    if user_id in USERS_DB:
        return USERS_DB[user_id]
    raise HTTPException(status_code=404, detail="User not found")

