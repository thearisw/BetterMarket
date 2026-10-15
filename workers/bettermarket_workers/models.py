from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

# Must match the listing_source enum in apps/web/src/db/schema.ts.
SOURCES = ("facebook", "kijiji", "karrot", "craigslist", "ebay")


@dataclass
class ListingIn:
    """A listing normalized by an adapter, ready to upsert. Mirrors the `listing` table."""

    source: str
    source_id: str
    url: str
    title: str
    description: str = ""
    price: float | None = None  # None = contact for price, 0 = free
    currency: str = "CAD"
    category: str | None = None
    lat: float | None = None
    lng: float | None = None
    location_text: str | None = None
    images: list[str] = field(default_factory=list)
    posted_at: datetime | None = None
    raw: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        if self.source not in SOURCES:
            raise ValueError(f"unknown source {self.source!r}; add it to the enum in schema.ts first")
        self.title = self.title.strip()
        self.description = self.description.strip()
        if not self.title:
            raise ValueError("title is required")
