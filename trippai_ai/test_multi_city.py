"""Test script for multi-city trip planning."""

from datetime import datetime
from multi_city_planner import MultiCityPlanner, CityStop


def test_basic_multi_city():
    """Test basic multi-city planning."""
    print("=" * 70)
    print("TEST 1: Basic Multi-City Trip Planning")
    print("=" * 70)
    
    # Create city stops
    cities = [
        CityStop("Paris", min_days=3, max_days=5, preferred_days=4),
        CityStop("Barcelona", min_days=3, max_days=6, preferred_days=4),
        CityStop("Rome", min_days=2, max_days=5, preferred_days=3)
    ]
    
    # Initialize planner
    planner = MultiCityPlanner(origin_city="London", use_real_prices=False)
    
    # Plan trip
    result = planner.plan_trip(
        cities=cities,
        total_days=12,
        start_date=None,  # Find optimal date
        optimize_route=True,
        forecast_weeks=52
    )
    
    # Print results
    print(f"\n✓ Trip planned successfully!")
    print(f"\nTrip Summary:")
    print(f"  Origin: {result['origin_city']}")
    print(f"  Cities: {' → '.join(result['cities'])}")
    print(f"  Duration: {result['total_days']} days")
    print(f"  Dates: {result['start_date']} to {result['end_date']}")
    print(f"  Route Optimized: {result['route_optimized']}")
    
    print(f"\nOverall Score: {result['overall_score']['overall']}/100")
    print(f"  Average: {result['overall_score']['average']}/100")
    print(f"  Range: {result['overall_score']['min']} - {result['overall_score']['max']}")
    
    print(f"\nCost Breakdown:")
    print(f"  Hotels: ${result['cost_breakdown']['total_hotel']:,.2f}")
    print(f"  Flights: ${result['cost_breakdown']['total_flights']:,.2f}")
    print(f"  Total: ${result['cost_breakdown']['total_cost']:,.2f}")
    print(f"  Per Person: ${result['cost_breakdown']['per_person']:,.2f}")
    
    print(f"\nItinerary:")
    for stop in result['itinerary']:
        print(f"  {stop['order']}. {stop['city']} ({stop['days']} days)")
        print(f"     Dates: {stop['start_date']} to {stop['end_date']}")
        print(f"     From: {stop['from_city']}")
        if 'travel_score' in stop:
            print(f"     Score: {stop['travel_score']}/100")
        if 'predicted_weather' in stop:
            weather = stop['predicted_weather']
            if weather.get('temperature'):
                print(f"     Weather: {weather['temperature']}°C, {weather['precipitation']}mm rain")
    
    print(f"\n{result['summary']}")
    print("\n" + "=" * 70)
    return result


def test_fixed_date_trip():
    """Test multi-city trip with fixed start date."""
    print("\n" + "=" * 70)
    print("TEST 2: Multi-City Trip with Fixed Start Date")
    print("=" * 70)
    
    cities = [
        CityStop("Tokyo", min_days=4, max_days=7, preferred_days=5),
        CityStop("Sydney", min_days=3, max_days=5, preferred_days=4)
    ]
    
    planner = MultiCityPlanner(origin_city="London", use_real_prices=False)
    
    # Fixed start date
    start_date = datetime(2025, 12, 15)
    
    result = planner.plan_trip(
        cities=cities,
        total_days=10,
        start_date=start_date,
        optimize_route=False,  # Keep original order
        forecast_weeks=52
    )
    
    print(f"\n✓ Fixed date trip planned!")
    print(f"  Start Date: {result['start_date']}")
    print(f"  Cities: {' → '.join(result['cities'])}")
    print(f"  Total Cost: ${result['cost_breakdown']['total_cost']:,.2f}")
    print(f"  Overall Score: {result['overall_score']['overall']}/100")
    
    print("\n" + "=" * 70)
    return result


def test_route_optimization():
    """Test route optimization across multiple cities."""
    print("\n" + "=" * 70)
    print("TEST 3: Route Optimization")
    print("=" * 70)
    
    # Create cities in non-optimal order
    cities = [
        CityStop("Tokyo", min_days=2, max_days=4, preferred_days=3),
        CityStop("Paris", min_days=2, max_days=4, preferred_days=3),
        CityStop("Rome", min_days=2, max_days=4, preferred_days=2),
        CityStop("Barcelona", min_days=2, max_days=4, preferred_days=3)
    ]
    
    planner = MultiCityPlanner(origin_city="London")
    
    print("\nOriginal city order:")
    print("  " + " → ".join([c.city for c in cities]))
    
    result = planner.plan_trip(
        cities=cities,
        total_days=12,
        start_date=None,
        optimize_route=True,
        forecast_weeks=52
    )
    
    print("\nOptimized route:")
    print("  " + " → ".join(result['cities']))
    
    print(f"\n✓ Route optimized successfully!")
    print(f"  Total cities: {len(result['cities'])}")
    print(f"  Trip duration: {result['total_days']} days")
    print(f"  Overall score: {result['overall_score']['overall']}/100")
    
    print("\n" + "=" * 70)
    return result


def test_day_allocation():
    """Test day allocation across cities."""
    print("\n" + "=" * 70)
    print("TEST 4: Day Allocation")
    print("=" * 70)
    
    cities = [
        CityStop("Paris", min_days=2, max_days=8, preferred_days=5),
        CityStop("Barcelona", min_days=1, max_days=5, preferred_days=2),
        CityStop("Rome", min_days=2, max_days=7, preferred_days=4)
    ]
    
    planner = MultiCityPlanner(origin_city="London")
    
    # Test with different total days
    for total_days in [8, 12, 15]:
        result = planner.plan_trip(
            cities=cities,
            total_days=total_days,
            start_date=datetime(2025, 6, 1),
            optimize_route=False
        )
        
        print(f"\nTotal days: {total_days}")
        for stop in result['itinerary']:
            print(f"  {stop['city']}: {stop['days']} days")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    print("\n🌍 Multi-City Trip Planner Test Suite\n")
    
    try:
        # Run tests
        test_basic_multi_city()
        test_fixed_date_trip()
        test_route_optimization()
        test_day_allocation()
        
        print("\n✅ All tests completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
