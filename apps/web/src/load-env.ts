import path from "node:path";
import { loadEnvConfig } from "@next/env";

// Env lives in the repo-root .env so docker compose, web and workers share one file.
// next.config.ts, drizzle.config.ts and the server runtime all run with cwd = apps/web.
// forceReload: Next has already loaded (and cached) env for apps/web, which would make this a no-op.
loadEnvConfig(path.resolve(process.cwd(), "../.."), process.env.NODE_ENV !== "production", console, true);
