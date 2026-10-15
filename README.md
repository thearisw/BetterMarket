# BetterMarket

One search across Facebook Marketplace, Kijiji, Karrot, Craigslist and eBay, with likes, hides,
collections and a personalized front page.

## Layout

| Path | What |
|---|---|
| `apps/web` | Next.js 15 app (UI, API routes, auth). Owns the DB schema: `src/db/schema.ts` |
| `workers` | Python jobs: ingestion adapters, search indexing, later embeddings + recommendations |
| `infra` | docker compose for Postgres (pgvector), Meilisearch, Redis |
| `market.html` | Original UI mockup; design tokens were ported into `apps/web/src/app/globals.css` |

## Prerequisites

- Node.js 22 LTS
- Docker Desktop
- Python 3.12+

## First-time setup

```bash
cp .env.example .env              # then set BETTER_AUTH_SECRET
npm install
npm run infra:up                  # Postgres, Meilisearch, Redis
npm run db:generate               # SQL migration from schema.ts -> apps/web/drizzle/
npm run db:migrate

cd workers
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"   # macOS/Linux: .venv/bin/python
.venv/Scripts/python -m bettermarket_workers setup-search
.venv/Scripts/python -m bettermarket_workers ingest demo
cd ..

npm run dev                       # http://localhost:3000
```

Check wiring at http://localhost:3000/api/health.

## Conventions

- **Schema changes** go in `apps/web/src/db/schema.ts`, then `npm run db:generate` and commit the SQL.
  Workers never create tables.
- **New source** = a class in `workers/bettermarket_workers/adapters/` implementing `fetch()` and
  `normalize()`, registered in `adapters/__init__.py`. If it's a new site, add it to the
  `listing_source` enum and `SOURCES` in `workers/bettermarket_workers/models.py`.
- **Postgres is the source of truth**; Meilisearch is a rebuildable read copy.
- Check each source's terms of service before ingesting from it.
