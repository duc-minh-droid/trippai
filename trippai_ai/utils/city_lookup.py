"""Utility functions for coordinates and city data lookup."""

from typing import Dict
from config import CITY_COORDINATES, DESTINATIONS

_DESTINATION_COORDS = {d["name"].lower(): {"lat": d["lat"], "lon": d["lon"]} for d in DESTINATIONS}


def lookup_city_coordinates(destination: str) -> Dict[str, float]:
    """
    Look up coordinates from the city database.
    
    Args:
        destination: City name
    
    Returns:
        Dictionary with 'lat' and 'lon' keys
    
    Raises:
        ValueError: If coordinates not found for the destination
    """
    city_key = destination.lower()
    
    if city_key in CITY_COORDINATES:
        return CITY_COORDINATES[city_key]
    if city_key in _DESTINATION_COORDS:
        return _DESTINATION_COORDS[city_key]
    else:
        raise ValueError(
            f"Coordinates not found for '{destination}'. "
            f"Please provide lat/lon manually or add to CITY_COORDINATES in config.py"
        )


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points in kilometres."""
    from math import radians, sin, cos, asin, sqrt
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * 6371 * asin(sqrt(a))


def estimate_base_price(origin_city: str, lat: float, lon: float) -> float:
    """
    Baseline weekly trip price (USD) for the synthetic price model, scaled by
    flight distance from the origin. Without this every destination shared the
    same $300 baseline, so Tokyo cost the same as Paris from London.
    """
    try:
        o = lookup_city_coordinates(origin_city or "London")
    except ValueError:
        o = CITY_COORDINATES["london"]
    km = haversine_km(o["lat"], o["lon"], lat, lon)
    return round(180 + 0.045 * km, 2)
