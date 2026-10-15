// Single source of truth for the database. Migrations are generated from this file
// (npm run db:generate); the Python workers read/write these tables with plain SQL.
import {
  bigserial,
  boolean,
  char,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// bge-small-en-v1.5 output size. Changing models means a migration + re-embedding.
export const EMBEDDING_DIMS = 384;

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Auth (Better Auth). Column names follow its Drizzle adapter's expectations.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// App-specific per-user data, kept apart from the auth tables.
export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  homeLat: doublePrecision("home_lat"),
  homeLng: doublePrecision("home_lng"),
  homeLabel: text("home_label"),
  radiusKm: doublePrecision("radius_km").notNull().default(15),
  // Weighted average of embeddings the user engaged with (Phase 4 job fills this).
  tasteEmbedding: vector("taste_embedding", { dimensions: EMBEDDING_DIMS }),
  tasteUpdatedAt: timestamp("taste_updated_at", { withTimezone: true }),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export const listingSource = pgEnum("listing_source", ["facebook", "kijiji", "karrot", "craigslist", "ebay"]);
export type ListingSource = (typeof listingSource.enumValues)[number];

// stale = not seen in the last few ingestion runs; probably gone but not confirmed.
export const listingStatus = pgEnum("listing_status", ["active", "sold", "removed", "stale"]);

export const listing = pgTable(
  "listing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: listingSource("source").notNull(),
    sourceId: text("source_id").notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    // null = "contact for price"; 0 = free.
    price: numeric("price", { precision: 12, scale: 2, mode: "number" }),
    currency: char("currency", { length: 3 }).notNull().default("CAD"),
    category: text("category"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    locationText: text("location_text"),
    // Remote image URLs only; we link to the source rather than re-hosting photos.
    images: jsonb("images").$type<string[]>().notNull().default([]),
    status: listingStatus("status").notNull().default("active"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMS }),
    // Untouched adapter payload, for re-normalizing without re-fetching.
    raw: jsonb("raw"),
  },
  (t) => [
    uniqueIndex("listing_source_uid").on(t.source, t.sourceId),
    index("listing_status_seen_idx").on(t.status, t.lastSeenAt),
    index("listing_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

// ---------------------------------------------------------------------------
// User activity
// ---------------------------------------------------------------------------

export const interactionType = pgEnum("interaction_type", [
  "view",
  "click", // opened the original listing
  "like",
  "unlike",
  "save",
  "unsave",
  "hide",
  "unhide",
]);

// Append-only event log. The recommender reads this; the UI reads listing_state.
export const interaction = pgTable(
  "interaction",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    type: interactionType("type").notNull(),
    // Where it happened (search, feed, collection) so ranking can be evaluated later.
    context: jsonb("context"),
    createdAt: createdAt(),
  },
  (t) => [index("interaction_user_time_idx").on(t.userId, t.createdAt)],
);

// Current like/hide state per user+listing, derived from interactions for fast filtering.
export const listingState = pgTable(
  "listing_state",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    liked: boolean("liked").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })],
);

// "Saving" a listing puts it in a named collection, as in the mockup.
export const collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("collection_user_idx").on(t.userId)],
);

export const collectionItem = pgTable(
  "collection_item",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.collectionId, t.listingId] })],
);

export type SearchFilters = {
  sources?: ListingSource[];
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

// Every search run, for the recommender and for search-quality analysis.
export const search = pgTable(
  "search",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    // null = signed-out visitor.
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    filters: jsonb("filters").$type<SearchFilters>().notNull().default({}),
    resultCount: integer("result_count"),
    queryEmbedding: vector("query_embedding", { dimensions: EMBEDDING_DIMS }),
    createdAt: createdAt(),
  },
  (t) => [index("search_user_time_idx").on(t.userId, t.createdAt)],
);

// Searches the user pinned, optionally with new-match alerts.
export const savedSearch = pgTable(
  "saved_search",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    query: text("query").notNull(),
    filters: jsonb("filters").$type<SearchFilters>().notNull().default({}),
    notify: boolean("notify").notNull().default(false),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("saved_search_user_idx").on(t.userId)],
);
