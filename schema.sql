-- Revenue Clutch Audit Engine - Cloudflare D1 SQL Schema Database bootstraps
-- SQLite compliant syntax for D1 persistent storage setups.

DROP TABLE IF EXISTS audits;
CREATE TABLE audits (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    company_name TEXT,
    audit_type TEXT DEFAULT 'Standard',
    overall_score INTEGER DEFAULT 0,
    report_json TEXT, -- Complete JSON payload for detailed report retrievals
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS leads;
CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    company TEXT,
    phone TEXT,
    status TEXT DEFAULT 'New', -- New, Contacted, Proposal Sent, Closed Won, Archived
    notes TEXT,
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS oauth_tokens;
CREATE TABLE oauth_tokens (
    service TEXT PRIMARY KEY, -- e.g. google_gsc
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT NOT NULL
);

DROP TABLE IF EXISTS bulk_jobs;
CREATE TABLE bulk_jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_urls INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS bulk_queue;
CREATE TABLE bulk_queue (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'queued', -- queued, crawling, completed, failed
    progress INTEGER DEFAULT 0,
    score INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY(job_id) REFERENCES bulk_jobs(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS keyword_history;
CREATE TABLE keyword_history (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    keyword TEXT NOT NULL,
    volume INTEGER,
    difficulty INTEGER,
    relevance TEXT,
    created_at TEXT NOT NULL
);

-- Index mappings for quick retrievals and audit lookups
CREATE INDEX IF NOT EXISTS idx_audits_domain ON audits(domain);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_queue_job ON bulk_queue(job_id);
