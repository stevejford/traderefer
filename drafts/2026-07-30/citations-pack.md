# TradeRefer Foundation Citations Pack

Generated 2026-07-30 for `LINK_PLAN.md` section 3 (foundation layer, month 1).
Every submission URL below was live-checked this session (WebFetch and/or a local
stealth fetch); anything not directly confirmed is marked **UNVERIFIED**. Follow/nofollow
column is the industry-typical behaviour for each platform, not something that can be
verified before a listing exists - re-check the actual `rel` attribute once each listing
is live, and log it.

Plan rules that apply to every submission here:

- Anchor is branded/NAP by nature (business name or bare URL). Never add keyword anchors.
- Target URL is always the homepage `https://traderefer.au` - never a `/local/...` page.
- Use the exact same NAP block everywhere (consistency is the point of citations).
- Push each live listing URL through Omega Indexer (`oi`) once published.

---

## Canonical NAP block (paste this, identically, everywhere)

| Field | Value |
|---|---|
| Business name | TradeRefer |
| Website | https://traderefer.au |
| Email | support@traderefer.au |
| Phone | **None published - gap.** Get a number (e.g. a Vonage virtual number) before starting; most directories require one. Do not invent one. |
| Address | Geelong VIC, Australia (online service-area business, no public street address) |
| ABN | 88 764 351 213 (verified active on ABR this session: sole trader, registered VIC 3217) |
| Category theme | Referral service / trades directory / business services (per-site picks below) |

**Three data problems found while building this pack - fix before submitting anywhere:**

1. **The site footer address is a placeholder.** `DirectoryFooter.tsx` line 171 shows
   "Level 1, 123 Collins Street, Melbourne VIC 3000". Never use it in a citation - it is
   not a real premises and citations built on it would be fabricated NAP. Where a
   directory mandates a street address, use the real registered address privately and
   set it to hidden/service-area; where suburb-level is allowed, use Geelong VIC.
2. **Entity mismatch.** The footer says "TradeRefer Pty Ltd" but ABN 88 764 351 213 is a
   sole trader registration (FORD, STEPHEN). Either register the company or fix the
   footer to the sole-trader trading name. Directories that verify ABN against entity
   name will trip on this. In citations, use the trading name "TradeRefer" only.
3. **No phone number.** Several targets below (GBP, Yellow/Thryv, Localsearch) require
   one. Sort this first; it becomes part of the canonical NAP and must then never vary.

Description rules used below: 2 sentences, branded, factual claims only (all drawn from
the site's own published copy: ABN-checked profiles, compare reviews, free quotes,
rewards for eligible referrals). No review counts, no "years in business", no keywords
stuffed. Each directory gets a lightly varied wording so the same paragraph is not
duplicated across the web, but every factual element is identical.

---

## Status summary

| # | Target | Submission URL status | Cost | Typical link |
|---|---|---|---|---|
| 1 | Google Business Profile | VERIFIED (eligibility caveat) | Free | Nofollow / entity signal |
| 2 | Bing Places | VERIFIED | Free | Nofollow / entity signal |
| 3 | True Local | Own form GONE - now via Yellow/Thryv signup (VERIFIED) | Free | Nofollow (tracked) |
| 4 | Yellow | VERIFIED | Free | Nofollow (tracked) |
| 5 | White Pages | VERIFIED | Free basic (paid tiers UNVERIFIED) | Nofollow (tracked) |
| 6 | ProductReview.com.au | No self-serve URL (both legacy paths 404, VERIFIED); entry via for-businesses page | Free listing | Nofollow |
| 7 | Localsearch | VERIFIED | Free | Often dofollow - verify live |
| 8 | Word of Mouth | VERIFIED | Free | Nofollow |
| 9 | Hotfrog | EXISTS, bot-gated (do in a normal browser) | Free | Historically dofollow |
| 10 | Yelp Australia | VERIFIED | Free | Nofollow |
| 11 | StartLocal | **DEAD - no working submission page found. Skip.** | - | - |
| 12 | Cylex Australia | VERIFIED (use cylex-australia.com, not cylex.com.au) | Free basic | Mixed - verify live |
| 13 | Brownbook | VERIFIED | Free | Historically dofollow |
| 14 | Foursquare | Product page VERIFIED; claim flow UNVERIFIED; low priority | Free claim (current terms UNVERIFIED) | Nofollow |
| 15 | Trustpilot | VERIFIED | Free plan | Nofollow |

