import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MEDIGUARD AI-Powered Prescription OCR & Medicine Verification API",
    version="1.0.0",
)

# Configure CORS for Mobile Client & Web Viewers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "MEDIGUARD",
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0",
    }

@app.get("/health")
def health_check():
    has_gemini = bool(settings.GEMINI_API_KEY)
    return {
        "status": "healthy",
        "gemini_configured": has_gemini,
        "model": settings.GEMINI_MODEL,
    }
