import React, { useState } from 'react';
import { WebsiteAuditReport } from '../types';
import { Mail, Copy, Check, Download, Sparkles, Send, Bell, ArrowRight } from 'lucide-react';

interface AiOutreachScriptPanelProps {
  report: WebsiteAuditReport;
}

export const AiOutreachScriptPanel: React.FC<AiOutreachScriptPanelProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const [outreachSent, setOutreachSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  // Fallback default outreach mail if not defined
  const emailBody = report.outreachScript || `Subject: Quick visual SEO gap in ${report.domain}

Hi Team ${report.companyName},

I ran an enterprise-level search crawling audit on ${report.domain} using our SEO Audit Suite.
The scan completed with an overall score of ${report.overallScore}/100.

While your brand presentation looks sleek, we found three primary search optimization gaps that are currently suppressing your high-intent traffic rankings:
1. Heading Structure: Your homepage is missing keyword-optimized H1 elements. This diminishes topical authority.
2. Core Web Vitals: Largest Contentful Paint (LCP) has a notable drag, reducing visitor conservation.
3. Citations Index: Inconsistent phone or coordinates records across regional mapping directories.

I have generated a complete, prioritized enterprise technical remediation blueprint and AI outreach campaign to help you capture these opportunities. If you would like to run through the custom proposal, feel free to reply directly here.

Best regards,
Prospect Outreach Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([emailBody], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.domain}_outreach_marketing_script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleMockSend = (e: React.FormEvent) => {
    e.preventDefault();
    setOutreachSent(true);
    setTimeout(() => setOutreachSent(false), 3000);
    setRecipientEmail('');
  };

  return (
    <div id="outreach-panel-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Script Copy Workspace Area (8 columns) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] px-2.5 py-1 rounded-full border border-indigo-150 uppercase tracking-widest font-extrabold flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
              Gemini AI Personalized Campaign Copy
            </span>
            <h3 className="text-lg font-bold font-display text-slate-900 tracking-tight">
              Personalized Outreach Marketing Script
            </h3>
            <p className="text-xs text-slate-500">
              Tailored outreach message designed for high reply conversion regarding <strong className="text-slate-805 font-semibold">{report.domain}</strong>'s results.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-850 font-semibold transition px-3.5 py-2 rounded-xl text-xs border border-slate-250 cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied Script
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copy Script
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition px-3.5 py-2 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download Script (.txt)
            </button>
          </div>
        </div>

        {/* Script Content Card */}
        <div className="relative bg-slate-50/65 border border-slate-150 rounded-2xl p-5 md:p-6 font-mono text-xs text-slate-800 leading-relaxed overflow-hidden shadow-2xs">
          <div className="absolute right-3 top-3 opacity-15 pointer-events-none select-none">
            <Mail className="w-24 h-24 text-slate-400" />
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-755 leading-relaxed">
            {emailBody}
          </pre>
        </div>

        {/* Test Send Emulator Form */}
        <div className="bg-slate-50/65 border border-slate-150 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700">Outreach Email Emulator</h4>
          </div>
          <p className="text-xs text-slate-500">
            Want to test-fire this outreach pitch directly to the client's contact mailbox or yourself? Use the emulator below.
          </p>
          <form onSubmit={handleMockSend} className="flex gap-2">
            <input 
              type="email"
              placeholder="recipient@domain.com"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 flex-1 max-w-sm"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
            >
              Send Pitch Email
            </button>
          </form>

          {outreachSent && (
            <div className="bg-emerald-50 text-emerald-850 px-3.5 py-2.5 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 animate-slide-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Emulator Sent!</strong> A simulated high-conversion email has been registered for tracking in your Leads CRM pipeline under 'Proposal Sent'.</span>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Pitch Sidebar (4 columns) */}
      <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
        <div className="space-y-5">
          <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[9px] px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest font-extrabold flex items-center gap-1.5 w-fit">
            <Bell className="w-3 h-3 text-indigo-400" />
            Pitch Relevancy Signal
          </span>

          <h3 className="text-md font-display font-bold leading-tight">
            How to Pitch This Crawl Report Securely
          </h3>

          <p className="text-xs text-indigo-200 font-normal leading-relaxed">
            Outreach conversions skyrocket when prospects see immediate, verified factual deficiencies rather than standard promotional blurbs.
          </p>

          <div className="space-y-3.5 border-t border-indigo-900/60 pt-4 mt-4">
            <div className="flex gap-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">1</div>
              <div>
                <strong className="block text-white mb-0.5 font-medium">Focus on the overall score ({report.overallScore}%)</strong>
                <span className="text-indigo-200/80 leading-normal text-[11px]">The score serves as an immediate visual rating. Pointing out they got below 60% hooks curiosity.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">2</div>
              <div>
                <strong className="block text-white mb-0.5 font-medium">State the H1 Header lack</strong>
                <span className="text-indigo-200/80 leading-normal text-[11px]">They can check this visually themselves, establishing your credibility instantly.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">3</div>
              <div>
                <strong className="block text-white mb-0.5 font-medium">Use the standalone share link</strong>
                <span className="text-indigo-200/80 leading-normal text-[11px]">Include their interactive report page so they can scroll the metrics and view beautiful diagnostics.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-indigo-900/60 pt-5 mt-6">
          <div className="bg-indigo-950/40 border border-indigo-900 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-indigo-300 block mb-1">Target Client URL</span>
            <span className="font-mono text-xs text-white break-all block shrink-0">{report.url}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
