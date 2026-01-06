from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_db
from routers import auth, events, enrollments, investors

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Offline Event Management API",
    description="Production-grade API for managing offline startup pitching events",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
app.include_router(investors.router, prefix="/investors", tags=["Investors"])

@app.get("/")
async def root():
    return {"message": "Offline Event Management API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

