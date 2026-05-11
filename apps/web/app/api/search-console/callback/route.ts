import { google } from '@googleapis/searchconsole';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?error=missing_code`);
  }

  try {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/search-console/callback`
    );

    const { tokens } = await client.getToken(code);
    
    // Store tokens securely - in production, use database or encrypted storage
    // For now, we'll store in a cookie (not ideal for production)
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?search_console_connected=true`);
    
    response.cookies.set('search_console_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?error=auth_failed`);
  }
}