---

## 1. Google Business Profile

- **(a) Submission URL:** https://business.google.com/create (302 to Google sign-in, expected; AU landing verified live at https://business.google.com/aunz/business-profile/)
- **(b) Category:** Primary: **Referral service**. Secondary: Business to business service. (Search the picker for "referral"; do not pick a trade category like Plumber.)
- **(c) NAP:** canonical block above. Description:
  > TradeRefer is an Australian trades directory and referral marketplace based in Geelong, Victoria. Compare ABN-checked trade profiles and reviews, request free quotes, and receive rewards for eligible referrals.
- **(d) Link:** Website links from Google listings carry no direct equity (treat as nofollow); the value is the entity/local trust signal.
- **(e) Cost:** Free.
- **Caveat (honest one):** Google's eligibility rules require in-person customer contact or a defined service area. A pure online marketplace is borderline. List as a service-area business (address hidden), and if Google rejects or suspends it, drop it rather than faking a storefront - a suspended GBP is worse than none during a de-index recovery.

## 2. Bing Places for Business

- **(a) Submission URL:** https://www.bingplaces.com/ (301 to https://www.bing.com/forbusiness/ - verified live)
- **(b) Category:** Nearest available under Business/Professional Services (picker is coarse; choose a directory/business-services category, not a trade). Tip: after GBP exists, use the "Import from Google Business Profile" option so the NAP is copied exactly.
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an online directory and referral marketplace for Australian trades, run from Geelong, Victoria. Find ABN-checked trade businesses, compare reviews, and request free quotes.
- **(d) Link:** Nofollow / citation value. Extra weight here: Bing is the one channel already working (1-2k impressions/day) - this listing supports it directly.
- **(e) Cost:** Free.

## 3. True Local (truelocal.com.au)

- **(a) Submission URL:** True Local's own add-business page no longer exists - verified this session: truelocal.com.au/add-business now lands on a generic search-results page. True Local is a Thryv Australia property; new listings are created through the shared Thryv signup: **https://my.yellow.com.au/online-signup/** (verified live, 200). One Thryv signup feeds the Yellow network; confirm during signup that the True Local listing is included, and if the flow does not offer it, treat True Local as covered by #4 rather than a separate citation.
- **(b) Category:** Search for "Referral Services"; if absent, "Internet Services" or "Business Services".
- **(c) NAP:** canonical block. Description:
  > TradeRefer helps Australians find and compare local trade businesses in one place. The platform lists ABN-checked trade profiles and rewards eligible customer referrals.
- **(d) Link:** Typically nofollow (Thryv properties wrap outbound links in tracking redirects).
- **(e) Cost:** Free.

## 4. Yellow (yellowpages.com.au)

- **(a) Submission URL:** https://my.yellow.com.au/online-signup/?referrer=yp_footer (verified live; this is the exact "Get a free listing" link in the yellowpages.com.au footer)
- **(b) Category:** Search for "Referral Service" / "Business Referral"; fallback "Internet Services". Do not pick a trade category.
- **(c) NAP:** canonical block. Description:
  > TradeRefer is a trades directory and referral marketplace covering trades across Australia. Browse ABN-checked business profiles, compare reviews, and request quotes for your job.
- **(d) Link:** Typically nofollow (tracked redirect links).
- **(e) Cost:** Free listing (paid ad products exist; ignore them).

## 5. White Pages (whitepages.com.au)

- **(a) Submission URL:** https://business.whitepages.com.au/products/listing/ (verified: whitepages.com.au homepage "List my business" resolves here via redirect)
- **(b) Category:** Same Thryv taxonomy as Yellow - "Referral Service" if available, else "Business Services".
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an Australian online directory for finding local trade businesses. It combines ABN-checked profiles with a referral program that rewards eligible word-of-mouth recommendations.
- **(d) Link:** Typically nofollow (tracked).
- **(e) Cost:** Basic listing free; the listing product page advertises paid tiers whose pricing was not verified this session - take the free tier only.

