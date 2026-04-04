import hashlib
from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from api.db import get_user_by_id, get_user_by_embed_token
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
security = HTTPBearer()

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_embed_token(embed_token: str) -> dict:
    user = get_user_by_embed_token(hash_token(embed_token))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid embed token")
    return user