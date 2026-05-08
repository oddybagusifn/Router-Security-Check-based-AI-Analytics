import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import traceback
from audit_logic import run_mikrotik_audit 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    host: str
    username: str
    password: str
    port: int = 22

@app.get("/")
def read_root():
    return {"status": "NexGuard API is Running"}

@app.post("/api/audit")
async def start_audit(req: AuditRequest):
    try:
        device = {
            'host': req.host,
            'username': req.username,
            'password': req.password,
            'port': req.port,
        }
        
        report = run_mikrotik_audit(device)
        
        return {
            "status": "success",
            "data": report 
        }
    except Exception as e:
        print("--- CRITICAL ERROR ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("[*] Starting NexGuard Backend on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)