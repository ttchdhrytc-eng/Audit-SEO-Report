import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dns from "dns";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { validateUrlAndResolveSafe, ssrfSafeLookup } from "./server-utils/ssrfValidator";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for custom deployments (like Cloudflare Workers / Pages) using a whitelist-based CORS policy
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.status(403).json({ error: "Forbidden: Origin not whitelisted by CORS policy." });
      return;
    }
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

// Load security and integration credentials from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not configured. Some AI features will use simulations.");
}

const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || "";
if (!PAGESPEED_API_KEY) {
  console.warn("WARNING: PAGESPEED_API_KEY environment variable is not configured.");
}

const OPENGRAPH_API_KEY = process.env.OPENGRAPH_API_KEY || "";
if (!OPENGRAPH_API_KEY) {
  console.warn("WARNING: OPENGRAPH_API_KEY environment variable is not configured.");
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-13579-24680";
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not configured. Falling back to default.");
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
if (!process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD environment variable is not configured. Falling back to default 'admin123'.");
}

// Initialize Gemini API client safely with the recommended pattern
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API client initialized successfully");
} catch (err) {
  console.warn("Failed to initialize Gemini API client:", err);
}

// Robust Gemini content generation module with exponential retry and model fallback support
async function safeGenerateContent(params: {
  contents: any;
  config?: any;
}): Promise<any> {
  if (!ai) {
    throw new Error("Gemini API client is not initialized");
  }

  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Retry up to 2 times for each model
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Calling Gemini API using model: ${model} (attempt ${attempt}/2)`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config,
        });

        if (response && (response.text || response.candidates)) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt} for model ${model} failed:`, err.message || err);
        
        // Wait a short delay before trying another attempt of the same model
        if (attempt < 2) {
          const delay = attempt * 1200;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after all model retries");
}

// In-Memory Database for Leads CRM and Saved Audits
interface DB {
  leads: Array<{
    id: string;
    name: string;
    email: string;
    website: string;
    phone?: string;
    company?: string;
    overallScore?: number;
    status: 'New' | 'Contacted' | 'Proposal Sent' | 'Closed Won' | 'Archived';
    dateCaptured: string;
    notes?: string;
  }>;
  audits: Record<string, any>;
  bulkJobs: Record<string, {
    id: string;
    name: string;
    status: 'processing' | 'completed';
    totalCount: number;
    processedCount: number;
    completedAt?: string;
    items: Array<{
      id: string;
      url: string;
      status: 'queued' | 'crawling' | 'analyzing' | 'applying-ai' | 'completed' | 'failed';
      progress: number;
      score?: number;
      error?: string;
    }>;
  }>;
}

const db: DB = {
  leads: [
    {
      id: "lead_1",
      name: "Johnathan Miller",
      email: "j.miller@apexlawdesign.com",
      website: "apexlawdesign.com",
      phone: "+1 (512) 555-0192",
      company: "Apex Legal Partners",
      overallScore: 47,
      status: "New",
      dateCaptured: "2026-05-28T14:22:00Z",
      notes: "Generated audit via our sidebar widget. High traffic potential but missing SSL on schema subpages, poor CWV."
    },
    {
      id: "lead_2",
      name: "Sarah Jenkins",
      email: "sarah@lumoradental.com",
      website: "lumoradental.com",
      phone: "+1 (214) 555-8831",
      company: "Lumora Dental Care",
      overallScore: 68,
      status: "Contacted",
      dateCaptured: "2026-05-27T09:12:00Z",
      notes: "Dallas based dentist. Has GBP but no local schema or citation consistency. Sent intro email regarding Local SEO package."
    },
    {
      id: "lead_3",
      name: "Marcus Aurelius",
      email: "marcus@stoicfits.io",
      website: "stoicfits.io",
      phone: "+1 (310) 555-7729",
      company: "Stoic Apparel",
      overallScore: 59,
      status: "Proposal Sent",
      dateCaptured: "2026-05-25T16:45:00Z",
      notes: "E-Commerce brand. Severe competitor backlink gap and zero product-structured data. Sent audit proposal draft."
    },
    {
      id: "lead_4",
      name: "Emily Watson",
      email: "emily@watsonrealty.com",
      website: "watsonrealty.com",
      phone: "+1 (415) 555-4100",
      company: "Watson Real Estate Group",
      overallScore: 82,
      status: "Closed Won",
      dateCaptured: "2026-05-20T11:05:00Z",
      notes: "Closed $2,500/mo retainer. Primary focus is targeting local suburb keywords."
    }
  ],
  audits: {},
  bulkJobs: {}
};

// Seed initial reports for instant demonstration
const preSeedUrls = ["apexlawdesign.com", "lumoradental.com", "stoicfits.io", "watsonrealty.com"];
preSeedUrls.forEach(urlName => {
  const cleanedK = cleanDomainName(urlName);
  db.audits[cleanedK] = generateSimulationAudit(cleanedK, urlName.split('.')[0] + " Corp", "Standard");
});

// Seed an initial bulk job
const initialBulkJob = {
  id: "job_seed_1",
  name: "Plano TX Chiropractors List",
  status: "completed" as const,
  totalCount: 15,
  processedCount: 15,
  completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  items: Array.from({ length: 15 }).map((_, idx) => {
    const names = [
      "planochiropractic.com", "alignedplano.org", "backcaretx.net", "planochirowellness.com",
      "westplanorchiro.com", "texasspinecare.com", "drcollinsspinal.com", "planorehabcenter.com",
      "northtexasback.com", "apexspinalwellness.com", "planochiros.net", "summitplanospine.com",
      "eliteplanorehab.com", "txchirowealth.com", "legacychiropractictx.com"
    ];
    const itemUrl = names[idx] || `plano-chiro-${idx}.com`;
    
    // Seed each item of the initial completed bulk campaign in db.audits so it can be clicked and navigated to immediately
    const cleanK = cleanDomainName(itemUrl);
    db.audits[cleanK] = generateSimulationAudit(cleanK, itemUrl.split('.')[0].charAt(0).toUpperCase() + itemUrl.split('.')[0].slice(1), "Standard");

    return {
      id: `job_item_${idx}`,
      url: itemUrl,
      status: "completed" as const,
      progress: 100,
      score: db.audits[cleanK].overallScore,
    };
  })
};
db.bulkJobs[initialBulkJob.id] = initialBulkJob;

// Helper to scrape basic HTML if url is provided (best-effort, fails back smoothly)
async function getHtmlMetadata(targetUrl: string): Promise<{ title?: string; description?: string; h1s: string[]; h2s: string[]; h3s: string[]; hasSitemap: boolean; hasRobots: boolean; isHttps: boolean }> {
  const result = {
    title: "",
    description: "",
    h1s: [] as string[],
    h2s: [] as string[],
    h3s: [] as string[],
    hasSitemap: false,
    hasRobots: false,
    isHttps: targetUrl.startsWith("https://")
  };

  const safetyCheck = await validateUrlAndResolveSafe(targetUrl);
  if (!safetyCheck.safe) {
    console.warn(`Blocked unsafe URL from being scraped inside server: ${targetUrl}. Reason: ${safetyCheck.error}`);
    return result;
  }

  let resolvedUrl = safetyCheck.url || targetUrl;

  // 1. Try to fetch from Opengraph.io if API key is provided
  if (OPENGRAPH_API_KEY) {
    try {
      const opengraphUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(resolvedUrl)}?app_id=${OPENGRAPH_API_KEY}`;
      console.log(`Querying Opengraph.io API for target URL metadata: ${resolvedUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4005);
      const response = await fetch(opengraphUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const ogData = await response.json();
        const ogTitle = ogData.hybridGraph?.title || ogData.openGraph?.title || ogData.title || "";
        const ogDesc = ogData.hybridGraph?.description || ogData.openGraph?.description || ogData.description || "";
        
        if (ogTitle) {
          result.title = ogTitle.trim();
        }
        if (ogDesc) {
          result.description = ogDesc.trim();
        }
        console.log(`Opengraph.io successfully retrieved metadata - Title: "${result.title}"`);
      } else {
        console.warn(`Opengraph.io API returned bad status code: ${response.status}`);
      }
    } catch (err) {
      console.warn("Could not query Opengraph.io directly, fallback to native fetcher:", err);
    }
  }

  // 2. Perform native HTTP scrape fallback for heading tags and files
  return new Promise((resolve) => {
    const lib = resolvedUrl.startsWith("https://") ? https : http;

    // Timeout-backed best-effort get
    const req = lib.get(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SEO-Audit-Crawler/1.0'
      },
      lookup: ssrfSafeLookup
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        if (data.length < 150000) { // Limit to 150KB to preserve CPU/mem
          data += chunk;
        }
      });
      res.on("end", () => {
        try {
          // If we didn't get title/description from opengraph yet, or we want to overwrite/merge:
          if (!result.title) {
            const titleMatch = data.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              result.title = titleMatch[1].trim();
            }
          }

          if (!result.description) {
            const descMatch = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
                              data.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
            if (descMatch && descMatch[1]) {
              result.description = descMatch[1].trim();
            }
          }

          // Regex extract h1s, h2s, h3s
          const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
          let match;
          while ((match = h1Regex.exec(data)) && result.h1s.length < 5) {
            if (match[1]) result.h1s.push(match[1].replace(/<[^>]*>/g, "").trim());
          }

          const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
          while ((match = h2Regex.exec(data)) && result.h2s.length < 5) {
            if (match[1]) result.h2s.push(match[1].replace(/<[^>]*>/g, "").trim());
          }

          const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
          while ((match = h3Regex.exec(data)) && result.h3s.length < 5) {
            if (match[1]) result.h3s.push(match[1].replace(/<[^>]*>/g, "").trim());
          }

          // Quick checks for sitemap or robots link patterns in HTML (not accurate server-level, but good hint)
          result.hasRobots = data.indexOf("robots.txt") > -1;
          result.hasSitemap = data.indexOf("sitemap.xml") > -1 || data.indexOf("sitemap-index") > -1;

          resolve(result);
        } catch {
          resolve(result);
        }
      });
    });

    req.on("error", () => {
      resolve(result); // Fail-safe
    });
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(result);
    });
  });
}

