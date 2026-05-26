# TradeRefer SEO Rescue Status

Last updated: 2026-05-26

## Current Live State

The first SEO rescue pass and the first DeepSyte-driven metadata/accessibility uplift are deployed to production on Vercel and merged to the upstream GitHub repository.

The next rescue pass added dynamic, template-specific Open Graph image generation for homepage, profile, local trade, suburb, top-list, near-me, and trade/job guide templates. The current live pass also reduces public-page mobile weight by removing the embedded Google Maps iframe from profile pages, lazy-loading address autocomplete, disabling eager route prefetches on key public directory templates, replacing the oversized remote local-page hero image with the existing local WebP asset, and deferring Clerk/PostHog/Google Analytics away from anonymous SEO routes.

The latest route-flow rescue pass is deployed and verified on production. It fixes public navigation from the landing page, restores the public business directory render path, adds a real noindex listing-removal support page, prevents homepage popular-search links from emitting bad city/postcode combinations, and adds repo-side Vercel monorepo build config for the GitHub-connected deployment.

- Production domain: `https://traderefer.au`
- Vercel deployment: `https://vercel.com/stevejfords-projects/traderefer/93PbjEindTeUE7bBer4cGQRZD4r7`
- Upstream PR: `https://github.com/maddonsteve2-blip/traderefer/pull/1` (merged)
- Active upstream PR for dynamic OG images: `https://github.com/maddonsteve2-blip/traderefer/pull/2`
- Fork containing rescue commits: `https://github.com/stevejford/traderefer`
- Railway API deployment: `828c4e70-3422-4c62-b3e5-a7ad2a1cc4d8` for commit `4abaddb4`

Local commits:

- `cfa6fa98 Rescue TradeRefer SEO indexation`
- `eee3c1ee Add TradeRefer SEO rescue monitoring`
- `4abaddb4 Document TradeRefer SEO rescue status`
- `52e79312 Improve SEO metadata and accessibility signals`
- `c4a77e6f Strengthen visible focus styles`
- `bdde8997 Force visible focus outline`

The upstream repository is now at commit `ddd6ef6e`. The fork branch has the current merged/deploy commits through `f6363997`; the performance and anonymous-route JS deferral passes are deployed live and should be pushed/merged upstream next.

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

## Live Route-Flow Verification

Rendered Chrome sweep from the production landing page on 2026-05-26 after deployment found 84 unique internal routes and 0 route-flow issues:

- `/businesses` returns `200` and renders `Find Verified Trades Near You`.
- Visible `/businesses?category=...` category links render the directory page.
- Public directory browsing no longer triggers `/api/enrich-business`.
- The public header and mobile menu expose `/register`, not `/signup`.
- Visible homepage `/local/...` popular-search links no longer redirect from bad city/postcode combinations.
- `/remove` returns `200`, renders `Request a business listing removal`, and emits `noindex, follow`.

DeepSyte CLI confirmation runs:

- Broken production before deploy: `https://web-phi-eight-56.vercel.app/dashboard/runs/KL7dmkvXgLi_0-k363S76`.
- Fixed production after deploy: `https://web-phi-eight-56.vercel.app/dashboard/runs/zCpe_1eljoZEXrdG-ciHA`.

## GSC State

Latest GSC cache seen during rescue monitor:

- Pulled at: `2026-05-25T20:58:54.996111+00:00`
- Last 28 days: 11 clicks, 3,458 impressions, 0.32% CTR, average position 15.3

The existing `gsc_token.json` has readonly scope only. Sitemap listing works, but submitting from this workspace still fails with `403 insufficient authentication scopes`.

The cleaned sitemap has been resubmitted in Google Search Console. Readonly verification shows:

- Path: `https://traderefer.au/sitemap.xml`
- Last submitted: `2026-05-26T08:13:44.856Z`
- Last downloaded: `2026-05-26T08:13:46.375Z`
- Pending: `false`
- Warnings: `0`
- Errors: `0`

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
- Template-specific OG images are live on production via `apps/web/app/api/og/route.tsx` and `apps/web/lib/og-image.ts`.
- Live metadata checks show homepage, local trade, top-list, near-me, and plumber guide pages now emit `/api/og?...` image URLs instead of `og-default.jpg`.
- DeepSyte OG preview for `/local/nsw/sydney/caringbah-2229/air-conditioning-heating` scored `100/100`, found `og:image` and `twitter:image` using `/api/og`, validated 1200x630 dimensions, and rendered the local trade card successfully.
- Mobile performance pass is live on production. DeepSyte evidence:
  - Profile before: 74 resources, 24 fetches, ~1,385 KB transfer.
  - Profile after: 43 resources, 5 fetches, ~927 KB transfer, no embedded Google Maps iframe.
  - Local trade after final pass: 40 resources, 4 fetches, ~1,009 KB transfer; the 607 KB remote Unsplash hero was replaced by `/images/hero-construction.webp`.
  - Top-list after: 40 resources, 4 fetches, ~105 KB page-size summary, with no failed network requests in the sampled run.
- DeepSyte run evidence for this pass: `https://www.deepsyte.com/dashboard/runs/4YOLPaw0BOGwYgEAhcStE`, `https://www.deepsyte.com/dashboard/runs/808UDTo6puiJVrvMnGuqA`, and `https://www.deepsyte.com/dashboard/runs/FSVjq0ITmUqlxd5Veor8h`.
- Anonymous-route JS deferral pass is live on production. DeepSyte evidence:
  - Profile `/b/derek-son-painting-group`: 24 resources, 1 fetch, 527 KB transfer, LCP 1024ms, no failed requests, and no Clerk/GTM/GA/PostHog/ingest resources.
  - Local trade `/local/nsw/sydney/caringbah-2229/air-conditioning-heating`: 20 resources, 0 fetches, 599 KB transfer, LCP 672ms, no failed requests, and no Clerk/GTM/GA/PostHog/ingest resources.
  - Top-list `/top/air-conditioning-heating/nsw/parramatta`: 20 resources, 0 fetches, 587 KB transfer, LCP 704ms, no failed requests, and no Clerk/GTM/GA/PostHog/ingest resources.
