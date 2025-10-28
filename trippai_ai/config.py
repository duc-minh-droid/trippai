"""Configuration for the TripAI model."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ollama API configuration
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:latest")
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")

# RapidAPI configuration
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

# Eventbrite API configuration
EVENTBRITE_API_KEY = os.getenv("EVENTBRITE_API_KEY")
EVENTBRITE_API_URL = "https://www.eventbriteapi.com/v3"

# Open-Meteo API endpoint
OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast"

# Weather comfort weights
WEATHER_WEIGHTS = {
    "temperature": 0.4,
    "precipitation": 0.3,
    "cloud_cover": 0.2,
    "wind_speed": 0.1
}

# Ideal weather conditions
IDEAL_TEMPERATURE = 22  # Celsius
TEMPERATURE_TOLERANCE = 10  # Degrees from ideal

# TravelScore weights
TRAVEL_SCORE_WEIGHTS = {
    "price": 0.4,
    "weather": 0.35,
    "crowd": 0.25
}

# Price normalization bounds (for synthetic data)
MIN_PRICE = 200
MAX_PRICE = 500

# City coordinates database (for quick lookup)
CITY_COORDINATES = {
    "paris": {"lat": 48.8566, "lon": 2.3522},
    "barcelona": {"lat": 41.3874, "lon": 2.1686},
    "london": {"lat": 51.5074, "lon": -0.1278},
    "rome": {"lat": 41.9028, "lon": 12.4964},
    "tokyo": {"lat": 35.6762, "lon": 139.6503},
    "new york": {"lat": 40.7128, "lon": -74.0060},
    "sydney": {"lat": -33.8688, "lon": 151.2093},
}

# Supported destinations for API
DESTINATIONS = [
    {"name": "Barcelona", "country": "Spain", "lat": 41.3851, "lon": 2.1734},
    {"name": "Paris", "country": "France", "lat": 48.8566, "lon": 2.3522},
    {"name": "London", "country": "UK", "lat": 51.5074, "lon": -0.1278},
    {"name": "New York", "country": "USA", "lat": 40.7128, "lon": -74.0060},
    {"name": "Tokyo", "country": "Japan", "lat": 35.6762, "lon": 139.6503},
    {"name": "Rome", "country": "Italy", "lat": 41.9028, "lon": 12.4964},
    {"name": "Berlin", "country": "Germany", "lat": 52.5200, "lon": 13.4050},
    {"name": "Madrid", "country": "Spain", "lat": 40.4168, "lon": -3.7038},
    {"name": "Amsterdam", "country": "Netherlands", "lat": 52.3676, "lon": 4.9041},
    {"name": "Vienna", "country": "Austria", "lat": 48.2082, "lon": 16.3738},
    {"name": "Prague", "country": "Czech Republic", "lat": 50.0755, "lon": 14.4378},
    {"name": "Lisbon", "country": "Portugal", "lat": 38.7223, "lon": -9.1393},
    {"name": "Athens", "country": "Greece", "lat": 37.9838, "lon": 23.7275},
    {"name": "Budapest", "country": "Hungary", "lat": 47.4979, "lon": 19.0402},
    {"name": "Stockholm", "country": "Sweden", "lat": 59.3293, "lon": 18.0686},
    {"name": "Copenhagen", "country": "Denmark", "lat": 55.6761, "lon": 12.5683},
    {"name": "Dublin", "country": "Ireland", "lat": 53.3498, "lon": -6.2603},
    {"name": "Edinburgh", "country": "Scotland", "lat": 55.9533, "lon": -3.1883},
    {"name": "Oslo", "country": "Norway", "lat": 59.9139, "lon": 10.7522},
    {"name": "Helsinki", "country": "Finland", "lat": 60.1699, "lon": 24.9384},
    {"name": "Brussels", "country": "Belgium", "lat": 50.8503, "lon": 4.3517},
    {"name": "Zurich", "country": "Switzerland", "lat": 47.3769, "lon": 8.5417},
    {"name": "Munich", "country": "Germany", "lat": 48.1351, "lon": 11.5820},
    {"name": "Florence", "country": "Italy", "lat": 43.7696, "lon": 11.2558},
    {"name": "Venice", "country": "Italy", "lat": 45.4408, "lon": 12.3155},
    {"name": "Milan", "country": "Italy", "lat": 45.4642, "lon": 9.1900},
    {"name": "Nice", "country": "France", "lat": 43.7102, "lon": 7.2620},
    {"name": "Lyon", "country": "France", "lat": 45.7640, "lon": 4.8357},
    {"name": "Marseille", "country": "France", "lat": 43.2965, "lon": 5.3698},
    {"name": "Geneva", "country": "Switzerland", "lat": 46.2044, "lon": 6.1432},
    {"name": "Hamburg", "country": "Germany", "lat": 53.5511, "lon": 9.9937},
    {"name": "Warsaw", "country": "Poland", "lat": 52.2297, "lon": 21.0122},
    {"name": "Krakow", "country": "Poland", "lat": 50.0647, "lon": 19.9450},
    {"name": "Sydney", "country": "Australia", "lat": -33.8688, "lon": 151.2093},
    {"name": "Melbourne", "country": "Australia", "lat": -37.8136, "lon": 144.9631},
    {"name": "Singapore", "country": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"name": "Hong Kong", "country": "Hong Kong", "lat": 22.3193, "lon": 114.1694},
    {"name": "Bangkok", "country": "Thailand", "lat": 13.7563, "lon": 100.5018},
    {"name": "Dubai", "country": "UAE", "lat": 25.2048, "lon": 55.2708},
    {"name": "Istanbul", "country": "Turkey", "lat": 41.0082, "lon": 28.9784},
    {"name": "Los Angeles", "country": "USA", "lat": 34.0522, "lon": -118.2437},
    {"name": "San Francisco", "country": "USA", "lat": 37.7749, "lon": -122.4194},
]

