import React, { useState, useEffect } from 'react';
import { WebsiteAuditReport } from '../types';
import { 
  TrendingUp, 
  Globe, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ExternalLink, 
  Activity, 
  Calendar, 
  MousePointer, 
  Eye, 
  Percent, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface GoogleSearchConsolePanelProps {
  report: WebsiteAuditReport;
}

interface GscDataPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export const GoogleSearchConsolePanel: React.FC<GoogleSearchConsolePanelProps> = ({ report }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('google_gsc_token'));
  const [sites, setSites] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<GscDataPoint[]>([]);
  const [queries, setQueries] = useState<GscQueryRow[]>([]);
  const [pages, setPages] = useState<GscPageRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(!localStorage.getItem('google_gsc_token'));

  // Extract a clean domain name for display and matching
  const cleanDomain = report.domain
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .split('/')[0]
    .split('?')[0];

  const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GSC_CLIENT_ID;
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("VITE_GSC_CLIENT_ID is required");
  }

  // Trigger Google OAuth 2.0 Implicit Flow popup
  const handleConnectGoogle = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "https://www.googleapis.com/auth/webmasters.readonly";
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&prompt=consent` +
      `&include_granted_scopes=true`;

    const width = 580;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      alert("Popup blocker detected! Please allow popups for this page to authenticate and link Google Search Console.");
    }
  };

  // Disconnect Google Account
  const handleDisconnect = () => {
    localStorage.removeItem('google_gsc_token');
    setToken(null);
    setSites([]);
    setSelectedSite(null);
    setDailyData([]);
    setQueries([]);
    setPages([]);
    setIsDemo(true);
    setError(null);
  };

  // Generate beautiful simulated demo data using domain hash characteristics
  const generateDemoData = () => {
    // Generate stable hash code based on original domain for reproducible demo statistics
    let hash = 0;
    for (let i = 0; i < cleanDomain.length; i++) {
      hash = cleanDomain.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const baseClicks = 40 + (hash % 120);
    const baseImpressions = 1200 + (hash % 4500);
    const avgPosition = (2.2 + (hash % 14) * 0.5).toFixed(1);

    // 1. Generate 30 days daily performance data
    const points: GscDataPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = d.toISOString().split('T')[0];
      
      // Add standard realistic fluctuations
      const noise = Math.sin(i * 0.6) * 15 + (i % 5) * 4;
      const clicks = Math.round(Math.max(5, baseClicks + noise + (hash % 10)));
      const impressions = Math.round(Math.max(100, baseImpressions + noise * 30 + (hash % 300)));
      const ctr = parseFloat(((clicks / impressions) * 100).toFixed(2));
      const pos = parseFloat((parseFloat(avgPosition) + Math.cos(i * 0.4) * 0.8).toFixed(1));

      points.push({
        date: dateString,
        clicks,
        impressions,
        ctr,
        position: pos
      });
    }
    setDailyData(points);

    // 2. Generate Search Queries
    const kwBase = cleanDomain.split('.')[0];
    const demoQueries: GscQueryRow[] = [
      { query: kwBase, clicks: Math.round(baseClicks * 0.45), impressions: Math.round(baseImpressions * 0.15), ctr: 0, position: 1.1 },
      { query: `${kwBase} review`, clicks: Math.round(baseClicks * 0.12), impressions: Math.round(baseImpressions * 0.08), ctr: 0, position: 2.3 },
      { query: `best local ${report.niche || 'service'} provider`, clicks: Math.round(baseClicks * 0.08), impressions: Math.round(baseImpressions * 0.05), ctr: 0, position: 5.7 },
      { query: `${kwBase} pricing`, clicks: Math.round(baseClicks * 0.05), impressions: Math.round(baseImpressions * 0.025), ctr: 0, position: 1.9 },
      { query: `certified ${report.niche || 'quality'} expert near me`, clicks: Math.round(baseClicks * 0.03), impressions: Math.round(baseImpressions * 0.12), ctr: 0, position: 8.4 },
      { query: `${kwBase} official website`, clicks: Math.round(baseClicks * 0.02), impressions: Math.round(baseImpressions * 0.015), ctr: 0, position: 1.0 },
      { query: `how to choose a ${report.niche || 'reliable'} business`, clicks: Math.round(baseClicks * 0.01), impressions: Math.round(baseImpressions * 0.07), ctr: 0, position: 12.2 }
    ];

    demoQueries.forEach(q => {
      q.ctr = parseFloat(((q.clicks / q.impressions) * 100).toFixed(2));
    });
    setQueries(demoQueries);

    // 3. Generate Landing Pages
    const demoPages: GscPageRow[] = [
      { page: `/`, clicks: Math.round(baseClicks * 0.65), impressions: Math.round(baseImpressions * 0.4), ctr: 0, position: 1.8 },
      { page: `/services`, clicks: Math.round(baseClicks * 0.18), impressions: Math.round(baseImpressions * 0.15), ctr: 0, position: 3.2 },
      { page: `/about`, clicks: Math.round(baseClicks * 0.08), impressions: Math.round(baseImpressions * 0.06), ctr: 0, position: 1.9 },
      { page: `/contact`, clicks: Math.round(baseClicks * 0.05), impressions: Math.round(baseImpressions * 0.04), ctr: 0, position: 2.1 },
      { page: `/blog/how-to-start`, clicks: Math.round(baseClicks * 0.04), impressions: Math.round(baseImpressions * 0.25), ctr: 0, position: 7.9 }
    ];

    demoPages.forEach(p => {
      p.ctr = parseFloat(((p.clicks / p.impressions) * 100).toFixed(2));
    });
    setPages(demoPages);
  };

  // Fetch verified GSC properties list
  const fetchGscProperties = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleDisconnect();
          throw new Error("Google login session expired. Please connect again.");
        }
        throw new Error(`GSC sites lookup failed (Response: ${res.status})`);
      }

      const data = await res.json();
      const siteList = data.siteEntry ? data.siteEntry.map((s: any) => s.siteUrl) : [];
      setSites(siteList);

      if (siteList.length > 0) {
        // Find best match: contains matching domain prefix or raw string
        const match = siteList.find((url: string) => {
          const lcase = url.toLowerCase();
          return lcase.includes(cleanDomain.toLowerCase()) || cleanDomain.toLowerCase().includes(lcase.replace(/^(sc-domain:)|https?:\/\//, ''));
        });

        const targetSite = match || siteList[0];
        setSelectedSite(targetSite);
        fetchReportData(authToken, targetSite);
      } else {
        setSelectedSite(null);
        setLoading(false);
        setError("Your authenticated Google account does not contain any verified Search Console properties.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load Google Search Console properties list.");
      setLoading(false);
    }
  };

  // Fetch report metrics for specific property siteUrl
  const fetchReportData = async (authToken: string, siteUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      // Calculate start & end date (30-day window ending 2 days ago)
      const now = new Date();
      const endDateVal = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago because GSC dates lag
      const startDateVal = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000); // 32 days ago
      const startDateStr = startDateVal.toISOString().split('T')[0];
      const endDateStr = endDateVal.toISOString().split('T')[0];

      // 1. Fetch Daily Analytics (clicks, impressions, position by date)
      const dailyUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      const dailyRes = await fetch(dailyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ["date"],
          rowLimit: 100
        })
      });

      let dailyPoints: GscDataPoint[] = [];
      if (dailyRes.ok) {
        const dData = await dailyRes.json();
        if (dData.rows && dData.rows.length > 0) {
          // Map to points
          dailyPoints = dData.rows.map((row: any) => ({
            date: row.keys[0],
            clicks: Math.round(row.clicks),
            impressions: Math.round(row.impressions),
            ctr: parseFloat((row.ctr * 100).toFixed(2)),
            position: parseFloat(row.position.toFixed(1))
          })).sort((a: any, b: any) => a.date.localeCompare(b.date));
          setDailyData(dailyPoints);
        }
      }

      // 2. Fetch Top Queries
      const queryRes = await fetch(dailyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ["query"],
          rowLimit: 15
        })
      });

      if (queryRes.ok) {
        const qData = await queryRes.json();
        if (qData.rows) {
          const mappedQueries = qData.rows.map((row: any) => ({
            query: row.keys[0],
            clicks: Math.round(row.clicks),
            impressions: Math.round(row.impressions),
            ctr: parseFloat((row.ctr * 100).toFixed(2)),
            position: parseFloat(row.position.toFixed(1))
          }));
          setQueries(mappedQueries);
        }
      }

      // 3. Fetch Top Landing Pages
      const pageRes = await fetch(dailyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDateStr,
          endDate: endDateStr,
          dimensions: ["page"],
          rowLimit: 15
        })
      });

      if (pageRes.ok) {
        const pData = await pageRes.json();
        if (pData.rows) {
          const mappedPages = pData.rows.map((row: any) => {
            // Shorten URL prefix for easier viewing
            const relativePage = row.keys[0].replace(/^(https?:\/\/)?(www\.)?[^\/]+/, '') || '/';
            return {
              page: relativePage,
              clicks: Math.round(row.clicks),
              impressions: Math.round(row.impressions),
              ctr: parseFloat((row.ctr * 100).toFixed(2)),
              position: parseFloat(row.position.toFixed(1))
            };
          });
          setPages(mappedPages);
        }
      }

      // If we got no daily points, check if properties list returned nothing
      if (dailyPoints.length === 0) {
        setError(`We found the site property "${siteUrl}", but it does not have any active search data captured for the selected time index. GSC takes 2-3 days to begin showing data.`);
      }

      setIsDemo(false);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred trying to query Google Search Console API. Check network connections.");
    } finally {
      setLoading(false);
    }
  };

  // On mount or message login success
  useEffect(() => {
    if (token) {
      fetchGscProperties(token);
    } else {
      generateDemoData();
    }

    const handleOAuthUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newToken = customEvent.detail;
      setToken(newToken);
      fetchGscProperties(newToken);
    };

    window.addEventListener('gsc_token_updated', handleOAuthUpdate);
    return () => {
      window.removeEventListener('gsc_token_updated', handleOAuthUpdate);
    };
  }, [token, cleanDomain]);

  // Aggregate totals
  const totalClicks = dailyData.reduce((acc, point) => acc + point.clicks, 0);
  const totalImpressions = dailyData.reduce((acc, point) => acc + point.impressions, 0);
  const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const avgPositionValue = dailyData.length > 0 
    ? (dailyData.reduce((acc, p) => acc + p.position, 0) / dailyData.length).toFixed(1) 
    : '0';

  return (
    <div id="google-search-console-panel" className="space-y-8 animate-fade-in">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/10 border border-blue-100/30 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
              Google Search Console Integration
            </h3>
            {isDemo ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">
                Simulated Preview
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Acquire actual metrics directly from Google's analytics index. Audit search queries, crawl impressions, live CTR percentages, and true average position alignments.
          </p>
        </div>

        <div className="flex-shrink-0">
          {token ? (
            <button
              onClick={handleDisconnect}
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs px-4 py-2 rounded-xl transition font-semibold cursor-pointer"
            >
              Disconnect Google Account
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 1.485 15.34 0 12.24 0 5.58 0 0 5.42 0 12s5.58 12 12.24 12c6.96 0 11.57-4.832 11.57-11.62c0-.785-.083-1.39-.184-2.095H12.24Z"/>
              </svg>
              Connect Search Console API
            </button>
          )}
        </div>
      </div>

      {/* Info Notice when in Simulated mode */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Currently showing dynamic simulation data based on: {cleanDomain}</span>
          </div>
          <p className="text-slate-600">
            Because search data requires proper Google account authorization to protect user privacy, we generated deep-level SEO models tailored strictly to {cleanDomain}. For real verified data, click the Google button above as instructed!
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex gap-2 items-start">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Search Console API Notice</p>
            <p>{error}</p>
            {sites.length > 0 && (
              <div className="pt-2">
                <p className="font-semibold text-rose-900">Your verified Search Console sites:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                  {sites.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSite(s);
                        fetchReportData(token!, s);
                      }}
                      className="text-left bg-white/70 hover:bg-white border border-rose-100 text-[11px] p-1.5 rounded text-rose-800 truncate"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selector of site if connected with Google */}
      {token && sites.length > 0 && selectedSite && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Verified Site:</span>
            <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
              {selectedSite}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Switch Properties:</span>
            <select
              value={selectedSite}
              onChange={(e) => {
                setSelectedSite(e.target.value);
                fetchReportData(token, e.target.value);
              }}
              className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {sites.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => fetchReportData(token, selectedSite)}
              className="p-1 px-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded"
              title="Refresh parameters"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Main KPI counters row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Clicks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Clicks</span>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950">{totalClicks.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-slate-400">Total organic search sessions inside 30-day index</p>
        </div>

        {/* KPI: Impressions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Impressions</span>
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950">{totalImpressions.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-slate-400">Number of times any page appeared in organic SERPs</p>
        </div>

        {/* KPI: CTR */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Average CTR</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950">{avgCtr}%</span>
          </div>
          <p className="text-[10px] text-slate-400">Ratio of clicks relative to search impressions</p>
        </div>

        {/* KPI: Avg Position */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Average Position</span>
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950">{avgPositionValue}</span>
          </div>
          <p className="text-[10px] text-slate-400">The average ranking placement globally on google results</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Fetching live verified Search Console index from Google...</p>
          <p className="text-xs text-slate-400">This connects directly via the Google API endpoints.</p>
        </div>
      ) : (
        <>
          {/* Chart area: Search traffic trend */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-3xs">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Organic Search Traffic Volume & Interaction Traces
              </h4>
              <p className="text-xs text-slate-500">Visualization of organic clicks (blue area) and impressions (indigo line) compiled across the last 30 active days</p>
            </div>

            {dailyData.length > 0 ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gscClicksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(d) => {
                        try {
                          const dateObj = new Date(d);
                          return dateObj.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                        } catch { return d; }
                      }}
                      stroke="#94a3b8" 
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '10px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6366f1" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      labelFormatter={(d) => d}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="clicks" 
                      name="Clicks" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#gscClicksGrad)" 
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="impressions"
                      name="Impressions"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400">
                No performance datapoints mapped
              </div>
            )}
          </div>

          {/* Bottom data side-by-side matrices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table: Search keywords Queries */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-500" />
                    Top Queries (Keywords) in SERP Pack
                  </span>
                  <span className="text-[10px] text-slate-400">Last 30 Days</span>
                </h4>
                <p className="text-xs text-slate-500">Real organic keywords driving users to discover your site</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="py-2.5 pb-2 font-semibold">Search Phrase</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Clicks</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Impressions</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">CTR</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {queries.map((q, idx) => (
                      <tr key={q.query + idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-slate-800 font-bold truncate max-w-[140px]" title={q.query}>
                          {q.query}
                        </td>
                        <td className="py-2.5 text-right text-slate-900 font-semibold">{q.clicks.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-slate-400 font-normal">{q.impressions.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-emerald-700 font-bold">{q.ctr}%</td>
                        <td className="py-2.5 text-right text-amber-600 bg-amber-50/20 px-1 rounded-md">{q.position}</td>
                      </tr>
                    ))}
                    {queries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No query details discovered</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table: Landing pages url path listings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-3xs">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Top Active Organic Landing Pages
                  </span>
                  <span className="text-[10px] text-slate-400">Last 30 Days</span>
                </h4>
                <p className="text-xs text-slate-500">Destination page routes that acquired the highest organic engagement</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="py-2.5 pb-2 font-semibold">URL Route</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Clicks</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Impressions</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">CTR</th>
                      <th className="py-2.5 pb-2 font-semibold text-right">Avg Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pages.map((p, idx) => (
                      <tr key={p.page + idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-slate-800 font-semibold truncate max-w-[140px] font-mono" title={p.page}>
                          {p.page}
                        </td>
                        <td className="py-2.5 text-right text-slate-900 font-bold">{p.clicks.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-slate-400 font-normal">{p.impressions.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-emerald-700 font-semibold">{p.ctr}%</td>
                        <td className="py-2.5 text-right text-slate-500">{p.position}</td>
                      </tr>
                    ))}
                    {pages.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No active dynamic page details gathered</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Guide section for using GSC in the application */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1 md:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Console Setup</h4>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">How to authorize your sites:</h3>
          <p className="text-xs text-slate-500 max-w-sm pt-2">
            Google restricts Webmaster tools explicitly to verified property owners. Grant read access to compile metrics, charts, and queries safely here.
          </p>
        </div>

        <div className="space-y-3 md:col-span-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-blue-150 text-blue-800 font-bold rounded-full">1</span>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Set Up callback redirects in GSC Developers Console</p>
              <p className="pt-0.5 text-slate-500">Your Google Webmaster developer credentials should specify these URIs:</p>
              <div className="font-mono bg-white dark:bg-slate-950 p-2 border border-slate-200 rounded mt-1 overflow-x-auto text-[10px]">
                {window.location.origin}/auth/callback
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-blue-150 text-blue-800 font-bold rounded-full">2</span>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Authenticate popups directly</p>
              <p className="pt-0.5 text-slate-500">
                Clicking the Google Connect triggers an authorization popup where you pick your Google account and grant GSC webmasters permissions.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-blue-150 text-blue-800 font-bold rounded-full">3</span>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Select property and review live graphs</p>
              <p className="pt-0.5 text-slate-500">
                Instantly map keywords, monitor clicks from different geographical areas, and cross-reference crawl indexing rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
