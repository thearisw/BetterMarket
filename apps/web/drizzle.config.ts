import "./src/load-env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle", // generated SQL migrations; commit these
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