- DeepSyte run evidence for anonymous-route JS deferral: `https://www.deepsyte.com/dashboard/runs/Mw6BYZ3Hfrkx_a0st3R2V`, `https://www.deepsyte.com/dashboard/runs/gv9xOuO8fRBrdNo8Ia5Od`, and `https://www.deepsyte.com/dashboard/runs/MJ9K2RgecrZ-Z3q4lFLkH`.
- Remaining mobile weight is mostly first-party Next.js chunks, font files, large icon/favicon transfer, and template images/logos.
- Route-flow pass DeepSyte state:
  - MCP browser navigation still fails with `No value provided for input HTTP label: Bucket`.
  - MCP `ux_review` timed out after 120 seconds.
  - DeepSyte CLI `doctor` now passes API reachability and API-key validity against `https://api.deepsyte.com`.
  - DeepSyte CLI controlled local Chrome successfully against the built local app.
  - DeepSyte CLI verified `/businesses` renders `Find Verified Trades Near You` instead of `This page couldn't load`.
  - DeepSyte CLI verified `/remove` renders `Request a business listing removal`, emits `robots: noindex, follow`, and canonicalizes to `https://traderefer.au/remove`.
  - DeepSyte route-flow run: `https://web-phi-eight-56.vercel.app/dashboard/runs/-goQxtCsY94UWQepDypD-`.
  - Some DeepSyte snapshot upload attempts returned API `502`, so keep the local Chrome route-sweep output as the primary route evidence for this pass.

## Current Local Validation

Latest local/live checks:

- Vercel GitHub deployment for fork commit `7a06b4a2` completed successfully.
- `https://traderefer.au/businesses` returns `200`, renders `Find Verified Trades Near You`, and keeps `robots: index, follow`.
- `https://traderefer.au/remove` returns `200`, renders `Request a business listing removal`, and keeps `robots: noindex, follow`.
- Production route-flow sweep from `https://traderefer.au/` found 84 visible internal routes and 0 issues.
- Production route-flow sweep found 0 `/signup` links, 0 bad `/local/` redirecting popular-search links, and 0 `/api/enrich-business` calls from public directory browsing.
- GSC sitemap listing confirms `https://traderefer.au/sitemap.xml` was submitted and downloaded on `2026-05-26` with 0 errors and 0 warnings.
- `pnpm.cmd --dir apps/web exec eslint app/page.tsx "app/(public)/businesses/page.tsx" app/remove/page.tsx components/RuntimeShell.tsx lib/public-routes.ts` passed with one existing `<img>` performance warning on directory thumbnails.
- `pnpm.cmd --dir apps/web build` completed successfully after the route-flow changes.
- Built local app served at `http://localhost:3020` and was swept from the landing page with rendered Chrome.
- Route-flow sweep found 84 unique internal routes exposed from desktop/mobile landing-page navigation and content links.
- Route-flow sweep found zero real failures after retrying two transient category navigations.
- Verified no visible landing-page links point to `/signup`; public header and mobile menu point to `/register`.
- Verified no visible `/local/` popular-search links redirect because of bad city/postcode combinations.
- Verified `/businesses` and visible `/businesses?category=...` links render the directory shell instead of the generic client error state.
- Verified `/businesses` no longer triggers public `/api/enrich-business` requests during rendered navigation.
- Verified `/remove` is a real support route and noindexed.
- `pnpm.cmd --dir apps/web build` completed with `LASTEXITCODE=0`.
- `pnpm.cmd --dir apps/web exec eslint app/layout.tsx app/page.tsx components/RuntimeShell.tsx components/AuthenticatedRuntimeShell.tsx components/GoogleAnalytics.tsx components/ClientProviders.tsx components/PostHogPageView.tsx components/LeadForm.tsx instrumentation-client.ts lib/public-routes.ts` passed.
- `pnpm.cmd --dir apps/web exec eslint components/AddressAutocomplete.tsx` passed.
- `pnpm.cmd --dir apps/web exec eslint app/api/og/route.tsx lib/og-image.ts app/page.tsx app/layout.tsx` passed.
- `curl -I http://localhost:3000/api/og?...` returned `200` with `content-type: image/png`.
- `curl -I https://traderefer.au/api/og?...` returned `200` with `content-type: image/png` after deployment.
- Live HTML checks confirm profile pages no longer contain `maps.google.com/maps?...output=embed`, profile pages include `Open location in Google Maps`, and local trade pages use `/images/hero-construction.webp` instead of the remote Unsplash hero.
- Live HTML checks confirm home, profile, local, and top SEO pages do not include Clerk, Google Tag Manager, or PostHog markers; `/login` still includes Clerk as expected.
- `git diff --check` passed.
- `node scripts/seo_rescue_monitor.mjs` returned `Status: OK` after deploy with sitemap counts unchanged and watched URL indexation/redirect rules stable.
- Broad targeted lint across old directory templates still reports pre-existing `any`, unused import, React set-state-in-effect, and `<img>` warnings/errors unrelated to this performance pass.

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

1. Merge the fork rescue commits upstream so `maddonsteve2-blip/traderefer` reflects the deployed production state.
2. Follow up on selector-level focus indicator audit.
3. Reduce remaining first-party JS/font/icon weight where it materially affects crawl/render cost.
4. Monitor GSC at 7, 14, and 28 days before adding any new programmatic page sets.
