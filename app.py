from dotenv import load_dotenv
from openai import OpenAI
import json
import os
import requests
from pypdf import PdfReader
import gradio as gr
from agents import Agent, Runner, function_tool
import asyncio

load_dotenv(override=True)

def push(text):
    requests.post(
        "https://api.pushover.net/1/messages.json",
        data={
            "token": os.getenv("PUSHOVER_TOKEN"),
            "user": os.getenv("PUSHOVER_USER"),
            "message": text,
        }
    )

@function_tool
def record_user_details(email: str, name: str = "Name not provided", notes: str = "not provided"):                
    """Use this tool to record that a user is interested 
in being in touch and provided an email address."""      
    push(f"Recording {name} with email {email} and notes {notes}")                                                
    return {"recorded": "ok"}                            
                            
@function_tool                                           
def record_unknown_question(question: str):
    """Always use this tool to record any question that 
couldn't be answered as you didn't know the answer."""
    push(f"Recording {question}")                        
    return {"recorded": "ok"}

@function_tool                                           
def search_knowledge_base(query: str) -> str:
    """Search this person's uploaded documents for       
relevant information about their background, skills and 
experience."""                                           
    return "Knowledge base not connected yet."

tools = [{"type": "function", "function": record_user_details},
        {"type": "function", "function": record_unknown_question}]


class Me:

    def __init__(self):
        self.openai = OpenAI()
        self.name = "Haresh Ramasamy"
        reader = PdfReader("me/linkedin.pdf")
        self.linkedin = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                self.linkedin += text
        with open("me/summary.txt", "r", encoding="utf-8") as f:
            self.summary = f.read()
    
    def system_prompt(self):
        system_prompt = f"You are acting as {self.name}. You are answering questions on {self.name}'s website, \
particularly questions related to {self.name}'s career, background, skills and experience. \
Your responsibility is to represent {self.name} for interactions on the website as faithfully as possible. \
You are given a summary of {self.name}'s background and LinkedIn profile which you can use to answer questions. \
Be professional and engaging, as if talking to a potential client or future employer who came across the website. \
If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career. \
If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your record_user_details tool. "

        system_prompt += f"\n\n## Summary:\n{self.summary}\n\n## LinkedIn Profile:\n{self.linkedin}\n\n"
        system_prompt += f"With this context, please chat with the user, always staying in character as {self.name}."
        return system_prompt
    
    def chat(self, message, history):
        agent = Agent(                                       
            name=self.name,                                  
            model="gpt-4o-mini",
            instructions=self.system_prompt(),               
            tools=[search_knowledge_base,                    
    record_user_details, record_unknown_question]
        )                                                    
        result = asyncio.run(Runner.run(agent, message))
        return result.final_output   
    

if __name__ == "__main__":
    me = Me()
    gr.ChatInterface(me.chat).launch()
    