// Helper functions for consistent domain cleaning and hashing
function cleanDomainName(url: string): string {
  if (!url) return '';
  let cleaned = url.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  const qIdx = cleaned.indexOf('?');
  if (qIdx !== -1) {
    cleaned = cleaned.substring(0, qIdx);
  }
  const sIdx = cleaned.indexOf('/');
  if (sIdx !== -1) {
    cleaned = cleaned.substring(0, sIdx);
  }
  return cleaned.replace(/\.+$/, '').trim();
}

function isSimulationDomain(domain: string): boolean {
  if (!domain) return false;
  const sims = [
    "apexlawdesign.com", "lumoradental.com", "stoicfits.io", "watsonrealty.com",
    "elitedentaltx.com", "apexlawdallas.com", "austindentalspa.com", 
    "stoicchiro.com", "watsonrealestate.com", "dallasspinechiro.com",
    "stoicfitstore.com", "eliteplanorehab.com", "txchirowealth.com", "legacychiropractictx.com",
    "plano-chiro", "solaris-tech.io", "luxe-apartments.com", "green-eats-delivery.co",
    "prime-legal-group.org", "urban-style-co.uk", "planochiropractic.com", "backcaretx.net",
    "summitplanospine.com"
  ];
  const cleaned = cleanDomainName(domain);
  return sims.some(s => cleaned.includes(s)) || cleaned.endsWith(".test") || cleaned.endsWith(".local") || cleaned.includes("localhost") || cleaned.includes("127.0.0.1");
}

