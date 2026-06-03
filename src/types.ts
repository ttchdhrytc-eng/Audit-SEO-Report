export interface SeoMetric {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  value?: string;
  details: string;
  recommendation: string;
  sourceApi?: string;
  originalField?: string;
  isLive?: boolean;
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
    scoreSource?: string;
    scoreField?: string;
    scoreIsLive?: boolean;
    lcp: { value: string; rating: 'good' | 'needs-improvement' | 'poor'; sourceApi?: string; originalField?: string; isLive?: boolean };
    cls: { value: string; rating: 'good' | 'needs-improvement' | 'poor'; sourceApi?: string; originalField?: string; isLive?: boolean };
    inp: { value: string; rating: 'good' | 'needs-improvement' | 'poor'; sourceApi?: string; originalField?: string; isLive?: boolean };
    ttfb: { value: string; rating: 'good' | 'needs-improvement' | 'poor'; sourceApi?: string; originalField?: string; isLive?: boolean };
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
    sourceApi?: string;
    originalField?: string;
    isLive?: boolean;
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
    sourceApi?: string;
    originalField?: string;
    isLive?: boolean;
  };
  nlpRelevance: {
    value: string;
    details: string;
    sourceApi?: string;
    originalField?: string;
    isLive?: boolean;
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
  scoreSource?: string;
  scoreField?: string;
  scoreIsLive?: boolean;
  competitors: {
    domain: string;
    authority: number | string;
    backlinks: number | string;
    referringDomains: number | string;
    trafficValue: string;
    rankingKeywords: number | string;
    overlapKeywords: number | string;
    isLive?: boolean;
    sourceApi?: string;
    originalField?: string;
  }[];
  keywordGaps: {
    keyword: string;
    volume: number | string;
    difficulty: number | string;
    competitorRank: number | string;
    ourRank: number | 'Not Ranking' | string;
    opportunityValue: 'Critical' | 'High' | 'Medium' | string;
    isLive?: boolean;
    sourceApi?: string;
    originalField?: string;
  }[];
}

export interface LocalSeoAudit {
  overallScore: number;
  scoreSource?: string;
  scoreField?: string;
  scoreIsLive?: boolean;
  isApplicable: boolean;
  googleBusinessProfile: SeoMetric;
  napConsistency: SeoMetric;
  localCitations: SeoMetric;
  reviewsAnalysis: {
    totalReviews: number | string;
    averageRating: number | string;
    sentimentSummary: string;
    status: 'passed' | 'warning' | 'failed';
    totalReviewsSource?: string;
    totalReviewsField?: string;
    totalReviewsIsLive?: boolean;
    averageRatingSource?: string;
    averageRatingField?: string;
    averageRatingIsLive?: boolean;
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
  verificationLayer?: Record<string, {
    value: any;
    sourceName: string;
    sourceField: string;
    timestamp: string;
    isVerified: boolean;
  }>;
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
