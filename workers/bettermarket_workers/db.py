import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from .config import get_settings
from .models import ListingIn

# The schema is owned by Drizzle (apps/web/src/db/schema.ts); this module only reads/writes rows.


def connect() -> psycopg.Connection:
    return psycopg.connect(get_settings().database_url)


UPSERT_LISTING = """
INSERT INTO listing (
    source, source_id, url, title, description, price, currency, category,
    lat, lng, location_text, images, posted_at, raw
) VALUES (
    %(source)s::listing_source, %(source_id)s, %(url)s, %(title)s, %(description)s, %(price)s,
    %(currency)s, %(category)s, %(lat)s, %(lng)s, %(location_text)s, %(images)s, %(posted_at)s, %(raw)s
)
ON CONFLICT (source, source_id) DO UPDATE SET
    url = EXCLUDED.url,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    category = EXCLUDED.category,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    location_text = EXCLUDED.location_text,
    images = EXCLUDED.images,
    posted_at = COALESCE(EXCLUDED.posted_at, listing.posted_at),
    raw = EXCLUDED.raw,
    status = 'active',
    last_seen_at = now()
RETURNING id, status, extract(epoch FROM posted_at)::bigint AS posted_at_ts
"""


def upsert_listing(conn: psycopg.Connection, item: ListingIn) -> dict:
    """Insert or refresh one listing; returns the columns needed for the search document."""
    params = {
        **item.__dict__,
        "images": Jsonb(item.images),
        "raw": Jsonb(item.raw) if item.raw is not None else None,
    }
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(UPSERT_LISTING, params)
        return cur.fetchone()
