import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { JOB_TYPES } from "@/lib/constants";
import { getCanonicalSuburbSlug, isPostcodeValidForState } from "@/lib/postcodes";

export const runtime = "nodejs";
export const revalidate = 86400;

const BASE_URL = "https://traderefer.au";
const FIND_TRADE_PAGES = ["find-a-plumber-near-me", "find-an-electrician-near-me"];
const LOCAL_TRADE_PAGES = [
    "local/gutter-cleaning-geelong",
    "local/asbestos-removal-bendigo",
    "local/bathroom-renovations-perth",
];

type SitemapName = "general" | "profiles" | "suburbs" | "trades" | "top";

type SitemapParams = {
    params: Promise<{ sitemap: string }>;
};

type UrlEntry = {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
};

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function xmlEscape(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function slugify(value: string) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function dateString(value: unknown, fallback = todayIso()) {
    if (!value) return fallback;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

function url(loc: string, lastmod = todayIso(), changefreq = "weekly", priority = "0.7"): UrlEntry {
    return { loc, lastmod, changefreq, priority };
}

function urlset(entries: UrlEntry[]) {
    const body = entries.map((entry) =>
        `  <url><loc>${xmlEscape(entry.loc)}</loc><lastmod>${xmlEscape(entry.lastmod)}</lastmod><changefreq>${xmlEscape(entry.changefreq)}</changefreq><priority>${xmlEscape(entry.priority)}</priority></url>`
    ).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

function sitemapResponse(entries: UrlEntry[], status = 200) {
    return new NextResponse(urlset(entries), {
        status,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        },
    });
}

function postcodeFromAddress(address: string | null, state: string) {
    if (!address) return null;
    const matches = address.match(/\b\d{4}\b/g) || [];
    return matches.find((postcode) => isPostcodeValidForState(postcode, state)) || null;
}

function suburbSegment(suburbSlug: string, state: string, address: string | null) {
    const canonical = getCanonicalSuburbSlug(suburbSlug, state);
    if (canonical !== suburbSlug) return canonical;
    const postcode = postcodeFromAddress(address, state);
    return postcode ? `${suburbSlug}-${postcode}` : suburbSlug;
}

async function generalSitemap() {
    const today = todayIso();
    const entries: UrlEntry[] = [
        url(BASE_URL, today, "daily", "1.0"),
        url(`${BASE_URL}/businesses`, today, "daily", "0.9"),
        url(`${BASE_URL}/categories`, today, "weekly", "0.95"),
        url(`${BASE_URL}/locations`, today, "weekly", "0.95"),
        url(`${BASE_URL}/local`, today, "weekly", "0.9"),
        url(`${BASE_URL}/contact`, today, "monthly", "0.5"),
        url(`${BASE_URL}/terms`, today, "monthly", "0.3"),
        url(`${BASE_URL}/privacy`, today, "monthly", "0.3"),
        url(`${BASE_URL}/cookies`, today, "monthly", "0.2"),
    ];

    const states = await sql<{ s: string }[]>`
        SELECT DISTINCT LOWER(state) AS s
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND state IS NOT NULL
          AND state != ''
    `;
    for (const row of states) {
        entries.push(url(`${BASE_URL}/local/${row.s}`, today, "weekly", "0.9"));
    }

    const cities = await sql<{ s: string; c: string; business_count: string | number }[]>`
        SELECT LOWER(state) AS s, LOWER(REPLACE(city, ' ', '-')) AS c, COUNT(*) AS business_count
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND state IS NOT NULL
          AND state != ''
          AND city IS NOT NULL
          AND city != ''
        GROUP BY LOWER(state), LOWER(REPLACE(city, ' ', '-'))
        HAVING COUNT(*) >= 2
    `;
    for (const row of cities) {
        entries.push(url(`${BASE_URL}/local/${row.s}/${row.c}`, today, "weekly", "0.85"));
    }

    for (const slug of FIND_TRADE_PAGES) {
        entries.push(url(`${BASE_URL}/${slug}`, today, "weekly", "0.95"));
    }
    for (const slug of LOCAL_TRADE_PAGES) {
        entries.push(url(`${BASE_URL}/${slug}`, today, "weekly", "0.9"));
    }
    for (const jobs of Object.values(JOB_TYPES)) {
        for (const job of jobs) {
            entries.push(url(`${BASE_URL}/trades/${slugify(job)}`, today, "monthly", "0.8"));
        }
    }

    return entries;
}

async function profilesSitemap() {
    const rows = await sql<{ slug: string; lastmod: Date | string | null }[]>`
        SELECT slug, COALESCE(updated_at, created_at)::date AS lastmod
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND slug IS NOT NULL
          AND slug != ''
          AND business_name IS NOT NULL
          AND business_name != ''
        ORDER BY created_at ASC
    `;
    return rows.map((row) => url(`${BASE_URL}/b/${row.slug}`, dateString(row.lastmod), "weekly", "0.5"));
}

async function suburbsSitemap() {
    const today = todayIso();
    const rows = await sql<{ s: string; c: string; sub: string; addr: string | null }[]>`
        SELECT LOWER(state) AS s,
               LOWER(REPLACE(city, ' ', '-')) AS c,
               LOWER(REPLACE(suburb, ' ', '-')) AS sub,
               MAX(address) AS addr,
               COUNT(*) AS business_count,
               COUNT(DISTINCT trade_category) AS category_count
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND state IS NOT NULL
          AND state != ''
          AND city IS NOT NULL
          AND city != ''
          AND suburb IS NOT NULL
          AND suburb != ''
        GROUP BY LOWER(state), LOWER(REPLACE(city, ' ', '-')), LOWER(REPLACE(suburb, ' ', '-'))
        HAVING COUNT(*) >= 2 OR COUNT(DISTINCT trade_category) >= 2
    `;
    return rows.map((row) => url(`${BASE_URL}/local/${row.s}/${row.c}/${suburbSegment(row.sub, row.s, row.addr)}`, today, "weekly", "0.75"));
}

async function tradesSitemap() {
    const today = todayIso();
    const rows = await sql<{ s: string; c: string; sub: string; trade_category: string; lastmod: Date | string | null; addr: string | null }[]>`
        SELECT LOWER(state) AS s,
               LOWER(REPLACE(city, ' ', '-')) AS c,
               LOWER(REPLACE(suburb, ' ', '-')) AS sub,
               trade_category,
               MAX(COALESCE(updated_at, created_at))::date AS lastmod,
               MAX(address) AS addr,
               COUNT(*) AS business_count,
               COALESCE(SUM(total_reviews), 0) AS review_count
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND state IS NOT NULL
          AND state != ''
          AND city IS NOT NULL
          AND city != ''
          AND suburb IS NOT NULL
          AND suburb != ''
          AND trade_category IS NOT NULL
          AND trade_category != ''
        GROUP BY LOWER(state), LOWER(REPLACE(city, ' ', '-')), LOWER(REPLACE(suburb, ' ', '-')), trade_category
        HAVING COUNT(*) >= 2 OR COALESCE(SUM(total_reviews), 0) > 0
    `;
    return rows.map((row) => url(
        `${BASE_URL}/local/${row.s}/${row.c}/${suburbSegment(row.sub, row.s, row.addr)}/${slugify(row.trade_category)}`,
        dateString(row.lastmod, today),
        "weekly",
        "0.7"
    ));
}

async function topSitemap() {
    const today = todayIso();
    const rows = await sql<{ trade_category: string; s: string; c: string }[]>`
        SELECT trade_category, LOWER(state) AS s, LOWER(REPLACE(city, ' ', '-')) AS c, COUNT(*) AS business_count
        FROM businesses
        WHERE status = 'active'
          AND (listing_visibility = 'public' OR listing_visibility IS NULL)
          AND trade_category IS NOT NULL
          AND state IS NOT NULL
          AND city IS NOT NULL
          AND avg_rating > 0
          AND total_reviews > 0
        GROUP BY trade_category, LOWER(state), LOWER(REPLACE(city, ' ', '-'))
        HAVING COUNT(*) >= 3
        ORDER BY trade_category, s, c
    `;
    return rows.map((row) => url(`${BASE_URL}/top/${slugify(row.trade_category)}/${row.s}/${row.c}`, today, "weekly", "0.8"));
}

export async function GET(_request: NextRequest, { params }: SitemapParams) {
    const { sitemap } = await params;
    if (!["general", "profiles", "suburbs", "trades", "top"].includes(sitemap)) {
        return sitemapResponse([], 404);
    }

    const sitemapName = sitemap as SitemapName;
    const entries = {
        general: generalSitemap,
        profiles: profilesSitemap,
        suburbs: suburbsSitemap,
        trades: tradesSitemap,
        top: topSitemap,
    }[sitemapName];

    return sitemapResponse(await entries());
}
