import { sql } from "drizzle-orm";
import { db } from "@/db";

// GET /api/health: quick check that the web app can reach Postgres and Meilisearch.
export async function GET() {
  const checks: Record<string, "ok" | string> = {};

  try {
    await db.execute(sql`select 1`);
    checks.postgres = "ok";
  } catch (e) {
    checks.postgres = (e as Error).message;
  }

  try {
    const res = await fetch(`${process.env.MEILI_URL}/health`, { cache: "no-store" });
    checks.meilisearch = res.ok ? "ok" : `HTTP ${res.status}`;
  } catch (e) {
    checks.meilisearch = (e as Error).message;
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  return Response.json(checks, { status: healthy ? 200 : 503 });
}
