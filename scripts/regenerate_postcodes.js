/**
 * Regenerate apps/web/lib/postcodes.ts from DB data.
 * 
 * Sources (in priority order):
 * 1. locations_reference table
 * 2. Valid postcode extracted from businesses.address field
 * 
 * Usage: node scripts/regenerate_postcodes.js
 */

const pg = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'web', '.env.local') });

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to database.');

  // Get all active suburb/state combos with addresses
  const businesses = await client.query(`
    SELECT DISTINCT ON (LOWER(REPLACE(suburb, ' ', '-')), state)
      LOWER(REPLACE(suburb, ' ', '-')) as suburb_slug,
      UPPER(state) as state,
      address
    FROM businesses
    WHERE status = 'active' AND suburb IS NOT NULL
    ORDER BY LOWER(REPLACE(suburb, ' ', '-')), state, address DESC NULLS LAST
  `);

  // Get all postcodes from locations_reference as fallback
  const refRows = await client.query(`
    SELECT LOWER(slug) as slug, UPPER(state_code) as state_code, postcode
    FROM locations_reference
    WHERE postcode IS NOT NULL AND postcode != ''
  `);
  const refLookup = {};
  for (const r of refRows.rows) {
    if (isPostcodeValidForState(r.postcode, r.state_code)) {
      refLookup[`${r.slug}|${r.state_code}`] = r.postcode;
    }
  }

  // Also query ALL businesses (not just distinct) for address postcodes 
  const allAddresses = await client.query(`
    SELECT LOWER(REPLACE(suburb, ' ', '-')) as suburb_slug, UPPER(state) as state, address
    FROM businesses
    WHERE status = 'active' AND suburb IS NOT NULL AND address IS NOT NULL
  `);

  // Build address postcode lookup from all businesses
  const addressPostcodes = {};
  for (const row of allAddresses.rows) {
    const key = `${row.suburb_slug}|${row.state}`;
    if (addressPostcodes[key]) continue;
    const pc = extractPostcode(row.address, row.state);
    if (pc) addressPostcodes[key] = pc;
  }

  // Build the postcode map
  const postcodeMap = {}; // state -> { slug -> postcode }
  let total = 0;
  let fromAddress = 0;
  let fromRef = 0;
  let missing = 0;

  for (const row of businesses.rows) {
    const { suburb_slug, state } = row;
    if (!postcodeMap[state]) postcodeMap[state] = {};

    const addrKey = `${suburb_slug}|${state}`;
    let pc = refLookup[`${suburb_slug}|${state}`];
    if (pc) {
      postcodeMap[state][suburb_slug] = pc;
      fromRef++;
      total++;
      continue;
    }

    pc = addressPostcodes[addrKey];
    if (pc) {
      postcodeMap[state][suburb_slug] = pc;
      fromAddress++;
      total++;
      continue;
    }

    // Still missing
    console.log(`  MISSING postcode: ${suburb_slug} (${state})`);
    missing++;
  }

  console.log(`\nResults: ${total} postcodes found, ${missing} missing`);
  console.log(`  From address: ${fromAddress}`);
  console.log(`  From reference: ${fromRef}`);

  // Sort states and suburbs
  const states = Object.keys(postcodeMap).sort();
  const lines = [];
  for (const state of states) {
    lines.push(`    "${state}": {`);
    const slugs = Object.keys(postcodeMap[state]).sort();
    for (const slug of slugs) {
      lines.push(`        "${slug}": "${postcodeMap[state][slug]}",`);
    }
    lines.push(`    },`);
  }

  const totalSuburbs = Object.values(postcodeMap).reduce((acc, m) => acc + Object.keys(m).length, 0);

  // Write the TS file, preserving the STATE_SLUG_TO_CODE and functions at the bottom
  const ts = `// Auto-generated suburb → postcode lookup
// Generated from locations_reference + validated businesses.address fallback
// ${totalSuburbs} suburbs across ${states.length} states
// Last updated: ${new Date().toISOString().split('T')[0]}
// Regenerate: node scripts/regenerate_postcodes.js

export const SUBURB_POSTCODES: Record<string, Record<string, string>> = {
${lines.join('\n')}
};

const STATE_SLUG_TO_CODE: Record<string, string> = {
    "new-south-wales": "NSW",
    "victoria": "VIC",
    "queensland": "QLD",
    "western-australia": "WA",
    "south-australia": "SA",
    "tasmania": "TAS",
    "australian-capital-territory": "ACT",
    "northern-territory": "NT",
};

const STATE_POSTCODE_RANGES: Record<string, Array<[number, number]>> = {
    ACT: [[2600, 2618], [2900, 2920]],
    NSW: [[2000, 2599], [2619, 2899], [2921, 2999]],
    NT: [[800, 899]],
    QLD: [[4000, 4999]],
    SA: [[5000, 5999]],
    TAS: [[7000, 7999]],
    VIC: [[3000, 3999]],
    WA: [[6000, 6799]],
};

export function normalizeStateCode(stateCodeOrSlug: string): string {
    const normalized = String(stateCodeOrSlug || "").trim().toLowerCase();
    return STATE_SLUG_TO_CODE[normalized] || normalized.toUpperCase();
}

function normalizeSuburbSlug(suburbSlug: string): string {
    let decoded = String(suburbSlug || "").trim();
    try { decoded = decodeURIComponent(decoded); } catch { /* keep raw */ }
    return decoded
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function isPostcodeValidForState(postcode: string | null | undefined, stateCodeOrSlug: string): boolean {
    if (!postcode || !/^\\d{4}$/.test(postcode)) return false;
    const state = normalizeStateCode(stateCodeOrSlug);
    const ranges = STATE_POSTCODE_RANGES[state];
    if (!ranges) return false;
    const numericPostcode = Number(postcode);
    return ranges.some(([min, max]) => numericPostcode >= min && numericPostcode <= max);
}

/**
 * Look up postcode for a suburb slug + state (code or slug).
 * Accepts both "NSW" and "new-south-wales" formats.
 * Returns the postcode string or null if not found.
 */
export function getPostcode(suburbSlug: string, stateCodeOrSlug: string): string | null {
    const slug = normalizeSuburbSlug(suburbSlug);
    const state = normalizeStateCode(stateCodeOrSlug);
    const postcode = SUBURB_POSTCODES[state]?.[slug] ?? null;
    return isPostcodeValidForState(postcode, state) ? postcode : null;
}

/**
 * Parse a suburb slug that may contain a postcode suffix.
 * e.g. "parramatta-2150" → { suburb: "parramatta", postcode: "2150" }
 * e.g. "armstrong-creek-3217" → { suburb: "armstrong-creek", postcode: "3217" }
 * e.g. "parramatta" → { suburb: "parramatta", postcode: null }
 */
export function parseSuburbSlug(slug: string): { suburb: string; postcode: string | null } {
    const normalized = normalizeSuburbSlug(slug);
    const match = normalized.match(/^(.+)-(\\d{4})$/);
    if (match) {
        return { suburb: match[1], postcode: match[2] };
    }
    return { suburb: normalized, postcode: null };
}

export function getCanonicalSuburbSlug(suburbSlug: string, stateCodeOrSlug: string): string {
    const { suburb, postcode } = parseSuburbSlug(suburbSlug);
    const knownPostcode = getPostcode(suburb, stateCodeOrSlug);

    if (knownPostcode) return \`\${suburb}-\${knownPostcode}\`;
    if (postcode && isPostcodeValidForState(postcode, stateCodeOrSlug)) return \`\${suburb}-\${postcode}\`;
    return suburb;
}

export function getDisplayPostcode(suburbSlug: string, stateCodeOrSlug: string): string | null {
    const { suburb, postcode } = parseSuburbSlug(suburbSlug);
    if (postcode && isPostcodeValidForState(postcode, stateCodeOrSlug)) return postcode;
    return getPostcode(suburb, stateCodeOrSlug);
}
`;

  const outPath = path.join(__dirname, '..', 'apps', 'web', 'lib', 'postcodes.ts');
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log(`\nWritten ${totalSuburbs} suburbs to ${outPath}`);

  await client.end();
}

function extractPostcode(address, stateCode) {
  if (!address) return null;
  // Match Australian postcodes (4 digits, typically at end or before "Australia")
  const matches = address.match(/\b\d{4}\b/g) || [];
  return matches.find((pc) => isPostcodeValidForState(pc, stateCode)) || null;
}

function isPostcodeValidForState(postcode, stateCode) {
  if (!postcode || !/^\d{4}$/.test(String(postcode))) return false;
  const n = parseInt(postcode, 10);
  const ranges = {
    ACT: [[2600, 2618], [2900, 2920]],
    NSW: [[2000, 2599], [2619, 2899], [2921, 2999]],
    NT: [[800, 899]],
    QLD: [[4000, 4999]],
    SA: [[5000, 5999]],
    TAS: [[7000, 7999]],
    VIC: [[3000, 3999]],
    WA: [[6000, 6799]],
  }[String(stateCode || '').toUpperCase()];
  return !!ranges && ranges.some(([min, max]) => n >= min && n <= max);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
