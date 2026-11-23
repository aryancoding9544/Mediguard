from fastapi import APIRouter
from app.api.v1 import prescriptions, chat

api_router = APIRouter()
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
