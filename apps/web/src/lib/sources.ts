import type { ListingSource } from "@/db/schema";

// Display metadata per source. Keys must match the listing_source enum in db/schema.ts.
export const SOURCES: Record<ListingSource, { name: string; colorVar: string }> = {
  facebook: { name: "Facebook Marketplace", colorVar: "--src-fb" },
  kijiji: { name: "Kijiji", colorVar: "--src-kj" },
  karrot: { name: "Karrot", colorVar: "--src-kr" },
  craigslist: { name: "Craigslist", colorVar: "--src-cl" },
  ebay: { name: "eBay", colorVar: "--src-eb" },
};
