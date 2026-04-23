#!/usr/bin/env python3
"""Sync upcoming public Toledo events for the studio display."""

from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_PATH = ROOT / "data" / "studio-display-events.json"
EVENTS_PAGE_URL = "https://wineandcanvas.com/toledo/events/"
EVENTS_API_URL = "https://wineandcanvas.com/toledo/wp-json/tribe/events/v1/events"
BOOKING_URL = "https://wineandcanvas.com/toledo/"
EVENT_LIMIT = 6
PER_PAGE = 20
MAX_PAGES = 5
REQUEST_TIMEOUT_SECONDS = 20
EASTERN_TZ = ZoneInfo("America/New_York")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_PATH),
        help="Path to write the normalized studio display event snapshot.",
    )
    return parser.parse_args()


def fetch_json(url: str) -> dict[str, Any]:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "StudioDisplayEventSync/1.0 (+https://frankcreationsllc.com/)",
        },
    )

    with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        return json.load(response)


def strip_html(value: Any) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<br\s*/?>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def truncate_text(value: str, max_length: int) -> str:
    if len(value) <= max_length:
        return value

    return f"{value[: max_length - 1].rstrip()}…"


def normalize_id(value: Any) -> str:
    text = str(value or "event").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"(^-+|-+$)", "", text) or "event"


def parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None

    text = str(value).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue

    return None


def format_time(value: datetime | None) -> str:
    if value is None:
        return ""

    return value.strftime("%I:%M %p").lstrip("0")


def format_time_range(start_value: Any, end_value: Any) -> str:
    start = format_time(parse_datetime(start_value))
    end = format_time(parse_datetime(end_value))

    if start and end and start != end:
        return f"{start} - {end}"

    return start or end or "See site"


def parse_price(raw_event: dict[str, Any]) -> float | None:
    values = raw_event.get("cost_details", {}).get("values", [])
    if values:
        try:
            return float(values[0])
        except (TypeError, ValueError):
            pass

    cleaned = re.sub(r"[^0-9.]+", "", html.unescape(str(raw_event.get("cost") or "")))
    if not cleaned:
        return None

    try:
        return float(cleaned)
    except ValueError:
        return None


def infer_status(raw_event: dict[str, Any], availability_text: str) -> str:
    haystack = " ".join(
        [
            availability_text.lower(),
            str(raw_event.get("status") or "").lower(),
            str(raw_event.get("stock_status") or "").lower(),
            str(raw_event.get("event_status") or "").lower(),
        ]
    )

    if raw_event.get("sold_out") or "sold out" in haystack:
        return "sold-out"

    if re.search(r"\b([1-6])\s+(?:tickets|seats|spots)\s+left\b", haystack):
        return "few-seats"

    return "now-booking"


def build_availability_text(raw_event: dict[str, Any]) -> str:
    for key in ("availability_text", "availability", "tickets_left_text", "stock_status_text"):
        value = strip_html(raw_event.get(key))
        if value:
            return value

    seats_left = raw_event.get("tickets_left") or raw_event.get("available_tickets")
    if isinstance(seats_left, (int, float)):
        if seats_left <= 0:
            return "Sold out for now"

        return f"{int(seats_left)} seats left"

    if raw_event.get("sold_out"):
        return "Sold out for now"

    return "Check live site for seats"


def is_public_event(event: dict[str, Any]) -> bool:
    haystack = " ".join(
        [
            event["title"],
            event.get("description", ""),
            event.get("venue", ""),
        ]
    ).lower()
    return "private" not in haystack


def sort_score(event: dict[str, Any]) -> int:
    haystack = f"{event['title']} {event.get('venue', '')}".lower()
    score = 0
    if "toledo" in haystack:
        score += 3
    if "wine & canvas" in haystack or "studio" in haystack:
        score += 2
    if "date night" in haystack or "wine glass" in haystack:
        score += 1
    return score


def normalize_event(raw_event: dict[str, Any]) -> dict[str, Any] | None:
    title = strip_html(raw_event.get("title") or raw_event.get("name"))
    start = parse_datetime(raw_event.get("start_date"))
    if not title or start is None:
        return None

    availability_text = build_availability_text(raw_event)
    status = infer_status(raw_event, availability_text)
    badge = "Sold Out" if status == "sold-out" else "Few Seats" if status == "few-seats" else "Now Booking"
    venue = strip_html(raw_event.get("venue", {}).get("venue"))

    return {
        "id": normalize_id(raw_event.get("slug") or raw_event.get("id") or title),
        "title": title,
        "date": start.strftime("%Y-%m-%d"),
        "time": format_time_range(raw_event.get("start_date"), raw_event.get("end_date")),
        "price": parse_price(raw_event),
        "availabilityText": availability_text,
        "status": status,
        "badge": badge,
        "ctaLabel": "Join Waitlist" if status == "sold-out" else "Scan to Book",
        "ctaUrl": str(raw_event.get("url") or BOOKING_URL),
        "image": str(raw_event.get("image", {}).get("url") or ""),
        "description": truncate_text(
            strip_html(raw_event.get("excerpt") or raw_event.get("description")),
            190,
        ),
        "venue": venue,
    }


def build_initial_api_url(today_key: str) -> str:
    params = urlencode(
        {
            "per_page": str(PER_PAGE),
            "start_date": f"{today_key} 00:00:00",
            "status": "publish",
        }
    )
    return f"{EVENTS_API_URL}?{params}"


def collect_events(today_key: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    next_url = build_initial_api_url(today_key)
    page = 0

    while next_url and page < MAX_PAGES and len(events) < EVENT_LIMIT:
        payload = fetch_json(next_url)
        for raw_event in payload.get("events", []):
            normalized = normalize_event(raw_event)
            if not normalized:
                continue

            if normalized["date"] < today_key:
                continue

            if not is_public_event(normalized):
                continue

            if raw_event.get("hide_from_listings"):
                continue

            events.append(normalized)
            if len(events) >= EVENT_LIMIT:
                break

        next_url = payload.get("next_rest_url")
        page += 1

    events.sort(key=lambda item: (item["date"], -sort_score(item), item["title"]))
    return events[:EVENT_LIMIT]


def build_snapshot(today_key: str) -> dict[str, Any]:
    events = collect_events(today_key)
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    return {
        "generatedAt": generated_at,
        "source": {
            "pageUrl": EVENTS_PAGE_URL,
            "apiUrl": EVENTS_API_URL,
            "timezone": "America/New_York",
        },
        "upcomingEvents": events,
    }


def write_snapshot(output_path: Path, snapshot: dict[str, Any]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    output_path = Path(args.output).resolve()
    today_key = datetime.now(EASTERN_TZ).strftime("%Y-%m-%d")
    snapshot = build_snapshot(today_key)
    write_snapshot(output_path, snapshot)
    print(f"Wrote {len(snapshot['upcomingEvents'])} events to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
