#!/usr/bin/env node

const GSC_BASE_URL = process.env.GSC_API_BASE_URL || "https://disciplined-truth-production-5cd7.up.railway.app";
const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://traderefer.au";
const SAMPLE_LIMIT = Number(process.env.SEO_AUDIT_SAMPLE_LIMIT || 8);
const INCLUDE_GSC_URL_SAMPLES = process.env.SEO_AUDIT_INCLUDE_GSC_URLS !== "false";
const REWRITE_SITEMAP_HOST = process.env.SEO_AUDIT_REWRITE_SITEMAP_HOST !== "false"
  && new URL(SITE_BASE_URL).origin !== "https://traderefer.au";

const SITEMAPS = ["general", "profiles", "suburbs", "trades", "top"];
const STATE_POSTCODE_RANGES = {
  ACT: [[2600, 2618], [2900, 2920]],
  NSW: [[2000, 2599], [2619, 2899], [2921, 2999]],
  NT: [[800, 899]],
  QLD: [[4000, 4999]],
  SA: [[5000, 5999]],
  TAS: [[7000, 7999]],
  VIC: [[3000, 3999]],
  WA: [[6000, 6799]],
};

function arg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function extractLocs(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
}

function rewriteToSiteBase(url) {
  if (!REWRITE_SITEMAP_HOST) return url;
  const target = new URL(url);
  const base = new URL(SITE_BASE_URL);
  target.protocol = base.protocol;
  target.host = base.host;
  return target.toString();
}

function urlType(url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "home";
  if (pathname.startsWith("/b/")) return pathname.endsWith("/refer") ? "refer" : "profile";
  if (pathname.startsWith("/local/")) return "local";
  if (pathname.startsWith("/trades/")) return "trade-hub";
  if (pathname.startsWith("/top/")) return "top";
  return "other";
}

function isPostcodeValidForState(postcode, state) {
  const ranges = STATE_POSTCODE_RANGES[String(state || "").toUpperCase()];
  const numeric = Number(postcode);
  return /^\d{4}$/.test(String(postcode || "")) && !!ranges && ranges.some(([min, max]) => numeric >= min && numeric <= max);
}

function findLocalPostcodeIssue(url) {
  const { pathname } = new URL(url);
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "local" || parts.length < 4) return null;
  const state = parts[1].toUpperCase();
  const suburb = parts[3];
  const match = suburb.match(/^(.+)-(\d{4})$/);
  if (!match) return null;
  return isPostcodeValidForState(match[2], state)
    ? null
    : { state, suburb: match[1], postcode: match[2], issue: "postcode-state-mismatch" };
}

function firstMatch(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

async function inspectUrl(url) {
  const postcodeIssue = findLocalPostcodeIssue(url);
  const response = await fetch(url, { redirect: "manual" });
  const result = {
    url,
    type: urlType(url),
    status: response.status,
    redirectLocation: response.headers.get("location"),
    postcodeIssue,
  };

  const contentType = response.headers.get("content-type") || "";
  if (response.status >= 300 && response.status < 400) return result;
  if (!contentType.includes("text/html")) return result;

  const html = await response.text();
  result.title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  result.canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  result.robots = firstMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  result.h1Count = (html.match(/<h1\b/gi) || []).length;
  result.jsonLdCount = (html.match(/application\/ld\+json/gi) || []).length;
  result.hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  return result;
}

function summarizePages(pages) {
  const summary = {};
  for (const page of pages || []) {
    const type = urlType(page.page);
    const bucket = summary[type] || { pages: 0, clicks: 0, impressions: 0, weightedPosition: 0 };
    bucket.pages += 1;
    bucket.clicks += Number(page.clicks || 0);
    bucket.impressions += Number(page.impressions || 0);
    bucket.weightedPosition += Number(page.position || 0) * Number(page.impressions || 0);
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
  const explicitUrls = (arg("url") || "").split(",").map((value) => value.trim()).filter(Boolean);
  const [status, latest, ctr, pages90] = await Promise.all([
    fetchJson(`${GSC_BASE_URL}/api/gsc/status`),
    fetchJson(`${GSC_BASE_URL}/api/gsc/latest?refresh_if_stale=true`),
    fetchJson(`${GSC_BASE_URL}/api/gsc/ctr-analysis?period=28&refresh_if_stale=true`),
    fetchJson(`${GSC_BASE_URL}/api/gsc/pages?limit=1000&period=90&refresh_if_stale=true`),
  ]);

  const sitemapEntries = {};
  const sitemapUrls = [];
  for (const sitemap of SITEMAPS) {
    const locs = extractLocs(await fetchText(`${SITE_BASE_URL}/sitemaps/${sitemap}`));
    const sample = locs.slice(0, SAMPLE_LIMIT).map(rewriteToSiteBase);
    sitemapEntries[sitemap] = { count: locs.length, sample };
    sitemapUrls.push(...sample);
  }

  const topGscUrls = INCLUDE_GSC_URL_SAMPLES
    ? (pages90.pages || [])
      .filter((page) => Number(page.impressions || 0) > 0)
      .slice(0, SAMPLE_LIMIT)
      .map((page) => page.page)
    : [];
  const urlsToInspect = Array.from(new Set([...explicitUrls, ...topGscUrls, ...sitemapUrls]));
  const inspections = [];
  for (const url of urlsToInspect) {
    try {
      inspections.push(await inspectUrl(url));
    } catch (error) {
      inspections.push({ url, type: urlType(url), error: String(error.message || error) });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    gsc: {
      status,
      latest: latest.summary,
      ctrPositionRanges: Object.fromEntries(Object.entries(ctr.position_ranges || {}).map(([range, value]) => [
        range,
        { count: value.count, avgCtr: value.avg_ctr },
      ])),
      pageTypeSummary90d: summarizePages(pages90.pages),
    },
    sitemaps: sitemapEntries,
    inspectedUrls: inspections,
    criticalFindings: inspections.filter((item) =>
      item.error ||
      (item.postcodeIssue && !(item.status >= 300 && item.status < 400 && item.redirectLocation)) ||
      item.status >= 400 ||
      (item.status === 200 && !item.canonical) ||
      (item.type === "local" && item.status === 200 && item.h1Count !== 1)
    ),
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
