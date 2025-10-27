"""Test script for the forecasting model."""

from datetime import datetime, timedelta
from travel_model import TripTimeAI

# Test with Barcelona
print("Testing TripTimeAI with Barcelona...")
print("=" * 80)

model = TripTimeAI("barcelona")

# Test with explicit date range (1 year of historical data)
# Historical data should be from the PAST
today = datetime.now()
start_historical = today - timedelta(days=365)  # 1 year ago
end_historical = today  # Today

print(f"\nUsing date range:")
print(f"  Start: {start_historical.date()}")
print(f"  End: {end_historical.date()}")
print()

result = model.predict_best_time(
    start_date=start_historical.strftime("%Y-%m-%d"),
    end_date=end_historical.strftime("%Y-%m-%d"),
    trip_days=7,
    forecast_weeks=12,  # Forecast 12 weeks ahead
    save_output=True
)

print("\n" + "=" * 80)
print("PREDICTION RESULT")
print("=" * 80)
print(f"Best travel dates: {result['best_start_date']} to {result['best_end_date']}")
print(f"Travel score: {result['travel_score']}")
print(f"Predicted price: ${result['predicted_price']}")
print(f"Predicted temperature: {result['predicted_temp']}°C")
print(f"Confidence: {result['confidence']}")
print(f"\n{result['ai_explanation']}")
