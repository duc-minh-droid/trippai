#!/bin/bash

# Quick start script for local development
echo "🚀 Starting TripAI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
    exit 1
fi

# Start the server
echo "✅ Starting FastAPI server..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📚 API docs at: http://localhost:8000/docs"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
