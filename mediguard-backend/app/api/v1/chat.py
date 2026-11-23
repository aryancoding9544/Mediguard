import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.doctor_chat_service import doctor_chat_service

router = APIRouter()

class ChatMessageItem(BaseModel):
    role: str  # 'user' | 'model'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessageItem]] = []
    attached_prescription: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    status: str = "success"

@router.post("/message", response_model=ChatResponse)
async def chat_with_doctor(payload: ChatRequest):
    """
    Endpoint for patient-doctor medical chat with Gemini AI.
    Processes user inquiries with Dr. MediGuard clinical persona and system instructions.
    Can be provided with an attached_prescription from the user's history.
    """
    start_t = time.perf_counter()
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    print("\n" + "=" * 55)
    print(f"⏱️  [CHAT] Dr. MediGuard inquiry started: \"{user_msg[:50]}...\"")
    if payload.attached_prescription:
        print(f"  [CHAT] Attached Record: {payload.attached_prescription.get('order_number')}")

    try:
        history_dicts = [
            {"role": h.role, "content": h.content}
            for h in (payload.history or [])
        ]
        doctor_reply = await doctor_chat_service.get_doctor_response(
            message=user_msg,
            history=history_dicts,
            attached_prescription=payload.attached_prescription,
        )
        elapsed_sec = time.perf_counter() - start_t
        print(f"⏱️  [CHAT TIMER] Dr. MediGuard AI Response Completed in: {elapsed_sec:.2f}s ({elapsed_sec*1000:.0f} ms)")
        print("=" * 55 + "\n")
        return ChatResponse(reply=doctor_reply, status="success")
    except Exception as e:
        elapsed_sec = time.perf_counter() - start_t
        print(f"[ChatAPI Error] Failed after {elapsed_sec:.2f}s: {e}")
        print("=" * 55 + "\n")
        raise HTTPException(status_code=500, detail=str(e))
