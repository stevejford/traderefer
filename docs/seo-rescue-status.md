# TradeRefer SEO Rescue Status

Last updated: 2026-05-25

## Current Live State

The first SEO rescue pass is deployed to production on Vercel.

- Production domain: `https://traderefer.au`
- Vercel deployment: `dpl_9AigpD6pW6Fs4tE2H9FSHaHYBEUP`
- Upstream PR: `https://github.com/maddonsteve2-blip/traderefer/pull/1`
- Fork containing rescue commits: `https://github.com/stevejford/traderefer`

Local commits:

- `cfa6fa98 Rescue TradeRefer SEO indexation`
- `eee3c1ee Add TradeRefer SEO rescue monitoring`

The upstream repository currently grants the active GitHub account read-only access, so the code was pushed to the fork and opened as a PR.

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

Latest GSC cache seen during rescue:

- Pulled at: `2026-05-24T19:45:00.513200+00:00`
- Last 28 days: 11 clicks, 3,836 impressions, 0.29% CTR, average position 16.8

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

DeepSyte was not available for the final visual/performance sample audit in this session.

Observed state:

- Codex MCP config lists `deepsyte` at `https://api.deepsyte.com/mcp`.
- Native `mcp__deepsyte` tools were not mounted in this running thread.
- `deepsyte whoami` reported the website OAuth session was expired.
- `codex mcp login deepsyte` timed out waiting for OAuth completion.

Next step:

```bash
codex mcp login deepsyte
```

Then start a fresh Codex session or retry once the `mcp__deepsyte` tools are mounted.

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

1. Merge the upstream PR or grant write access to the upstream repo.
2. Complete writable GSC OAuth and resubmit `https://traderefer.au/sitemap.xml`.
3. Reconnect DeepSyte and run visual/performance/SEO samples across home, profile, local trade, suburb, top, and generic near-me pages.
4. Monitor GSC at 7, 14, and 28 days before adding any new programmatic page sets.
