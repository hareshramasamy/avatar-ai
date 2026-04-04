from fastapi import APIRouter, UploadFile, File, Form, Depends, BackgroundTasks, HTTPException
from api.deps import get_current_user
from ingestion.pipeline import ingest_document
import asyncio
import uuid

router = APIRouter()

@router.post("/users/{user_id}/documents")
async def upload_document(
    user_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(None),
    github_url: str = Form(None),
    github_profile_url: str = Form(None),
    raw_text: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    doc_id = str(uuid.uuid4())
    metadata = {"user_id": user_id, "doc_id": doc_id}

    if file:
        content = await file.read()
        source_type = "pdf" if file.filename.endswith(".pdf") else "text"
        metadata["filename"] = file.filename
        background_tasks.add_task(asyncio.run, ingest_document(user_id, source_type, content, metadata))

    elif github_url:
        metadata["filename"] = github_url
        background_tasks.add_task(asyncio.run, ingest_document(user_id, "github_url", github_url, metadata))

    elif github_profile_url:
        metadata["filename"] = github_profile_url
        background_tasks.add_task(asyncio.run, ingest_document(user_id, "github_profile", github_profile_url, metadata))

    elif raw_text:
        metadata["filename"] = "raw_text"
        background_tasks.add_task(asyncio.run, ingest_document(user_id, "text", raw_text, metadata))

    return {"doc_id": doc_id, "status": "processing"}