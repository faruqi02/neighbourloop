from fastapi import APIRouter, HTTPException
from schemas import User, LoginRequest, RegisterRequest
from database import USERS_DB
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=User)
def login(data: LoginRequest):
    # Search by email or phone
    for user in USERS_DB.values():
        if user.email.lower() == data.identifier.lower() or user.phone == data.identifier:
            return user
    # Demo convenience: return Aisyah if not found
    return USERS_DB["u1"]

@router.post("/register", response_model=User)
def register(data: RegisterRequest):
    user_id = f"u{uuid.uuid4().hex[:6]}"
    new_user = User(
        id=user_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        location=data.location,
        greenPoints=50,  # Welcome bonus points
        avatarUrl=f"https://api.dicebear.com/7.x/bottts/png?seed={data.name}"
    )
    USERS_DB[user_id] = new_user
    return new_user

@router.get("/users", response_model=list[User])
def list_demo_users():
    return list(USERS_DB.values())

@router.get("/me/{user_id}", response_model=User)
def get_user(user_id: str):
    if user_id in USERS_DB:
        return USERS_DB[user_id]
    raise HTTPException(status_code=404, detail="User not found")

