import React, { useState } from 'react';
import { WebsiteAuditReport } from '../types';
import { getApiUrl } from '../utils/api';
import { 
  Search, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  TrendingUp, 
  HelpCircle, 
  FileText, 
  Copy, 
  Check, 
  BarChart2, 
  PieChart, 
  Layers,
  AlertCircle
} from 'lucide-react';

interface AiKeywordStrategistPanelProps {
  report: WebsiteAuditReport;
}

interface StrategicKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  cpc: string;
  priority: string;
  competition: string;
  opportunityValue: string;
}

interface KeywordReport {
  difficultyCeiling: number;
  trafficPotential: string;
  intentBalance: string;
  keywords: StrategicKeyword[];
  clusterSummary: string;
}

interface HeadingBlock {
  level: 'H1' | 'H2' | 'H3';
  text: string;
}

interface ContentOutline {
  title: string;
  metaDescription: string;
  targetWordCount: number;
  semanticKeywords: string[];
  briefIntroduction: string;
  headings: HeadingBlock[];
}

export const AiKeywordStrategistPanel: React.FC<AiKeywordStrategistPanelProps> = ({ report }) => {
  const [seedInput, setSeedInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keywordReport, setKeywordReport] = useState<KeywordReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Outline generation states
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isOutlineLoading, setIsOutlineLoading] = useState<boolean>(false);
  const [outlineData, setOutlineData] = useState<ContentOutline | null>(null);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const handleGenerateKeywords = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);
    setKeywordReport(null);
    setSelectedKeyword(null);
    setOutlineData(null);

    const targetSeed = seedInput.trim() || `${report.companyName} seo optimization`;

    try {
      const response = await fetch(getApiUrl('/api/keyword-strategist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: report.domain,
          seed: targetSeed
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate strategy. Server returned status ${response.status}`);
      }

      const data = await response.json();
      setKeywordReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected network issue occurred while querying the AI Keyword Strategist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOutline = async (kw: string) => {
    setSelectedKeyword(kw);
    setOutlineError(null);
    setIsOutlineLoading(true);
    setOutlineData(null);

    try {
      const response = await fetch(getApiUrl('/api/keyword-strategist/outline'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: report.domain,
          keyword: kw
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate outline brief. Server status ${response.status}`);
      }

      const data = await response.json();
      setOutlineData(data);
    } catch (err: any) {
      console.error(err);
      setOutlineError(err?.message || "Could not generate content brief for target keyword.");
    } finally {
      setIsOutlineLoading(false);
    }
  };

  const handleCopyOutline = () => {
    if (!outlineData) return;
    
    let plainText = `SEO Content Brief & Outline: ${selectedKeyword}\n\n`;
    plainText += `Recommended Title: ${outlineData.title}\n`;
    plainText += `Recommended Meta Description: ${outlineData.metaDescription}\n`;
    plainText += `Suggested Word Count: ${outlineData.targetWordCount} words\n\n`;
    plainText += `Semantic / LSI Keywords to Use:\n`;
    outlineData.semanticKeywords.forEach(kw => {
      plainText += `- ${kw}\n`;
    });
    plainText += `\nBrief User Intent Alignment:\n${outlineData.briefIntroduction}\n\n`;
    plainText += `Heading Hierarchy Outline:\n`;
    outlineData.headings.forEach(h => {
      plainText += `[${h.level}] -- ${h.text}\n`;
    });

    navigator.clipboard.writeText(plainText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getDifficultyColor = (diff: number) => {
    if (diff < 35) return 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20';
    if (diff < 60) return 'text-amber-650 bg-amber-50 dark:bg-amber-950/20';
    return 'text-rose-650 bg-rose-50 dark:bg-rose-950/20';
  };

  const getIntentBadgeStyle = (intent: string) => {
    switch(intent) {
      case 'Transactional': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400';
      case 'Commercial': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Informational': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400';
    }
  };

  // Seed suggestion helpers
  const handleApplySuggestion = (text: string) => {
    setSeedInput(text);
  };

  return (
    <div id="ai-keyword-strategist" className="space-y-8 animate-fade-in no-print">
      
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-100/35 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-indigo-100 text-indigo-750 dark:bg-indigo-950 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3 h-3 text-indigo-550" /> Gemini-Powered Strategist
          </div>
          <h2 className="text-xl md:text-2xl font-display font-extrabold text-slate-900 dark:text-white">
            AI Keyword Strategist & Semantic Silk Mappers
          </h2>
          <p className="text-xs md:text-sm text-slate-552 max-w-xl leading-relaxed">
            Uncover high-conversion keyword clusters tailored specifically to <strong>{report.companyName}</strong>'s current domain authority. Create rapid semantic content outlines dynamically targeting competitors' ranking deficits.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 shrink-0 shadow-sm relative z-10 flex flex-col items-center">
          <Layers className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mt-2">Active Domain URL</span>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{report.domain}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Strategist input panel -- spans 4 cols on desktop */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              Configure Strategy Explorer
            </h3>

            <form onSubmit={handleGenerateKeywords} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Seed Keyword or Topic Room
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder="E.g., high end boutique gym design"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono text-slate-850 placeholder-slate-400"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-350">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed pt-1">
                  Enter key services or topics you want to target. If left empty, AI uses your current profile metrics.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing SERP authority loops...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Strategy
                  </>
                )}
              </button>
            </form>

            {/* Quick Suggestions based on domain and existing content */}
            <div className="space-y-3 pt-2 border-t border-slate-50">
              <span className="block text-[10px] font-mono font-bold text-slate-405 uppercase tracking-wider">
                Recommended seeds for {report.companyName}
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {report.onPage.keywordDensity && report.onPage.keywordDensity.slice(0, 3).map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplySuggestion(`${kw.keyword} services`)}
                    className="bg-slate-50 hover:bg-indigo-50 text-slate-650 hover:text-indigo-750 dark:bg-slate-950 dark:hover:bg-indigo-950/20 border border-slate-200/50 hover:border-indigo-200/40 px-2.5 py-1 rounded-lg font-medium cursor-pointer transition"
                  >
                    + {kw.keyword}
                  </button>
                ))}
                <button
                  onClick={() => handleApplySuggestion(`affordable local ${report.companyName.toLowerCase()}`)}
                  className="bg-slate-50 hover:bg-indigo-50 text-slate-650 hover:text-indigo-750 dark:bg-slate-950 dark:hover:bg-indigo-950/20 border border-slate-200/50 hover:border-indigo-200/40 px-2.5 py-1 rounded-lg font-medium cursor-pointer transition"
                >
                  + local {report.companyName.toLowerCase()}
                </button>
              </div>
            </div>

            {/* Existing Keyword Stats Overview */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 p-4 rounded-2xl space-y-3">
              <span className="block text-[10px] font-mono text-slate-450 uppercase tracking-widest font-bold">
                Existing Keyword Baseline Index
              </span>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[9px] text-slate-400 font-mono">Mapped Densities</span>
                  <span className="text-base font-bold font-display text-slate-800 dark:text-slate-200">
                    {report.onPage.keywordDensity?.length || 0} Terms
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[9px] text-slate-400 font-mono">Semantic Gaps</span>
                  <span className="text-base font-bold font-display text-slate-800 dark:text-slate-200">
                    {report.competitors.keywordGaps?.length || 0} Rival Outlets
                  </span>
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-850 p-4 rounded-2xl flex gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Error Extracting Strategy</strong>
                <span className="block font-mono mt-0.5 text-[11px]">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right main analysis workspace pane -- Spans 7 cols on desktop */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xs">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold font-display text-slate-800 dark:text-slate-200 text-sm">Drafting SEO Opportunity Pipeline</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto">
                  Gemini AI is parsing competitor clusters, estimating organic click value indexes, and preparing high-level content structure briefings...
                </p>
              </div>
              <div className="flex justify-center gap-1.5 pt-2">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce delay-75" />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          ) : keywordReport ? (
            <div className="space-y-6">
              
              {/* Keyword Report Metadata Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 p-5 rounded-2xl shadow-xs text-center space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Authority Diff. Ceiling
                  </span>
                  <span className="text-3xl font-display font-bold text-slate-900 dark:text-white block">
                    {keywordReport.difficultyCeiling}%
                  </span>
                  <span className="inline-block text-[9px] text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-full font-bold">
                    Lower Difficulty Advised
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 p-5 rounded-2xl shadow-xs text-center space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Est. Traffic Potential
                  </span>
                  <span className="text-3xl font-display font-bold text-indigo-650 block">
                    {keywordReport.trafficPotential}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-sans">
                    With optimized silo hubs
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 p-5 rounded-2xl shadow-xs text-center space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Target Intent Balance
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-200 block py-2">
                    {keywordReport.intentBalance}
                  </span>
                  <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Balanced Target Ratios
                  </span>
                </div>
              </div>

              {/* Actionable Keyword recommendation table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <h4 className="font-display font-semibold text-slate-900 dark:text-white text-xs uppercase font-mono tracking-wider">
                    High Opportunity AI Keyword Blueprints
                  </h4>
                  <span className="text-[10px] text-slate-400">Click a row to draft outline briefs</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                        <th className="px-3 py-2.5">Key Search Target Phrase</th>
                        <th className="px-3 py-2.5 text-center">Vol/Mo</th>
                        <th className="px-3 py-2.5 text-center">SEO KD</th>
                        <th className="px-3 py-2.5 text-center">Intent</th>
                        <th className="px-3 py-2.5 text-center">Est CPC</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                      {keywordReport.keywords.map((kw, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition cursor-pointer ${selectedKeyword === kw.keyword ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => handleGenerateOutline(kw.keyword)}
                        >
                          <td className="px-3 py-3 font-semibold text-slate-850 dark:text-slate-100">
                            <div>{kw.keyword}</div>
                            <span className="text-[10px] text-slate-450 font-normal mt-0.5 leading-relaxed block max-w-xs">{kw.opportunityValue}</span>
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-medium text-slate-700">
                            {kw.volume.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${getDifficultyColor(kw.difficulty)}`}>
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${getIntentBadgeStyle(kw.intent)}`}>
                              {kw.intent}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-mono text-slate-600 font-bold">
                            {kw.cpc}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateOutline(kw.keyword);
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Draft Brief <ArrowRight className="w-3 h-3 inline-block ml-0.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-indigo-50/45 dark:bg-indigo-950/15 p-4 rounded-xl border border-indigo-100 border-dashed space-y-1.5">
                  <h5 className="text-[11px] font-bold text-indigo-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-550" />
                    Recommended Topical Sizing Hub Structure
                  </h5>
                  <p className="text-[11px] leading-relaxed text-indigo-900">
                    {keywordReport.clusterSummary}
                  </p>
                </div>
              </div>

              {/* OUTLINE SECTION DISPLAY */}
              {selectedKeyword && (
                <div id="outline-results-container" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 scroll-mt-6">
                  
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#571e9a] font-bold block">
                        Keyword SEO Content Brief
                      </span>
                      <h4 className="text-sm font-semibold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-purple-550" />
                        Target: <span className="font-mono text-indigo-600 text-xs font-bold bg-indigo-50/70 px-2 py-0.5 rounded">{selectedKeyword}</span>
                      </h4>
                    </div>

                    {outlineData && (
                      <button 
                        type="button" 
                        onClick={handleCopyOutline}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer select-none"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied brief!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Brief
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isOutlineLoading ? (
                    <div className="text-center py-10 space-y-3">
                      <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin" />
                      <p className="text-xs text-slate-450">Generating outline headings, recommended CTR titles, and LSI semantic triggers...</p>
                    </div>
                  ) : outlineError ? (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                      <span>{outlineError}</span>
                    </div>
                  ) : outlineData ? (
                    <div className="space-y-6">
                      
                      {/* Grid parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                            CTR Optimised Title Tag
                          </span>
                          <span className="text-xs font-sans font-semibold text-slate-800 block">
                            {outlineData.title}
                          </span>
                        </div>

                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                            Organic Search Description Brief
                          </span>
                          <span className="text-xs font-sans text-slate-700 leading-relaxed block">
                            {outlineData.metaDescription}
                          </span>
                        </div>
                      </div>

                      {/* Word counts and LSI links */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        
                        <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-center h-full flex flex-col justify-center">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                            Recommended Word Length
                          </span>
                          <span className="text-2xl font-bold font-display text-slate-805 block">
                            ~{outlineData.targetWordCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">words</span>
                          </span>
                          <p className="text-[10px] text-slate-450">Aligned with high rank indexes</p>
                        </div>

                        <div className="md:col-span-8 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                            Weave-In Semantic / LSI Keyword targets
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {outlineData.semanticKeywords.map((tag, tIdx) => (
                              <span 
                                key={tIdx} 
                                className="bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-mono font-medium px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-450 leading-relaxed">
                            Integrate these naturally into high ranking heading blocks and paragraph blocks.
                          </p>
                        </div>

                      </div>

                      {/* Brief text and instruction */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-1 bg-violet-50/20">
                        <span className="block text-[9px] font-mono text-emerald-800 uppercase tracking-widest font-bold">
                          Copywriting Intent Calibration
                        </span>
                        <p className="text-xs text-slate-650 leading-relaxed">
                          {outlineData.briefIntroduction}
                        </p>
                      </div>

                      {/* Heading outlines list */}
                      <div className="space-y-3">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                          SEO Content Structure Layout (H1-H3 Hierarchy)
                        </span>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-sans space-y-2.5">
                          {outlineData.headings.map((hCode, hIdx) => {
                            const paddingLeft = hCode.level === 'H2' ? 'ml-4 sm:ml-6' : hCode.level === 'H3' ? 'ml-8 sm:ml-12' : '';
                            const bgStyle = hCode.level === 'H1' ? 'bg-indigo-100 text-indigo-855 font-bold' : hCode.level === 'H2' ? 'bg-purple-150 text-slate-800 font-semibold' : 'bg-slate-200 text-slate-600';
                            return (
                              <div key={hIdx} className={`flex items-start gap-2.5 ${paddingLeft}`}>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase shrink-0 font-extrabold ${bgStyle}`}>
                                  {hCode.level}
                                </span>
                                <span className={`text-[11px] leading-relaxed font-sans ${hCode.level === 'H1' ? 'font-bold' : hCode.level === 'H2' ? 'font-medium' : ''}`}>
                                  {hCode.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ) : null}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-dashed rounded-3xl p-16 text-center text-slate-400 space-y-4 shadow-inner">
              <Sparkles className="w-10 h-10 mx-auto text-indigo-400 animate-pulse" />
              <div className="space-y-1.5">
                <h4 className="font-bold font-display text-slate-800 dark:text-slate-200 text-sm">Strategist Workbench Waiting for Core Context</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                  Enter a seed phrase to configure the opportunity engine, or click the button below to autogenerate based on website baseline content profiles.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => handleGenerateKeywords()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition select-none"
              >
                Auto-generate Base Strategy
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
