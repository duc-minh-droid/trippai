@echo off
REM Quick start script for local development (Windows)

echo 🚀 Starting TripAI Backend...

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo ⚠️  No .env file found. Creating from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your API keys!
    pause
    exit /b 1
)

REM Start the server
echo ✅ Starting FastAPI server...
echo 🌐 API will be available at: http://localhost:8000
echo 📚 API docs at: http://localhost:8000/docs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