## 6. ProductReview.com.au

- **(a) Submission URL:** **No self-serve add-listing URL exists.** Verified this session: both legacy paths (productreview.com.au/add-listing and /listings/new) return 404. Entry points: create a free account at https://www.productreview.com.au/ then use the in-account "request a new listing" flow, and the business side at https://www.productreview.com.au/for-businesses (verified live). Business help centre: https://support.productreview.com.au/hc/en-us (bot-gated to WebFetch; open in a browser).
- **(b) Category:** Pick the services-marketplace category that hipages/Airtasker sit in (confirm the exact label during submission; ProductReview assigns/curates categories).
- **(c) NAP:** canonical block. Description:
  > TradeRefer is a Geelong-based online marketplace that connects Australians with local trade businesses. Users can compare ABN-checked profiles, request quotes, and refer tradies they trust.
- **(d) Link:** Nofollow. The real value (as LINK_PLAN.md says) is real reviews on a high-trust AU review domain, plus the brand entity.
- **(e) Cost:** Free listing; paid brand-management tools exist and are not needed.
- **Do not** seed or solicit incentivised reviews here - ProductReview polices this and a flagged profile on a review site is a trust hit the recovery cannot afford.

## 7. Localsearch (localsearch.com.au)

- **(a) Submission URL:** https://business.localsearch.com.au/free-listing (verified live: "Claim your free profile in 60 seconds, no card, no contract")
- **(b) Category:** Nearest business-services/online-directory category (their taxonomy is trade-heavy; do not pick a trade). If free-text is offered: "Trades Directory & Referral Service".
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an online trades directory and referral marketplace built in Geelong, Victoria. It lists ABN-checked trade businesses Australia-wide and rewards eligible customer referrals.
- **(d) Link:** Localsearch profile website links have often been dofollow historically - one of the few AU citations where that is true. Verify the live `rel` once published; if dofollow, this is the best pure-citation link in the pack.
- **(e) Cost:** Free (explicitly no card, verified).

## 8. Word of Mouth (womo.com.au / wordofmouth.com.au)

- **(a) Submission URL:** https://www.wordofmouth.com.au/users/new_with_business (verified: this is the live "Register business" nav link on wordofmouth.com.au; note WOMO rebranded to Word of Mouth, old womo.com.au naming in the plan refers to this same site)
- **(b) Category:** Nearest business-services category; it is a service-review platform so the listing doubles as a review surface.
- **(c) NAP:** canonical block. Description:
  > TradeRefer connects homeowners with local trade businesses through a national online directory. Profiles are ABN-checked, and the referral program rewards eligible recommendations.
- **(d) Link:** Typically nofollow.
- **(e) Cost:** Free.

## 9. Hotfrog Australia (hotfrog.com.au)

- **(a) Submission URL:** https://www.hotfrog.com.au/AddYourBusiness - page exists but sits behind an ALTCHA human-verification gate (both WebFetch and stealth fetch got the challenge page). **Complete this one manually in a normal browser.** Do not script it; the plan's rule against bot-detection games applies.
- **(b) Category:** Free-text tags; use "Trades Directory", "Referral Service", "Business Services".
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an Australian trades directory and referral marketplace. Find ABN-checked trade profiles near you, compare reviews, and request free quotes online.
- **(d) Link:** Historically dofollow - verify live.
- **(e) Cost:** Free.

## 10. Yelp Australia

- **(a) Submission URL:** https://biz.yelp.com/claim (verified: this is the "Verify my free listing" flow linked from https://business.yelp.com/, which is live; search for TradeRefer, then use "add your business" when it is not found)
- **(b) Category:** Yelp's picker has no marketplace category; choose the closest under Professional Services. Do not pick Home Services trade categories (that claims to BE a tradie).
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an online directory and referral marketplace for Australian trades, based in Geelong. Compare ABN-checked trade profiles, read reviews, and request quotes.
- **(d) Link:** Nofollow.
- **(e) Cost:** Free ("It's free to be on Yelp" verified on page).

## 11. StartLocal (startlocal.com.au) - SKIP

