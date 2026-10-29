#!/usr/bin/env python3
"""Daily Tripadvisor Content API → GitHub Pages build artifact (no secret exposed).
Tripadvisor reviews are sorted newest first. Updates should be served afresh daily.
Do not commit this API-derived review data to Git history.
"""
import datetime
import json
import os
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

LOCATION_ID = 13531157
URL = f"https://api.content.tripadvisor.com/api/v1/location/{LOCATION_ID}/reviews"
DEST = Path("content/tripadvisor-reviews.json")
LISTING_URL = (
    "https://www.tripadvisor.co.uk/Restaurant_Review-g186397-d13531157-"
    "Reviews-The_Bulls_Head-Bidford_on_Avon_Warwickshire_England.html"
)


def safe_url(value, image=False):
    if not isinstance(value, str):
        return None
    try:
        p = urlparse(value)
        if p.scheme != "https":
            return None
        if image:
            if p.hostname not in ("static.tacdn.com", "www.tripadvisor.com", "www.tripadvisor.co.uk"):
                return None
        elif p.hostname not in ("tripadvisor.com", "tripadvisor.co.uk", "www.tripadvisor.com", "www.tripadvisor.co.uk"):
            return None
        return value
    except ValueError:
        return None


def normalise(raw):
    text = raw.get("text")
    if not isinstance(text, str) or not text.strip():
        return None
    author = raw.get("user") or {}
    if not isinstance(author, dict):
        author = {}
    username = author.get("username")
    rating = raw.get("rating")
    try:
        rating = float(rating)
        if not 1 <= rating <= 5:
            rating = None
    except (TypeError, ValueError):
        rating = None
    return {
        "id": str(raw.get("id", "")),
        "title": str(raw.get("title") or "").strip(),
        "text": text.strip(),
        "author": str(username or "").strip(),
        "date": str(raw.get("published_date") or ""),
        "rating": rating,
        "rating_image": safe_url(raw.get("rating_image_url"), image=True),
        "url": safe_url(raw.get("web_url") or raw.get("url")) or LISTING_URL,
    }


def main():
    key = os.environ.get("TRIPADVISOR_API_KEY", "").strip()
    if not key:
        print("No Tripadvisor key; leaving snapshot cards unchanged.")
        return 0
    query = urlencode({"key": key, "language": "en", "limit": 5})
    req = Request(URL + "?" + query, headers={"Accept": "application/json", "User-Agent": "TheBullsHeadBidford-ReviewDisplay/1.0"})
    try:
        with urlopen(req, timeout=25) as response:
            payload = json.load(response)
        raw = payload.get("data", []) if isinstance(payload, dict) else []
        if not isinstance(raw, list):
            raise ValueError("Unexpected Tripadvisor response")
        reviews = [x for x in (normalise(item) for item in raw if isinstance(item, dict)) if x]
        reviews.sort(key=lambda x: (x["date"], x["id"]), reverse=True)
        # Keep the three newest without discarding lower-rated guest feedback.
        if len(reviews) < 3:
            raise ValueError("Fewer than three reviews returned")
        result = {
            "status": "live",
            "location_id": LOCATION_ID,
            "synced_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "reviews": reviews[:3],
        }
        DEST.parent.mkdir(parents=True, exist_ok=True)
        DEST.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Prepared three latest Tripadvisor reviews for GitHub Pages publication.")
    except Exception as exc:
        # Never print a full request URL: it contains the protected API key.
        raise SystemExit(f"Tripadvisor refresh failed ({type(exc).__name__}). Original cards remain until the next successful refresh.") from None
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
