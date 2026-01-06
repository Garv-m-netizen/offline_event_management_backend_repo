@echo off
echo Starting Backend Server from project root...
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

