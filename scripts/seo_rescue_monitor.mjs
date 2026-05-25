#!/usr/bin/env node

const GSC_BASE_URL = process.env.GSC_API_BASE_URL || "https://disciplined-truth-production-5cd7.up.railway.app";
const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://traderefer.au";
const SAMPLE_LIMIT = Number(process.env.SEO_MONITOR_SAMPLE_LIMIT || 2);

const SITEMAPS = ["general", "profiles", "suburbs", "trades", "top"];
const EXPECTED_LIMITS = {
  general: { max: 900 },
  profiles: { min: 30000, max: 36000 },
  suburbs: { max: 1300 },
  trades: { max: 15000 },
  top: { max: 1400 },
};

const WATCH_URLS = [
  "/local/nsw/epping/epping-3076/drainage",
  "/local/nsw/sydney/caringbah-2229/air-conditioning-heating",
  "/local/nsw/sydney/caringbah-2229/air-conditioning-heating/split-system-air-conditioner-electrical",
  "/top/air-conditioning-heating/nsw/parramatta",
  "/air-conditioning-specialists-near-me",
];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

function extractLocs(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

function firstMatch(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : "";
}

function pageType(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/b/")) return "profile";
  if (pathname.startsWith("/local/")) return "local";
  if (pathname.startsWith("/top/")) return "top";
  return "other";
}

async function inspectPath(pathname) {
  const url = new URL(pathname, SITE_BASE_URL).toString();
  const { response, text } = await fetchText(url, { redirect: "manual" });
  const result = {
    url,
    type: pageType(new URL(url).pathname),
    status: response.status,
    location: response.headers.get("location") || "",
  };
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return result;

  result.title = firstMatch(text, /<title[^>]*>([\s\S]*?)<\/title>/i);
  result.canonical = firstMatch(text, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || firstMatch(text, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  result.robots = firstMatch(text, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  result.h1Count = (text.match(/<h1\b/gi) || []).length;
  result.jsonLdCount = (text.match(/application\/ld\+json/gi) || []).length;
  return result;
}

function summarizePageTypes(pages) {
  const summary = {};
  for (const page of pages || []) {
    const type = pageType(new URL(page.page).pathname);
    const bucket = summary[type] || { pages: 0, clicks: 0, impressions: 0, weightedPosition: 0 };
    const impressions = Number(page.impressions || 0);
    bucket.pages += 1;
    bucket.clicks += Number(page.clicks || 0);
    bucket.impressions += impressions;
    bucket.weightedPosition += Number(page.position || 0) * impressions;
    summary[type] = bucket;
  }
  for (const bucket of Object.values(summary)) {
    bucket.ctr = bucket.impressions ? bucket.clicks / bucket.impressions : 0;
    bucket.avgPosition = bucket.impressions ? bucket.weightedPosition / bucket.impressions : null;
    delete bucket.weightedPosition;
  }
  return summary;
}

async function main() {
  const [gscStatus, latest, pages90] = await Promise.all([
    fetchJson(`${GSC_BASE_URL}/api/gsc/status`),
    fetchJson(`${GSC_BASE_URL}/api/gsc/latest?refresh_if_stale=true`),
    fetchJson(`${GSC_BASE_URL}/api/gsc/pages?limit=1000&period=90&refresh_if_stale=true`),
  ]);

  const sitemapSummary = {};
  const issues = [];
  for (const sitemap of SITEMAPS) {
    const { response, text } = await fetchText(`${SITE_BASE_URL}/sitemaps/${sitemap}`);
    const locs = response.ok ? extractLocs(text) : [];
    const limits = EXPECTED_LIMITS[sitemap] || {};
    const count = locs.length;
    const nearMeLeak = text.includes("air-conditioning-specialists-near-me");
    const badPostcodeLeak = text.includes("/local/nsw/epping/epping-3076/");
    sitemapSummary[sitemap] = {
      status: response.status,
      count,
      sample: locs.slice(0, SAMPLE_LIMIT),
      nearMeLeak,
      badPostcodeLeak,
    };
    if (!response.ok) issues.push(`${sitemap} sitemap returned ${response.status}`);
    if (limits.min && count < limits.min) issues.push(`${sitemap} sitemap count ${count} is below expected minimum ${limits.min}`);
    if (limits.max && count > limits.max) issues.push(`${sitemap} sitemap count ${count} is above expected maximum ${limits.max}`);
    if (nearMeLeak) issues.push(`${sitemap} sitemap includes generic near-me URLs`);
    if (badPostcodeLeak) issues.push(`${sitemap} sitemap includes invalid NSW/VIC Epping postcode URL`);
  }

  const inspections = [];
  for (const pathname of WATCH_URLS) {
    inspections.push(await inspectPath(pathname));
  }

  const expectedBehaviors = [
    {
      label: "bad Epping URL redirects",
      ok: inspections.find((item) => item.url.endsWith("/local/nsw/epping/epping-3076/drainage"))?.status === 308,
    },
    {
      label: "valid local trade page remains indexable",
      ok: inspections.find((item) => item.url.endsWith("/local/nsw/sydney/caringbah-2229/air-conditioning-heating"))?.robots === "index, follow",
    },
    {
      label: "job subtype pages stay noindex",
      ok: inspections.find((item) => item.url.includes("/split-system-air-conditioner-electrical"))?.robots === "noindex, follow",
    },
    {
      label: "generic near-me pages stay noindex",
      ok: inspections.find((item) => item.url.endsWith("/air-conditioning-specialists-near-me"))?.robots === "noindex, follow",
    },
  ];
  for (const behavior of expectedBehaviors) {
    if (!behavior.ok) issues.push(`Unexpected live behavior: ${behavior.label}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    siteBaseUrl: SITE_BASE_URL,
    status: issues.length ? "warn" : "ok",
    issues,
    gsc: {
      pulledAt: gscStatus.freshness?.pulledAt,
      isStale: gscStatus.freshness?.isStale,
      last28: latest.summary?.last28,
      ctr28: latest.summary?.ctr_28d,
      position28: latest.summary?.position_28d,
      pageTypeSummary90d: summarizePageTypes(pages90.pages),
    },
    sitemaps: sitemapSummary,
    inspections,
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(issues.length ? 1 : 0);
  }

  console.log(`# TradeRefer SEO Rescue Monitor\n`);
  console.log(`Status: ${report.status.toUpperCase()}`);
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`GSC pulledAt: ${report.gsc.pulledAt || "unknown"}${report.gsc.isStale ? " (stale)" : ""}`);
  console.log(`Last 28d: ${report.gsc.last28?.totalClicks ?? 0} clicks, ${report.gsc.last28?.totalImpressions ?? 0} impressions, CTR ${((report.gsc.ctr28 || 0) * 100).toFixed(2)}%, avg position ${report.gsc.position28 ?? "n/a"}\n`);
  console.log(`Sitemaps:`);
  for (const [name, details] of Object.entries(sitemapSummary)) {
    console.log(`- ${name}: ${details.count} URLs`);
  }
  console.log(`\nWatched URLs:`);
  for (const item of inspections) {
    console.log(`- ${item.status} ${item.url}${item.robots ? ` [${item.robots}]` : ""}${item.location ? ` -> ${item.location}` : ""}`);
  }
  if (issues.length) {
    console.log(`\nIssues:`);
    for (const issue of issues) console.log(`- ${issue}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
