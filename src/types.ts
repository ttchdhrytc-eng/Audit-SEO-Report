export interface SeoMetric {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  value?: string;
  details: string;
  recommendation: string;
}

export interface TechnicalAudit {
  overallScore: number;
  crawlability: SeoMetric;
  indexability: SeoMetric;
  robotsTxt: SeoMetric;
  sitemapXml: SeoMetric;
  canonicalTags: SeoMetric;
  schemaMarkup: SeoMetric;
  sslHttps: SeoMetric;
  redirectChains: SeoMetric;
  orphanPages: SeoMetric;
  coreWebVitals: {
    score: number;
    lcp: { value: string; rating: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: string; rating: 'good' | 'needs-improvement' | 'poor' };
    inp: { value: string; rating: 'good' | 'needs-improvement' | 'poor' };
    ttfb: { value: string; rating: 'good' | 'needs-improvement' | 'poor' };
    imageOptimization: SeoMetric;
    renderBlocking: SeoMetric;
  };
}

export interface OnPageAudit {
  overallScore: number;
  titleTag: SeoMetric;
  metaDescription: SeoMetric;
  headingStructure: {
    score: number;
    h1s: string[];
    h2s: string[];
    h3s: string[];
    validation: SeoMetric;
  };
  contentScore: {
    value: string;
    details: string;
  };
  keywordDensity: {
    keyword: string;
    count: number;
    density: string;
    relevance: 'high' | 'medium' | 'low';
  }[];
  readabilityScore: {
    value: string;
    details: string;
  };
  nlpRelevance: {
    value: string;
    details: string;
  };
  eeatSignals: SeoMetric;
  semanticKeywords: {
    term: string;
    suggestedUsage: string;
    opportunity: string;
  }[];
}

export interface CompetitorAudit {
  overallScore: number;
  competitors: {
    domain: string;
    authority: number;
    backlinks: number;
    referringDomains: number;
    trafficValue: string;
    rankingKeywords: number;
    overlapKeywords: number;
  }[];
  keywordGaps: {
    keyword: string;
    volume: number;
    difficulty: number;
    competitorRank: number;
    ourRank: number | 'Not Ranking';
    opportunityValue: 'Critical' | 'High' | 'Medium';
  }[];
}

export interface LocalSeoAudit {
  overallScore: number;
  isApplicable: boolean;
  googleBusinessProfile: SeoMetric;
  napConsistency: SeoMetric;
  localCitations: SeoMetric;
  reviewsAnalysis: {
    totalReviews: number;
    averageRating: number;
    sentimentSummary: string;
    status: 'passed' | 'warning' | 'failed';
  };
}

export interface AiRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  category: 'technical' | 'onpage' | 'performance' | 'competitor' | 'local';
  title: string;
  description: string;
  impact: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface WebsiteAuditReport {
  id: string;
  domain: string;
  companyName: string;
  auditType: 'Standard' | 'Enterprise' | 'Local';
  overallScore: number;
  executiveSummary: string;
  generatedAt: string;
  technical: TechnicalAudit;
  onPage: OnPageAudit;
  competitors: CompetitorAudit;
  localSeo: LocalSeoAudit;
  recommendations: AiRecommendation[];
  outreachScript?: string;
}

export interface AuditQueueItem {
  id: string;
  url: string;
  status: 'queued' | 'crawling' | 'analyzing' | 'applying-ai' | 'completed' | 'failed';
  progress: number;
  score?: number;
}

export interface CapturedLead {
  id: string;
  name: string;
  email: string;
  website: string;
  company?: string;
  phone?: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Closed Won' | 'Archived';
  notes?: string;
  dateCaptured: string;
  overallScore?: number;
}
