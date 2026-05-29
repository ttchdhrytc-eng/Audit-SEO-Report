import React, { useState } from 'react';
import { WebsiteAuditReport, AiRecommendation } from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  AlertOctagon, 
  ArrowUpRight, 
  LineChart, 
  CheckCircle, 
  Flame, 
  Briefcase,
  Layers,
  ChevronRight,
  ClipboardList,
  Check
} from 'lucide-react';

interface AiRoadmapPanelProps {
  report: WebsiteAuditReport;
}

export const AiRoadmapPanel: React.FC<AiRoadmapPanelProps> = ({ report }) => {
  const [completedRecs, setCompletedRecs] = useState<Record<string, boolean>>({});
  const [activePriorityFilter, setActivePriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const filteredRecs = report.recommendations.filter(rec => {
    if (activePriorityFilter === 'all') return true;
    return rec.priority === activePriorityFilter;
  });

  const toggleComplete = (id: string) => {
    setCompletedRecs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { text: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40', label: 'CRITICAL PRIORITY' };
      case 'high':
        return { text: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40', label: 'HIGH PRIORITY' };
      case 'medium':
        return { text: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40', label: 'MEDIUM PRIORITY' };
      default:
        return { text: 'text-slate-700 bg-slate-50 border-slate-250', label: 'LOW PRIORITY' };
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'technical':
        return { bg: 'bg-blue-50 text-blue-700', label: 'Technical Structure' };
      case 'onpage':
        return { bg: 'bg-emerald-50 text-emerald-700', label: 'Semantic Copy' };
      case 'performance':
        return { bg: 'bg-pink-50 text-pink-700', label: 'Performance / CWV' };
      case 'competitor':
        return { bg: 'bg-purple-50 text-purple-700', label: 'Competitor Deficit' };
      case 'local':
        return { bg: 'bg-amber-50 text-amber-750', label: 'Local Directory' };
    }
  };

  return (
    <div id="ai-roadmap-panel" className="space-y-6 animate-fade-in">
      
      {/* Priority Engine Header card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-transparent" />
        <div className="space-y-4 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-indigo-505/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI prioritized high-velocity diagnostic checklist
          </span>
          <h2 className="text-xl md:text-2xl font-display font-semibold tracking-tight text-white leading-tight">
            Director's Optimization Plan: Convert Search Deficits into Organic Revenue
          </h2>
          <p className="text-slate-350 text-xs md:text-sm leading-relaxed font-normal">
            We prioritize recommendations according to direct revenue impact versus estimated deployment requirements. This specific sequence bypasses technical noise to present high-conversion copywriting that turns traffic gaps into client contracts.
          </p>
        </div>
      </div>

      {/* Actionable Pipeline workspace */}
      <div className="space-y-5">
        
        {/* Filtering Pills row */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setActivePriorityFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${activePriorityFilter === 'all' ? 'bg-indigo-650 text-white border-indigo-600 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'}`}
            >
              All Directives
            </button>
            <button 
              type="button"
              onClick={() => setActivePriorityFilter('critical')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${activePriorityFilter === 'critical' ? 'bg-rose-600 text-white border-rose-500 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'}`}
            >
              Critical
            </button>
            <button 
              type="button"
              onClick={() => setActivePriorityFilter('high')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${activePriorityFilter === 'high' ? 'bg-amber-500 text-white border-amber-400 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'}`}
            >
              High Importance
            </button>
            <button 
              type="button"
              onClick={() => setActivePriorityFilter('medium')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${activePriorityFilter === 'medium' ? 'bg-blue-600 text-white border-blue-500 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'}`}
            >
              Medium
            </button>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Showing {filteredRecs.length} sequence steps</span>
        </div>

        {/* Action Directives lists */}
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const priorityMeta = getPriorityBadge(rec.priority);
            const categoryMeta = getCategoryTheme(rec.category);
            const isDone = !!completedRecs[rec.id];

            return (
              <div 
                id={`rec-item-${rec.id}`}
                key={rec.id} 
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-xs relative ${isDone ? 'border-amber-200/50 bg-slate-50/50 dark:bg-slate-950/20 opacity-70' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="flex items-start gap-4 flex-col sm:flex-row justify-between">
                  
                  {/* Left block information */}
                  <div className="space-y-3 flex-1">
                    
                    {/* Badge Pill Header line */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${priorityMeta.text}`}>
                        {priorityMeta.label}
                      </span>
                      
                      {categoryMeta && (
                        <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full ${categoryMeta.bg}`}>
                          {categoryMeta.label}
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                        Effort: <strong className="text-slate-700 dark:text-slate-200">{rec.effort}</strong>
                      </span>
                    </div>

                    {/* Title Text */}
                    <h3 className={`text-sm md:text-base font-display font-bold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {rec.title}
                    </h3>

                    {/* Actionable Copywriting logic */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mt-1.5 font-normal">
                      {rec.description}
                    </p>

                    {/* Specific client conversion advice snippet */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-950 flex items-start gap-2.5">
                      <LineChart className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Estimated Conversion Impact</span>
                        <p className="text-slate-700 dark:text-slate-200 text-xs font-normal">
                          {rec.impact}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Right side check status button */}
                  <div className="shrink-0 pt-1 self-stretch sm:self-auto border-t border-slate-50 sm:border-t-0 pt-4 sm:pt-0 flex items-center justify-between sm:block">
                    <button 
                      type="button"
                      onClick={() => toggleComplete(rec.id)}
                      className={`text-xs font-bold transition px-4 py-2.5 rounded-xl border flex items-center gap-2 w-full justify-center sm:w-auto cursor-pointer ${isDone ? 'bg-amber-500 border-amber-400 text-white shadow-xs' : 'bg-white border-slate-250 text-slate-750 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800'}`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4" />
                          Mark Ignored / Active
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          Complete Fix
                        </>
                      )}
                    </button>
                    {isDone && (
                      <span className="block text-[10px] font-mono font-bold uppercase text-amber-600 text-center mt-2.5">
                        ✓ Locked Out Fix
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
