import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
# Impor ini sekarang akan berhasil karena audit_logic.py sudah diperbaiki
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

@app.post("/api/audit")
async def start_audit(req: AuditRequest):
    try:
        device = {
            'device_type': 'mikrotik_routeros',
            'host': req.host,
            'username': req.username,
            'password': req.password,
            'port': req.port,
        }
        
        report = run_mikrotik_audit(device)
        return {
            "status": "success",
            "target": req.host,
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            "data": report.get("audit_results", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)