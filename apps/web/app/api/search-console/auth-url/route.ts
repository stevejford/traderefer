import { google } from '@googleapis/searchconsole';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/search-console/callback`
  );

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    prompt: 'consent'
  });

  return NextResponse.json({ authUrl });
}
