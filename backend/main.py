from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from processing import validate_and_process_file
from nlp_engine import NLPEngine
import pandas as pd

app = FastAPI(title="CostAdvisor API")

# Global state for MVP
CURRENT_DATA = None
nlp = NLPEngine()

# Enable CORS for frontend usage (React/Vite usually on 5173)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to CostAdvisor API", "status": "running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Endpoint to upload financial data (CSV/Excel).
    Validates structure and returns a summary.
    """
    global CURRENT_DATA
    try:
        content = await file.read()
        df = validate_and_process_file(content, file.filename)
        
        # Update Global State
        CURRENT_DATA = df
        nlp.set_data(df)
        
        # Determine stats
        total_budget = float(df['budget'].sum())
        total_real = float(df['real'].sum())
        total_variance = float(df['variance'].sum())
        
        # Top offender (service with highest overspending)
        # Filter for positive variance (Real > Budget)
        over_budget = df[df['variance'] > 0]
        top_offender = None
        if not over_budget.empty:
            top_offender_row = over_budget.loc[over_budget['variance'].idxmax()]
            top_offender = {
                "service": top_offender_row['service'],
                "amount": float(top_offender_row['variance'])
            }
        
        # Convert minimal data for preview (first 5 rows)
        preview = df.head(5).to_dict(orient='records')
        
        return {
            "status": "success",
            "summary": {
                "total_budget": total_budget,
                "total_real": total_real,
                "total_variance": total_variance,
                "top_offender": top_offender
            },
            "preview": preview,
            "filename": file.filename
        }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest):
    """
    Endpoint for AI Chat.
    """
    try:
        response = nlp.generate_response(request.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
