"""Utility functions for coordinates and city data lookup."""

from typing import Dict
from config import CITY_COORDINATES


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
    else:
        raise ValueError(
            f"Coordinates not found for '{destination}'. "
            f"Please provide lat/lon manually or add to CITY_COORDINATES in config.py"
        )
