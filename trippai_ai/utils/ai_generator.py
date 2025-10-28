"""Utility functions for generating AI explanations and travel tips."""

import requests
import pandas as pd
from typing import Dict

from config import OLLAMA_MODEL, OLLAMA_API_URL


def check_ollama_available() -> bool:
    """
    Check if Ollama is running and available.
    
    Returns:
        True if Ollama is available, False otherwise
    """
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={"model": OLLAMA_MODEL, "prompt": "test", "stream": False},
            timeout=5
        )
        return response.status_code == 200
    except Exception:
        return False


def generate_ai_explanation(
    destination: str,
    best_window: Dict,
    confidence: float,
    ollama_available: bool = True
) -> str:
    """
    Generate an AI explanation for why this week is the best time to travel.
    
    Uses Ollama (llama3:latest) if available, otherwise generates a template-based explanation.
    
    Args:
        destination: Destination name
        best_window: Dictionary with best window information
        confidence: Confidence score (0-1)
        ollama_available: Whether Ollama is available
    
    Returns:
        AI-generated or template-based explanation string
    """
    if not ollama_available:
        return generate_template_explanation(destination, best_window)
    
    try:
        best_date = pd.to_datetime(best_window["best_week"])
        month_name = best_date.strftime("%B")
        price = best_window["price"]
        
        prompt = f"""You are a travel advisor.

Destination: {destination}.
Best week: {best_date.strftime('%B %d, %Y')} ({month_name}).
Predicted price: ${round(price, 2)} USD.
Weather: {round(best_window['temperature'], 1)}°C, {round(best_window['precipitation'], 1)}mm precipitation.
Crowd level: {round(best_window['crowd_level'], 1)} / 100.
Travel score: {round(best_window['travel_score'], 1)} / 100.
Confidence: {round(confidence * 100, 0)}%.

Explain in 2-3 sentences why this week is the best time to go. 
Focus on the balance of price, weather, and crowd levels.
Be specific and mention actual numbers when relevant."""

        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 150
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            raise Exception(f"Ollama returned status code {response.status_code}")
    
    except Exception as e:
        print(f"⚠️  Warning: Could not generate AI explanation with Ollama: {e}")
        return generate_template_explanation(destination, best_window)


def generate_template_explanation(destination: str, best_window: Dict) -> str:
    """
    Generate a template-based explanation if Ollama is not available.
    
    Args:
        destination: Destination name
        best_window: Dictionary with best window information
    
    Returns:
        Template-based explanation string
    """
    best_date = pd.to_datetime(best_window["best_week"])
    month_name = best_date.strftime("%B")
    
    temp = best_window["temperature"]
    price = best_window["price"]
    crowd = best_window["crowd_level"]
    
    # Determine temperature quality
    if 18 <= temp <= 26:
        temp_desc = "comfortable"
    elif temp < 18:
        temp_desc = "mild"
    else:
        temp_desc = "warm"
    
    # Determine crowd level
    if crowd < 40:
        crowd_desc = "light tourist crowds"
    elif crowd < 70:
        crowd_desc = "moderate tourist levels"
    else:
        crowd_desc = "peak season activity"
    
    explanation = (
        f"{month_name} offers excellent value for {destination} — "
        f"flight prices around ${round(price, 0)}, {temp_desc} temperatures near {round(temp, 1)}°C, "
        f"and {crowd_desc}. This week provides an optimal balance across all factors."
    )
    
    return explanation
