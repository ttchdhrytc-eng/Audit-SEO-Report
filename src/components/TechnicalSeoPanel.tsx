import React from 'react';
import { WebsiteAuditReport, SeoMetric } from '../types';
import { 
  Cpu, 
  Search, 
  ShieldAlert, 
  FileCode, 
  Sliders, 
  Compass, 
  Gauge, 
  Image, 
  Timer, 
  Layers, 
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle as InfoIcon
} from 'lucide-react';

interface TechnicalSeoPanelProps {
  report: WebsiteAuditReport;
}

export const TechnicalSeoPanel: React.FC<TechnicalSeoPanelProps> = ({ report }) => {
  const { technical } = report;

  const getMetricIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getVitalsRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', badge: 'bg-emerald-500' };
      case 'needs-improvement':
        return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', badge: 'bg-amber-500' };
      case 'poor':
        return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', badge: 'bg-rose-500' };
    }
  };

  const renderMetricRow = (metric: SeoMetric, idPrefix: string) => {
    return (
      <div id={`${idPrefix}-metric-card`} key={metric.name} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {metric.name}
            </h4>
            {metric.value && (
              <span className="inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                {metric.value}
              </span>
            )}
          </div>
          {getMetricIcon(metric.status)}
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {metric.details}
          </p>
          <div className="border-t border-slate-50 dark:border-slate-950/40 pt-2.5 mt-2.5">
            <span className="block text-[10px] font-mono uppercase text-indigo-500 dark:text-indigo-400 font-semibold tracking-wider">
              Priority Fix
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">
              "{metric.recommendation}"
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="technical-seo-panel" className="space-y-8 animate-fade-in">
      {/* Overview Block */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20 border border-blue-100/30 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <Cpu className="w-5 h-5 text-indigo-500" />
            Technical SEO Indexation Core
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Critical parsing, security protocols, routing chains, and crawler alignment indexes. We examine details to ensure web spiders discover deep content directories smoothly.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-xl border border-blue-100 dark:border-slate-800 text-center shrink-0 shadow-sm">
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            Tech Health Factor
          </span>
          <span className="text-3xl font-display font-bold text-slate-900 dark:text-white block mt-0.5">
            {technical.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {/* Grid of standard search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderMetricRow(technical.crawlability, "crawlability")}
        {renderMetricRow(technical.indexability, "indexability")}
        {renderMetricRow(technical.robotsTxt, "robots")}
        {renderMetricRow(technical.sitemapXml, "sitemap")}
        {renderMetricRow(technical.canonicalTags, "canonical")}
        {renderMetricRow(technical.schemaMarkup, "schema")}
        {renderMetricRow(technical.sslHttps, "ssl")}
        {renderMetricRow(technical.redirectChains, "redirects")}
        {renderMetricRow(technical.orphanPages, "orphan")}
      </div>

      {/* Core Web Vitals Section */}
      <div id="core-web-vitals-subpanel" className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-pink-500" />
              Core Web Vitals & Real-user Latency
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Web Performance and Page Stability (CWV) metrics measured directly from Chrome UX Reports in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">CWV Score Index</span>
            <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
              {technical.coreWebVitals.score}/100
            </span>
          </div>
        </div>

        {/* The 4 Core Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LCP */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Largest Contentful Paint</span>
              <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">LCP</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {technical.coreWebVitals.lcp.value}
              </span>
              <span className={`text-xs font-semibold capitalize ${getVitalsRatingColor(technical.coreWebVitals.lcp.rating).text}`}>
                {technical.coreWebVitals.lcp.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
              Main content load latency. Recommendation: Max 2.5s.
            </p>
          </div>

          {/* CLS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Cumulative Layout Shift</span>
              <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">CLS</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {technical.coreWebVitals.cls.value}
              </span>
              <span className={`text-xs font-semibold capitalize ${getVitalsRatingColor(technical.coreWebVitals.cls.rating).text}`}>
                {technical.coreWebVitals.cls.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
              Visual movement parity. Recommendation: Max 0.10.
            </p>
          </div>

          {/* INP */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Interaction to Next Paint</span>
              <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">INP</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {technical.coreWebVitals.inp.value}
              </span>
              <span className={`text-xs font-semibold capitalize ${getVitalsRatingColor(technical.coreWebVitals.inp.rating).text}`}>
                {technical.coreWebVitals.inp.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
              Click & touch layout latency. Target: Under 200ms.
            </p>
          </div>

          {/* TTFB */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Time to First Byte</span>
              <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">TTFB</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {technical.coreWebVitals.ttfb.value}
              </span>
              <span className={`text-xs font-semibold capitalize ${getVitalsRatingColor(technical.coreWebVitals.ttfb.rating).text}`}>
                {technical.coreWebVitals.ttfb.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
              Initial server response speeds. Target: Under 800ms.
            </p>
          </div>
        </div>

        {/* Code Bloat & Image Optimization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderMetricRow(technical.coreWebVitals.imageOptimization, "image-optimize")}
          {renderMetricRow(technical.coreWebVitals.renderBlocking, "render-block")}
        </div>
      </div>
    </div>
  );
};
