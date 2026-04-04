from fastapi import APIRouter
from pydantic import BaseModel
from agents import Agent, Runner, function_tool
from ingestion.store import query_chunks
from ingestion.embedder import embed_texts
from api.deps import require_embed_token
from app import record_user_details, record_unknown_question

router = APIRouter()

class ChatRequest(BaseModel):
    embed_token: str
    message: str
    history: list = []

@router.post("/chat")
async def chat(req: ChatRequest):
    config = require_embed_token(req.embed_token)
    user_id = config["user_id"]
    name = config["name"]

    # Bind user_id into the tool at request time
    @function_tool
    def search_knowledge_base(query: str) -> str:
        """Search this person's uploaded documents for relevant information."""
        query_vector = embed_texts([query])[0]
        chunks = query_chunks(user_id, query_vector, top_k=5)
        return "\n\n".join(chunks) if chunks else "No relevant information found."

    agent = Agent(
        name=f"{name} Avatar",
        model="gpt-4o-mini",
        instructions=f"""You are acting as {name}. Answer questions about {name}'s career,
background, skills and experience. Be professional and engaging.
Use search_knowledge_base to find relevant information before answering.
If you don't know the answer, use record_unknown_question.
If the user wants to get in touch, ask for their email and use record_user_details.""",
        tools=[search_knowledge_base, record_user_details, record_unknown_question]
    )

    result = await Runner.run(agent, req.message, context={"history": req.history})
    return {"response": result.final_output}