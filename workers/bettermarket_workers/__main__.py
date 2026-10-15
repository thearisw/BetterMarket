"""Worker CLI.

    python -m bettermarket_workers healthcheck
    python -m bettermarket_workers setup-search
    python -m bettermarket_workers ingest demo
"""

import argparse
import logging
import sys


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(prog="bm-worker")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("healthcheck", help="check Postgres and Meilisearch are reachable")
    sub.add_parser("setup-search", help="create the Meilisearch index and apply settings")
    ingest_p = sub.add_parser("ingest", help="run one adapter end to end")
    ingest_p.add_argument("adapter")
    args = parser.parse_args()

    # Imports are deferred so --help works without a configured .env.
    if args.cmd == "healthcheck":
        from . import db, search_index

        with db.connect() as conn:
            conn.execute("select 1")
        print("postgres: ok")
        print("meilisearch:", search_index.client().health()["status"])
    elif args.cmd == "setup-search":
        from . import search_index

        search_index.ensure_index()
        print("index ready")
    elif args.cmd == "ingest":
        from . import ingest

        ingest.run(args.adapter)


if __name__ == "__main__":
    sys.exit(main())
