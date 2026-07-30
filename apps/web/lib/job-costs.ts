// Per-job cost overrides. Some job types within a trade have materially
// different pricing than the trade-level TRADE_COST_GUIDE average (e.g.
// turf laying is far cheaper per m² than general landscaping). Keyed by
// job slug (see jobToSlug in lib/constants.ts).
export const JOB_COST_OVERRIDES: Record<string, { unit: string; low: number; high: number; note?: string }> = {
    "turf-laying": { unit: "/m²", low: 25, high: 50, note: "supplied and laid; turf alone $10-$19/m²" },
    // Maintenance/resurfacing jobs priced far below their trade's full-build
    // bucket, and premium-material jobs priced above it. Each figure matches
    // the job's published FAQ answer (batch 3) — one price story per page.
    "deck-sanding-and-sealing": { unit: "/m²", low: 35, high: 70 },
    "deck-oiling-and-staining": { unit: "/m²", low: 15, high: 35 },
    "tile-regrouting": { unit: "/m²", low: 15, high: 40 },
    "bathroom-tap-installation": { unit: " per tap", low: 150, high: 400 },
    "frameless-shower-screen-installation": { unit: " per screen", low: 900, high: 2200 },
    "shower-screen-replacement": { unit: " per screen", low: 275, high: 1008, note: "screen only; fitting labour on top" },
    "kitchen-splashback-installation": { unit: "/m²", low: 60, high: 180 },
    "stone-benchtop-installation": { unit: " per benchtop", low: 4800, high: 7500, note: "typical 5m² kitchen, installed" },
    "engineered-timber-flooring-installation": { unit: "/m²", low: 160, high: 250, note: "installed; board cost dominates" },
    "glass-pool-fencing": { unit: " per metre", low: 400, high: 800, note: "frameless; semi-frameless from ~$250/m" },
    "aluminium-slat-fencing": { unit: " per metre", low: 250, high: 600 },
    "waterproofing-and-tiling": { unit: "/m²", low: 60, high: 180 },
    "waterproofing-membrane-installation": { unit: "/m²", low: 30, high: 80 },
    "kitchen-sink-installation": { unit: " supply and install", low: 600, high: 1600, note: "labour-only swap $250-$600" },
    "vanity-installation": { unit: " supply and install", low: 800, high: 2500 },
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
