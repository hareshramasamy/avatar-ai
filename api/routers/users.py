import secrets, hashlib
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.deps import get_current_user
from api.db import (
    get_user_by_id, update_user_config,
    save_unanswered_question, list_unanswered_questions, delete_unanswered_question,
    delete_all_documents, delete_all_unanswered, delete_user,
    get_table,
)
from ingestion.store import delete_user_namespace
from ingestion.pipeline import ingest_document
import uuid
from datetime import datetime, timezone

router = APIRouter()


class ConfigUpdate(BaseModel):
    persona_tone: str = "professional"
    ask_for_email: bool = True
    topics_to_avoid: str = ""


class AnswerRequest(BaseModel):
    answer: str


@router.get("/users/{user_id}/config")
def get_config(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = get_user_by_id(user_id)
    return user.get("avatar_config", {
        "persona_tone": "professional",
        "ask_for_email": True,
        "topics_to_avoid": ""
    })


@router.patch("/users/{user_id}/config")
def patch_config(user_id: str, config: ConfigUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    update_user_config(user_id, config.model_dump())
    return {"updated": True}


@router.delete("/users/{user_id}")
def delete_account(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    delete_user_namespace(user_id)
    delete_all_documents(user_id)
    delete_all_unanswered(user_id)
    delete_user(user_id)
    return {"deleted": True}


@router.post("/users/{user_id}/regenerate-token")
def regenerate_token(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    new_token = secrets.token_hex(16)
    token_hash = hashlib.sha256(new_token.encode()).hexdigest()
    get_table().update_item(
        Key={"user_id": user_id},
        UpdateExpression="SET embed_token_hash = :h",
        ExpressionAttributeValues={":h": token_hash},
    )
    return {"embed_token": new_token}


@router.get("/users/{user_id}/unanswered")
def get_unanswered(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    questions = list_unanswered_questions(user_id)
    return {"questions": sorted(questions, key=lambda q: q.get("asked_at", ""), reverse=True)}


@router.post("/users/{user_id}/unanswered/{question_id}/answer")
async def answer_question(
    user_id: str,
    question_id: str,
    body: AnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    questions = list_unanswered_questions(user_id)
    question = next((q for q in questions if q["question_id"] == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    doc_id = str(uuid.uuid4())
    raw_text = f"Q: {question['question']}\nA: {body.answer}"
    metadata = {"user_id": user_id, "doc_id": doc_id, "filename": "unanswered_answer"}
    await ingest_document(user_id, "text", raw_text, metadata)

    delete_unanswered_question(user_id, question_id)
    return {"resolved": question_id}
