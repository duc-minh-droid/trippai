"""Test script for the forecasting model with default dates."""

from travel_model import TripTimeAI

# Test with Barcelona using default dates (should use past year automatically)
print("Testing TripTimeAI with Barcelona (using default dates)...")
print("=" * 80)

model = TripTimeAI("barcelona")

# Use default dates - will automatically collect 1 year of historical data
result = model.predict_best_time(
    trip_days=7,
    forecast_weeks=26,  # Forecast 26 weeks (6 months) ahead
    save_output=True
)

print("\n" + "=" * 80)
print("PREDICTION RESULT")
print("=" * 80)
print(f"Best travel dates: {result['best_start_date']} to {result['best_end_date']}")
print(f"Travel score: {result['travel_score']}")
print(f"Predicted price: ${result['predicted_price']}")
print(f"Predicted temperature: {result['predicted_temp']}°C")
print(f"Predicted crowd level: {result['predicted_crowd']}/100")
print(f"Confidence: {result['confidence']}")
print(f"\n{result['ai_explanation']}")
