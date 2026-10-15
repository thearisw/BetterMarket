import path from "node:path";
import { loadEnvConfig } from "@next/env";

// Env lives in the repo-root .env so docker compose, web and workers share one file.
// Both next.config.ts and drizzle.config.ts run with cwd = apps/web.
loadEnvConfig(path.resolve(process.cwd(), "../.."));
