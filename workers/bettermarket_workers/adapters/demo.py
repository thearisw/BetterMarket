from datetime import UTC, datetime, timedelta

from ..models import ListingIn
from .base import Adapter

# Hand-written sample data so the pipeline can be exercised before any real source exists.
_NOW = datetime.now(UTC)
_SAMPLES = [
    ("facebook", "Trek FX 2 hybrid bike, 54cm", "Bikes", 420, "Kitsilano", 49.2684, -123.1683, 5,
     "Lightly used commuter, new tires and chain last spring. Fenders and rack included."),
    ("kijiji", "IKEA Ektorp 3-seat sofa, grey cover", "Furniture", 150, "Mount Pleasant", 49.2627, -123.1006, 20,
     "Washable cover, no pets, no smoking. Must pick up, third floor walk-up."),
    ("karrot", "Nintendo Switch OLED + 2 games", "Electronics", 310, "Burnaby", 49.2488, -122.9805, 2,
     "Comes with Zelda TOTK and Mario Kart 8. Screen protector since day one."),
    ("craigslist", "Cast iron skillet 12in, Lodge", "Kitchen", 25, "East Van", 49.2766, -123.0700, 48,
     "Well seasoned, no rust. Moving and can't take it."),
    ("kijiji", "Free moving boxes, ~30", "Household", 0, "Richmond", 49.1666, -123.1336, 7,
     "Assorted sizes, flattened. Come grab them."),
]


class DemoAdapter(Adapter):
    name = "demo"

    def fetch(self):
        for i, (src, title, cat, price, area, lat, lng, hours_ago, desc) in enumerate(_SAMPLES):
            yield {
                "src": src, "id": f"demo-{i + 1}", "title": title, "cat": cat, "price": price,
                "area": area, "lat": lat, "lng": lng, "hours_ago": hours_ago, "desc": desc,
            }

    def normalize(self, raw):
        return ListingIn(
            source=raw["src"],
            source_id=raw["id"],
            url=f"https://example.com/listing/{raw['id']}",
            title=raw["title"],
            description=raw["desc"],
            price=raw["price"],
            category=raw["cat"],
            lat=raw["lat"],
            lng=raw["lng"],
            location_text=raw["area"],
            posted_at=_NOW - timedelta(hours=raw["hours_ago"]),
            raw=raw,
        )
