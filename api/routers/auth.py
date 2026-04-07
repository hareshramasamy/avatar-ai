import uuid, secrets, hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from jose import jwt
from bcrypt import hashpw, checkpw, gensalt
import os

from api.models import SignupRequest, LoginRequest, AuthResponse
from api.db import create_user, get_user_by_email

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    if get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    password_hash = hashpw(req.password.encode(), gensalt()).decode()
    embed_token = secrets.token_hex(16)

    create_user(
        user_id=user_id,
        name=req.name,
        slug=req.slug,
        email=req.email,
        password_hash=password_hash,
        embed_token_hash=hash_token(embed_token),
    )

    access_token = create_access_token(user_id)
    return AuthResponse(access_token=access_token, user_id=user_id, embed_token=embed_token, name=req.name)

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user or not checkpw(req.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(user["user_id"])
    # embed_token is stored hashed — not retrievable on login
    return AuthResponse(access_token=access_token, user_id=user["user_id"], embed_token="", name=user.get("name", ""))