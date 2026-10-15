import meilisearch

from .config import get_settings
from .models import ListingIn

INDEX = "listings"

# Searchable order = ranking weight: a match in the title beats one in the description.
SETTINGS = {
    "searchableAttributes": ["title", "description", "category", "location_text"],
    "filterableAttributes": ["source", "status", "price", "category", "posted_at_ts", "_geo"],
    "sortableAttributes": ["price", "posted_at_ts", "_geo"],
    "typoTolerance": {"minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8}},
}


def client() -> meilisearch.Client:
    s = get_settings()
    return meilisearch.Client(s.meili_url, s.meili_master_key)


def ensure_index() -> None:
    """Create the listings index and apply settings. Safe to run repeatedly."""
    c = client()
    task = c.create_index(INDEX, {"primaryKey": "id"})
    c.wait_for_task(task.task_uid)  # fails harmlessly if the index already exists
    c.wait_for_task(c.index(INDEX).update_settings(SETTINGS).task_uid)


def to_document(listing_id: str, item: ListingIn, status: str, posted_at_ts: int | None) -> dict:
    """Shape a listing for Meilisearch. Postgres stays the source of truth; this is a read copy."""
    doc = {
        "id": str(listing_id),
        "source": item.source,
        "url": item.url,
        "title": item.title,
        "description": item.description,
        "price": item.price,
        "currency": item.currency,
        "category": item.category,
        "location_text": item.location_text,
        "image": item.images[0] if item.images else None,
        "status": status,
        "posted_at_ts": posted_at_ts,
    }
    if item.lat is not None and item.lng is not None:
        doc["_geo"] = {"lat": item.lat, "lng": item.lng}
    return doc
