import React from 'react';
import { WebsiteAuditReport } from '../types';
import { 
  Users, 
  TrendingUp, 
  Link, 
  Search, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Activity,
  Award
} from 'lucide-react';

interface CompetitorGapPanelProps {
  report: WebsiteAuditReport;
}

export const CompetitorGapPanel: React.FC<CompetitorGapPanelProps> = ({ report }) => {
  const { competitors } = report;

  // Render priority color indicators
  const getOpportunityColor = (opp: 'Critical' | 'High' | 'Medium') => {
    switch (opp) {
      case 'Critical':
        return 'bg-rose-50 border-rose-200 text-rose-750 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400';
      case 'High':
        return 'bg-amber-50 border-amber-200 text-amber-750 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400';
      case 'Medium':
        return 'bg-blue-50 border-blue-200 text-blue-750 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400';
    }
  };

  return (
    <div id="competitor-gap-panel" className="space-y-8 animate-fade-in">
      
      {/* Upper pitch banner with lead generation flavor */}
      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-purple-950/20 border border-purple-100/30 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <Users className="w-5 h-5 text-purple-500" />
            Competitive SEO Intelligence & Lead Deficit Mappings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Who is absorbing high-value organic clicks in geographic grids? Analyze overlap rates, backlink volumes, and discover critical keyword gaps where your site is currently missing out.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-xl border border-purple-100 dark:border-slate-800 text-center shrink-0 shadow-sm">
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            Competitor Deficit Score
          </span>
          <span className="text-3xl font-display font-bold text-slate-900 dark:text-white block mt-0.5">
            {competitors.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {/* Profile Deficit Chart Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
            Competitive Footprint Comparison matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">Mapped Core Web Indexes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-450 uppercase tracking-wider font-bold bg-slate-50 dark:bg-slate-950">
                <th className="px-4 py-3">Domain Website</th>
                <th className="px-4 py-3 text-center">Auth Index</th>
                <th className="px-4 py-3 text-center">Backlinks Footprint</th>
                <th className="px-4 py-3 text-center">Ref. Domains</th>
                <th className="px-4 py-3 text-center">Organic Traffic Value</th>
                <th className="px-4 py-3 text-center">Ranked Keywords</th>
                <th className="px-4 py-3 text-center">Serp Overlap</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              
              {/* Target Website row */}
              <tr className="bg-indigo-50/20 dark:bg-indigo-950/10 font-medium">
                <td className="px-4 py-3.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400">{report.domain} (You)</span>
                </td>
                <td className="px-4 py-3.5 text-center font-bold font-mono">
                  {Math.round(competitors.overallScore * 0.72)}
                </td>
                <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300 font-mono">
                  150
                </td>
                <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300 font-mono">
                  38
                </td>
                <td className="px-4 py-3.5 text-center text-emerald-600 font-bold font-mono">
                  $340 /mo
                </td>
                <td className="px-4 py-3.5 text-center text-slate-700 dark:text-slate-300 font-mono">
                  84
                </td>
                <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                  -
                </td>
              </tr>

              {/* Competitors rows */}
              {competitors.competitors.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="px-4 py-3.5 text-slate-800 dark:text-slate-100 font-medium">
                    {comp.domain}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                    {comp.authority}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                    {comp.backlinks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                    {comp.referringDomains}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400 font-semibold text-slate-700 dark:text-slate-200">
                    {comp.trafficValue}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-400">
                    {comp.rankingKeywords.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                    {comp.overlapKeywords}%
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Keyword Gap Analysis Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-purple-500" />
              Primary Geographical & Commercial Keyword Gaps
            </h3>
            <p className="text-xs text-slate-500">
              Keywords where competitors rank in top position slots but your domain fails to trigger placement indexes or ranks page 5+.
            </p>
          </div>
          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 text-xs px-3 py-1 rounded-full font-medium">
            Discovering {competitors.keywordGaps.length} Actionable Opportunities
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                <th className="px-4 py-3">High Intent Keyword Target</th>
                <th className="px-4 py-3 text-center">Search Vol (Mo)</th>
                <th className="px-4 py-3 text-center">Keyword Difficulty (KD)</th>
                <th className="px-4 py-3 text-center">Rival Position</th>
                <th className="px-4 py-3 text-center">Our Domain rank</th>
                <th className="px-4 py-3 text-center">Opportunity Tier</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {competitors.keywordGaps.map((gap, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                    {gap.keyword}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400">
                    {gap.volume}/mo
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div 
                          className={`h-full rounded-full ${gap.difficulty > 45 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${gap.difficulty}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">{gap.difficulty}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-white font-mono">
                    #{gap.competitorRank}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {gap.ourRank === 'Not Ranking' ? (
                      <span className="text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded text-[10px]">
                        Not Ranking
                      </span>
                    ) : (
                      <span className="text-slate-500">#{gap.ourRank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-semibold border ${getOpportunityColor(gap.opportunityValue)}`}>
                      {gap.opportunityValue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pitch trigger note */}
        <div className="bg-indigo-900 text-white p-5 rounded-xl border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Agency Lead Generator
            </span>
            <h4 className="text-sm font-display font-bold">Want to close this prospect with customized proposals?</h4>
            <p className="text-xs text-indigo-200 max-w-xl">
              Use these keyword gap metrics directly in your pitching sales decks. Pointing out direct lost revenue opportunities converts prospects into monthly retainers.
            </p>
          </div>
          <button 
            type="button"
            className="bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs transition px-4 py-2.5 rounded-lg whitespace-nowrap self-start md:self-center cursor-pointer"
            onClick={() => {
              const el = document.getElementById('print-export-btn');
              if (el) el.click();
            }}
          >
            Generate Proposal PDF
          </button>
        </div>
      </div>

    </div>
  );
};
