// Per-job cost overrides. Some job types within a trade have materially
// different pricing than the trade-level TRADE_COST_GUIDE average (e.g.
// turf laying is far cheaper per m² than general landscaping). Keyed by
// job slug (see jobToSlug in lib/constants.ts).
export const JOB_COST_OVERRIDES: Record<string, { unit: string; low: number; high: number; note?: string }> = {
    "turf-laying": { unit: "/m²", low: 25, high: 50, note: "supplied and laid; turf alone $10-$15/m²" },
};

/**
 * Returns the cost guide for a specific job, preferring a job-level override
 * over the trade-level fallback. Single source of truth for hero copy, meta
 * descriptions, and AggregateOffer JSON-LD on the job page.
 */
export function jobCostGuide(
    jobSlug: string,
    tradeFallback: { unit: string; low: number; high: number } | undefined
): { unit: string; low: number; high: number; note?: string } | undefined {
    return JOB_COST_OVERRIDES[jobSlug] || tradeFallback;
}