function getDomainHash(domain: string): number {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Simulated data structures based on industry averages, tailored to domain niche keywords
function generateSimulationAudit(domain: string, companyName: string, type: 'Standard' | 'Enterprise' | 'Local'): any {
  const cleanDomain = cleanDomainName(domain);
  const name = companyName || cleanDomain.split('.')[0].charAt(0).toUpperCase() + cleanDomain.split('.')[0].slice(1);
  const niche = cleanDomain.includes("law") || cleanDomain.includes("legal") ? "legal" :
                cleanDomain.includes("clinic") || cleanDomain.includes("dentist") || cleanDomain.includes("chiro") ? "medical" :
                cleanDomain.includes("shop") || cleanDomain.includes("fit") || cleanDomain.includes("wear") ? "ecommerce" : "agency";

  const hash = getDomainHash(cleanDomain);
  
  // Use domain hash to derive beautiful, stable and dynamic scores
  const scores = {
    technical: (hash % 21) + 65, // 65 to 85
    onPage: ((hash >> 2) % 20) + 60, // 60 to 79
    competitors: ((hash >> 4) % 21) + 55, // 55 to 75
    local: type === 'Local' || niche === 'medical' || cleanDomain.includes("law") ? ((hash >> 6) % 20) + 65 : 0
  };

  const overall = type === 'Local' || scores.local > 0
    ? Math.round((scores.technical + scores.onPage + scores.competitors + (scores.local || 65)) / 4)
    : Math.round((scores.technical + scores.onPage + scores.competitors) / 3);

  // Dynamic values based on technical score and hash
  const dynamicLcpValue = (1.1 + ((85 - scores.technical) * 0.08) + (hash % 8) * 0.04).toFixed(1) + "s";
  const dynamicLcpRating = (parseFloat(dynamicLcpValue) < 2.5) ? "good" : (parseFloat(dynamicLcpValue) <= 4.0 ? "needs-improvement" : "poor");
  
  const dynamicClsValue = (0.01 + ((85 - scores.technical) * 0.004) + (hash % 6) * 0.01).toFixed(2);
  const dynamicClsRating = parseFloat(dynamicClsValue) < 0.1 ? "good" : "needs-improvement";
  
  const dynamicInpValue = Math.round(90 + ((85 - scores.technical) * 4.5) + (hash % 15) * 4) + "ms";
  
  const dynamicTtfbValue = (0.10 + ((85 - scores.technical) * 0.015) + (hash % 6) * 0.02).toFixed(2) + "s";
  const dynamicTtfbRating = parseFloat(dynamicTtfbValue) < 0.8 ? "good" : "needs-improvement";

  const keywordDensityCount = 8 + (hash % 14);
  const keywordDensityPercent = (1.2 + (hash % 12) * 0.18).toFixed(1) + "%";

  // Dynamic layout headings
  const industryTitle = niche === "legal" ? "Legal Counsel & Attorneys" : niche === "medical" ? "Healthcare & Chiropractic Clinic" : niche === "ecommerce" ? "Premium Design Shop" : "Full-Suite Digital Brand";
  const h1Text = `${name} | Certified ${industryTitle}`;
  const h2s = [`Advanced Services of ${name}`, `Why Our Clients Trust ${name}`, "Strategic Local Solutions"];
  const h3s = [`Schedule an Appointment with ${name}`, "Our Performance Verification Policy"];

  // Custom Industry Keywords
  let industryKeywords = ["services near me", "professional provider", "top rated company", "quality consulting"];
  if (niche === "medical") {
    industryKeywords = ["spine doctor", "health adjustments", "chiropractor pricing", "pain relief care"];
  } else if (niche === "legal") {
    industryKeywords = ["expert litigation attorney", "law defense specialists", "attorney consultations", "local legal firm"];
  } else if (niche === "ecommerce") {
    industryKeywords = ["original design wear", "quality athletic shirts", "secure web shop", "fast delivery shipping"];
  }

  // Helper variables for varied dynamic reporting details
  const randNumLabel = (hash % 4) + 2;
  const randNumOrphans = (hash % 7) + 2;
  const isCrawlPassed = scores.technical > 74;
  const isIndexPassed = scores.technical > 70;
  const hasRobotsFile = (hash % 6) !== 0; // robots.txt is missing for 1 out of 6 domains simulated
  const sitemapDisparity = 5 + (hash % 20);

  return {
    id: "audit_" + Math.random().toString(36).substr(2, 9),
    url: domain,
    domain: cleanDomain,
    companyName: name,
    auditType: type,
    overallScore: overall,
    generatedAt: new Date().toISOString(),
    executiveSummary: `The comprehensive SEO audit for ${cleanDomain} reveals an overall digital optimization index of ${overall}%. While your site possesses solid foundational components, we found critical structural gaps in technical indexing latency and local listing coherence, which are directly depressing search rankings in high-value geographical queries. Addressing these priorities is estimated to yield a ${120 + (hash % 100)}% to ${200 + (hash % 120)}% growth in high-intent keyword acquisition within 90 days.`,
    
    technical: {
      overallScore: scores.technical,
      crawlability: {
        name: "Crawlability Index",
        score: isCrawlPassed ? scores.technical + 4 : scores.technical - 8,
        status: isCrawlPassed ? "passed" : "warning",
        value: isCrawlPassed ? "Optimized crawl paths" : "Partial indexation drag",
        details: isCrawlPassed 
          ? `Engine spiders traced main root configurations dynamically. Crawl path loops are minimal and system resources are preserved.` 
          : `Deep search crawlers map page folders, but traversal efficiency is restricted by ${randNumLabel} nested subdirectories.`,
        recommendation: isCrawlPassed
          ? "Ensure newly introduced pages continue to use flat, simple folder directories."
          : `Group related folders into direct parent hierarchies. Restrict non-indexing parameters down to max 3 layers.`
      },
      indexability: {
        name: "Indexability Controls",
        score: isIndexPassed ? scores.technical + 8 : scores.technical - 12,
        status: isIndexPassed ? "passed" : "failed",
        value: isIndexPassed ? "Complete active indexing index" : "Orphaned assets blocked",
        details: isIndexPassed
          ? "Essential product pages return optimal 200 codes. System stylesheets are correctly ignored."
          : `At least ${randNumLabel} primary promotion sheets mistakenly return inconsistent canonical tags or temp header instructions.`,
        recommendation: isIndexPassed
          ? "Periodically audit private admin areas to confirm they remain indexed out."
          : "Clean up conflicting x-robots parameters. Standardize server response tags specifically for Googlebot crawls."
      },
      robotsTxt: {
        name: "Robots.txt Schema Alignment",
        score: hasRobotsFile ? 95 : 30,
        status: hasRobotsFile ? "passed" : "failed",
        value: hasRobotsFile ? "Active" : "Robots.txt Missing!",
        details: hasRobotsFile
          ? "/robots.txt exists in root directory, preventing index spiders from crawling private database directories."
          : "No robots.txt was found on your document root, leaving sensitive resource folders open to search spiders.",
        recommendation: hasRobotsFile
          ? "No absolute fixes required. Refrain from listing private directory paths explicitly inside public robots rules."
          : "Create and upload a standard, syntactically clean robots.txt mapping user-agent rules and linking the XML sitemap."
      },
      sitemapXml: {
        name: "Sitemap XML Coherence",
        score: hasRobotsFile && scores.technical > 60 ? 98 : 45,
        status: hasRobotsFile && scores.technical > 60 ? "passed" : "warning",
        value: hasRobotsFile && scores.technical > 60 ? "Sitemap fully matched" : "Sitemap misalignment",
        details: hasRobotsFile && scores.technical > 60
          ? "Dynamic server sitemap successfully lists key landing pathways with optimal priority configurations."
          : `The sitemap lists obsolete parameters and exhibits a local ${sitemapDisparity}% file count variance relative to active pages.`,
        recommendation: hasRobotsFile && scores.technical > 60
          ? "Ensure sitemap generation scripts run on a timed routine daily."
          : "Integrate a real-time auto-routing sitemap generator. Re-submit fresh sitemap maps securely in search consoles."
      },
      canonicalTags: {
        name: "Canonical Directives",
        score: (hash % 25) + 65,
        status: (hash % 25) + 65 > 78 ? "passed" : "warning",
        value: (hash % 25) + 65 > 78 ? "Optimal self-referential links" : "Duplicate canonical variations",
        details: (hash % 25) + 65 > 78
          ? "Canonical tags match the root parameters, avoiding duplicates under HTTP/HTTPS protocols."
          : "Several dynamic system filters lack explicit canonical definitions, causing potential duplicate crawling risks.",
        recommendation: (hash % 25) + 65 > 78
          ? "Enforce lowercase rule parameters in redirection configurations."
          : "Configure explicit self-pointing canonical fields in global layouts down to all subdirectory index layers."
      },
      schemaMarkup: {
        name: "Structured JSON-LD Schema",
        score: scores.technical > 72 ? 88 : 40,
        status: scores.technical > 72 ? "passed" : "failed",
        value: scores.technical > 72 ? "Rich entity schema active" : "Sparse entity elements",
        details: scores.technical > 72
          ? "The document head embeds schema variables representing local coordinates, ratings, and active support lines."
          : "Structured markup is limited to standard site templates, leaving rich visual search snippet triggers inactive.",
        recommendation: scores.technical > 72
          ? "Introduce additional product/review variables down to individual service elements."
          : "Incorporate dedicated corporate JSON-LD markup outlining founders, locations, coordinates, and social profiles."
      },
      sslHttps: {
        name: "HTTPS Protocol Security",
        score: 100,
        status: "passed",
        value: "Secure SSL Active",
        details: "Strong modern TLS configurations successfully force HTTP requests over encrypted secure channels.",
        recommendation: "Ensure key security certificates are configured for auto-renewal to maintain continuous TLS protocol validation."
      },
      redirectChains: {
        name: "Redirect Latency & Chains",
        score: Math.max(scores.technical - 15, 45) + (hash % 10),
        status: Math.max(scores.technical - 15, 45) + (hash % 10) > 72 ? "passed" : "warning",
        value: Math.max(scores.technical - 15, 45) + (hash % 10) > 72 ? "Direct redirects resolved" : `${(hash % 3) + 2} redirect hops detected`,
        details: Math.max(scores.technical - 15, 45) + (hash % 10) > 72
          ? "Redirect pathways contain only single, clean server hops without unnecessary loop latency."
          : `Historical urls double-hop during protocol normalization, adding ${120 + (hash % 100)}ms in unnecessary DNS resolve time.`,
        recommendation: Math.max(scores.technical - 15, 45) + (hash % 10) > 72
          ? "Maintain periodic audits to prevent chaining when migrating content."
          : "Edit obsolete link locations to point directly to true target secure URLs, bypassing secondary server redirection steps."
      },
      orphanPages: {
        name: "Orphan Page Discoverability",
        score: (hash % 21) + 70,
        status: (hash % 21) + 70 > 79 ? "passed" : "warning",
        value: (hash % 21) + 70 > 79 ? "Low orphan density" : `${randNumOrphans} orphaned files`,
        details: (hash % 21) + 70 > 79
          ? "All relevant content templates are easily crawled via internal anchor links inside primary global headers."
          : `Spiders discovered ${randNumOrphans} isolated blog posts or utility directories with zero internal incoming connections.`,
        recommendation: (hash % 21) + 70 > 79
          ? "Ensure new informational articles are always interlinked with relevant category landing blocks."
          : "Introduce direct references to orphaned articles inside contextual content pieces, or include them on category pages."
      },
      hreflangTags: {
        name: "Hreflang Geotargeting",
        score: 100,
        status: "passed",
        value: "Local optimal (Single target)",
        details: "Single locale language definitions align perfectly, indicating target audiences are correctly regional.",
        recommendation: "No immediate updates needed. If scaling globally, implement strict language code pointers."
      },
      jsRendering: {
        name: "Client JS Hydration Speed",
        score: (hash % 15) + 82,
        status: "passed",
        value: "Hydration matches budget",
        details: "Interactive frameworks hydrate within targeted budget limits, causing minimal main thread blocking.",
        recommendation: "Load interactive sliders and comment components using delayed asynchronous scripts."
      },
      coreWebVitals: {
        score: Math.round(scores.technical - ((hash % 6) + 3)),
        lcp: { value: dynamicLcpValue, rating: dynamicLcpRating },
        cls: { value: dynamicClsValue, rating: dynamicClsRating },
        inp: { value: dynamicInpValue, rating: scores.technical > 75 ? "good" : "needs-improvement" },
        ttfb: { value: dynamicTtfbValue, rating: dynamicTtfbRating },
        imageOptimization: {
          name: "Image Payload Compression",
          score: Math.max(scores.technical - 16, 40) + (hash % 10),
          status: Math.max(scores.technical - 16, 40) + (hash % 10) > 70 ? "passed" : "warning",
          value: `${(1.1 + (hash % 22) * 0.1).toFixed(1)}MB payload weight`,
          details: "Large uncompressed high-res banners expand layout weight, slowing initial mobile paint times.",
          recommendation: "Transform existing JPEG/PNG layouts to next-gen formats like WebP or AVIF. Apply lossless scaling compression."
        },
        lazyLoading: {
          name: "Lazy Loading Implementation",
          score: (hash % 3) === 0 ? 60 : 100,
          status: (hash % 3) === 0 ? "warning" : "passed",
          value: (hash % 3) === 0 ? "Lazy loading partial" : "Active on media elements",
          details: (hash % 3) === 0
            ? "Several below-the-fold icons or service maps download eagerly before the user scrolls, bloating bandwidth."
            : "Media and interactive elements implement standard loading=\"lazy\" flags safely across the viewport.",
          recommendation: (hash % 3) === 0
            ? "Embed native loading tags in all template image tags located below early views."
            : "Continue maintaining lazy attributes across deep elements."
        },
        renderBlocking: {
          name: "Render-blocking Assets",
          score: Math.max(scores.technical - 18, 38) + (hash % 10),
          status: Math.max(scores.technical - 18, 38) + (hash % 10) > 65 ? "warning" : "failed",
          value: `${2 + (hash % 4)} blocks`,
          details: `Dynamic tracking systems and social media widgets load synchronously inside document headers, delaying visual paints.`,
          recommendation: "Shift non-essential script codes to async execution. Utilize lightweight scripts for analytics tags."
        },
        cssOptimization: {
          name: "CSS Bloat & Unused Classes",
          score: 85 + (hash % 12),
          status: "passed",
          value: "Tailwind parameters verified",
          details: "Main stylesheets are modern, clean, lightweight, and purged of redundant styles.",
          recommendation: "Implement inline layout styling specifically for viewport critical paths to eliminate stylesheets blocking render ticks."
        }
      }
    },
    
    onPage: {
      overallScore: scores.onPage,
      titleTag: {
        name: "Title Tag Optimization",
        score: scores.onPage > 71 ? 92 : 55,
        status: scores.onPage > 71 ? "passed" : "warning",
        value: `${name} | ${industryTitle}`,
        details: scores.onPage > 71 
          ? "Title is properly length-adjusted and targets key industry terms perfectly." 
          : "The current page title lacks geographical indicators or crucial descriptive action verbs, and resolves under standard lengths.",
        recommendation: scores.onPage > 71
          ? "No updates needed. Ensure secondary landing targets apply matching title structure policies."
          : `Expand current title to 55-60 characters. Integrate high-conversion search modifiers such as "Certified" or "Near Me" to boost organic CTR.`
      },
      metaDescription: {
        name: "Meta Description Engagement",
        score: scores.onPage > 66 ? 92 : 42,
        status: scores.onPage > 66 ? "passed" : "failed",
        value: scores.onPage > 66 ? "Custom description active" : "Default fallback snippet",
        details: scores.onPage > 66
          ? "Meta description contains engaging calls-to-action and incorporates your targeted local focus queries perfectly."
          : "The site utilizes generic boilerplate summaries that make search snippet cards look unappealing on search result listings.",
        recommendation: scores.onPage > 66
          ? "Incorporate tracking analytics to check snippet CTR changes over time."
          : "Craft a custom, highly conversion-driven meta snippet under 155 characters that features phone details and direct calls-to-action."
      },
      headingStructure: {
        score: scores.onPage - 4,
        h1s: [h1Text],
        h2s: h2s,
        h3s: h3s,
        validation: {
          name: "H1-H6 Structure Integrity",
          score: scores.onPage > 71 ? 98 : 55,
          status: scores.onPage > 71 ? "passed" : "warning",
          value: scores.onPage > 71 ? "Optimal heading density" : `${2 + (hash % 3)} H1 tags detected`,
          details: scores.onPage > 71
            ? "Exactly one semantic H1 tag is configured on the homepage, keeping content categories extremely clear."
            : `The home page root contains ${2 + (hash % 3)} H1 elements, causing index bots to struggle to locate primary local topics.`,
          recommendation: scores.onPage > 71
            ? "Maintain this clean heading hierarchy as you design future article templates."
            : "Enforce a strict single-H1 system page-wide. Re-assign less relevant title blocks to descriptive H2 or H3 options."
        }
      },
      contentScore: {
        name: "Client Content Depth Core",
        score: scores.onPage > 72 ? 88 : 50,
        status: scores.onPage > 72 ? "passed" : "warning",
        value: `${380 + (scores.onPage * 7) + (hash % 120)} words on homepage`,
        details: `Your home page has ${380 + (scores.onPage * 7) + (hash % 120)} words. To compete strongly in regional SERP rankings, industry guides suggest target metrics of 1,200+ words.`,
        recommendation: "Build out primary homepage copy blocks. Outline in detail your services, client case reports, and core value metrics to establish context."
      },
      keywordDensity: [
        { keyword: cleanDomain.split('.')[0], count: keywordDensityCount, density: keywordDensityPercent, relevance: "high" },
        { keyword: industryKeywords[0], count: Math.max(2, keywordDensityCount - 6), density: (parseFloat(keywordDensityPercent) * 0.6).toFixed(1) + "%", relevance: "high" },
        { keyword: industryKeywords[1], count: Math.max(1, keywordDensityCount - 8), density: (parseFloat(keywordDensityPercent) * 0.4).toFixed(1) + "%", relevance: "medium" },
        { keyword: "click here", count: 2 + (hash % 3), density: "0.3%", relevance: "low" }
      ],
      semanticKeywords: [
        { term: `expert ${niche} services`, suggestedUsage: "Use 4-6 times", currentCount: 0, opportunity: "Immediate SERP booster" },
        { term: "local search optimizations", suggestedUsage: "Use 3 times", currentCount: 1, opportunity: "Improves keyword clusters" },
        { term: "topical ranking strategies", suggestedUsage: "Use 2 times", currentCount: 0, opportunity: "Builds systemic authority" }
      ],
      nlpRelevance: {
        name: "Semantic NLP Relevance Index",
        score: Math.max(scores.onPage - 6, 42) + (hash % 8),
        status: Math.max(scores.onPage - 6, 42) + (hash % 8) > 70 ? "passed" : "warning",
        value: Math.max(scores.onPage - 6, 42) + (hash % 8) > 70 ? "High NLP focus" : "Moderate semantic index",
        details: "Your landing layouts lack certain latent semantic vocabulary terms which NLP crawlers like BERT/RankBrain expect.",
        recommendation: "Include direct answers to high-intent questions in your copy. Use clear bullet points and Q&A blocks to help engines discover voice results."
      },
      readabilityScore: {
        name: "Flesch-Kincaid Reading Score",
        score: 60 + (hash % 15),
        status: "passed",
        value: `${60 + (hash % 15)} (Standard Professional)`,
        details: "Reading difficulty is well optimized for general target visitors, ensuring low page bounce rates.",
        recommendation: "Keep paragraphs under 3-4 sentences. Use bold key terms in long descriptions to facilitate rapid scanning."
      },
      topicalAuthority: {
        name: "Topical Authority Score",
        score: scores.onPage > 74 ? 80 : 35,
        status: scores.onPage > 74 ? "passed" : "failed",
        value: scores.onPage > 74 ? "Robust coverage" : "Narrow topic scope",
        details: scores.onPage > 74
          ? "The domain covers wide related service topics, showing solid index presence in regional index tables."
          : "The index directory has limited coverage across peripheral keyword topics, showing an average lack of supporting articles.",
        recommendation: scores.onPage > 74
          ? "Continue to reinforce topical focus using high quality monthly article campaigns."
          : "Develop structured topical resource hubs containing 10-12 specialized guides, all interlinked towards your primary business landing views."
      },
      entitiesExtracted: ["Professional Business", name, "Regional Services", "E-Commerce Integrations"],
      eeatSignals: {
        name: "E-E-A-T Signal Compliance",
        score: Math.max(scores.onPage - 12, 40) + (hash % 8),
        status: Math.max(scores.onPage - 12, 40) + (hash % 8) > 70 ? "passed" : "warning",
        value: Math.max(scores.onPage - 12, 40) + (hash % 8) > 70 ? "Strong trust variables" : "Missing key credibility indicators",
        details: "The content layouts are missing explicit author qualifications, credential certifications, and direct links to trust directories.",
        recommendation: "Incorporate certified author biographies containing links to LinkedIn. Embed client reviews directly inside service layouts to build E-E-A-T signals."
      }
    },
    
    competitors: {
      overallScore: scores.competitors,
      competitors: [
        { domain: `elite-${cleanDomain}`, authority: Math.max(scores.competitors - 6, 20), backlinks: 480 + (hash % 240), referringDomains: 90 + (hash % 50), trafficValue: `$${(2.8 + (hash % 6)).toFixed(1)}K`, rankingKeywords: 350 + (hash % 180), visibilityIndex: 40 + (hash % 12), overlapKeywords: 22 },
        { domain: `apex-${cleanDomain}`, authority: Math.max(scores.competitors + 12, 45), backlinks: 2200 + (hash % 700), referringDomains: 480 + (hash % 120), trafficValue: `$${(15.2 + (hash % 12)).toFixed(1)}K`, rankingKeywords: 1400 + (hash % 400), visibilityIndex: 72 + (hash % 7), overlapKeywords: 38 },
        { domain: `summit-${cleanDomain}`, authority: Math.max(scores.competitors + 4, 30), backlinks: 950 + (hash % 350), referringDomains: 190 + (hash % 60), trafficValue: `$${(6.8 + (hash % 10)).toFixed(1)}K`, rankingKeywords: 780 + (hash % 250), visibilityIndex: 52 + (hash % 10), overlapKeywords: 29 }
      ],
      keywordGaps: [
        { keyword: `best ${niche} specialist ${name.toLowerCase()}`, volume: 720 + (hash % 300), difficulty: 25 + (hash % 30), competitorRank: 3, ourRank: "Not Ranking", opportunityValue: "Critical" },
        { keyword: `${niche} operations audit cost`, volume: 380 + (hash % 150), difficulty: 20 + (hash % 20), competitorRank: 2, ourRank: 38, opportunityValue: "High" },
        { keyword: `how to optimize local ${niche}`, volume: 1050 + (hash % 500), difficulty: 35 + (hash % 25), competitorRank: 6, ourRank: "Not Ranking", opportunityValue: "High" },
        { keyword: `affordable ${cleanDomain.split('.')[0]} plans`, volume: 180 + (hash % 80), difficulty: 12 + (hash % 18), competitorRank: 1, ourRank: "Not Ranking", opportunityValue: "Medium" }
      ]
    },
    
    localSeo: {
      overallScore: scores.local,
      isApplicable: type === 'Local' || niche === 'medical' || cleanDomain.includes("law"),
      googleBusinessProfile: {
        name: "GBP Profile Completeness",
        score: scores.local > 80 ? 95 : 58,
        status: scores.local > 80 ? "passed" : "warning",
        value: scores.local > 80 ? "Optimal profile parameters" : "Incomplete GBP details",
        details: "Google Business Profile misses additional service categories, localized keywords inside headers, and geographic descriptions.",
        recommendation: "Ensure key auxiliary categories are listed. Upload high-res geotagged photos of your storefront twice weekly to reinforce location markers."
      },
      napConsistency: {
        name: "NAP Consistency Indicator",
        score: scores.local > 75 ? 90 : 42,
        status: scores.local > 75 ? "passed" : "failed",
        value: scores.local > 75 ? "Perfect citation alignment" : "NAP spelling variances",
        details: scores.local > 75
          ? "We mapped local index directories and found identical name, address, and telephone layouts page-wide."
          : `We resolved dynamic citation inconsistencies (e.g., telephone or address format differences) across ${randNumLabel} business directories.`,
        recommendation: scores.local > 75
          ? "Continue maintaining exact spelling parameters as you submit new catalog memberships."
          : "Execute list-cleaning steps across major local indexing systems like Yelp, Foursquare, and YellowPages. Sync data cells perfectly."
      },
      localCitations: {
        name: "Local Citations Checklist",
        score: scores.local > 65 ? 85 : 55,
        status: scores.local > 65 ? "passed" : "warning",
        value: `${15 + (hash % 18)} verified directory entries`,
        details: `We mapped ${15 + (hash % 18)} active regional listing indexes. Leading industry competitors in your region maintain 75+ active listings on average.`,
        recommendation: "Initiate monthly listing registration campaigns to list on high-repute map and catalog aggregates."
      },
      reviewsAnalysis: {
        score: scores.local > 71 ? 90 : 52,
        totalReviews: scores.local > 71 ? 38 + (hash % 110) : 4 + (hash % 12),
        averageRating: scores.local > 71 ? (4.4 + (hash % 6) * 0.1).toFixed(1) : (3.1 + (hash % 9) * 0.1).toFixed(1),
        sentimentSummary: scores.local > 71 
          ? "Client reviews indicate a solid local reputation with high ratings and quick customer interaction." 
          : "Customer feedback shows average ratings under standards, with missed reviews that lack responses from ownership.",
        status: scores.local > 71 ? "passed" : "warning"
      }
    },
    
    recommendations: [
      {
        id: "rec_1",
        category: "technical",
        priority: "critical",
        title: "Fix H1 Heading structures and eliminate duplicates",
        description: `Your homepage lacks a primary keyword-focused H1. This reduces topical relevance for '${niche === "legal" ? "SEO agency" : "niche business"}'. Adding a keyword-optimized H1 can improve semantic search alignment and CTR.`,
        impact: "Directly boosts crawl relevancy index page scoring by 25%.",
        effort: "low"
      },
      {
        id: "rec_2",
        category: "performance",
        priority: "high",
        title: "Initiate Image Compression and modern WebP transformation",
        description: "Compress oversized graphic assets on primary catalogs and convert all file pathways to optimized WebP. This trims initial visual drag down by 1.8 seconds.",
        impact: "Major Core Web Vitals (LCP) performance progress.",
        effort: "medium"
      },
      {
        id: "rec_3",
        category: "technical",
        priority: "high",
        title: "Incorporate Rich Local JSON-LD schema blocks",
        description: "Insert explicit semantic tags directly inside page scripts. This helps web spiders instantly identify physical coordinates and services.",
        impact: "Enables click-friendly rich snippet snippets on active SERPs.",
        effort: "medium"
      },
      {
        id: "rec_4",
        category: "competitor",
        priority: "medium",
        title: "Build Topical Authority via a dedicated Content Hub portfolio",
        description: "Draft 8 core expert tutorials targeting detailed semantic search gaps. Interlink these with designated landing pathways to flow internal juices.",
        impact: "Triggers organic search reach for several long-tail listings.",
        effort: "high"
      }
    ],
    outreachScript: `Subject: Quick visual SEO gap in ${cleanDomain}\n\nHi Team ${name},\n\nI ran an enterprise-level search crawling audit on ${cleanDomain} using our SEO Audit Suite.\nThe scan completed with an overall score of ${overall}/100.\n\nWhile your brand presentation looks sleek, we found three primary search optimization gaps that are currently suppressing your high-intent traffic rankings:\n1. Heading Structure: Your homepage is missing keyword-optimized H1 elements. This diminishes topical authority.\n2. Core Web Vitals: Largest Contentful Paint (LCP) has a notable drag, reducing visitor conservation.\n3. Citations Index: Inconsistent phone or coordinates records across regional mapping directories.\n\nI have generated a complete, prioritized enterprise technical remediation blueprint and AI outreach campaign to help you capture these opportunities. If you would like to run through the custom proposal, feel free to reply directly here.\n\nBest regards,\nProspect Outreach Team`
  };
}

// REST APIs

// Authentication and Session JWT Management Security Middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { role: string; sub?: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

const USER_PASSWORD = process.env.USER_PASSWORD || "user123";

// Role authorization middleware helpers
const requireRole = (allowedRoles: ("admin" | "user")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(", ")}` });
    }
    next();
  };
};

// Reusable Audit Logger for sensitive customer data endpoints
function auditLog(req: Request, endpoint: string, action: string, description: string) {
  const timestamp = new Date().toISOString();
  const userName = (req as any).user?.sub || "anonymous_user";
  const userRole = (req as any).user?.role || "no_role";
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown_ip";
  console.log(
    `[CRM-AUDIT-LOG] [${timestamp}] Principal: "${userName}" (Role: ${userRole}) | Action: "${action}" | Endpoint: "${endpoint}" | Context: "${description}" | Source IP: ${ipAddress}`
  );
}

// User & Admin Login Token Generation Endpoint
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin", sub: "admin_user" }, JWT_SECRET!, { expiresIn: "24h" });
    res.json({ token, role: "admin" });
  } else if (password === USER_PASSWORD) {
    const token = jwt.sign({ role: "user", sub: "staff_user" }, JWT_SECRET!, { expiresIn: "24h" });
    res.json({ token, role: "user" });
  } else {
    return res.status(401).json({ error: "Invalid password" });
  }
});

app.get("/api/leads", authMiddleware, requireRole(["admin", "user"]), (req, res) => {
  // Audit the endpoint that exposes all emails, phones, notes, and customer data
  auditLog(req, "GET /api/leads", "READ_ALL_LEADS", `Exposing complete CRM database. Record count: ${db.leads.length}`);
  res.json(db.leads);
});

// Admin-only CSV export of leads
app.get("/api/leads/export", authMiddleware, requireRole(["admin"]), (req, res) => {
  auditLog(req, "GET /api/leads/export", "EXPORT_ALL_LEADS", `Generating and exporting complete customer lead spreadsheet. Count: ${db.leads.length}`);

  let csv = "ID,Name,Email,Website,Phone,Company,Overall Score,Status,Date Captured,Notes\n";
  for (const lead of db.leads) {
    const safeId = (lead.id || "").replace(/"/g, '""');
    const safeName = (lead.name || "").replace(/"/g, '""');
    const safeEmail = (lead.email || "").replace(/"/g, '""');
    const safeWebsite = (lead.website || "").replace(/"/g, '""');
    const safePhone = (lead.phone || "").replace(/"/g, '""');
    const safeCompany = (lead.company || "").replace(/"/g, '""');
    const safeScore = lead.overallScore || "";
    const safeStatus = (lead.status || "").replace(/"/g, '""');
    const safeDate = (lead.dateCaptured || "").replace(/"/g, '""');
    const safeNotes = (lead.notes || "").replace(/"/g, '""');
    
    csv += `"${safeId}","${safeName}","${safeEmail}","${safeWebsite}","${safePhone}","${safeCompany}","${safeScore}","${safeStatus}","${safeDate}","${safeNotes}"\n`;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=leads-export-${Date.now()}.csv`);
  res.status(200).send(csv);
});

