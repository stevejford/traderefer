# TradeRefer SEO Rescue Status

Last updated: 2026-05-26

## Current Live State

The first SEO rescue pass and the first DeepSyte-driven metadata/accessibility uplift are deployed to production on Vercel and merged to the upstream GitHub repository.

- Production domain: `https://traderefer.au`
- Vercel deployment: `dpl_FTMBM6G6GuxTD93CN6trnPKKqnbm`
- Upstream PR: `https://github.com/maddonsteve2-blip/traderefer/pull/1` (merged)
- Fork containing rescue commits: `https://github.com/stevejford/traderefer`
- Railway API deployment: `828c4e70-3422-4c62-b3e5-a7ad2a1cc4d8` for commit `4abaddb4`

Local commits:

- `cfa6fa98 Rescue TradeRefer SEO indexation`
- `eee3c1ee Add TradeRefer SEO rescue monitoring`
- `4abaddb4 Document TradeRefer SEO rescue status`
- `52e79312 Improve SEO metadata and accessibility signals`
- `c4a77e6f Strengthen visible focus styles`
- `bdde8997 Force visible focus outline`

The upstream repository is now at commit `bdde8997`.

## Live Sitemap Counts

Run:

```bash
npm run seo:monitor
```

Current verified counts:

- `general`: 812 URLs
- `profiles`: 33,632 URLs
- `suburbs`: 1,178 URLs
- `trades`: 14,560 URLs
- `top`: 1,264 URLs

The generic national near-me URLs are no longer in the XML sitemap. Known bad postcode variants such as `/local/nsw/epping/epping-3076/...` are no longer in XML.

## Verified Live Behaviors

The monitor currently checks these URLs:

- `/local/nsw/epping/epping-3076/drainage` redirects with `308` to `/local/nsw/epping/epping-2118/drainage`.
- `/local/nsw/sydney/caringbah-2229/air-conditioning-heating` is `index, follow`.
- `/local/nsw/sydney/caringbah-2229/air-conditioning-heating/split-system-air-conditioner-electrical` is `noindex, follow`.
- `/top/air-conditioning-heating/nsw/parramatta` is `index, follow`.
- `/air-conditioning-specialists-near-me` is `noindex, follow`.

## GSC State

Latest GSC cache seen during rescue monitor:

- Pulled at: `2026-05-25T20:09:28.711608+00:00`
- Last 28 days: 11 clicks, 3,458 impressions, 0.32% CTR, average position 15.3

The existing `gsc_token.json` has readonly scope only. Sitemap listing works, but submitting the sitemap fails with `403 insufficient authentication scopes`.

To submit the cleaned sitemap after approving writable Search Console scope:

```bash
npm run gsc:submit-sitemap -- --reauth
```

This writes the writable token to ignored file `gsc_token_webmasters.json`, then submits:

```text
https://traderefer.au/sitemap.xml
```

## DeepSyte State

DeepSyte MCP is connected and was used for sampled public-page audits across homepage, local trade, suburb, top, profile, and generic near-me templates.

Observed state and fixes:

- DeepSyte run evidence: `https://www.deepsyte.com/dashboard/runs/Fbv29oZ7TbD7-83yvGvnl` and `https://www.deepsyte.com/dashboard/runs/fl2kCPImF01cyYApXDbys`.
- Homepage description is shorter and clearer.
- Local trade page title is shorter; sampled page changed from `2 Verified Air Conditioning Specialists in Caringbah 2229 | TradeRefer` to `2 Air Conditioning Specialists in Caringbah 2229`.
- Suburb, top, profile, and generic near-me templates now emit complete OG/Twitter image metadata.
- Public profile pages now include the shared footer landmark.
- App-wide skip link is present.
- Orange-on-white CTA contrast now passes DeepSyte sampled contrast checks.
- Live computed styles confirm focused CTA links receive a 3px outline plus 6px focus halo.

Residual DeepSyte findings:

- DeepSyte still reports `WCAG 2.4.7` focus indicator failures in its aggregate audit despite computed focus styles showing a visible outline. Treat this as needing a follow-up selector-level audit before closing accessibility.
- All sampled pages still share `https://traderefer.au/og-default.jpg`; add template-specific OG images next.
- Mobile Lighthouse lab performance remains weak on heavier pages, especially profiles. Latest sampled scores: home 66, local trade 65, top 69, profile 49.

## Daily Monitoring

Codex automation created:

```text
traderefer-seo-rescue-monitor
```

It runs every 24 hours from this workspace and executes:

```bash
node scripts/seo_rescue_monitor.mjs
```

Watch for:

- sitemap count regressions
- generic near-me URLs leaking back into XML
- invalid postcode variants leaking back into XML
- key URL robots/canonical/redirect behavior changing
- stale GSC cache
- movement in clicks, impressions, CTR, and page-template performance

## Next Recovery Gates

1. Complete writable GSC OAuth and resubmit `https://traderefer.au/sitemap.xml`.
2. Add differentiated OG images for profile, local trade, suburb, top, and generic trade templates.
3. Investigate profile/mobile performance: large JS payload, LCP, TTI, and resource count.
4. Follow up on selector-level focus indicator audit.
5. Monitor GSC at 7, 14, and 28 days before adding any new programmatic page sets.
