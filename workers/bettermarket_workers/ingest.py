import logging

from . import db, search_index
from .adapters import get_adapter

log = logging.getLogger(__name__)


def run(adapter_name: str) -> int:
    """Fetch → normalize → upsert to Postgres → push to Meilisearch. Returns listings ingested."""
    adapter = get_adapter(adapter_name)
    docs: list[dict] = []
    skipped = 0

    with db.connect() as conn:
        for raw in adapter.fetch():
            try:
                item = adapter.normalize(raw)
            except ValueError as e:
                log.warning("skipping record from %s: %s", adapter.name, e)
                item = None
            if item is None:
                skipped += 1
                continue
            row = db.upsert_listing(conn, item)
            docs.append(search_index.to_document(row["id"], item, row["status"], row["posted_at_ts"]))
        # Commit before indexing so search never points at rows that don't exist.
        conn.commit()

    if docs:
        index = search_index.client().index(search_index.INDEX)
        index.wait_for_task(index.add_documents(docs).task_uid)

    log.info("%s: ingested %d, skipped %d", adapter.name, len(docs), skipped)
    return len(docs)
