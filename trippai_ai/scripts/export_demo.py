"""
Snapshot real model output for the frontend's demo mode.

Runs the same pipeline as POST /api/predict (weather from Open-Meteo, search
interest from Google Trends with a synthetic fallback, Prophet forecasts,
scoring, mock event calendar) for a handful of destinations and writes one JSON
file per destination to trippai/public/demo/. The static Vercel build serves
these files instead of calling the API.

Usage (from trippai_ai/):
    python scripts/export_demo.py                 # default destination set
    python scripts/export_demo.py tokyo lisbon    # just these
"""

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from models.trip_time_ai import TripTimeAI  # noqa: E402
from services.event_service import EventService  # noqa: E402
from multi_city_planner import MultiCityPlanner, CityStop  # noqa: E402
from config import EVENTBRITE_API_KEY  # noqa: E402

ORIGIN = "London"
DEFAULT_DESTINATIONS = [
    "Barcelona", "Tokyo", "Lisbon", "New York", "Rome", "Bangkok", "Paris", "Sydney",
]
OUT_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "trippai", "public", "demo")
)


def slug(name: str) -> str:
    return name.lower().replace(" ", "-")


def export_single(destination: str) -> dict:
    model = TripTimeAI(destination=destination)
    result = model.predict_best_time(
        trip_days=7, forecast_weeks=52, save_output=False, origin_city=ORIGIN
    )
    events = EventService(api_key=EVENTBRITE_API_KEY).get_events_for_trip(
        city=destination,
        start_date=result["best_start_date"],
        end_date=result["best_end_date"],
    )
    result.update(
        destination=destination,
        origin_city=ORIGIN,
        data_source="demo_snapshot",
        events=events.get("events", []),
        event_warning=events.get("warning"),
        event_suggestions=events.get("suggestions", []),
    )
    return result


def export_multi_city() -> dict:
    planner = MultiCityPlanner(origin_city=ORIGIN, use_real_prices=False)
    stops = [
        CityStop(city="Paris", min_days=3, max_days=5, preferred_days=4),
        CityStop(city="Barcelona", min_days=3, max_days=6, preferred_days=4),
        CityStop(city="Rome", min_days=2, max_days=5, preferred_days=3),
    ]
    result = planner.plan_trip(cities=stops, total_days=12, optimize_route=True)
    result["data_source"] = "demo_snapshot"
    return result


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    wanted = sys.argv[1:] or DEFAULT_DESTINATIONS
    index = []
    for dest in wanted:
        name = dest.title()
        print(f"\n=== {name} ===")
        data = export_single(name)
        with open(os.path.join(OUT_DIR, f"{slug(name)}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1, default=str)
        index.append({"name": name, "slug": slug(name), "travel_score": data["travel_score"]})

    if not sys.argv[1:]:
        print("\n=== multi-city ===")
        multi = export_multi_city()
        with open(os.path.join(OUT_DIR, "multi-city.json"), "w", encoding="utf-8") as f:
            json.dump(multi, f, ensure_ascii=False, indent=1, default=str)

    with open(os.path.join(OUT_DIR, "index.json"), "w", encoding="utf-8") as f:
        json.dump(
            {"origin": ORIGIN, "generated_at": datetime.now().isoformat(), "destinations": index},
            f, indent=1,
        )
    print(f"\nWrote {len(index)} destinations to {OUT_DIR}")


if __name__ == "__main__":
    main()
