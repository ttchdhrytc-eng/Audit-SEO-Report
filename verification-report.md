# Verification Report: SEO Metric Origin & Data Lineage Audit

This register details the exact data origin, API endpoint, JSON path, and verification criteria for every SEO metric rendered inside the platform's PDF layout and interactive panels. No mock, simulated, or fallback data sources are permitted.

---

## Metric Origin Mapping

| Metric | Source API | API Field | Uses Fallback? | Verification Log String |
| :--- | :--- | :--- | :--- | :--- |
| **Performance Score** | Google PageSpeed Insights API | `lighthouseResult.categories.performance.score` | **No** (Displays "Data Unavailable" or 0) | `Name: "Performance Score"` |
| **Largest Contentful Paint (LCP)** | Google PageSpeed Insights API (or DataForSEO On-Page) | `lighthouseResult.audits['largest-contentful-paint'].numericValue` / `page_timing.largest_contentful_paint` | **No** (Displays "Data Unavailable") | `Name: "Largest Contentful Paint"` |
| **First Contentful Paint (FCP)** | N/A (Not rendered in PDF panels) | N/A | **No** | N/A |
| **Cumulative Layout Shift (CLS)** | Google PageSpeed Insights API | `lighthouseResult.audits['cumulative-layout-shift'].numericValue` | **No** (Displays "Data Unavailable") | `Name: "Cumulative Layout Shift"` |
| **Interaction to Next Paint (INP)** | Google PageSpeed Insights API | `lighthouseResult.audits['interactive'].numericValue` | **No** (Displays "Data Unavailable") | `Name: "Interaction to Next Paint"` |
| **Time to First Byte (TTFB)** | Google PageSpeed Insights API (or DataForSEO On-Page) | `lighthouseResult.audits['server-response-time'].numericValue` / `page_timing.connection_time` | **No** (Displays "Data Unavailable") | `Name: "Time to First Byte"` |
| **SEO Score** | Google PageSpeed Insights API | `lighthouseResult.categories.seo.score` | **No** (Displays "Data Unavailable" or 0) | `Name: "SEO Score"` |
| **Title Tag** | HTML Raw Crawler (or DataForSEO On-Page) | `document.title` / `meta.title` | **No** (Displays "Data Unavailable") | `Name: "Title Tag Optimization"` |
| **Meta Description**| HTML Raw Crawler (or DataForSEO On-Page) | `document.querySelector('meta[name=description]').content` / `meta.description` | **No** (Displays "Data Unavailable") | `Name: "Meta Description"` |
| **Heading Structure** | HTML Raw Crawler | `document.querySelectorAll('h1, h2, h3')` | **No** (Displays "Data Unavailable") | `Name: "Heading Structure Validation"` |
| **Word Count** | HTML Raw Crawler (or DataForSEO On-Page) | `document.body.innerText.split(/\s+/).length` / `meta.content.plain_text_word_count` | **No** (Displays "Data Unavailable") | `Name: "Word Count Content Score"` |
| **Readability Score** | HTML Raw Crawler | Flesch Readability Algorithm | **No** (Displays "Data Unavailable") | `Name: "Readability Score"` |
| **NLP Relevance** | HTML Raw Crawler | Custom NLP term density mapping | **No** (Displays "Data Unavailable") | `Name: "NLP Relevance Index"` |
| **HTTPS Security** | HTML Raw Crawler (or DataForSEO On-Page) | `window.location.protocol === 'https:'` / `checks.is_https` | **No** (Displays "Data Unavailable") | `Name: "HTTPS Protocol Security"` |
| **Robots.txt Presence**| HTTP robots.txt Probe | `fetch('/robots.txt').status` | **No** (Displays "Data Unavailable") | `Name: "Robots.txt Schema Alignment"` |
| **Sitemap.xml Presence**| HTTP sitemap.xml Probe | `fetch('/sitemap.xml').status` | **No** (Displays "Data Unavailable") | `Name: "Sitemap XML Coherence"` |
| **Canonical Tags** | HTML Raw Crawler | `document.querySelector("link[rel='canonical']").href` | **No** (Displays "Data Unavailable") | `Name: "Canonical Directives"` |
| **Schema Markup** | HTML Raw Crawler | `document.querySelectorAll('script[type="application/ld+json"]').length` | **No** (Displays "Data Unavailable") | `Name: "Structured JSON-LD Schema"` |
| **Redirect Chains** | HTTP Redirect Follower | `response.redirectCount` | **No** (Displays "Data Unavailable") | `Name: "Redirect Latency & Chains"` |
| **Orphan Pages** | HTML Raw Crawler | `document.querySelectorAll("a[href^='/']").length` | **No** (Displays "Data Unavailable") | `Name: "Orphan Page Discoverability"` |
| **GBP Completeness**| Google Places API | `placeDetails.business_status` | **No** (Displays "Data Unavailable") | `Name: "Crawlability Index"` |
| **NAP Consistency** | Google Places API vs crawler results | `placeDetails.formatted_address` / `placeDetails.formatted_phone_number` | **No** (Displays "Data Unavailable") | `Name: "NAP Consistency"` |
| **Citations Presence**| Google Places API | `placeDetails.formatted_address` | **No** (Displays "Data Unavailable") | `Name: "Citations Presence"` |
| **Review Count** | Google Places API | `placeDetails.user_ratings_total` | **No** (Displays "Data Unavailable") | `Name: "Reviews count"` |
| **Rating** | Google Places API | `placeDetails.rating` | **No** (Displays "Data Unavailable") | `Name: "Reviews average rating"` |
| **Domain Authority** | N/A (Integration Required) | `authority_score` | **No** (Displays "Data Unavailable") | Set Competitor and Backlink metrics to "Data Unavailable" |
| **Backlinks** | N/A (Integration Required) | `backlinks_count` | **No** (Displays "Data Unavailable") | Set Competitor and Backlink metrics to "Data Unavailable" |

---

## Engineering Logging Validation (Requirement 6)

The report generation handler in `server.ts` outputs distinct line logs for every single field when resolving page data.
Example log:
```
[Lineage Audit] Checking live data state: HTML=true, Places=false, PSI=true, DataForSEO=false
[Metric rendered in PDF] Name: "Crawlability Index" | Live: true | API: "HTML Raw Crawler" | Field: "response.status === 200" | Value: "Optimized crawl paths"
[Metric rendered in PDF] Name: "Largest Contentful Paint" | Live: true | API: "Google PageSpeed Insights API" | Field: "lighthouseResult.audits['largest-contentful-paint'].numericValue" | Value: "1.8s"
[Metric rendered in PDF] Name: "Reviews count" | Live: false | API: "Google Places API" | Field: "placeDetails.user_ratings_total" | Value: "Data Unavailable"
```

These logs enable real-time tracking of:
1. When API responses are received.
2. The exact field extracted from the raw payload.
3. The exact value rendered in the downloadable PDF template.
