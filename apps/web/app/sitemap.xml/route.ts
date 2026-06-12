import { NextResponse } from 'next/server';
import { countProfileUrls, profilesChunkCount } from '@/lib/sitemaps';

export const runtime = 'nodejs';
export const revalidate = 86400; // 24-hour edge cache

// Sub-sitemaps are served by the web app so sitemap indexation rules can ship
// with the SEO templates without waiting on the separate Railway API deploy.
const BASE_URL = 'https://traderefer.au';

export async function GET() {
    const chunkCount = profilesChunkCount(await countProfileUrls());
    const profileSitemaps = Array.from(
        { length: chunkCount },
        (_, i) => `  <sitemap><loc>${BASE_URL}/sitemaps/profiles-${i + 1}</loc></sitemap>`
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemaps/general</loc></sitemap>
${profileSitemaps}
  <sitemap><loc>${BASE_URL}/sitemaps/suburbs</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemaps/trades</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemaps/top</loc></sitemap>
</sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
        },
    });
}