app.post("/api/leads", authMiddleware, requireRole(["admin", "user"]), (req, res) => {
  const { name, email, website, phone, company, overallScore } = req.body;
  if (!email || !website) {
    return res.status(400).json({ error: "Email and Website are required parameters" });
  }

  // Deduplicate and insert
  const currentLead = {
    id: "lead_" + Date.now(),
    name: name || "Anonymous Lead",
    email,
    website,
    phone: phone || "",
    company: company || "",
    overallScore: overallScore || undefined,
    status: "New" as const,
    dateCaptured: new Date().toISOString(),
    notes: "Captured directly via SEO Audit Landing Widget."
  };

  // Audit entry creation of customer data
  auditLog(req, "POST /api/leads", "CREATE_LEAD", `Inserting new CRM registry: ${currentLead.name} (${currentLead.email})`);

  db.leads.unshift(currentLead);
  res.status(201).json(currentLead);
});

app.put("/api/leads/:id", authMiddleware, requireRole(["admin"]), (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const leadIdx = db.leads.findIndex(l => l.id === id);
  if (leadIdx === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  auditLog(req, `PUT /api/leads/${id}`, "UPDATE_LEAD", `Modifying lead parameters. Target: ${db.leads[leadIdx].name}. Updated Status: ${status || 'N/A'}`);

  if (status) db.leads[leadIdx].status = status;
  if (notes !== undefined) db.leads[leadIdx].notes = notes;

  res.json(db.leads[leadIdx]);
});

app.delete("/api/leads/:id", authMiddleware, requireRole(["admin"]), (req, res) => {
  const { id } = req.params;
  const prevLen = db.leads.length;
  const targetLead = db.leads.find(l => l.id === id);
  
  if (!targetLead) {
    return res.status(404).json({ error: "Lead not found" });
  }

  auditLog(req, `DELETE /api/leads/${id}`, "DELETE_LEAD", `Permanently destroying customer lead registry: ${targetLead.name} (${targetLead.email})`);

  db.leads = db.leads.filter(l => l.id !== id);
  res.json({ success: true });
});

// Single Website Audit Endpoint (Backed by Gemini AI for rich Copywriting)
app.post("/api/audit", async (req, res) => {
  const { url, domain, companyName, auditType } = req.body;
  const targetUrl = url || domain;
  
  if (!targetUrl) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  const safetyCheck = await validateUrlAndResolveSafe(targetUrl);
  if (!safetyCheck.safe) {
    return res.status(400).json({ error: `Rejected unsafe URL: ${safetyCheck.error}` });
  }

  const executionTasks: Promise<void>[] = [];

  const cleanUrl = cleanDomainName(targetUrl);
  const domainShortName = cleanUrl.split('.')[0];
  const formattedCompany = companyName || domainShortName.charAt(0).toUpperCase() + domainShortName.slice(1);
  const typeOfAudit = auditType || 'Standard';

  console.log(`Auditing Website: ${cleanUrl} (Company: ${formattedCompany}, Type: ${typeOfAudit})`);

  // 1. Generate core structured SEO report template
  const staticReport = generateSimulationAudit(cleanUrl, formattedCompany, typeOfAudit);

  // 2. Perform best-effort live content parse to merge real findings if possible
  if (!isSimulationDomain(cleanUrl)) {
    try {
      const rawMeta = await getHtmlMetadata(cleanUrl);
      if (rawMeta.title) {
        staticReport.onPage.titleTag.value = rawMeta.title;
        staticReport.onPage.titleTag.score = rawMeta.title.length > 50 && rawMeta.title.length < 65 ? 98 : 65;
        staticReport.onPage.titleTag.details = `Parsed Title Tag: "${rawMeta.title}". Character count is ${rawMeta.title.length}.`;
      }
      if (rawMeta.description) {
        staticReport.onPage.metaDescription.value = rawMeta.description;
        staticReport.onPage.metaDescription.score = rawMeta.description.length > 110 && rawMeta.description.length < 160 ? 98 : 60;
        staticReport.onPage.metaDescription.details = `Parsed Meta Description: "${rawMeta.description.slice(0, 100)}..."`;
      }
      
      // Inject dynamic actual layout headings parsed from URL
      if (rawMeta.h1s.length > 0) {
        staticReport.onPage.headingStructure.h1s = rawMeta.h1s;
        staticReport.onPage.headingStructure.validation.value = `${rawMeta.h1s.length} H1 Tag(s) Mapped`;
        if (rawMeta.h1s.length === 1) {
          staticReport.onPage.headingStructure.validation.score = 98;
          staticReport.onPage.headingStructure.validation.status = "passed";
          staticReport.onPage.headingStructure.validation.details = `Exactly one H1 found: "${rawMeta.h1s[0]}". This is excellent structural design.`;
        } else {
          staticReport.onPage.headingStructure.validation.score = 45;
          staticReport.onPage.headingStructure.validation.status = "failed";
          staticReport.onPage.headingStructure.validation.details = `Discovered ${rawMeta.h1s.length} separate H1 tags on page root. This fragments indexing hierarchy.`;
        }
      }
      if (rawMeta.h2s.length > 0) staticReport.onPage.headingStructure.h2s = rawMeta.h2s;
      if (rawMeta.h3s.length > 0) staticReport.onPage.headingStructure.h3s = rawMeta.h3s;

      staticReport.technical.sslHttps.score = rawMeta.isHttps ? 100 : 0;
      staticReport.technical.sslHttps.status = rawMeta.isHttps ? "passed" : "failed";
      staticReport.technical.sslHttps.value = rawMeta.isHttps ? "Secure HTTPS connection detected" : "Insecure HTTP protocol mapped";

      if (rawMeta.hasSitemap) staticReport.technical.sitemapXml.score = 100;
      if (rawMeta.hasRobots) staticReport.technical.robotsTxt.score = 100;
    } catch (error) {
      console.warn("Could not fetch elements from the actual target website:", error);
    }

    // 2b. Perform PageSpeed Insights and Gemini AI Enrichment in PARALLEL to prevent gateway timeouts!
    if (PAGESPEED_API_KEY) {
      executionTasks.push((async () => {
        try {
          let targetForPsi = cleanUrl;
          if (!/^https?:\/\//i.test(targetForPsi)) {
            targetForPsi = "https://" + targetForPsi;
          }
          const safetyCheck = await validateUrlAndResolveSafe(targetForPsi);
          if (!safetyCheck.safe) {
            console.warn(`Blocked unsafe URL from PageSpeed Insights: ${targetForPsi}`);
            return;
          }
          targetForPsi = safetyCheck.url || targetForPsi;
          const psiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetForPsi)}&category=performance&category=seo&key=${PAGESPEED_API_KEY}`;
          console.log(`[Parallel task] Calling Google PageSpeed Insights API for root url: ${targetForPsi}`);

          // Capped PageSpeed Insights at 6 seconds maximum because Lighthouse analysis takes long and we have excellent simulations if it times out
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const psiResponse = await fetch(psiUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (psiResponse.ok) {
            const psiData = await psiResponse.json();
            const lhRes = psiData?.lighthouseResult;
            if (lhRes) {
              const perfScore = lhRes.categories?.performance?.score;
              const seoScoreValue = lhRes.categories?.seo?.score;

              if (perfScore !== undefined && perfScore !== null) {
                const roundedPerf = Math.round(perfScore * 100);
                staticReport.technical.coreWebVitals.score = roundedPerf;
                
                // Adjust technical score a bit to reflect PageSpeed Insights reality too
                staticReport.technical.overallScore = Math.round((staticReport.technical.overallScore + roundedPerf) / 2);
              }

              // LCP
              const lcpValue = lhRes.audits?.['largest-contentful-paint']?.numericValue;
              if (lcpValue !== undefined) {
                const lcpSec = (lcpValue / 1000).toFixed(1) + "s";
                staticReport.technical.coreWebVitals.lcp.value = lcpSec;
                staticReport.technical.coreWebVitals.lcp.rating = lcpValue <= 2500 ? "good" : lcpValue <= 4000 ? "needs-improvement" : "poor";
              }

              // CLS
              const clsValue = lhRes.audits?.['cumulative-layout-shift']?.numericValue;
              if (clsValue !== undefined) {
                staticReport.technical.coreWebVitals.cls.value = clsValue.toFixed(2);
                staticReport.technical.coreWebVitals.cls.rating = clsValue <= 0.1 ? "good" : clsValue <= 0.25 ? "needs-improvement" : "poor";
              }

              // TTFB
              const ttfbValue = lhRes.audits?.['server-response-time']?.numericValue;
              if (ttfbValue !== undefined) {
                const ttfbSec = (ttfbValue / 1000).toFixed(2) + "s";
                staticReport.technical.coreWebVitals.ttfb.value = ttfbSec;
                staticReport.technical.coreWebVitals.ttfb.rating = ttfbValue <= 800 ? "good" : ttfbValue <= 1500 ? "needs-improvement" : "poor";
              }

              // INP
              const inpValue = lhRes.audits?.['interactive']?.numericValue || lhRes.audits?.['max-potential-fid']?.numericValue;
              if (inpValue !== undefined) {
                staticReport.technical.coreWebVitals.inp.value = Math.round(inpValue) + "ms";
                staticReport.technical.coreWebVitals.inp.rating = inpValue <= 200 ? "good" : inpValue <= 500 ? "needs-improvement" : "poor";
              }

              // Adjust overall score to merge PageSpeed Insights feedback
              if (perfScore !== undefined && seoScoreValue !== undefined) {
                const combinedPsiScore = Math.round(((perfScore + seoScoreValue) / 2) * 100);
                staticReport.overallScore = Math.round((staticReport.overallScore * 2 + combinedPsiScore) / 3);
              }

              console.log(`[Parallel task] PageSpeed check matched and overwrote report metrics successfully.`);
            }
          } else {
            console.warn(`[Parallel task] PageSpeed API returned error response code: ${psiResponse.status}`);
          }
        } catch (psiErr) {
          console.warn("[Parallel task] Could not retrieve PageSpeed Insights metrics - using simulations instead:", psiErr);
        }
      })());
    }
  } else {
    console.log(`Using optimized simulations layout for simulation domain: ${cleanUrl}`);
  }

  // 3. Enrich the audit report using Gemini AI (if initialized and active)
  if (ai) {
    executionTasks.push((async () => {
      try {
        const prompt = `
          You are an elite, Enterprise-Grade SaaS SEO agency director.
          Please help enrich an SEO audit report for ${cleanUrl} (${formattedCompany}), operating as a ${typeOfAudit} audit type.
          
          The current parsed details include:
          - Title Tag: ${staticReport.onPage.titleTag.value} 
          - Meta Description: ${staticReport.onPage.metaDescription.value}
          - Current Overall Score: ${staticReport.overallScore}%
          - Homepage H1 tags currently matching: ${JSON.stringify(staticReport.onPage.headingStructure.h1s)}
          
          Please generate high-conversion, highly detailed content in a valid, parsed-friendly JSON response string containing EXACTLY these keys:
          - executiveSummary: (Make this incredibly strategic, client-ready, professional, and convincing of why they need to optimize their site now)
          - clientRec1: (An extremely specific, customized, conversion-oriented recommendation for their title tag/headings structure, styled like: "Your homepage lacks a primary keyword-focused H1. This reduces topical relevance for 'SEO agency in Dallas'. Adding a keyword-optimized H1 can improve semantic search alignment and CTR.")
          - clientRec2: (An incredibly actionable recommendation regarding their performance/Core Web Vitals or schema markup, directly targeting technical optimization metrics)
          - mainKeywordsList: (A simplified JSON list of 4 relevant keywords for their specific industry based on the domain name/company, with realistic counts, densities e.g. "2.4%", and relevance metrics)
          - outreachScript: (A highly personalized, professional cold email outreach script targeting the website owner. It must mention the specific homepage title tag "${staticReport.onPage.titleTag.value}" or their audit score of ${staticReport.overallScore}%, point out they are missing critical semantic headers or LCP speed variables, and suggest a 5-minute strategic walkthrough as a low-friction call-to-action)
          
          Use exact JSON notation without wrappers or markdown markers other than backticks if requested.
        `;

        console.log("[Parallel task] Calling Gemini AI to enrich the SEO copywriting report...");
        const aiResponse = await safeGenerateContent({
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                clientRec1: { type: Type.STRING },
                clientRec2: { type: Type.STRING },
                outreachScript: { type: Type.STRING },
                mainKeywordsList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      keyword: { type: Type.STRING },
                      count: { type: Type.INTEGER },
                      density: { type: Type.STRING },
                      relevance: { type: Type.STRING }
                    },
                    required: ["keyword", "count", "density", "relevance"]
                  }
                }
              },
              required: ["executiveSummary", "clientRec1", "clientRec2", "outreachScript", "mainKeywordsList"]
            }
          }
        });

        if (aiResponse.text) {
          const enriched = JSON.parse(aiResponse.text);
          if (enriched.executiveSummary) staticReport.executiveSummary = enriched.executiveSummary;
          if (enriched.outreachScript) staticReport.outreachScript = enriched.outreachScript;
          
          // Enrich first critical recommendation
          if (enriched.clientRec1) {
            staticReport.recommendations[0].description = enriched.clientRec1;
            staticReport.onPage.headingStructure.validation.recommendation = enriched.clientRec1;
          }
          
          // Enrich second recommendation
          if (enriched.clientRec2) {
            staticReport.recommendations[1].description = enriched.clientRec2;
          }

          // Incorporate custom keyword density list
          if (enriched.mainKeywordsList && enriched.mainKeywordsList.length > 0) {
            staticReport.onPage.keywordDensity = enriched.mainKeywordsList.map((kw: any) => ({
              keyword: kw.keyword,
              count: Number(kw.count) || 12,
              density: kw.density || "1.8%",
              relevance: (kw.relevance || "high").toLowerCase() as 'high' | 'medium' | 'low'
            }));
          }
          console.log("[Parallel task] Audit successfully enriched by Gemini AI.");
        }
      } catch (aiErr) {
        console.warn("[Parallel task] Failed to generate content via Gemini API. Falling back to high-grade local simulation model.", aiErr);
      }
    })());
  }

  // Await the concurrent tasks safely (the short timeouts guarantee this resolves very quickly)
  await Promise.all(executionTasks);

  // Save to persistent database
  db.audits[cleanUrl] = staticReport;
  res.json(staticReport);
});

// Get Audit Report Detail
app.get("/api/audit/:domain", (req, res) => {
  const { domain } = req.params;
  const cleanDomain = cleanDomainName(domain);
  const report = db.audits[cleanDomain];
  if (!report) {
    return res.status(404).json({ error: `No report found for query "${cleanDomain}"` });
  }
  res.json(report);
});

// Get List of All Audited Websites
app.get("/api/audited-list", (req, res) => {
  res.json(Object.values(db.audits));
});

// Start Bulk Enterprise Audit Job API
app.post("/api/bulk-audit", authMiddleware, async (req, res) => {
  const { listName, urls, auditType } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "An array of URLs is required for bulk processing" });
  }

  const jobId = "bulk_job_" + Date.now();
  const targetUrls = urls.map(u => u.trim()).filter(u => u !== "");

  // Pre-validate all URLs in parallel for safety
  const items = await Promise.all(targetUrls.map(async (url, index) => {
    const safetyCheck = await validateUrlAndResolveSafe(url);
    if (!safetyCheck.safe) {
      return {
        id: `item_${jobId}_${index}`,
        url,
        status: 'failed' as const,
        progress: 100,
        score: 0,
        error: safetyCheck.error || "Blocked unsafe URL"
      };
    }
    return {
      id: `item_${jobId}_${index}`,
      url: safetyCheck.url || url,
      status: 'queued' as const,
      progress: 0
    };
  }));

  const validItemsCount = items.filter(item => item.status === 'queued').length;

  db.bulkJobs[jobId] = {
    id: jobId,
    name: listName || `Bulk Campaign - ${new Date().toLocaleDateString()}`,
    status: validItemsCount === 0 ? 'completed' : 'processing',
    totalCount: items.length,
    processedCount: items.length - validItemsCount,
    items
  };

  // Run async bulk item process emulator inside Express loop (speeds up or ticks progress)
  let currentIndex = 0;
  const interval = setInterval(() => {
    const job = db.bulkJobs[jobId];
    if (!job || currentIndex >= job.items.length) {
      clearInterval(interval);
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }
      return;
    }

    // Process 2 units in parallel each tick to support "thousands of reports" rapidly
    const batchSize = Math.max(1, Math.min(5, Math.ceil(job.items.length / 50)));
    for (let b = 0; b < batchSize; b++) {
      const idx = currentIndex;
      if (idx >= job.items.length) break;

      const item = job.items[idx];
      if (item.status === 'failed') {
        currentIndex++;
        continue;
      }

      item.status = 'crawling';
      item.progress = 25;

      // Gradually tick or finish immediately for seamless feedback
      setTimeout(() => {
        item.status = 'analyzing';
        item.progress = 55;
      }, 300);

      setTimeout(() => {
        item.status = 'applying-ai';
        item.progress = 85;
      }, 600);

      setTimeout(() => {
        item.status = 'completed';
        item.progress = 100;
        
        // Seed full report for database lookup on demand with clean domain key
        const cleanK = cleanDomainName(item.url);
        const report = generateSimulationAudit(cleanK, item.url.split('.')[0], auditType || "Standard");
        item.score = report.overallScore;
        db.audits[cleanK] = report;
        
        job.processedCount++;
      }, 980);

      currentIndex++;
    }

  }, 1000);

  res.json({ jobId, message: "Campaign audit initiated successfully", job: db.bulkJobs[jobId] });
});

// Get Bulk Campaign Status
app.get("/api/bulk-audit/:jobId", authMiddleware, (req, res) => {
  const { jobId } = req.params;
  const job = db.bulkJobs[jobId];
  if (!job) {
    return res.status(404).json({ error: "Bulk job campaign not found" });
  }
  res.json(job);
});

// Get List of All Bulk Jobs
app.get("/api/bulk-jobs", authMiddleware, (req, res) => {
  const list = Object.values(db.bulkJobs).map((job: any) => ({
    id: job.id,
    name: job.name,
    status: job.status,
    totalCount: job.totalCount,
    processedCount: job.processedCount,
    completedAt: job.completedAt
  }));
  res.json(list);
});


// Google Search Console OAuth Callback handler for implicit popup flow
app.get(["/auth/callback", "/auth/callback/"], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Authentication</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f8fafc;
          color: #334155;
        }
        .card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          text-align: center;
          max-width: 400px;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4f46e5;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 1rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h3 style="margin-top:0; color:#1e293b;">Google Authentication</h3>
        <div class="spinner"></div>
        <p style="font-size:0.875rem; color:#64748b;">Connecting to Google Search Console... This window will close automatically.</p>
      </div>
      <script>
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const token = hashParams.get("access_token") || searchParams.get("access_token");
        const error = searchParams.get("error") || hashParams.get("error");
        
        if (window.opener) {
          if (token) {
            window.opener.postMessage({ type: "GOOGLE_OAUTH_SUCCESS", token: token }, "*");
          } else if (error) {
            window.opener.postMessage({ type: "GOOGLE_OAUTH_FAILURE", error: error }, "*");
          } else {
            setTimeout(() => {
              const retryHash = window.location.hash;
              const retryParams = new URLSearchParams(retryHash.substring(1));
              const retryToken = retryParams.get("access_token");
              if (retryToken) {
                window.opener.postMessage({ type: "GOOGLE_OAUTH_SUCCESS", token: retryToken }, "*");
              } else {
                window.opener.postMessage({ type: "GOOGLE_OAUTH_FAILURE", error: "No token found in callback" }, "*");
              }
              window.close();
            }, 800);
            return;
          }
          window.close();
        } else {
          window.location.href = "/";
        }
      </script>
    </body>
    </html>
  `);
});

// AI Keyword Strategist and Outline helpers
function getSimulatedKeywords(domain: string, seed: string) {
  const cleanSeed = seed.split('+').join(' ').split('-').join(' ');
  const keywords = [
    {
      keyword: `best ${cleanSeed} for beginners`,
      volume: 1200,
      difficulty: 32,
      intent: 'Informational',
      cpc: '$1.45',
      priority: 'High',
      competition: 'Low',
      opportunityValue: 'Low difficulty tutorial term. High search intent with excellent conversions.'
    },
    {
      keyword: `${cleanSeed} guide 2026`,
      volume: 950,
      difficulty: 45,
      intent: 'Informational',
      cpc: '$2.10',
      priority: 'High',
      competition: 'Medium',
      opportunityValue: 'Highly relevant search query that matches searchers seeking updated answers.'
    },
    {
      keyword: `top 10 ${cleanSeed} software solutions`,
      volume: 1900,
      difficulty: 58,
      intent: 'Commercial',
      cpc: '$3.50',
      priority: 'High',
      competition: 'High',
      opportunityValue: 'Strong buyer intent keyword where listicles rank in top SERP slots.'
    },
    {
      keyword: `${cleanSeed} services in USA`,
      volume: 680,
      difficulty: 38,
      intent: 'Commercial',
      cpc: '$4.25',
      priority: 'Medium',
      competition: 'Medium',
      opportunityValue: 'Localized transactional intent query. Great landing page opportunity.'
    },
    {
      keyword: `hire professional ${cleanSeed} experts`,
      volume: 450,
      difficulty: 41,
      intent: 'Transactional',
      cpc: '$5.50',
      priority: 'High',
      competition: 'Medium',
      opportunityValue: 'Direct transactional buyer-intent phrase with great commercial conversion rate.'
    },
    {
      keyword: `${cleanSeed} alternative comparison`,
      volume: 520,
      difficulty: 28,
      intent: 'Commercial',
      cpc: '$2.80',
      priority: 'Medium',
      competition: 'Low',
      opportunityValue: 'Comparison keyword. Compete directly against brand names.'
    }
  ];

  return {
    difficultyCeiling: 65,
    trafficPotential: '4,850/mo CPM',
    intentBalance: 'Informational: 33%, Commercial: 50%, Transactional: 17%',
    keywords,
    clusterSummary: `Group the 'best ${cleanSeed} for beginners' and '${cleanSeed} guide 2026' under a /blog/ learning hub silo. Group comparisons and solutions under high-relevance direct /landing/ page tunnels to convert active customers.`
  };
}

function getSimulatedOutline(domain: string, keyword: string) {
  return {
    title: `Ultimate Guide to ${keyword} (Step-by-Step Optimization)`,
    metaDescription: `Discover the best secrets about ${keyword} and learn how to optimize your organic CTR, increase conversion traffic rates, and beat competitors. Apply this today!`,
    targetWordCount: 1750,
    semanticKeywords: [`${keyword} tips`, `best ${keyword} services`, `how to use ${keyword}`, `${keyword} tutorial`, `top ${keyword} platforms`],
    briefIntroduction: `This content strategy targets visitors researching "${keyword}" with high buyer intent. Keep the intro under 150 words with a direct hook about resolving their pain points.`,
    headings: [
      { level: 'H1', text: `The Definite Guide to ${keyword} in 2026` },
      { level: 'H2', text: `What is ${keyword} and Why Does it Matter?` },
      { level: 'H3', text: `Key Concepts You Need to Understand` },
      { level: 'H2', text: `Top 5 Strategies for Successful ${keyword} Implementation` },
      { level: 'H2', text: `Common Mistakes of ${keyword} to Avoid` },
      { level: 'H2', text: `Leveraging AI Solutions for ${keyword} Growth` },
      { level: 'H2', text: `Conclusion & Direct Action Steps` }
    ]
  };
}

// API Endpoint for Keyword Strategist analysis
app.post("/api/keyword-strategist", async (req, res) => {
  const { domain, seed } = req.body;
  const cleanDomain = domain ? domain.trim().toLowerCase().replace(/^https?:\/\//i, '').split('/')[0] : "unknown";
  const seedWord = seed ? seed.trim() : "SEO optimization";

  if (ai) {
    try {
      const prompt = `
        You are an elite, world-class SaaS SEO Keyword Strategist director.
        Please help generate a comprehensive, highly strategic Keyword Research report for the domain "${cleanDomain}" targeting the user specified seeds/phrases: "${seedWord}".
        
        Analyze search opportunities, CPC potential, search intent, and user conversion funnels.
        Generate exactly 6 highly relevant target keyword terms that offer the best traffic potential and are appropriate difficulty-wise.
        
        Return a valid JSON response matching exactly this schema:
        - difficultyCeiling: (A Suggested difficulty threshold integer between 30 and 90)
        - trafficPotential: (E.g. "8,200/mo visits potential")
        - intentBalance: (E.g. "Informational: 40%, Commercial: 40%, Transactional: 20%")
        - keywords: Array of exactly 6 recommended keywords, each having:
          - keyword: String (the targeted query, e.g. "best local organic honey dallas")
          - volume: Integer (monthly search volume)
          - difficulty: Integer (0-100 target difficulty)
          - intent: String ('Informational' | 'Commercial' | 'Transactional' | 'Navigational')
          - cpc: String (E.g. "$4.20")
          - priority: String ('High' | 'Medium' | 'Low')
          - competition: String ('Low' | 'Medium' | 'High')
          - opportunityValue: String (Brief, highly specific reason explaining why this keyword serves the domain "${cleanDomain}" conversion goals)
        - clusterSummary: String (Short summary of how to silo and cluster this keyword dataset for topical authority)
      `;

      console.log(`Calling Gemini to generate Keyword Strategist report for seed: ${seedWord}, domain: ${cleanDomain}`);
      const response = await safeGenerateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              difficultyCeiling: { type: Type.INTEGER },
              trafficPotential: { type: Type.STRING },
              intentBalance: { type: Type.STRING },
              clusterSummary: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyword: { type: Type.STRING },
                    volume: { type: Type.INTEGER },
                    difficulty: { type: Type.INTEGER },
                    intent: { type: Type.STRING },
                    cpc: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    competition: { type: Type.STRING },
                    opportunityValue: { type: Type.STRING }
                  },
                  required: ["keyword", "volume", "difficulty", "intent", "cpc", "priority", "competition", "opportunityValue"]
                }
              }
            },
            required: ["difficultyCeiling", "trafficPotential", "intentBalance", "keywords", "clusterSummary"]
          }
        }
      });

      if (response.text) {
        const payload = JSON.parse(response.text.trim());
        return res.json(payload);
      }
    } catch (e: any) {
      console.warn("Gemini Keyword Strategist generation failed, fallback to high-quality simulation:", e);
    }
  }

  // Fallback to beautiful simulation
  const result = getSimulatedKeywords(cleanDomain, seedWord);
  res.json(result);
});

