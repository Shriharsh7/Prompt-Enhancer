from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

# SQLite database setup for rate limiting
conn = sqlite3.connect('usage.db', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS api_calls
             (id INTEGER PRIMARY KEY, user_id TEXT, timestamp TEXT, call_type TEXT)''')
conn.commit()

# Function to check daily calls
def check_daily_calls(user_id: str):
    one_day_ago = (datetime.now() - timedelta(days=1)).isoformat()
    c.execute("SELECT COUNT(*) FROM api_calls WHERE user_id = ? AND timestamp > ?", (user_id, one_day_ago))
    count = c.fetchone()[0]
    return count

# Verbose prompt templates with specialized categories
TEMPLATES = {
    "general": (
        "Generate a highly detailed and structured prompt based on the user input: '{topic}'. This prompt must be comprehensive, "
        "including a clear instruction (e.g., 'Write', 'Explain', 'Describe'), specific details about the topic or task, guidance "
        "on tone (e.g., informative, creative), audience (e.g., general public, experts), and any relevant constraints (e.g., word count "
        "range of 500-2000 words), structured with numbered sections or bullet points where applicable, encouraging thorough exploration "
        "of the subject matter without any brevity restrictions."
    ),
    "research": (
        "Generate a detailed prompt for a comprehensive research report on the topic: '{topic}', including sections for introduction, "
        "methodology, findings, and conclusion, with a suggested word count range of 750-2000 words. The prompt must provide specific "
        "instructions (e.g., 'Write', 'Analyze'), define the audience (e.g., academic or general with basic knowledge), set an informative "
        "tone, include guidance on citing sources (where possible), and encourage a structured, in-depth exploration of the topic with "
        "multiple subsections and detailed requirements."
    ),
    "creative": (
        "Generate an elaborate prompt for a creative story about '{topic}', specifying plot points, characters, and setting, "
        "with a suggested length of 500-1500 words. The prompt must include a clear instruction (e.g., 'Write', 'Create'), "
        "define a creative tone (e.g., adventurous, emotional), suggest a target audience (e.g., young adults, general readers), "
        "and provide detailed guidance on structure (e.g., beginning, climax, resolution) and character development, encouraging "
        "rich narrative depth without brevity constraints."
    ),
    "tech": (
        "Generate a detailed prompt to explain the concept of '{topic}', including its applications, implications, and technical details, "
        "with a suggested word count range of 500-2000 words. The prompt must include a clear instruction (e.g., 'Explain', 'Describe'), "
        "define an informative tone suitable for a technical audience with some background, provide guidance on using examples and diagrams "
        "where applicable, and encourage a thorough breakdown of the topic without any brevity restrictions."
    ),
    "technical_tutorial": (
        "Generate a detailed prompt for a step-by-step technical tutorial on the topic: '{topic}', with a suggested word count range of "
        "500-2000 words. The prompt must include a clear instruction (e.g., 'Create', 'Guide'), define an educational tone for beginners "
        "with some technical knowledge, provide a structured format with numbered steps or sections (e.g., setup, execution, examples), "
        "include practical examples or scenarios, and encourage a thorough, actionable explanation without brevity restrictions."
    ),
    "business_case_study": (
        "Generate a detailed prompt for a business case study on the topic: '{topic}', with a suggested word count range of 750-2000 words. "
        "The prompt must include a clear instruction (e.g., 'Analyze', 'Evaluate'), define a professional tone for business professionals, "
        "provide a structured format with sections (e.g., background, analysis, recommendations), include data-driven insights or hypothetical "
        "metrics where applicable, and encourage a comprehensive exploration of the topic without brevity constraints."
    ),
    "narrative_essay": (
        "Generate a detailed prompt for a narrative essay on the topic: '{topic}', with a suggested length of 500-1500 words. The prompt "
        "must include a clear instruction (e.g., 'Write', 'Narrate'), define a reflective or storytelling tone, suggest an audience (e.g., "
        "general readers, students), provide guidance on a chronological structure (e.g., introduction, events, reflection), and encourage "
        "a rich, personal narrative without brevity restrictions."
    ),
    "code_documentation": (
        "Generate a detailed prompt for documenting a code-related topic: '{topic}', with a suggested word count range of 500-1500 words. "
        "The prompt must include a clear instruction (e.g., 'Document', 'Explain'), define a technical tone for developers, provide a "
        "structured format with sections (e.g., overview, usage, examples), include pseudocode or function signatures where applicable, "
        "and encourage a thorough explanation of the code’s purpose and implementation without brevity restrictions."
    )
}

# State model
class State(BaseModel):
    prompt: str
    refinement_count: int = 0

# Request models
class GenerateRequest(BaseModel):
    prompt: str
    template: str = "general"

class RefineRequest(BaseModel):
    prompt: str
    additional_input: str
    refinement_count: int
    choice: str  # Added to match backend expectation

class TestRequest(BaseModel):
    prompt: str

# Functions to handle prompt processing
def start_node(state: State, template: str) -> State:
    prompt_template = TEMPLATES.get(template, TEMPLATES["general"])
    formatted_template = prompt_template.format(topic=state.prompt)
    response = model.generate_content(formatted_template)
    state.prompt = response.text
    state.refinement_count = 0
    return state

def add_context_node(state: State, additional_context: str, choice: str) -> State:
    if choice == "add_context":
        refinement_template = (
            f"Refine this detailed prompt by incorporating the extra context '{additional_context}', preserving its comprehensive "
            f"structure and depth, suitable for a 500-2000 word response: '{state.prompt}'"
        )
    else:
        refinement_template = (
            f"Refine this detailed prompt with the extra context '{additional_context}', preserving its structure and depth: '{state.prompt}'"
        )
    refined = model.generate_content(refinement_template)
    state.prompt = refined.text
    state.refinement_count += 1
    return state

# API endpoints with rate limiting
@app.post("/generate")
async def generate_prompt(request: GenerateRequest, req: Request):
    user_id = req.client.host
    if check_daily_calls(user_id) >= 25:
        raise HTTPException(status_code=429, detail="Daily limit of 25 calls reached. Try again tomorrow.")
    state = State(prompt=request.prompt)
    state = start_node(state, request.template)
    c.execute("INSERT INTO api_calls (user_id, timestamp, call_type) VALUES (?, ?, ?)", 
              (user_id, datetime.now().isoformat(), "generate"))
    conn.commit()
    return {
        "prompt": state.prompt,
        "refinement_count": state.refinement_count
    }

@app.post("/refine")
async def refine_prompt(request: RefineRequest, req: Request):
    user_id = req.client.host
    if check_daily_calls(user_id) >= 25:
        raise HTTPException(status_code=429, detail="Daily limit of 25 calls reached. Try again tomorrow.")
    if request.refinement_count >= 3:
        raise HTTPException(status_code=400, detail="Maximum refinements (3) reached")
    state = State(prompt=request.prompt, refinement_count=request.refinement_count)
    state = add_context_node(state, request.additional_input, request.choice)
    c.execute("INSERT INTO api_calls (user_id, timestamp, call_type) VALUES (?, ?, ?)", 
              (user_id, datetime.now().isoformat(), "refine"))
    conn.commit()
    return {
        "refined_prompt": state.prompt,
        "refinement_count": state.refinement_count
    }

@app.post("/test")
async def test_prompt(request: TestRequest, req: Request):
    user_id = req.client.host
    if check_daily_calls(user_id) >= 25:
        raise HTTPException(status_code=429, detail="Daily limit of 25 calls reached. Try again tomorrow.")
    response = model.generate_content(request.prompt)
    c.execute("INSERT INTO api_calls (user_id, timestamp, call_type) VALUES (?, ?, ?)", 
              (user_id, datetime.now().isoformat(), "test"))
    conn.commit()
    return {"response": response.text}

@app.get("/")
async def root():
    return {"message": "Prompt Enhancer API is running"}