import React from 'react';
import { WebsiteAuditReport, SeoMetric } from '../types';
import { 
  FileText, 
  Hash, 
  Compass, 
  BarChart, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Glasses,
  BookOpen,
  Milestone
} from 'lucide-react';

interface OnPageSeoPanelProps {
  report: WebsiteAuditReport;
}

export const OnPageSeoPanel: React.FC<OnPageSeoPanelProps> = ({ report }) => {
  const { onPage } = report;

  const getMetricIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    }
  };

  const getRelevanceColor = (relevance: 'high' | 'medium' | 'low') => {
    switch (relevance) {
      case 'high':
        return 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/20';
      case 'medium':
        return 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/20';
      case 'low':
        return 'text-slate-700 bg-slate-50 dark:text-slate-300 dark:bg-slate-950/20';
    }
  };

  return (
    <div id="on-page-seo-panel" className="space-y-8 animate-fade-in">
      
      {/* Top Banner Row */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-teal-950/20 border border-emerald-100/30 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <FileText className="w-5 h-5 text-emerald-500" />
            On-Page Semantic Relevance
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Copy volume, content depth, readability indices, heading structure outlines, and keyword coverage. Correct structures align your site with user intents and search bot parsing.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-xl border border-emerald-100 dark:border-slate-800 text-center shrink-0 shadow-sm">
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            On-Page Health
          </span>
          <span className="text-3xl font-display font-bold text-slate-900 dark:text-white block mt-0.5">
            {onPage.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {/* Two Columns Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Heading Outline and Metadata Parameters */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Cards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Crucial Meta Definitions
            </h3>

            {/* Title Tag Component */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl space-y-2 border border-slate-100 dark:border-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Title Tag</span>
                {getMetricIcon(onPage.titleTag.status)}
              </div>
              <div className="space-y-1 pt-1">
                <p className="font-mono text-slate-900 dark:text-white break-words">
                  {onPage.titleTag.value || "Not Detected"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {onPage.titleTag.details}
                </p>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 p-2 rounded-md mt-2 font-sans italic text-[11px]">
                  <strong>Director advice:</strong> {onPage.titleTag.recommendation}
                </div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-900/50">
                  Source: <span className="font-semibold">{onPage.titleTag.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.titleTag.originalField || "document.title"}</span>
                </div>
              </div>
            </div>

            {/* Meta Description Tag Component */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl space-y-2 border border-slate-100 dark:border-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Meta Description</span>
                {getMetricIcon(onPage.metaDescription.status)}
              </div>
              <div className="space-y-1 pt-1">
                <p className="font-mono text-slate-900 dark:text-white break-words">
                  {onPage.metaDescription.value || "Not Detected"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {onPage.metaDescription.details}
                </p>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 p-2 rounded-md mt-2 font-sans italic text-[11px]">
                  <strong>Director advice:</strong> {onPage.metaDescription.recommendation}
                </div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-900/50">
                  Source: <span className="font-semibold">{onPage.metaDescription.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.metaDescription.originalField || "document.querySelector('meta[name=description]').content"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heading Outline Map Component */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  Heading Tag Outline Structure
                </h3>
                <p className="text-xs text-slate-500">
                  Outline of HTML subheadings mapped chronologically relative to crawl flow paths.
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-mono">
                H1-H6 Score: {onPage.headingStructure.score}%
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono font-bold uppercase">
                  <Hash className="w-3.5 h-3.5" />
                  Primary Headings (H1)
                </div>
                {onPage.headingStructure.h1s.length > 0 ? (
                  onPage.headingStructure.h1s.map((h1, i) => (
                    <div key={i} className="text-xs font-mono bg-emerald-50/30 dark:bg-emerald-950/10 border-l-2 border-emerald-500 pl-2 py-1 text-slate-800 dark:text-slate-300">
                      {h1}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-rose-500 italic">No H1 tags detected! Severe indexing risk.</div>
                )}
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono font-bold uppercase">
                  <Hash className="w-3.5 h-3.5" />
                  Secondary Headings (H2)
                </div>
                <div className="space-y-1.5">
                  {onPage.headingStructure.h2s.map((h2, i) => (
                    <div key={i} className="text-xs font-mono border-l-2 border-indigo-400 pl-2 py-0.5 text-slate-700 dark:text-slate-400">
                      {h2}
                    </div>
                  ))}
                </div>
              </div>

              {onPage.headingStructure.h3s.length > 0 && (
                <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono font-bold uppercase">
                    <Hash className="w-3.5 h-3.5" />
                    Tertiary Headings (H3)
                  </div>
                  <div className="space-y-1.5">
                    {onPage.headingStructure.h3s.map((h3, i) => (
                      <div key={i} className="text-xs font-mono border-l-2 border-slate-300 dark:border-slate-700 pl-2 py-0.5 text-slate-500 dark:text-slate-400">
                        {h3}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
              <div className="flex items-start gap-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                {getMetricIcon(onPage.headingStructure.validation.status)}
                <div className="space-y-1 text-xs w-full">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Heading Outline Validation Status
                  </p>
                  <p className="text-slate-500">
                    {onPage.headingStructure.validation.details}
                  </p>
                  <p className="text-slate-900 dark:text-slate-300 mt-2 italic font-sans text-[11px] border-l-2 border-indigo-500 pl-2">
                    "{onPage.headingStructure.validation.recommendation}"
                  </p>
                  <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-2 border-t border-slate-100 dark:border-slate-800/50">
                    Source: <span className="font-semibold">{onPage.headingStructure.validation.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.headingStructure.validation.originalField || "document.querySelectorAll('h1, h2, h3')"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Keyword density analysis & semantic authority index */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Keyword Density Profile */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart className="w-4.5 h-4.5 text-indigo-500" />
              Primary Keyword Density Stats
            </h3>
            <p className="text-xs text-slate-500">
              The density footprint indicates whether copy is optimized cleanly or risks search engine keyword stuffing bans.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {onPage.keywordDensity.map((kd, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {kd.keyword}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-mono">x{kd.count}</span>
                    <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {kd.density}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${getRelevanceColor(kd.relevance)}`}>
                      {kd.relevance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NLP Authority Metrics & E-E-A-T trust indices */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-500" />
              Semantic and E-E-A-T Signals
            </h3>

            {/* Readability Score row */}
            <div className="flex flex-col border-b border-slate-50 dark:border-slate-800 pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Readability (Flesch-Kincaid)</span>
                  <span className="block text-[11px] text-slate-400">{onPage.readabilityScore.details}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{onPage.readabilityScore.value}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                Source: <span className="font-semibold">{onPage.readabilityScore.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.readabilityScore.originalField || "Flesch readability algorithm"}</span>
              </div>
            </div>

            {/* Content Depth row */}
            <div className="flex flex-col border-b border-slate-50 dark:border-slate-800 pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Text Word Count</span>
                  <span className="block text-[11px] text-slate-400">{onPage.contentScore.details}</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{onPage.contentScore.value}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                Source: <span className="font-semibold">{onPage.contentScore.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.contentScore.originalField || "document.body.innerText.split().length"}</span>
              </div>
            </div>

            {/* NLP Semantics */}
            <div className="flex flex-col border-b border-slate-50 dark:border-slate-800 pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">NLP Entity extraction index</span>
                  <span className="block text-[11px] text-slate-400">{onPage.nlpRelevance.details}</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{onPage.nlpRelevance.value}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                Source: <span className="font-semibold">{onPage.nlpRelevance.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.nlpRelevance.originalField || "NLP custom taxonomy overlap calculation"}</span>
              </div>
            </div>

            {/* E-E-A-T trust markers */}
            <div className="flex items-start gap-2 pt-1">
              {getMetricIcon(onPage.eeatSignals.status)}
              <div className="space-y-1 w-full">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Google E-E-A-T Profile</span>
                <p className="text-[11px] text-slate-500 leading-normal">{onPage.eeatSignals.details}</p>
                <p className="text-[11px] text-slate-600 italic font-mono mt-1 border-l border-slate-300 pl-1.5 mt-2">
                  "Recommendation: {onPage.eeatSignals.recommendation}"
                </p>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-2 border-t border-slate-100 dark:border-slate-805">
                  Source: <span className="font-semibold">{onPage.eeatSignals.sourceApi || "HTML Raw Crawler"}</span> | Field: <span className="font-semibold">{onPage.eeatSignals.originalField || "document.querySelectorAll('[itemscope]').length"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semantic Keyword Opportunities */}
          <div className="bg-indigo-950 text-white p-5 rounded-xl space-y-4 shadow-lg border border-indigo-900 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-900/40 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-indigo-200 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              LSI & Semantic Keyword Boosters
            </h3>
            
            <div className="space-y-3 pt-1">
              {onPage.semanticKeywords.map((sk, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">{sk.term}</span>
                    <span className="text-indigo-300 font-mono text-[10px]">{sk.suggestedUsage}</span>
                  </div>
                  <p className="text-indigo-200 text-[11px] leading-normal">{sk.opportunity}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
