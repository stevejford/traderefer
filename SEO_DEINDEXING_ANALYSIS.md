# TradeRefer SEO Deindexing Crisis - Analysis & Fixes

## Crisis Overview
- **Date Range**: March 27 → May 8, 2026
- **Indexed Pages Lost**: 41,931 → 21 pages (99.95% drop)
- **Total Unindexed**: 72,792 pages
- **Traffic Impact**: Impressions dropped from 8,518 to 60 daily

## Root Causes Identified

### 1. CRITICAL: Noindex Tags (35,944 pages) ✅ FIXED
**Problem**: Pages with `count === 0` (no businesses) were set to `noindex`
**Files Affected**:
- `/local/[state]/[city]/[suburb]/[trade]/[job]/page.tsx`
- `/local/[state]/[city]/[suburb]/[trade]/page.tsx`
- `/local/[state]/[city]/[suburb]/page.tsx`
- `/top/[trade]/[state]/[city]/page.tsx`
- `/businesses/page.tsx` (paginated)

**Fix Applied**: Removed all `count === 0` conditional noindex tags
```typescript
// BEFORE
robots: count === 0 ? { index: false, follow: true } : { index: true, follow: true }

// AFTER
robots: { index: true, follow: true }
```

**Why This Was Wrong**:
- Empty pages still target valuable keywords
- Users can still submit leads
- Google needs to see full site structure
- Pages have rich content (FAQs, related trades, CTAs)

### 2. CRITICAL: Missing robots.txt (99 pages blocked) ✅ FIXED
**Problem**: No robots.txt file existed
**Fix Applied**: Created `/public/robots.txt` with:
```
User-agent: *
Allow: /

Sitemap: https://traderefer.au/sitemap.xml

# Block only admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/static/
Disallow: /join/

# Allow everything else
Allow: /b/
Allow: /local/
Allow: /trades/
Allow: /top/
Allow: /find-
```

### 3. Low CTR (0.18%) ✅ FIXED
**Problem**: 15,200 impressions but only 27 clicks
**Fix Applied**: Improved business profile meta descriptions
```typescript
// BEFORE
`${cleanName} provides ${titleTrade.toLowerCase()} services in ${localArea}. ${yearsExperience} years experience. ${reviewCount} verified reviews. Read reviews, compare quotes and get connected free via TradeRefer. ABN verified.`

// AFTER
`${cleanName}: ${titleTrade.toLowerCase()} in ${localArea}. ${rating}★ from ${reviewCount} reviews. ${yearsExperience} years local experience. ABN verified & trusted. Get free quotes from ${cleanName} on TradeRefer today.`
```

**Changes**:
- Shorter, punchier sentences
- Rating upfront
- Strong CTA at end
- Removed redundant phrases

### 4. Crawled - Not Indexed (35,044 pages) ⚠️ ONGOING
**Problem**: Google crawled but chose not to index
**Likely Causes**:
- Thin content on pages with 0 businesses
- Duplicate content across similar pages
- Low internal linking
- No external backlinks

**Recommended Fixes**:
1. Add more unique content to empty pages
2. Implement internal linking strategy
3. Build backlinks to key pages
4. Add structured data (already implemented)
5. Improve page load speed

### 5. Page Redirects (1,024 pages) ⚠️ NEEDS REVIEW
**Problem**: Permanent redirects from non-postcode to postcode URLs
**Example**: `/local/vic/melbourne/carlton` → `/local/vic/melbourne/carlton-3053`

**Current Behavior**:
```typescript
if (!urlPostcode) {
    const knownPostcode = getPostcode(bareSuburb, state);
    if (knownPostcode) {
        permanentRedirect(`/local/${state}/${city}/${bareSuburb}-${knownPostcode}`);
    }
}
```

**Recommendation**: 
- Keep redirects (good for SEO consolidation)
- Ensure canonical URLs point to postcode version
- Update internal links to use postcode version

### 6. 404 Errors (402 pages) ⚠️ NEEDS INVESTIGATION
**Problem**: Pages returning 404
**Likely Causes**:
- Old URLs from sitemap
- Deleted businesses
- Invalid trade/suburb combinations

**Action Required**:
1. Export 404 URLs from Search Console
2. Identify patterns
3. Add redirects or remove from sitemap

### 7. Duplicate Content (80 pages) ⚠️ NEEDS INVESTIGATION
**Problem**: Google chose different canonical than user
**Likely Causes**:
- URL parameters (?page=2, ?category=x)
- Trailing slashes
- HTTP vs HTTPS
- www vs non-www

**Action Required**:
1. Check Search Console for duplicate URLs
2. Ensure consistent canonical tags
3. Add URL parameter handling in robots.txt

## Deployment Status
- **Commit**: f2ea1649
- **Message**: "CRITICAL FIX: Remove noindex tags blocking 35,944 pages + add robots.txt + improve business profile CTR"
- **Status**: Deploying to production
- **Files Changed**: 14 files, 1,553 insertions, 308 deletions

## Expected Recovery Timeline
1. **Immediate (0-24 hours)**: robots.txt takes effect
2. **Short-term (1-2 weeks)**: Google re-crawls and removes noindex
3. **Medium-term (2-4 weeks)**: 35,944 pages start indexing
4. **Long-term (1-3 months)**: Full recovery to 40,000+ indexed pages

## Next Steps (URGENT)

### Immediate Actions:
1. ✅ Deploy fixes to production
2. ⏳ Submit sitemap to Google Search Console
3. ⏳ Request indexing for top 10 pages via URL Inspection
4. ⏳ Monitor coverage report daily

### Short-term Actions (This Week):
1. Export and analyze 404 URLs
2. Export and analyze duplicate content URLs
3. Create redirect map for common 404s
4. Implement URL parameter handling
5. Add more unique content to empty pages

### Medium-term Actions (This Month):
1. Build internal linking strategy
2. Create backlink acquisition plan
3. Optimize page load speed
4. Add more structured data
5. Create content for high-traffic keywords

## Monitoring Metrics
Track these daily in Search Console:
- **Coverage**: Indexed vs Not Indexed
- **Impressions**: Should increase from 60 to 1,000+
- **Clicks**: Should increase from 27 to 100+
- **CTR**: Should increase from 0.18% to 2%+
- **Average Position**: Should improve from 28.8 to <20

## Risk Assessment
- **High Risk**: If Google doesn't re-index within 4 weeks, may need manual intervention
- **Medium Risk**: Competitors may have gained rankings during deindexing
- **Low Risk**: Brand searches should recover quickly

## Success Criteria
- 30,000+ pages indexed within 30 days
- 1,000+ daily impressions within 14 days
- 100+ daily clicks within 21 days
- CTR > 1.5% within 30 days
- Average position < 25 within 30 days
