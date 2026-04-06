from pydantic import BaseModel

class SignupRequest(BaseModel):
    name: str
    slug: str
    email: str
    password: str
    github_username: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    embed_token: str