- **(a) Submission URL:** **None found - treat as a dead target.** Verified this session: the legacy add-listing paths (/add/, /addlisting/, /signup/, /add_your_business/) all soft-render the homepage, and the current homepage/footer contain no add-your-business link at all. The site still serves its directory but appears to have closed public submissions.
- **(b)-(e):** n/a. Do not burn a citation slot chasing it; the other 14 targets cover the plan's month-1 count (15-20 including GBP/Bing). If a replacement is wanted, source it from a fresh AU-citation-list crawl rather than guessing here.

## 12. Cylex Australia

- **(a) Submission URL:** https://www.cylex-australia.com/register-company (verified: linked from the live cylex-australia.com homepage). Account creation first at https://www.cylex-australia.com/signin?view=register. **Note:** the plan names cylex.com.au, but that hostname currently serves a TLS certificate for cylex-australia.com (cert mismatch, verified this session) - use cylex-australia.com.
- **(b) Category:** Business & Professional Services (their tree; nearest match to a directory/marketplace).
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an Australian online trades directory with a built-in referral marketplace. It offers ABN-checked business profiles, review comparison, and free quote requests.
- **(d) Link:** Mixed reports; not verified. Check the live `rel` after publishing.
- **(e) Cost:** Free basic entry; "Premium Entry" is paid and not needed.

## 13. Brownbook (brownbook.net)

- **(a) Submission URL:** https://www.brownbook.net/add-business (verified live: "Add a business (step 1 of 2)" form)
- **(b) Category:** Free-text; use "Trades Directory & Referral Marketplace".
- **(c) NAP:** canonical block. Description:
  > TradeRefer is a trades directory and referral marketplace serving all of Australia from Geelong, Victoria. Homeowners compare ABN-checked tradie profiles and receive rewards for eligible referrals.
- **(d) Link:** Historically dofollow - verify live. Brownbook is the lowest-authority target in this pack; it is fine as foundation filler, nothing more.
- **(e) Cost:** Free (site self-describes as "Free business listings", verified).

## 14. Foursquare - low priority, do last

- **(a) Submission URL:** https://business.foursquare.com/products/listings/ (verified live, 200). The venue claim flow redirects to https://app.foursquare.com/venue/claim (redirect verified; the flow behind it was not verified this session - **UNVERIFIED**).
- **(b) Category:** Business and Professional Services > Business Service.
- **(c) NAP:** canonical block. Description:
  > TradeRefer is an online Australian trades directory and referral marketplace based in Geelong. It lists ABN-checked trade businesses and helps users compare and request quotes.
- **(d) Link:** Nofollow.
- **(e) Cost:** Claiming has historically been free; Foursquare has been moving listing management toward paid products and current terms were not verified - **UNVERIFIED**.
- **Honest caveat:** Foursquare shut its consumer City Guide in late 2024; remaining value is presence in the Foursquare Places dataset that feeds other apps and AI systems. It is also place-centric (wants a physical venue), which an online-only business does not have. Only do this one if the address question from the NAP block is resolved; otherwise skip without guilt.

## 15. Trustpilot

- **(a) Submission URL:** https://business.trustpilot.com/signup (verified live: "Create Your Free Account", free to start)
- **(b) Category:** Assigned/edited after claiming the traderefer.au domain profile; set the nearest trades/home-services marketplace category in profile settings.
- **(c) NAP:** canonical block (Trustpilot keys off the domain, not an address). Description:
  > TradeRefer is an Australian trades directory and referral marketplace. We list ABN-checked trade businesses, help people compare quotes and reviews, and reward eligible referrals.
- **(d) Link:** Nofollow.
- **(e) Cost:** Free plan (verified); paid tiers not needed.
- Same rule as ProductReview: no incentivised review solicitation.

---

## Suggested execution order (month 1)

1. Fix the three NAP problems (phone number, footer placeholder address, entity name).
2. GBP + Bing Places (entity anchors; Bing especially - it is the working channel).
3. Localsearch, Hotfrog, Brownbook (the potential dofollow trio).
4. Yellow/Thryv signup (covers Yellow + True Local + White Pages family).
5. ProductReview, Word of Mouth, Trustpilot, Yelp (review/trust surfaces).
6. Cylex, then Foursquare only if the address question is settled. StartLocal: skip.
7. After each goes live: log the listing URL, check the actual `rel` attribute, push through `oi`.
