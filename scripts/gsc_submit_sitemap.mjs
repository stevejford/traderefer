#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import open from "open";
import { google } from "googleapis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:traderefer.au";
const SITEMAP_URL = process.env.SITEMAP_URL || "https://traderefer.au/sitemap.xml";
const CREDENTIALS_PATH = process.env.GOOGLE_CLIENT_SECRET_PATH
  || path.join(rootDir, "client_secret_643902729199-qn7nntblms4brtb7ddtji1jfpuri1pgh.apps.googleusercontent.com.json");
const WRITE_TOKEN_PATH = process.env.GSC_WRITE_TOKEN_PATH || path.join(rootDir, "gsc_token_webmasters.json");
const READONLY_TOKEN_PATH = process.env.GSC_TOKEN_PATH || path.join(rootDir, "gsc_token.json");
const OAUTH_PORT = Number(process.env.GSC_OAUTH_PORT || 3000);
const WRITE_SCOPE = "https://www.googleapis.com/auth/webmasters";

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function loadClientInfo() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const clientInfo = credentials.web || credentials.installed || {};
  if (!clientInfo.client_id || !clientInfo.client_secret) {
    throw new Error(`Missing client_id/client_secret in ${CREDENTIALS_PATH}`);
  }
  return clientInfo;
}

function tokenPath() {
  if (hasFlag("--reauth")) return WRITE_TOKEN_PATH;
  if (fs.existsSync(WRITE_TOKEN_PATH)) return WRITE_TOKEN_PATH;
  return READONLY_TOKEN_PATH;
}

async function waitForOauthCode(authUrl) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url || "/", `http://localhost:${OAUTH_PORT}`);
      const code = requestUrl.searchParams.get("code");
      const error = requestUrl.searchParams.get("error");
      if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Google OAuth failed</h1><p>${error}</p>`);
        server.close();
        reject(new Error(error));
        return;
      }
      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>No OAuth code received</h1>");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>TradeRefer GSC authorization complete</h1><p>You can close this tab.</p>");
      server.close();
      resolve(code);
    });

    server.listen(OAUTH_PORT, async () => {
      console.log(`Waiting for Google OAuth callback on http://localhost:${OAUTH_PORT}/oauth2callback`);
      console.log(`Open this URL if the browser does not open automatically:\n${authUrl}\n`);
      try {
        await open(authUrl);
      } catch {
        // URL is already printed for manual opening.
      }
    });

    setTimeout(() => {
      server.close();
      reject(new Error("OAuth timeout after 120 seconds"));
    }, 120000);
  });
}

async function authorize() {
  const clientInfo = loadClientInfo();
  const redirectUri = `http://localhost:${OAUTH_PORT}/oauth2callback`;
  const oauth2Client = new google.auth.OAuth2(
    clientInfo.client_id,
    clientInfo.client_secret,
    redirectUri
  );

  const selectedTokenPath = tokenPath();
  if (!hasFlag("--reauth") && fs.existsSync(selectedTokenPath)) {
    const token = JSON.parse(fs.readFileSync(selectedTokenPath, "utf8"));
    oauth2Client.setCredentials(token);
    if (token.expiry_date && token.expiry_date < Date.now()) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      fs.writeFileSync(selectedTokenPath, JSON.stringify(credentials, null, 2));
    }
    return { oauth2Client, selectedTokenPath };
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [WRITE_SCOPE],
    prompt: "consent",
  });
  const code = await waitForOauthCode(authUrl);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  fs.writeFileSync(WRITE_TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return { oauth2Client, selectedTokenPath: WRITE_TOKEN_PATH };
}

async function main() {
  const { oauth2Client, selectedTokenPath } = await authorize();
  const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

  const before = await searchconsole.sitemaps.list({ siteUrl: SITE_URL });
  const existing = (before.data.sitemap || []).find((item) => item.path === SITEMAP_URL);

  try {
    await searchconsole.sitemaps.submit({ siteUrl: SITE_URL, feedpath: SITEMAP_URL });
    console.log(JSON.stringify({
      ok: true,
      siteUrl: SITE_URL,
      sitemapUrl: SITEMAP_URL,
      tokenPath: selectedTokenPath,
      previous: existing ? {
        lastSubmitted: existing.lastSubmitted,
        lastDownloaded: existing.lastDownloaded,
        warnings: existing.warnings,
        errors: existing.errors,
        isPending: existing.isPending,
      } : null,
    }, null, 2));
  } catch (error) {
    const insufficientScope = Number(error.code) === 403 && /insufficient authentication scopes/i.test(error.message || "");
    console.log(JSON.stringify({
      ok: false,
      siteUrl: SITE_URL,
      sitemapUrl: SITEMAP_URL,
      tokenPath: selectedTokenPath,
      code: error.code,
      error: error.message,
      nextStep: insufficientScope
        ? "Run: node scripts/gsc_submit_sitemap.mjs --reauth"
        : "Check GSC property access and sitemap URL.",
    }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
