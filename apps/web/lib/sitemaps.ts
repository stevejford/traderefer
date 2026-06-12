import { sql } from "@/lib/db";

// Googlebot drops connections on the single 5+ MB profiles sitemap, so profile
// URLs are served as numbered chunks (/sitemaps/profiles-1, -2, ...) capped at
// this many URLs each. The sitemap index derives its chunk list from the same
// count so the two always agree.
export const PROFILES_CHUNK_SIZE = 10000;

// The WHERE clause (including the quality gate) must stay identical to
// profilesSitemap() in app/sitemaps/[sitemap]/route.ts, or the chunk count
// in the sitemap index will disagree with the chunk contents.
export async function countProfileUrls() {
    const [row] = await sql<{ count: string }[]>`
        SELECT COUNT(*) AS count
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND slug IS NOT NULL
          AND slug != ''
          AND business_name IS NOT NULL
          AND business_name != ''
          AND (
              total_reviews >= 5
              OR (total_reviews >= 1 AND COALESCE(array_length(photo_urls, 1), 0) > 0)
          )
    `;
    return Number(row.count);
}

export function profilesChunkCount(totalUrls: number) {
    return Math.max(1, Math.ceil(totalUrls / PROFILES_CHUNK_SIZE));
}
