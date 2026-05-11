import { google } from '@googleapis/searchconsole';
import { NextRequest, NextResponse } from 'next/server';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

// Helper function to get OAuth client
function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/search-console/callback`
  );
}

// Helper function to get date range for last N months
function getLastNMonths(n: number) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - n + 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get('siteUrl') || 'https://traderefer.au';
    const months = parseInt(searchParams.get('months') || '6');
    const dimension = searchParams.get('dimension') || 'month';
    
    // Get tokens from cookie
    const tokenCookie = request.cookies.get('search_console_tokens');
    if (!tokenCookie) {
      return Response.json({ error: 'Not authenticated with Search Console' }, { status: 401 });
    }

    const tokens = JSON.parse(tokenCookie.value);
    const auth = getOAuthClient();
    auth.setCredentials(tokens);

    // Check if token needs refresh
    if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
      if (tokens.refresh_token) {
        const { credentials } = await auth.refreshToken();
        // Update cookie with new tokens
        const response = NextResponse.json({ error: 'Token refreshed, please retry' }, { status: 401 });
        response.cookies.set('search_console_tokens', JSON.stringify(credentials), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        });
        return response;
      } else {
        return Response.json({ error: 'Token expired, please re-authenticate' }, { status: 401 });
      }
    }

    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const dateRange = getLastNMonths(months);
    
    // Get monthly analytics data
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dimensions: [dimension], // Group by month
        rowLimit: 12, // Max 12 months
        aggregationType: 'byPage'
      }
    });

    // Get top queries for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const topQueriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: currentMonth + '-01',
        endDate: currentMonth + '-31',
        dimensions: ['query'],
        rowLimit: 20,
        aggregationType: 'byPage'
      }
    });

    return Response.json({ 
      monthlyData: response.data,
      topQueries: topQueriesResponse.data,
      dateRange: dateRange
    });
  } catch (error) {
    console.error('Search Console API error:', error);
    return Response.json({ error: 'Failed to fetch Search Console data' }, { status: 500 });
  }
}
