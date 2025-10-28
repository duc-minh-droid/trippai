"""Utility functions for output formatting and saving."""

import os
import json
from typing import Dict
from datetime import datetime


def save_prediction_output(output: Dict, destination: str, output_dir: str = "models"):
    """
    Save the prediction output to a JSON file.
    
    Args:
        output: Dictionary with prediction data
        destination: Destination name
        output_dir: Directory to save the file
    """
    os.makedirs(output_dir, exist_ok=True)
    
    dest_clean = destination.lower().replace(" ", "_")
    filename = f"output_{dest_clean}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Output saved to: {filepath}")


def print_prediction_summary(output: Dict):
    """
    Print a formatted summary of the prediction.
    
    Args:
        output: Dictionary with prediction data
    """
    print("\n" + "=" * 80)
    print("🎯 PREDICTION SUMMARY")
    print("=" * 80)
    print(f"📍 Destination:      {output['destination']}")
    print(f"📅 Best Travel Date: {output['best_start_date']} to {output['best_end_date']}")
    print(f"💰 Predicted Price:  ${output['predicted_price']}")
    print(f"🌡️  Temperature:       {output['predicted_temp']}°C")
    print(f"🌧️  Precipitation:    {output['predicted_precipitation']}mm")
    print(f"👥 Crowd Level:      {output['predicted_crowd']}/100")
    print(f"⭐ Travel Score:     {output['travel_score']}/100")
    print(f"🎲 Confidence:       {output['confidence'] * 100:.0f}%")
    print("\n💡 AI Explanation:")
    print(f"   {output['ai_explanation']}")
    print("\n🎒 Travel Tip:")
    print(f"   {output['ai_travel_tip']}")
    print("=" * 80)


def format_date_range_message(start_date: datetime, end_date: datetime, trip_days: int, max_budget: float = None):
    """
    Format and print date range information.
    
    Args:
        start_date: Historical start date
        end_date: Historical end date
        trip_days: Trip duration in days
        max_budget: Maximum budget (optional)
    """
    print(f"   Historical period: {start_date.date()} to {end_date.date()}")
    print(f"   Trip duration: {trip_days} days")
    if max_budget:
        print(f"   Maximum budget: ${max_budget:.2f}\n")
    else:
        print()
