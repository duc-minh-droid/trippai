"""Utility functions for calculating travel scores and confidence."""

from typing import Dict
import pandas as pd

from config import TRAVEL_SCORE_WEIGHTS


def calculate_travel_score(
    weather_comfort: float,
    price_score: float,
    crowd_score: float
) -> float:
    """
    Calculate overall TravelScore based on individual component scores.
    
    TravelScore is a weighted average where:
    - Higher weather comfort = better
    - Lower price = better (already inverted in price_score)
    - Lower crowd = better (already inverted in crowd_score)
    
    Args:
        weather_comfort: Weather comfort score (0-100)
        price_score: Normalized price score (0-100, inverted)
        crowd_score: Normalized crowd score (0-100, inverted)
    
    Returns:
        Overall travel score (0-100)
    """
    weights = TRAVEL_SCORE_WEIGHTS
    
    travel_score = (
        weights["weather"] * weather_comfort +
        weights["price"] * price_score +
        weights["crowd"] * crowd_score
    )
    
    return travel_score


def calculate_confidence(
    predictions_df: pd.DataFrame,
    best_window: Dict
) -> float:
    """
    Calculate confidence score based on how much better the best window is
    compared to alternatives.
    
    Higher confidence = best window is significantly better than others
    Lower confidence = many weeks have similar scores
    
    Args:
        predictions_df: DataFrame with all predictions
        best_window: Dictionary with best window information
    
    Returns:
        Confidence score (0.3-1.0)
    """
    if "error" in best_window:
        return 0.3
    
    if len(predictions_df) < 2:
        return 0.5
    
    best_score = best_window.get("travel_score", 50.0)
    all_scores = predictions_df["rolling_score"].dropna()
    
    if len(all_scores) == 0:
        all_scores = predictions_df["travel_score"].dropna()
    
    if len(all_scores) == 0:
        return 0.5
    
    # Calculate how many standard deviations above mean
    mean_score = all_scores.mean()
    std_score = all_scores.std()
    
    if std_score == 0:
        return 0.5
    
    z_score = (best_score - mean_score) / std_score
    
    # Convert z-score to confidence (0-1 scale)
    # z_score of 2+ means very confident, 0 means not confident
    confidence = min(0.5 + (z_score * 0.2), 1.0)
    confidence = max(confidence, 0.3)  # Minimum 30% confidence
    
    return confidence


def validate_predictions(best_window: Dict) -> Dict:
    """
    Validate and apply bounds to prediction values.
    
    Ensures all predicted values are within realistic ranges.
    
    Args:
        best_window: Dictionary with prediction values
        
    Returns:
        Dictionary with validated values
    """
    validated = best_window.copy()
    
    # Price validation (USD): $150 - $1500
    if validated["price"] < 150:
        validated["price"] = 150
        print("⚠️  Warning: Price prediction was below minimum, adjusted to $150")
    elif validated["price"] > 1500:
        validated["price"] = 1500
        print("⚠️  Warning: Price prediction was above maximum, adjusted to $1500")
    
    # Temperature validation (Celsius): -10°C to 45°C
    if validated["temperature"] < -10:
        validated["temperature"] = -10
        print("⚠️  Warning: Temperature prediction was too low, adjusted to -10°C")
    elif validated["temperature"] > 45:
        validated["temperature"] = 45
        print("⚠️  Warning: Temperature prediction was too high, adjusted to 45°C")
    
    # Precipitation validation (mm per week): 0mm to 150mm
    if validated["precipitation"] < 0:
        validated["precipitation"] = 0
        print("⚠️  Warning: Precipitation prediction was negative, adjusted to 0mm")
    elif validated["precipitation"] > 150:
        original_precip = validated["precipitation"]
        validated["precipitation"] = 150
        print(f"⚠️  Warning: Precipitation prediction was {original_precip:.1f}mm (too high), adjusted to 150mm")
    
    # Crowd level validation (0-100 scale)
    if validated["crowd_level"] < 0:
        validated["crowd_level"] = 0
        print("⚠️  Warning: Crowd level was negative, adjusted to 0")
    elif validated["crowd_level"] > 100:
        validated["crowd_level"] = 100
        print("⚠️  Warning: Crowd level was above 100, adjusted to 100")
    
    # Travel score validation (0-100 scale)
    if validated["travel_score"] < 0:
        validated["travel_score"] = 0
    elif validated["travel_score"] > 100:
        validated["travel_score"] = 100
    
    # Individual score validation (0-100 scale)
    for score_key in ["price_score", "weather_score", "crowd_score"]:
        if validated[score_key] < 0:
            validated[score_key] = 0
        elif validated[score_key] > 100:
            validated[score_key] = 100
    
    return validated
