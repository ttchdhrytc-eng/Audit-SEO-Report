import React, { useEffect, useState } from 'react';
import { ArrowLeft, Activity, ShieldAlert, CheckCircle2, Server, Database, Key, HelpCircle } from 'lucide-react';

interface ApiStatus {
  configured: boolean;
  status: 'healthy' | 'offline';
  endpoint: string;
  name: string;
}

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  apis: {
    googlePageSpeed: ApiStatus;
    googlePlaces: ApiStatus;
    dataForSeo: ApiStatus;
    geminiAi: ApiStatus;
  };
  system: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
  };
}

export const AdminSystemHealth: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = () => {
    setLoading(true);
    fetch('/api/admin/system-health')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to query system observability health metrics');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const formatMB = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400 animate-pulse">Syncing Observability Telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-150 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
        <h3 className="text-lg font-bold font-display text-white">Observability Sync Failed</h3>
        <p className="text-xs text-slate-400 max-w-sm font-mono leading-relaxed">{error || "No response received from system telemetry server"}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Return Home
          </button>
          <button
            onClick={fetchHealth}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      
      {/* Sticky floating control bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-6 md:px-12">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700/60 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          HQ Dashboard
        </button>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-extrabold uppercase py-1 px-3 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            System Live
          </span>
          <button
            onClick={fetchHealth}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer active:scale-95"
          >
            Refresh Status
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-8 space-y-8">
        
        {/* Intro Hero Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-extrabold">Suite Diagnostics Core</span>
            </div>
            <h2 className="text-3xl font-bold font-display text-white tracking-tight">System Health & API Observability</h2>
            <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
              Real-time white-label diagnostic board measuring core microservices credentials status, API connection loops, memory budgets, and cluster runtime activity.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl min-w-[200px] text-left shrink-0">
            <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">Node runtime uptime</span>
            <span className="text-xl font-mono font-extrabold text-slate-200 mt-1 block">{formatUptime(data.uptime)}</span>
            <span className="text-[9px] font-mono text-slate-500 block mt-1.5 border-t border-slate-800/60 pt-1">
              Version: <strong className="text-slate-300 font-bold">{data.system?.nodeVersion || "Unknown"}</strong>
            </span>
          </div>
        </div>

        {/* API Microservices Connections Bento Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            External SDK & API Integration Probes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(data.apis).map(([key, item]) => {
              const api = item as ApiStatus;
              return (
                <div key={key} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700/80 transition">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-550 block font-bold tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()} Connection</span>
                      <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">{api.name}</h4>
                    </div>
                    {api.configured ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded">
                        Configured
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded">
                        Missing env
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                      <span>Crawl Host Target:</span>
                      <span className="text-slate-200 select-all truncate max-w-[200px]">{api.endpoint}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] pt-1 border-t border-slate-900/60">
                      <span>Active Probe Status:</span>
                      <span className="flex items-center gap-1 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${api.status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className={api.status === 'healthy' ? 'text-emerald-400 uppercase font-extrabold' : 'text-red-400 uppercase font-extrabold'}>
                          {api.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {api.configured 
                      ? `Live validation credentials confirmed in environment scopes. Core-worker pipelines are successfully routed and verified.` 
                      : `Telemetry credentials for ${api.name} are missing. Falling back to secure 'Data Unavailable' response blocks; no simulations generated.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Node Cluster Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-450" />
              Node Cluster Memory Heap Allocated
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-950 border border-slate-800/40 rounded-xl">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Resident Set (RSS)</span>
                <span className="text-[13px] font-mono font-bold text-slate-200 mt-1 block">{formatMB(data.system.memoryUsage.rss)}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/40 rounded-xl">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Heap Total</span>
                <span className="text-[13px] font-mono font-bold text-slate-200 mt-1 block">{formatMB(data.system.memoryUsage.heapTotal)}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/40 rounded-xl">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Heap Used</span>
                <span className="text-[13px] font-mono font-bold text-slate-200 mt-1 block">{formatMB(data.system.memoryUsage.heapUsed)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 tracking-normal font-mono font-medium">
              Running node platform model: <strong className="text-indigo-400">{data.system.platform}</strong>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400 animate-pulse" />
                Live API Credential Guidance
              </h3>
              <p className="text-slate-405 text-xs leading-relaxed">
                Ensure API keys are loaded safely through target environmental files. If a connected metric displays <strong>MISSING ENV</strong>, add the corresponding key details into your active secret declarations:
              </p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800/40 rounded-xl text-[10px] font-mono text-slate-400 space-y-1">
              <div>PAGESPEED_API_KEY = "Google PageSpeed Insights Key"</div>
              <div>PLACES_API_KEY = "Google Maps API Key"</div>
              <div>DATAFORSEO_API_LOGIN / PASSWORD = "DataForSEO authentication"</div>
              <div>GEMINI_API_KEY = "Gemini Core AI Assistant Key"</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
