"""Travel Tip Service for generating personalized AI travel tips."""

import requests
from typing import Dict, Optional, List
from datetime import datetime
import pandas as pd
from config import OLLAMA_MODEL, OLLAMA_API_URL


class TravelTipService:
    """
    Service for generating personalized travel tips based on predictions.
    
    Uses LLM to create actionable 2-3 sentence travel tips based on:
    - Predicted month/season
    - Weather conditions
    - Crowd levels
    - Price information
    - Major events/festivals
    """
    
    def __init__(self):
        """Initialize the travel tip service."""
        self.ollama_available = self._check_ollama_available()
        if self.ollama_available:
            print(f"✓ Travel Tip Service initialized with {OLLAMA_MODEL}")
        else:
            print("⚠️  Ollama not available - using template-based travel tips")
    
    def _check_ollama_available(self) -> bool:
        """Check if Ollama is running and available."""
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={"model": OLLAMA_MODEL, "prompt": "test", "stream": False},
                timeout=5
            )
            return response.status_code == 200
        except Exception:
            return False
    
    def generate_travel_tip(
        self,
        destination: str,
        start_date: str,
        temperature: float,
        precipitation: float,
        crowd_level: float,
        price: float,
        trip_days: int = 7,
        events: Optional[List[Dict]] = None,
        event_warning: Optional[str] = None
    ) -> str:
        """
        Generate a personalized travel tip based on prediction data.
        
        Args:
            destination: Destination city name
            start_date: Start date of trip (YYYY-MM-DD format)
            temperature: Predicted temperature in Celsius
            precipitation: Predicted precipitation in mm
            crowd_level: Crowd level score (0-100)
            price: Predicted trip cost
            trip_days: Length of trip in days
            events: List of major events happening during trip (optional)
            event_warning: Warning message about events affecting the trip (optional)
        
        Returns:
            2-3 sentence personalized travel tip
        """
        if not self.ollama_available:
            return self._generate_template_tip(
                destination, start_date, temperature, precipitation, crowd_level, events, event_warning
            )
        
        try:
            # Parse date to get season and month
            date_obj = pd.to_datetime(start_date)
            month_name = date_obj.strftime("%B")
            season = self._get_season(date_obj.month)
            
            # Categorize conditions
            weather_desc = self._describe_weather(temperature, precipitation)
            crowd_desc = self._describe_crowd(crowd_level)
            
            # Add event information to prompt if available
            event_context = ""
            if events and len(events) > 0:
                event_names = [e.get("name", "") for e in events[:2]]
                event_context = f"\n- Major Events: {', '.join(event_names)}"
            
            # Create prompt for LLM
            prompt = f"""You are a helpful travel advisor. Generate a personalized, actionable travel tip for someone visiting {destination}.

Trip Details:
- Destination: {destination}
- Travel Month: {month_name} ({season})
- Temperature: {round(temperature, 1)}°C
- Precipitation: {round(precipitation, 1)}mm
- Crowd Level: {crowd_desc}{event_context}
- Trip Length: {trip_days} days

Generate a 2-3 sentence travel tip that:
1. Mentions the season/month and what makes it special
2. If there are major events, mention them and suggest attending
3. Gives specific, actionable advice about what to pack or do
4. Is friendly, encouraging, and helpful

Example: "Since you're visiting during spring, pack light jackets and enjoy Paris's cherry blossoms in full bloom. The mild weather is perfect for long walks along the Seine."

Generate a similar tip for {destination} in {month_name}:"""

            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.8,
                        "num_predict": 120,
                        "top_p": 0.9
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                tip = result.get("response", "").strip()
                
                # Clean up the response - remove any quotes or extra formatting
                tip = tip.strip('"').strip("'").strip()
                
                # If the tip is too long, truncate at the last sentence
                if len(tip) > 250:
                    sentences = tip.split('. ')
                    if len(sentences) >= 2:
                        tip = '. '.join(sentences[:2]) + '.'
                
                return tip
            else:
                raise Exception(f"Ollama returned status code {response.status_code}")
        
        except Exception as e:
            print(f"⚠️  Warning: Could not generate AI travel tip with Ollama: {e}")
            return self._generate_template_tip(
                destination, start_date, temperature, precipitation, crowd_level, events, event_warning
            )
    
    def _get_season(self, month: int) -> str:
        """Get season name from month number."""
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "fall"
    
    def _describe_weather(self, temp: float, precip: float) -> str:
        """Describe weather conditions."""
        if temp < 10:
            temp_desc = "cold"
        elif temp < 20:
            temp_desc = "mild"
        elif temp < 28:
            temp_desc = "warm"
        else:
            temp_desc = "hot"
        
        if precip < 2:
            rain_desc = "dry"
        elif precip < 5:
            rain_desc = "light rain"
        else:
            rain_desc = "rainy"
        
        return f"{temp_desc} and {rain_desc}"
    
    def _describe_crowd(self, crowd: float) -> str:
        """Describe crowd level."""
        if crowd < 30:
            return "low crowds"
        elif crowd < 60:
            return "moderate crowds"
        else:
            return "high crowds"
    
    def _generate_template_tip(
        self,
        destination: str,
        start_date: str,
        temperature: float,
        precipitation: float,
        crowd_level: float,
        events: Optional[List[Dict]] = None,
        event_warning: Optional[str] = None
    ) -> str:
        """Generate a template-based travel tip if LLM is not available."""
        date_obj = pd.to_datetime(start_date)
        month_name = date_obj.strftime("%B")
        season = self._get_season(date_obj.month)
        
        # Build contextual tip based on season and conditions
        tips = []
        
        # Event-specific tips (highest priority)
        if events and len(events) > 0:
            event_name = events[0].get("name", "")
            if event_name:
                tips.append(f"Your trip coincides with {event_name} - consider attending this exciting event")
        
        # Season-specific tips
        if season == "spring":
            tips.append(f"Visit {destination} in {month_name} during spring bloom")
        elif season == "summer":
            tips.append(f"Enjoy {destination}'s summer activities in {month_name}")
        elif season == "fall":
            tips.append(f"Experience {destination}'s autumn colors in {month_name}")
        else:
            tips.append(f"Discover {destination}'s winter charm in {month_name}")
        
        # Weather-based packing advice
        if temperature < 15:
            tips.append("Pack warm layers and a good jacket for cool temperatures")
        elif temperature < 25:
            tips.append("Pack light layers for comfortable, mild weather")
        else:
            tips.append("Pack light, breathable clothing for warm weather")
        
        # Precipitation advice
        if precipitation > 3:
            tips.append("Don't forget an umbrella or rain jacket")
        
        # Crowd advice (consider events)
        if crowd_level < 40:
            tips.append("Enjoy fewer crowds and more authentic local experiences")
        elif crowd_level > 70:
            if events and len(events) > 0:
                tips.append("Book accommodations and attractions early due to major events")
            else:
                tips.append("Book attractions in advance to avoid long queues")
        
        # Combine into 2-3 sentences
        if len(tips) >= 3:
            return f"{tips[0]}. {tips[1]}, and {tips[2].lower()}."
        elif len(tips) == 2:
            return f"{tips[0]}. {tips[1]}."
        else:
            return tips[0] + "."