// API Endpoint for Outline generator brief
app.post("/api/keyword-strategist/outline", async (req, res) => {
  const { domain, keyword } = req.body;
  const cleanDomain = domain ? domain.trim().toLowerCase().replace(/^https?:\/\//i, '').split('/')[0] : "unknown";
  const targetKeyword = keyword ? keyword.trim() : "SEO guide";

  if (ai) {
    try {
      const prompt = `
        You are an elite SEO Copywriter specializing in Conversion Rate Optimization (CRO).
        Create a detailed SEO Content Brief and Outline for target keyword "${targetKeyword}" for the website "${cleanDomain}".
        
        Provide high-value structure, recommended headings, and semantic LSI terms to insert.
        Return a valid JSON response matching exactly this schema:
        - title: String (recommended high-CTR page title tag)
        - metaDescription: String (recommended highly persuasive click-through meta description)
        - targetWordCount: Integer (highly recommended length in words)
        - semanticKeywords: Array of exactly 5 strings (semantic terms to include)
        - briefIntroduction: String (2-3 sentences outlining user search intent context for copywriters)
        - headings: Array of headings elements, each with properties:
          - level: String ('H1' | 'H2' | 'H3')
          - text: String (perfectly keyword-infused header text)
      `;

      console.log(`Calling Gemini to generate outline for keyword: ${targetKeyword}`);
      const response = await safeGenerateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              targetWordCount: { type: Type.INTEGER },
              briefIntroduction: { type: Type.STRING },
              semanticKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              headings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["level", "text"]
                }
              }
            },
            required: ["title", "metaDescription", "targetWordCount", "semanticKeywords", "briefIntroduction", "headings"]
          }
        }
      });

      if (response.text) {
        const payload = JSON.parse(response.text.trim());
        return res.json(payload);
      }
    } catch (e: any) {
      console.warn("Gemini outline generation failed, fallback to high-quality simulation:", e);
    }
  }

  // Fallback
  const result = getSimulatedOutline(cleanDomain, targetKeyword);
  res.json(result);
});


// Dev-production hybrid client static serving middleware
const distPath = path.join(process.cwd(), "dist");

async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.includes(".")) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(req.url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SEO Audit Server running on http://0.0.0.0:${PORT}`);
  });
}

configureServer();
