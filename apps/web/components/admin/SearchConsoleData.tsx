'use client';

import { useState, useEffect } from 'react';

interface SearchAnalyticsData {
  rows: Array<{
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export function SearchConsoleData({ siteUrl }: { siteUrl: string }) {
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/search-console/check-auth');
      const result = await response.json();
      setIsAuthorized(result.authorized);
    } catch (err) {
      setIsAuthorized(false);
    }
  };

  const initiateAuth = async () => {
    try {
      const response = await fetch('/api/search-console/auth-url');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate authorization');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search-console?siteUrl=${encodeURIComponent(siteUrl)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Google Search Console</h3>
        <p className="text-gray-600 mb-4">Connect to Search Console to view analytics data</p>
        <button
          onClick={initiateAuth}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Connect Search Console
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Search Console Analytics</h3>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {data.rows.reduce((sum, row) => sum + row.clicks, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">
                {data.rows.reduce((sum, row) => sum + row.impressions, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Impressions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {(data.rows.reduce((sum, row) => sum + row.ctr, 0) / data.rows.length * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg CTR</div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {(data.rows.reduce((sum, row) => sum + row.position, 0) / data.rows.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Position</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Top Queries</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.rows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.keys[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.clicks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.impressions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(row.ctr * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
