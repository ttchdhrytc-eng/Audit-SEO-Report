import React, { useState, useEffect } from 'react';
import { 
  SeoMetric, 
  TechnicalAudit, 
  OnPageAudit, 
  CompetitorAudit, 
  LocalSeoAudit, 
  AiRecommendation, 
  WebsiteAuditReport, 
  AuditQueueItem, 
  CapturedLead 
} from './types';
import { ExecutiveSummaryPanel } from './components/ExecutiveSummaryPanel';
import { TechnicalSeoPanel } from './components/TechnicalSeoPanel';
import { OnPageSeoPanel } from './components/OnPageSeoPanel';
import { CompetitorGapPanel } from './components/CompetitorGapPanel';
import { LocalSeoPanel } from './components/LocalSeoPanel';
import { AiRoadmapPanel } from './components/AiRoadmapPanel';
import { AiOutreachScriptPanel } from './components/AiOutreachScriptPanel';
import { GoogleSearchConsolePanel } from './components/GoogleSearchConsolePanel';
import { PublicReportView } from './components/PublicReportView';
import { AiKeywordStrategistPanel } from './components/AiKeywordStrategistPanel';
import { getApiUrl } from './utils/api';
import {   Building2, 
  Search, 
  ListOrdered, 
  Users, 
  Sparkles, 
  LayoutDashboard, 
  Gauge, 
  FileCheck, 
  Mail, 
  Globe, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  BookOpen, 
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Cpu,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkle,
  History,
  Check,
  Building,
  Activity,
  Edit2
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bulk-engine' | 'scanner' | 'leads-crm' | 'white-label'>('dashboard');
  
  // Scanned Audits State
  const [scannedAudits, setScannedAudits] = useState<WebsiteAuditReport[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStep, setScanStep] = useState<string>('');
  
  // Single Site Scan Form Inputs
  const [scanUrl, setScanUrl] = useState<string>('');
  const [scanCompanyName, setScanCompanyName] = useState<string>('');
  const [scanAuditType, setScanAuditType] = useState<'Standard' | 'Enterprise' | 'Local'>('Standard');
  const [scanError, setScanError] = useState<string | null>(null);

  // Diagnostic Sub-tabs under scanner
  const [activeReportSubTab, setActiveReportSubTab] = useState<'summary' | 'technical' | 'onpage' | 'competitors' | 'keywords' | 'local' | 'ai-roadmap' | 'outreach' | 'gsc'>('summary');

  // Bulk Engine Campaign Inputs & Progress
  const [bulkListInput, setBulkListInput] = useState<string>(
    "solaris-tech.io\nluxe-apartments.com\ngreen-eats-delivery.co\nprime-legal-group.org\nurban-style-co.uk\nplanochiropractic.com\nbackcaretx.net\nsummitplanospine.com\neliteplanorehab.com"
  );
  const [bulkCampaignName, setCampaignName] = useState<string>("Quarterly Local Acquisition");
  const [bulkCampaignType, setCampaignType] = useState<'Standard' | 'Enterprise' | 'Local'>('Local');
  const [activeBulkJobId, setActiveBulkJobId] = useState<string | null>(null);
  const [bulkJobs, setBulkJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // CRM Leads Database state
  const [crmLeads, setCrmLeads] = useState<CapturedLead[]>([]);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    website: '',
    company: '',
    phone: '',
    notes: ''
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editingLeadStatus, setEditingLeadStatus] = useState<string>('');
  const [editingLeadNotes, setEditingLeadNotes] = useState<string>('');

  // Landing Lead Widget Input (Dashboard client-conversion preview widget)
  const [demoWidgetUrl, setDemoWidgetUrl] = useState<string>('');
  const [demoWidgetEmail, setDemoWidgetEmail] = useState<string>('');
  const [demoWidgetName, setDemoWidgetName] = useState<string>('');
  const [demoWidgetStatus, setDemoWidgetStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [demoWidgetAuditType, setDemoWidgetAuditType] = useState<'Standard' | 'Enterprise' | 'Local'>('Standard');

  // White-Label Settings parameters
  const [whiteLabelSettings, setWhiteLabelSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('SEO_SUITE_WHITE_LABEL_SETTINGS');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          agencyName: parsed.agencyName || 'SEO SUITE',
          logoLetter: parsed.logoLetter || 'S',
          headerThemeColor: parsed.headerThemeColor || '#2563eb',
          customProposalTitle: parsed.customProposalTitle || 'Client Valuation & Digital Performance Audit',
          emailTemplate: parsed.emailTemplate || 'Hello {clientName},\n\nWe recently compiled a professional audit report for {websiteUrl}. It reveals an optimization gap of {deficit}%.\n\nLet me know if you would like to run through the prioritized roadmap together.\n\nBest,\nTeam {agencyName}',
          supportEmail: parsed.supportEmail || 'support@seo-audit-suite.com',
          apiBaseUrl: parsed.apiBaseUrl || ''
        };
      }
    } catch (e) {
      console.warn("Could not load setting overrides:", e);
    }
    return {
      agencyName: 'SEO SUITE',
      logoLetter: 'S',
      headerThemeColor: '#2563eb', // Royal Blue
      customProposalTitle: 'Client Valuation & Digital Performance Audit',
      emailTemplate: 'Hello {clientName},\n\nWe recently compiled a professional audit report for {websiteUrl}. It reveals an optimization gap of {deficit}%.\n\nLet me know if you would like to run through the prioritized roadmap together.\n\nBest,\nTeam {agencyName}',
      supportEmail: 'support@seo-audit-suite.com',
      apiBaseUrl: ''
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('SEO_SUITE_WHITE_LABEL_SETTINGS', JSON.stringify(whiteLabelSettings));
    } catch (e) {
      console.warn("Could not persist setting overrides:", e);
    }
  }, [whiteLabelSettings]);

  // Standalone public report states
  const [isPublicReportView, setIsPublicReportView] = useState(false);
  const [publicReportDomain, setPublicReportDomain] = useState('');
  const [publicReport, setPublicReport] = useState<WebsiteAuditReport | null>(null);
  const [loadingPublicReport, setLoadingPublicReport] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/report/')) {
      const parts = path.split('/');
      const domainVal = parts[parts.length - 1].trim();
      if (domainVal) {
        setIsPublicReportView(true);
        setPublicReportDomain(domainVal);
      }
    }
  }, []);

  // Listen for Google OAuth callback updates from auth popup
  useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      // Allow local or .run.app origins
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        const token = event.data.token;
        localStorage.setItem('google_gsc_token', token);
        // Alert other listening components to fetch new tokens automatically
        window.dispatchEvent(new CustomEvent('gsc_token_updated', { detail: token }));
      }
    };
    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, []);

  useEffect(() => {
    if (isPublicReportView && publicReportDomain) {
      setLoadingPublicReport(true);
      fetch(getApiUrl(`/api/audit/${publicReportDomain}`))
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Report details could not be parsed by browser");
        })
        .then(data => {
          setPublicReport(data);
          setLoadingPublicReport(false);
        })
        .catch(err => {
          console.warn(err);
          setLoadingPublicReport(false);
        });
    }
  }, [isPublicReportView, publicReportDomain]);

  // Synchronously auto-fetch full audit report if focus state lacks detailed metrics
  useEffect(() => {
    if (!selectedAuditId) return;
    const current = scannedAudits.find(aud => aud.domain === selectedAuditId);
    if (current && !current.technical) {
      fetch(getApiUrl(`/api/audit/${selectedAuditId}`))
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Audit has no live representation on server");
        })
        .then(fullReport => {
          setScannedAudits(prev => {
            const exists = prev.some(aud => aud.domain === fullReport.domain);
            if (exists) {
              return prev.map(aud => aud.domain === fullReport.domain ? fullReport : aud);
            } else {
              return [fullReport, ...prev];
            }
          });
        })
        .catch(err => {
          console.warn("Could not retrieve full detailed metrics on demand", err);
        });
    }
  }, [selectedAuditId, scannedAudits]);

  // Fetch initial scanned audits list and CRM leads
  useEffect(() => {
    fetchAuditedList();
    fetchLeadsList();
    fetchBulkCampaigns();
  }, []);

  const fetchAuditedList = async (targetToSelect?: string) => {
    try {
      const res = await fetch(getApiUrl('/api/audited-list'));
      const data = await res.json();
      setScannedAudits(data);
      if (targetToSelect) {
        setSelectedAuditId(targetToSelect);
      } else if (data.length > 0 && !selectedAuditId) {
        setSelectedAuditId(data[0].domain);
      }
    } catch (e) {
      console.error("Could not fetch audited websites list", e);
    }
  };

  const fetchLeadsList = async () => {
    try {
      const res = await fetch(getApiUrl('/api/leads'));
      const data = await res.json();
      setCrmLeads(data);
    } catch (e) {
      console.error("Could not fetch CRM leads", e);
    }
  };

  const fetchBulkCampaigns = async () => {
    try {
      const res = await fetch(getApiUrl('/api/bulk-jobs'));
      const data = await res.json();
      setBulkJobs(data);
      if (data.length > 0 && !selectedJob) {
        const detailRes = await fetch(getApiUrl(`/api/bulk-audit/${data[0].id}`));
        const detailData = await detailRes.json();
        setSelectedJob(detailData);
      }
    } catch (e) {
      console.warn("Could not retrieve bulk jobs:", e);
    }
  };

  // Poll bulk job status if active
  useEffect(() => {
    if (!activeBulkJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl(`/api/bulk-audit/${activeBulkJobId}`));
        const data = await res.json();
        
        // Update both list array and selected element
        setSelectedJob(data);
        setBulkJobs(prev => prev.map(job => job.id === activeBulkJobId ? {
          ...job,
          processedCount: data.processedCount,
          status: data.status,
          completedAt: data.completedAt
        } : job));

        if (data.status === 'completed') {
          setActiveBulkJobId(null);
          fetchAuditedList(); // Refresh audits index as brand-new reports were seeded
        }
      } catch (err) {
        console.error("Failed polling job state:", err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeBulkJobId]);

  // Launch a new single site scan audit
  const handleLaunchSingleScan = async (urlName: string, company: string, type: 'Standard' | 'Enterprise' | 'Local') => {
    if (!urlName) return;
    setIsScanning(true);
    setScanProgress(5);
    setScanStep('Initializing crawl spiders...');
    setScanError(null);

    // Fake visual ticker for granular feedback
    const timers = [
      setTimeout(() => { setScanProgress(20); setScanStep('Crawling subfolders metadata...'); }, 600),
      setTimeout(() => { setScanProgress(45); setScanStep('Extracting heading tags and checking SSL HTTPS parameters...'); }, 1200),
      setTimeout(() => { setScanProgress(68); setScanStep('Mapping keyword density & parsing NLP authority entities...'); }, 2000),
      setTimeout(() => { setScanProgress(85); setScanStep('Connecting Gemini AI recommendation engines...'); }, 2800),
    ];

    try {
      const response = await fetch(getApiUrl('/api/audit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: urlName, 
          companyName: company, 
          auditType: type 
        })
      });
      
      timers.forEach(t => clearTimeout(t));

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error || `Server responded with status ${response.status} (${response.statusText || 'Unknown Connection Issue'})`);
      }
      
      const finishedReport = await response.json();
      
      if (!finishedReport || finishedReport.error || !finishedReport.domain) {
        throw new Error(finishedReport?.error || 'Completed audit returned invalid dataset details');
      }
      
      setScanProgress(100);
      setScanStep('Report fully built!');
      
      // Inject to local reports array if not duplicated
      setScannedAudits(prev => {
        const exists = prev.some(aud => aud.domain === finishedReport.domain);
        if (exists) {
          return prev.map(aud => aud.domain === finishedReport.domain ? finishedReport : aud);
        } else {
          return [finishedReport, ...prev];
        }
      });

      setSelectedAuditId(finishedReport.domain);
      
      setTimeout(() => {
        setIsScanning(false);
        setActiveTab('scanner');
        setActiveReportSubTab('summary');
      }, 500);

    } catch (err: any) {
      console.error("Crawl process errored out", err);
      timers.forEach(t => clearTimeout(t));
      setScanError(err?.message || "An unexpected network error occurred while crawling target website.");
      setIsScanning(false);
    }
  };

  // Launch demographic preview lead capture crawler widget
  const handleDemoWidgetScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoWidgetUrl || !demoWidgetEmail) return;
    
    setDemoWidgetStatus('scanning');
    
    // 1. Instantly register lead in backend CRM
    try {
      const leadRes = await fetch(getApiUrl('/api/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: demoWidgetName || 'Organic Landing Prospect',
          email: demoWidgetEmail,
          website: demoWidgetUrl,
          overallScore: 54 // Placeholder average
        })
      });
      const newLead = await leadRes.json();
      setCrmLeads(prev => [newLead, ...prev]);
    } catch {
      console.warn("Could not write dynamic prospect lead");
    }

    // 2. Launch single scan immediately
    await handleLaunchSingleScan(demoWidgetUrl, demoWidgetName || demoWidgetUrl.split('.')[0], demoWidgetAuditType);
    setDemoWidgetUrl('');
    setDemoWidgetEmail('');
    setDemoWidgetName('');
    setDemoWidgetStatus('idle');
  };

  // Launch a thousands bulk campaign processing job
  const handleStartBulkCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkListInput.split('\n').map(u => u.trim()).filter(u => u !== '');
    if (urls.length === 0) return;

    try {
      const response = await fetch(getApiUrl('/api/bulk-audit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listName: bulkCampaignName,
          urls: urls,
          auditType: bulkCampaignType
        })
      });
      const data = await response.json();
      
      setActiveBulkJobId(data.jobId);
      setSelectedJob(data.job);
      setBulkJobs(prev => [data.job, ...prev]);
    } catch (err) {
      console.error("Could not compile bulk campaigns payload", err);
    }
  };

  // Add lead manually into the CRM Database
  const handleAddNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.email || !newLeadForm.website) return;

    try {
      const res = await fetch(getApiUrl('/api/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadForm.name,
          email: newLeadForm.email,
          website: newLeadForm.website,
          company: newLeadForm.company,
          phone: newLeadForm.phone,
          overallScore: Math.floor(Math.random() * 40) + 45
        })
      });
      const data = await res.json();
      
      setCrmLeads(prev => [data, ...prev]);
      setNewLeadForm({ name: '', email: '', website: '', company: '', phone: '', notes: '' });
    } catch (err) {
      console.error("Failed adding CRM Lead:", err);
    }
  };

  // Update Status / Notes of a CRM lead
  const handleUpdateLeadStatus = async (statusVal: string, notesVal: string) => {
    if (!selectedLeadId) return;

    try {
      const res = await fetch(getApiUrl(`/api/leads/${selectedLeadId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal, notes: notesVal })
      });
      const updated = await res.json();
      
      setCrmLeads(prev => prev.map(lead => lead.id === selectedLeadId ? updated : lead));
    } catch (err) {
      console.error("Failed updating lead pipeline", err);
    }
  };

  // Delete a CRM Lead
  const handleDeleteLead = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/leads/${id}`), { method: 'DELETE' });
      setCrmLeads(prev => prev.filter(lead => lead.id !== id));
      if (selectedLeadId === id) setSelectedLeadId(null);
    } catch (err) {
      console.error("Failed deleting lead record", err);
    }
  };

  // Fetch specific selected job detail row
  const handleSelectJob = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/bulk-audit/${id}`));
      const data = await res.json();
      setSelectedJob(data);
    } catch (err) {
      console.error("Failed loading job list item inline detail:", err);
    }
  };

  // Fetch individual report directly on demand from list
  const activeReport = scannedAudits.find(aud => aud.domain === selectedAuditId);

  // Computed dashboard statistics helper
  const meanHealthScore = scannedAudits.length > 0 
    ? Math.round(scannedAudits.reduce((acc, cr) => acc + (cr.overallScore || 0), 0) / scannedAudits.length)
    : 72;

  const leadCountToday = crmLeads.filter(l => l.status === 'New').length;
  const closedDeals = crmLeads.filter(l => l.status === 'Closed Won').length * 2500;

  if (isPublicReportView) {
    if (loadingPublicReport) {
      return (
        <div id="public-report-loading" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-bold font-mono text-slate-550 uppercase tracking-widest animate-pulse">Assembling Enterprise Audit View...</p>
        </div>
      );
    }
    if (publicReport) {
      return (
        <PublicReportView 
          report={publicReport}
          agencyName={whiteLabelSettings.agencyName}
          logoLetter={whiteLabelSettings.logoLetter}
          themeColor={whiteLabelSettings.headerThemeColor}
        />
      );
    }
    return (
      <div id="public-report-error" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
        <h3 className="text-lg font-bold font-display text-slate-900">404 - Audit Data Missing</h3>
        <p className="text-xs text-slate-500 max-w-sm">No recorded search performance logs present for domain <strong className="text-slate-800">{publicReportDomain}</strong>.</p>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-500 transition cursor-pointer"
        >
          Return to SUITE HQ Command
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR MAIN MENU NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 no-print">
        
        {/* Brand identity */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: whiteLabelSettings.headerThemeColor }}
          >
            {whiteLabelSettings.logoLetter}
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-tight text-lg text-slate-900 leading-none">
              {whiteLabelSettings.agencyName}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mt-0.5 font-bold">
              Agency Suite
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold mb-3 ml-2.5">
            HQ Command
          </div>

          {/* Tab buttons */}
          <button
            type="button"
            id="nav-dashboard-tab"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-50/70 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 font-bold border-l-3 border-indigo-600' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            Control Dashboard
          </button>

          <button
            type="button"
            id="nav-bulk-engine-tab"
            onClick={() => setActiveTab('bulk-engine')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${activeTab === 'bulk-engine' ? 'bg-indigo-50/70 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 font-bold border-l-3 border-indigo-600' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Layers className="w-4 h-4 text-slate-400" />
            Bulk Campaigns Engine
          </button>

          <button
            type="button"
            id="nav-scanner-tab"
            onClick={() => {
              setActiveTab('scanner');
              if (scannedAudits.length > 0 && !selectedAuditId) {
                setSelectedAuditId(scannedAudits[0].domain);
              }
            }}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${activeTab === 'scanner' ? 'bg-indigo-50/70 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 font-bold border-l-3 border-indigo-600' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            Site Audit Scanner
          </button>

          <button
            type="button"
            id="nav-leads-crm-tab"
            onClick={() => setActiveTab('leads-crm')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${activeTab === 'leads-crm' ? 'bg-indigo-50/70 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 font-bold border-l-3 border-indigo-600' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Users className="w-4 h-4 text-slate-400" />
            Lead Capture CRM
            {leadCountToday > 0 && (
              <span className="ml-auto bg-emerald-500 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                {leadCountToday}
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-white-label-tab"
            onClick={() => setActiveTab('white-label')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${activeTab === 'white-label' ? 'bg-indigo-50/70 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 font-bold border-l-3 border-indigo-600' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            White-Label Settings
          </button>
        </nav>

        {/* Bottom Campaign Stats card */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
            <div className="text-[10px] text-slate-450 uppercase font-mono tracking-widest font-bold">
              Bulk Processing Flow
            </div>
            <div className="text-xl font-bold font-sans">
              842 / <span className="text-slate-500 text-sm font-normal">1,000 processed</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full w-[84.2%]" />
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              Quota active: Enterprise Tier Pro
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold font-display text-slate-900">
              {activeTab === 'dashboard' && 'Enterprise SEO Control Dashboard'}
              {activeTab === 'bulk-engine' && 'Campaign Bulk Crawler Engine'}
              {activeTab === 'scanner' && 'Domain Crawler Audit Dashboard'}
              {activeTab === 'leads-crm' && 'Organic Conversion Leads CRM'}
              {activeTab === 'white-label' && 'White-Label Branding configs'}
            </h1>
            <div className="flex gap-2">
              <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider shadow-2xs">
                Live Crawler Node
              </span>
              <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider shadow-2xs">
                Gemini 3.5 Core Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick single-scan launcher model trigger */}
            <button 
              type="button"
              onClick={() => {
                setActiveTab('scanner');
                // Auto focus input
                setTimeout(() => {
                  const el = document.getElementById('quick-site-input');
                  if (el) el.focus();
                }, 200);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              + Run Audit Proposal
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center font-bold text-slate-650 text-xs shadow-2xs font-mono uppercase tracking-widest cursor-pointer">
              {whiteLabelSettings.logoLetter}
            </div>
          </div>
        </header>

        {/* Live Crawler Loading Screen */}
        {isScanning && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-[9999] p-6 text-center">
            <div className="space-y-6 max-w-md">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-500/35 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <Sparkle className="w-8 h-8 text-indigo-400 animate-pulse absolute" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-medium tracking-tight">Compiling Deep Core Audit Metadata</h3>
                <div className="bg-slate-800 text-indigo-300 rounded px-3 py-1 font-mono text-xs inline-block max-w-full truncate">
                  {scanStep}
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Progress Score: {scanProgress}%</span>
                <span>Thread active #3</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT VIEW PANELS */}
        <div className="p-6 md:p-8 flex-1 space-y-8 overflow-y-auto">
          
          {/* CONTROL DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div id="dashboard-tab-content" className="space-y-8 animate-fade-in">
              
              {/* Upper Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5 hover:shadow-md transition">
                  <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider font-bold">Health Score Avg</span>
                  <div className="text-2xl font-bold text-slate-900 font-display flex items-baseline gap-1 mt-0.5">
                    {meanHealthScore}<span className="text-slate-400 text-sm font-normal">/100</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Across {scannedAudits.length} scanned properties</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5 hover:shadow-md transition">
                  <span className="text-rose-600 text-[10px] font-mono uppercase tracking-wider font-bold">Unsolved Gaps Detected</span>
                  <div className="text-2xl font-bold text-rose-600 font-display mt-0.5">
                    {scannedAudits.length * 4} Critical
                  </div>
                  <p className="text-[10px] text-slate-500">Awaiting pitch proposal pdf launch</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5 hover:shadow-md transition">
                  <span className="text-emerald-500 text-[10px] font-mono uppercase tracking-wider font-bold">Unclaimed Leads Pipeline</span>
                  <div className="text-2xl font-bold text-emerald-600 font-display mt-0.5">
                    {crmLeads.length} Capture(s)
                  </div>
                  <p className="text-[10px] text-slate-500">Instant CRM retention active</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-1.5 hover:shadow-md transition">
                  <span className="text-slate-450 text-[10px] font-mono uppercase tracking-wider font-bold">Secured Retainers</span>
                  <div className="text-2xl font-bold text-slate-900 font-display mt-0.5">
                    ${closedDeals.toLocaleString()} <span className="text-emerald-600 text-xs font-semibold font-mono">+12%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Calculated value of Closed Won</p>
                </div>
              </div>

              {/* Main row: Lead Acquisition form & Scanned Properties List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Real-time Website SEO & Core Web Vitals Audit Widget */}
                <div className="lg:col-span-4 bg-gradient-to-b from-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-550/20 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <span className="bg-indigo-500/25 text-indigo-300 font-mono text-[9px] px-2.5 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest font-bold flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Live Website Audit Widget
                    </span>
                    <h3 className="text-lg font-display font-semibold tracking-tight leading-snug">
                      Audit Your Website Instantly
                    </h3>
                    <p className="text-indigo-200 text-xs leading-relaxed font-normal">
                      Enter your website details below to perform a live, comprehensive SEO audit. We will capture core metrics, crawl your page structure, and generate custom AI-driven recommendations in real-time.
                    </p>
                  </div>

                  {/* HTML CRM Live Client acquisition Form */}
                  <form onSubmit={handleDemoWidgetScan} className="space-y-3.5 mt-6 border-t border-indigo-900 pt-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-indigo-300 font-bold mb-1.5">Your Website URL / Domain</label>
                      <input 
                        type="text" 
                        placeholder="e.g. yourbusiness.com" 
                        required
                        value={demoWidgetUrl}
                        onChange={(e) => setDemoWidgetUrl(e.target.value)}
                        className="w-full bg-indigo-900/60 border border-indigo-800 focus:border-indigo-500 focus:outline-none transition rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-indigo-300 font-bold mb-1.5">Company / Business Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My Business Corp" 
                        value={demoWidgetName}
                        onChange={(e) => setDemoWidgetName(e.target.value)}
                        className="w-full bg-indigo-900/60 border border-indigo-800 focus:border-indigo-500 focus:outline-none transition rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-indigo-300 font-bold mb-1.5">Your Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. you@yourbusiness.com" 
                        required
                        value={demoWidgetEmail}
                        onChange={(e) => setDemoWidgetEmail(e.target.value)}
                        className="w-full bg-indigo-900/60 border border-indigo-800 focus:border-indigo-500 focus:outline-none transition rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-indigo-300 font-bold mb-1.5">Audit Scope & Level</label>
                      <select 
                        value={demoWidgetAuditType}
                        onChange={(e) => setDemoWidgetAuditType(e.target.value as 'Standard' | 'Enterprise' | 'Local')}
                        className="w-full bg-indigo-900/60 border border-indigo-800 focus:border-indigo-500 focus:outline-none transition rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                      >
                        <option value="Standard" className="bg-indigo-950 text-white">Standard Technical & SEO Audit</option>
                        <option value="Enterprise" className="bg-indigo-950 text-white">Enterprise Deep Search Audit</option>
                        <option value="Local" className="bg-indigo-950 text-white">Local SEO Citation Audit</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-950/45 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Run Free SEO Audit
                    </button>
                  </form>
                </div>

                {/* Scanned Web Properties List */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-slate-850 font-display text-sm">Active Auditor Work-Stream</h3>
                      <p className="text-xs text-slate-450 font-sans">Showing last 5 compiled SEO evaluation reports</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
                      {Math.min(5, scannedAudits.length)} of {scannedAudits.length} Properties
                    </span>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold">
                          <th className="px-6 py-3.5">Domain Website</th>
                          <th className="px-6 py-3.5 text-center">Score</th>
                          <th className="px-6 py-3.5">Client Label</th>
                          <th className="px-6 py-3.5">Tier</th>
                          <th className="px-6 py-3.5">Scan Date</th>
                          <th className="px-6 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-100 font-sans">
                        {scannedAudits.slice(0, 5).map((aud) => {
                          const isWorse = aud.overallScore < 60;
                          return (
                            <tr key={aud.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-900 block truncate max-w-[200px]">{aud.domain}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{aud.companyName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${isWorse ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                  {aud.overallScore}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-650 font-medium font-sans">
                                {aud.companyName}
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {aud.auditType || 'Standard'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                                {new Date(aud.generatedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setSelectedAuditId(aud.domain);
                                    setActiveTab('scanner');
                                    setActiveReportSubTab('summary');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-500 font-bold transition px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-[10px]"
                                >
                                  View / Pitch Report →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* BULK CRAWLER CAMPAIGNS ENGINE */}
          {activeTab === 'bulk-engine' && (
            <div id="bulk-engine-tab-content" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Setup Panel (Left Column) */}
                <form onSubmit={handleStartBulkCampaign} className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 font-display text-sm">Launch Mass Bulk Audit Campaign</h3>
                    <p className="text-xs text-slate-500">
                      Instantly generate reports across thousands of local businesses. Add your directory listing targets below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">Campaign Branding Name</label>
                    <input 
                      type="text" 
                      required
                      value={bulkCampaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Plano TX Chiropractors Campaign"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white rounded-xl px-3.5 py-2.5 text-xs transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">Campaign Audit Type</label>
                      <select 
                        value={bulkCampaignType}
                        onChange={(e: any) => setCampaignType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white rounded-xl px-3 py-2 text-xs transition"
                      >
                        <option value="Standard">Standard Multi-Pass</option>
                        <option value="Local">Local Brick & Mortar</option>
                        <option value="Enterprise font-semibold">Enterprise Crawl</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">Target Scope</label>
                      <div className="bg-indigo-50 border border-indigo-100 text-indigo-750 p-2 text-center rounded-xl text-[10px] font-mono leading-tight">
                        Active capacity:<br /><strong>Up to 5,000 domains</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-800">Target Domain List (One Website per Line)</label>
                      <span className="text-[10px] font-mono text-indigo-650 font-bold">
                        {bulkListInput.split('\n').filter(u => u.trim() !== '').length} Websites Detected
                      </span>
                    </div>
                    <textarea 
                      placeholder="solaris-tech.io&#10;luxe-apartments.com&#10;green-eats-delivery.co..." 
                      rows={6}
                      required
                      value={bulkListInput}
                      onChange={(e) => setBulkListInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      You can paste hundreds of URLs straight from business database CSVs such as Yelp or Apollo lists.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={activeBulkJobId !== null}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-350 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-indigo-200 active:scale-[0.98] cursor-pointer"
                  >
                    {activeBulkJobId ? "Campaign Audit Active in Queue..." : "⚡ Run Live Search Audit Campaign"}
                  </button>
                </form>

                {/* Progress Tracking Workspace (Right Column) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Active Live Pipeline detail */}
                  {selectedJob ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-0.5">
                          <span className="inline-block text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                            Campaign Progress Monitor
                          </span>
                          <h4 className="font-bold text-slate-850 font-display text-sm">{selectedJob.name}</h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {selectedJob.status === 'processing' ? (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Running...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-250">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Campaign Complete
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Processing Reports Matrix Status</span>
                          <span className="font-mono font-bold text-slate-900">
                            {selectedJob.processedCount} / {selectedJob.totalCount} ({Math.round((selectedJob.processedCount / selectedJob.totalCount) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(selectedJob.processedCount / selectedJob.totalCount) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Items Grid Pipeline */}
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedJob.items.map((item: any, idx: number) => {
                          return (
                            <div key={idx} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                                <span className="font-mono font-semibold text-slate-800">{item.url}</span>
                              </div>

                              <div className="flex items-center gap-4">
                                {item.status === 'completed' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-mono">
                                      Score: {item.score}%
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={async () => {
                                        // Format domain using consistent cleanDomainName rules
                                        const cleanedK = item.url
                                          .replace(/^https?:\/\//i, '')
                                          .replace(/www\./i, '')
                                          .split('/')[0]
                                          .split('?')[0]
                                          .replace(/\.+$/, '')
                                          .trim()
                                          .toLowerCase();
                                        
                                        // Refresh scannedAudits from the server with the explicit target to select
                                        await fetchAuditedList(cleanedK);
                                        setActiveTab('scanner');
                                        setActiveReportSubTab('summary');
                                      }}
                                      className="text-indigo-600 hover:text-indigo-500 font-extrabold text-[10.5px] cursor-pointer"
                                    >
                                      Load Audit Report
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-amber-600 capitalize font-medium animate-pulse">{item.status}...</span>
                                    <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-amber-500 h-1.5 rounded-full animate-pulse" style={{ width: `${item.progress}%` }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 space-y-2">
                      <Layers className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs">Select or initiate a Campaign on the left to monitor progress indicators live.</p>
                    </div>
                  )}

                  {/* Historic Campaigns table */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 font-display text-xs">Campaign History</h3>
                    <div className="divide-y divide-slate-100">
                      {bulkJobs.map((job) => (
                        <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span 
                              onClick={() => handleSelectJob(job.id)}
                              className="font-semibold text-indigo-700 hover:text-indigo-650 cursor-pointer hover:underline block text-xs"
                            >
                              {job.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans block block mt-0.5">
                              {job.totalCount} domains • {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                          <span className={`inline-block px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md tracking-wider border ${job.status === 'completed' ? 'border-emerald-250 bg-emerald-50 text-emerald-800' : 'border-amber-250 bg-amber-50 text-amber-800'}`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* SITE SCANNER CRAWLER VIEW */}
          {activeTab === 'scanner' && (
            <div id="scanner-tab-content" className="space-y-8 animate-fade-in">
              
              {/* Launcher/Switcher upper bar */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between no-print">
                <div className="w-full md:w-auto flex items-center gap-3">
                  <div className="text-slate-450 uppercase font-mono tracking-wider font-extrabold text-[11px] shrink-0">
                    Active Target:
                  </div>
                  <select 
                    value={selectedAuditId}
                    onChange={(e) => setSelectedAuditId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium cursor-pointer max-w-sm"
                  >
                    {scannedAudits.map(aud => (
                      <option key={aud.domain} value={aud.domain}>
                        {aud.domain} ({aud.companyName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instant search crawling inputs form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLaunchSingleScan(scanUrl, scanCompanyName, scanAuditType);
                  }}
                  className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end"
                >
                  <input 
                    type="text" 
                    id="quick-site-input"
                    placeholder="Search Website Domain... (e.g. stoicfits.io)" 
                    required
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    className="bg-slate-50 border border-slate-200 font-mono focus:border-indigo-500 focus:outline-none focus:bg-white rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 flex-1 md:flex-initial"
                  />
                  <input 
                    type="text" 
                    placeholder="Company Name (Optional)" 
                    value={scanCompanyName}
                    onChange={(e) => setScanCompanyName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 flex-1 md:flex-initial"
                  />
                  <select 
                    value={scanAuditType}
                    onChange={(e: any) => setScanAuditType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Local">Local</option>
                  </select>
                  <button 
                    type="submit"
                    className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Crawl Website →
                  </button>
                </form>
              </div>

              {scanError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl flex items-start justify-between font-medium text-xs shadow-xs no-print gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-rose-950 mb-0.5">Scan Processing Error</strong>
                      <span className="text-rose-700 font-mono text-[11px] font-medium leading-relaxed">{scanError}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setScanError(null)}
                    className="text-rose-450 hover:text-rose-600 font-bold cursor-pointer text-lg px-2 shrink-0 select-none"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Reports view workspace */}
              {activeReport ? (
                <div className="space-y-6">
                  
                  {/* Category sub-navigation bar */}
                  <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none pb-0 px-2 no-print">
                    <button
                      type="button"
                      onClick={() => setActiveReportSubTab('summary')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'summary' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-505 hover:text-slate-800'}`}
                    >
                      Executive Valuation Summary
                    </button>
                    <button
                      type="button"
                      id="report-tech-tab"
                      onClick={() => setActiveReportSubTab('technical')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'technical' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-505 hover:text-slate-800'}`}
                    >
                      Technical Audit Index
                    </button>
                    <button
                      type="button"
                      id="report-onpage-tab"
                      onClick={() => setActiveReportSubTab('onpage')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'onpage' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-502 hover:text-slate-800'}`}
                    >
                      On-Page Content & Metas
                    </button>
                    <button
                      type="button"
                      id="report-competitors-tab"
                      onClick={() => setActiveReportSubTab('competitors')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'competitors' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-552 hover:text-slate-800'}`}
                    >
                      Competitor Link Deficit
                    </button>
                    <button
                      type="button"
                      id="report-keywords-tab"
                      onClick={() => setActiveReportSubTab('keywords')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'keywords' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-552 hover:text-slate-800'}`}
                    >
                      🔑 AI Keyword Strategist
                    </button>
                    <button
                      type="button"
                      id="report-local-tab"
                      onClick={() => setActiveReportSubTab('local')}
                      className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'local' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-552 hover:text-slate-800'}`}
                    >
                      Local Map SEO
                    </button>
                    <button
                      type="button"
                      id="report-ai-roadmap-tab"
                      onClick={() => setActiveReportSubTab('ai-roadmap')}
                      className={`px-4 py-2.5 text-xs font-semibold bg-indigo-50/50 hover:bg-indigo-50 rounded-t-xl whitespace-nowrap transition border-b-2 cursor-pointer ${activeReportSubTab === 'ai-roadmap' ? 'border-indigo-650 text-indigo-700 font-bold' : 'border-transparent text-indigo-700'}`}
                    >
                      ★ Prioritized AI Fix Roadmap
                    </button>
                    <button
                      type="button"
                      id="report-ai-outreach-tab"
                      onClick={() => setActiveReportSubTab('outreach')}
                      className={`px-4 py-2.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-t-xl whitespace-nowrap transition border-b-2 cursor-pointer border-transparent ${activeReportSubTab === 'outreach' ? 'border-emerald-600 font-extrabold text-emerald-800' : ''}`}
                    >
                      ✉ AI Outreach Marketing Script
                    </button>
                    <button
                      type="button"
                      id="report-gsc-tab"
                      onClick={() => setActiveReportSubTab('gsc')}
                      className={`px-4 py-2.5 text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-t-xl whitespace-nowrap transition border-b-2 cursor-pointer border-transparent ${activeReportSubTab === 'gsc' ? 'border-blue-600 font-extrabold text-blue-850' : ''}`}
                    >
                      📈 Google Search Console (Live)
                    </button>
                  </div>

                  {/* Render targeted panels */}
                  <div className="space-y-6">
                    {activeReportSubTab === 'summary' && <ExecutiveSummaryPanel report={activeReport} />}
                    {activeReportSubTab === 'technical' && <TechnicalSeoPanel report={activeReport} />}
                    {activeReportSubTab === 'onpage' && <OnPageSeoPanel report={activeReport} />}
                    {activeReportSubTab === 'competitors' && <CompetitorGapPanel report={activeReport} />}
                    {activeReportSubTab === 'keywords' && <AiKeywordStrategistPanel report={activeReport} />}
                    {activeReportSubTab === 'local' && <LocalSeoPanel report={activeReport} />}
                    {activeReportSubTab === 'ai-roadmap' && <AiRoadmapPanel report={activeReport} />}
                    {activeReportSubTab === 'outreach' && <AiOutreachScriptPanel report={activeReport} />}
                    {activeReportSubTab === 'gsc' && <GoogleSearchConsolePanel report={activeReport} />}
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Globe className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-800 font-display">No target property crawled yet</h4>
                  <p className="text-xs max-w-sm mx-auto">
                    Type a business details and click "Crawl Website" above, or launch a free widget scan from the Dashboard.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* LEAD CAPTURE CRM VIEW */}
          {activeTab === 'leads-crm' && (
            <div id="leads-crm-tab-content" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CRM Leads Database (Left Column - 8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                    <div className="space-y-0.5">
                      <h3 className="font-bold font-display text-slate-900 text-sm">Organic CRM Capture Registry</h3>
                      <p className="text-xs text-slate-450">Manage dynamic lead pipelines and prospect communication logs</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100 font-bold">
                          <th className="px-5 py-3.5">Lead Prospect</th>
                          <th className="px-5 py-3.5">Website Domain</th>
                          <th className="px-5 py-3.5 text-center">Audit Score</th>
                          <th className="px-5 py-3.5">Status Pipeline</th>
                          <th className="px-5 py-3.5">Captured Date</th>
                          <th className="px-5 py-3.5 text-right">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-100 font-sans">
                        {crmLeads.map((lead) => {
                          const isNew = lead.status === 'New';
                          return (
                            <tr 
                              key={lead.id} 
                              className={`hover:bg-slate-50/50 transition cursor-pointer ${selectedLeadId === lead.id ? 'bg-indigo-50/40' : ''}`}
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setEditingLeadStatus(lead.status);
                                setEditingLeadNotes(lead.notes || '');
                              }}
                            >
                              <td className="px-5 py-3.5">
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-900 block">{lead.name}</span>
                                  <span className="text-[10px] text-slate-450 block font-mono">{lead.email}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-indigo-700 font-semibold">{lead.website}</span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-bold font-mono">
                                {lead.overallScore ? (
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                    {lead.overallScore}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-bold border ${
                                  lead.status === 'New' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  lead.status === 'Contacted' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  lead.status === 'Proposal Sent' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                  lead.status === 'Closed Won' ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-extrabold shadow-2xs' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px]">
                                {new Date(lead.dateCaptured).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3.5 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CRM Right column detailing select logs & manuals additions */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Prospect pipelines settings editor */}
                  {selectedLeadId ? (() => {
                    const activeLead = crmLeads.find(l => l.id === selectedLeadId);
                    if (!activeLead) return null;
                    const deficit = 100 - (activeLead.overallScore || 54);

                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                          <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider">Configure Prospect Pipeline</h4>
                          <span className="text-[10px] text-slate-450 font-mono">ID: {activeLead.id}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[11px] font-mono uppercase text-slate-400">Target Business Context</span>
                          <p className="text-sm font-semibold text-slate-800">{activeLead.company || 'Not Specified'}</p>
                          <p className="text-xs text-slate-500 font-mono">{activeLead.website} ({activeLead.email})</p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="block text-xs font-semibold text-slate-800">Pipeline Status</label>
                          <select 
                            value={editingLeadStatus}
                            onChange={(e) => {
                              setEditingLeadStatus(e.target.value);
                              handleUpdateLeadStatus(e.target.value, editingLeadNotes);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white"
                          >
                            <option value="New">New / Unclaimed</option>
                            <option value="Contacted">Active Contacted</option>
                            <option value="Proposal Sent">Proposal Valuation Sent</option>
                            <option value="Closed Won">Closed Won Retention</option>
                            <option value="Archived animate-pulse">Archived</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-800">Internal Agency Notes</label>
                          <textarea 
                            rows={3}
                            value={editingLeadNotes}
                            onChange={(e) => setEditingLeadNotes(e.target.value)}
                            placeholder="Add phone summaries, requested scopes, contract values..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleUpdateLeadStatus(editingLeadStatus, editingLeadNotes)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 mt-2 ml-auto cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save Pipeline Settings
                          </button>
                        </div>

                        {/* Automated pitch copy triggers */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl text-xs space-y-3 pt-3.5 border border-dashed rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-mono text-indigo-650 font-extrabold">Proposed Sales Email copy</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const bodyText = whiteLabelSettings.emailTemplate
                                  .replace('{clientName}', activeLead.name)
                                  .replace('{websiteUrl}', activeLead.website)
                                  .replace('{deficit}', deficit.toString())
                                  .replace('{agencyName}', whiteLabelSettings.agencyName);
                                navigator.clipboard.writeText(bodyText);
                                alert("Pitch Copied into Clipboard!");
                              }}
                              className="text-indigo-600 hover:text-indigo-500 font-bold text-[10px] cursor-pointer"
                            >
                              Copy Pitch
                            </button>
                          </div>
                          
                          <p className="text-[11px] text-slate-650 font-sans italic bg-white dark:bg-slate-900 border border-slate-100 p-2.5 rounded-lg max-h-[140px] overflow-y-auto leading-relaxed">
                            {whiteLabelSettings.emailTemplate
                              .replace('{clientName}', activeLead.name)
                              .replace('{websiteUrl}', activeLead.website)
                              .replace('{deficit}', deficit.toString())
                              .replace('{agencyName}', whiteLabelSettings.agencyName)
                            }
                          </p>

                          <div className="flex gap-2">
                            <button 
                              type="button" 
                              onClick={() => {
                                handleLaunchSingleScan(activeLead.website, activeLead.company || activeLead.name, 'Standard');
                              }}
                              className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 text-[11px] font-bold py-1.5 rounded-lg cursor-pointer transition text-center block"
                            >
                              Analyze Landing report
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400 text-xs">
                      <Users className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                      Select a Lead row in the CRM list to edit statuses, add phone notes, and copy custom automated sales pitches.
                    </div>
                  )}

                  {/* Manual addition of Leads registry form */}
                  <form onSubmit={handleAddNewLead} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 font-display text-xs uppercase font-mono tracking-wider border-b border-slate-50 pb-2 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      Register Manual Business Lead
                    </h4>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-450 font-bold mb-1">Company / Entity Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Plano Back Specialists"
                          value={newLeadForm.company}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-450 font-bold mb-1">Contact Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. Collins"
                            value={newLeadForm.name}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-450 font-bold mb-1">Contact Email</label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. collins@backcare.org"
                            value={newLeadForm.email}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-450 font-bold mb-1">Business Website</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. alignedplano.org"
                            value={newLeadForm.website}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, website: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-450 font-bold mb-1">Phone (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. +1 512-555-0199"
                            value={newLeadForm.phone}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs transition"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        ✓ Capture & Append registry
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* WHITE-LABEL BRANDING SETTINGS VIEW */}
          {activeTab === 'white-label' && (
            <div id="white-label-tab-content" className="space-y-6 animate-fade-in">
              <div className="max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 font-display text-sm">White-Label Branding Configurator</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Establish custom styles. All generated client audit reports and PDF printouts will enforce these designated branding criteria.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">Agency Custom Brand Name</label>
                      <input 
                        type="text"
                        value={whiteLabelSettings.agencyName}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, agencyName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">Agency Avatar Icon Letter</label>
                      <input 
                        type="text"
                        maxLength={2}
                        value={whiteLabelSettings.logoLetter}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, logoLetter: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs transition text-center font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">Theme Primary Accent hex</label>
                      <div className="flex gap-3">
                        <input 
                          type="color"
                          value={whiteLabelSettings.headerThemeColor}
                          onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, headerThemeColor: e.target.value })}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={whiteLabelSettings.headerThemeColor}
                          onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, headerThemeColor: e.target.value })}
                          className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">Agency Support Email Address</label>
                      <input 
                        type="email"
                        value={whiteLabelSettings.supportEmail}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, supportEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">API Server Endpoint Override (Optional)</label>
                      <input 
                        type="text"
                        placeholder="E.g., https://your-server-backend.com"
                        value={whiteLabelSettings.apiBaseUrl || ''}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, apiBaseUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs transition font-mono border-dashed"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1 leading-normal">
                        Configure this when deploying a standalone headless client (e.g. on Cloudflare Workers/Pages) pointing requests to your Node VPS or Cloud Run API. Leave empty for dynamic relative paths.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-850 mb-1.5">Custom Proposal Subtitle Text</label>
                      <input 
                        type="text"
                        value={whiteLabelSettings.customProposalTitle}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, customProposalTitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs transition"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-850">Prospect Outreach Email Template</label>
                        <span className="text-[10px] font-mono text-slate-400">Variables: {'{clientName}, {websiteUrl}, {deficit}'}</span>
                      </div>
                      <textarea 
                        rows={6}
                        value={whiteLabelSettings.emailTemplate}
                        onChange={(e) => setWhiteLabelSettings({ ...whiteLabelSettings, emailTemplate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-sans transition"
                      />
                    </div>
                  </div>

                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      alert("White label branding parameters active! Check the Sidebar and main summary headers to see styling modifications.");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
                  >
                    ✓ Lock Branding Values
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ENTERPRISE DOCK FOOTER */}
        <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight font-mono">
                API Channels Connected: Cloudflare Global Edge Mappings
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight font-mono">
              System CPU Load: 12%
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            Enterprise Agency License Stack • Build 4.2.0-stable
          </div>
        </footer>

      </main>
    </div>
  );
}
