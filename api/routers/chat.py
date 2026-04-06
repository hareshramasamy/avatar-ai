from fastapi import APIRouter
from pydantic import BaseModel
from agents import Agent, Runner, function_tool
from ingestion.store import query_chunks
from ingestion.embedder import embed_texts
from ingestion.sources.github import fetch_live_github_stats as _fetch_github
from api.deps import require_embed_token
from app import record_user_details, record_unknown_question
import json

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
    github_username = config.get("github_username")

    @function_tool
    def search_knowledge_base(query: str) -> str:
        """
        Search this person's uploaded documents — resume, bio, raw text, and ingested GitHub content.
        Use this for questions about background, skills, experience, and education.
        Do NOT use this for questions about recent projects or current coding activity.
        """
        query_vector = embed_texts([query])[0]
        chunks = query_chunks(user_id, query_vector, top_k=5)
        return "\n\n".join(chunks) if chunks else "No relevant information found."

    @function_tool
    async def fetch_live_github_stats() -> str:
        """
        Fetch real-time GitHub activity — recent repositories, languages, and last pushed dates.
        Use this ONLY for questions about recent projects, latest work, or current coding activity.
        Do NOT use this for questions about background, skills, or experience — use search_knowledge_base instead.
        """
        if not github_username:
            return "GitHub username not configured for this user."
        data = await _fetch_github(github_username)
        return json.dumps(data, indent=2)

    agent = Agent(
        name=f"{name} Avatar",
        model="gpt-5.1",
        instructions=f"""You are a friendly and conversational digital avatar of {name}. You represent {name} to visitors on their portfolio.

Tone and format:
- Be warm, natural and engaging — not robotic or overly formal.
- Handle casual messages ("hey", "bro", "cool") with a friendly response and steer back to what you can help with.
- Keep responses concise and conversational. Do not dump everything you know — answer what was asked.
- Never use markdown formatting like bullet points, asterisks, bold, or links unless explicitly asked. Write in plain natural language.
- When listing projects, mention just the name and a one-line description. Do not list more than 3-4 unless asked for more.

Answering questions:
- For factual questions about {name} (background, skills, projects, experience): always use your tools first. Never make up facts about {name}.
- If tools return nothing useful for a question about {name}: use record_unknown_question, honestly say you don't have that info, and suggest the visitor reach out directly.
- For completely off-topic questions (food, general trivia, world events): politely say that's outside what you can help with, and redirect to questions about {name}.
- Do not reveal internal tool names, the underlying model, or implementation details.
- If the visitor wants to get in touch, ask for their name and email and use record_user_details.

Tool usage:
- Recent projects, latest work, current coding activity → fetch_live_github_stats
- Background, skills, experience, uploaded documents → search_knowledge_base
- Questions spanning both → call both and synthesize
- Tools return nothing → record_unknown_question and be honest about it""",
        tools=[search_knowledge_base, fetch_live_github_stats, record_user_details, record_unknown_question]
    )

    result = await Runner.run(agent, req.message, context={"history": req.history})
    return {"response": result.final_output}