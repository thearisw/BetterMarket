import pytest

from bettermarket_workers.adapters import ADAPTERS, get_adapter
from bettermarket_workers.models import ListingIn
from bettermarket_workers.search_index import to_document


def test_demo_adapter_normalizes_every_record():
    adapter = get_adapter("demo")
    items = [adapter.normalize(raw) for raw in adapter.fetch()]
    assert items and all(isinstance(i, ListingIn) for i in items)
    assert len({(i.source, i.source_id) for i in items}) == len(items)  # unique keys


def test_unknown_adapter_exits():
    with pytest.raises(SystemExit):
        get_adapter("nope")


def test_listing_rejects_unknown_source_and_blank_title():
    with pytest.raises(ValueError):
        ListingIn(source="myspace", source_id="1", url="u", title="t")
    with pytest.raises(ValueError):
        ListingIn(source="kijiji", source_id="1", url="u", title="   ")


def test_to_document_includes_geo_only_when_located():
    item = ListingIn(source="kijiji", source_id="1", url="u", title="Desk", lat=49.2, lng=-123.1)
    assert to_document("abc", item, "active", None)["_geo"] == {"lat": 49.2, "lng": -123.1}
    item.lat = None
    assert "_geo" not in to_document("abc", item, "active", None)


def test_registry_names_match_adapter_names():
    assert all(name == cls.name for name, cls in ADAPTERS.items())
