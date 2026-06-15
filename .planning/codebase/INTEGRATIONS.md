# External Integrations

**Analysis Date:** 2026-06-13

## APIs & External Services

**Lead Scraping & Enrichment:**
- Apify - Primary lead scraping platform; powers `new-leads-scraper` skill (Apify Google Maps Lead Scraper actor); replaces deprecated `outputs/scrape_leads.py`
  - SDK/Client: Apify Actor HTTP API (called via the skill, not directly in this repo's code)
  - Auth: `APIFY_TOKEN` env var stored in `~/.bashrc`
  - Cost: ~$0.004/lead; 50 leads ≈ $0.20
- Scrapeless - Deprecated alternative scraper used in `outputs/scrape_leads.py`
  - Endpoint: `https://api.scrapeless.com/api/v1/scraper/request`
  - Auth: hardcoded key in `outputs/scrape_leads.py` (do not use — script targets wrong niche)
- Hunter.io - Email enrichment fallback when Apify does not return email addresses
  - SDK/Client: n8n Hunter node (`workflows/Hunter/` — 5 workflow templates)
  - Auth: Hunter API key (not yet configured in this repo)

**AI / Language Models:**
- Anthropic Claude API - Powers the SMS qualification bot in the demo flow and production intake
  - Architecture: `Prospect SMS → Twilio → n8n webhook → Claude API → Twilio reply + Calendar link` (see `SYSTEM_PLAN.md` §3)
  - Auth: `ANTHROPIC_API_KEY` (not yet set up in lawfirm environment)
  - Constraint: System prompt must qualify and schedule only — no legal advice (compliance requirement in `SYSTEM_PLAN.md` §5)
- OpenAI API - Listed in `outputs/lawfirm_pamphlet.js` tech stack table as "Natural language qualification" alternative (~$5–10/mo per client); n8n OpenAI node templates in `workflows/Openai/`
  - Auth: OpenAI API key via n8n credentials

**SMS / Voice:**
- Twilio - Inbound and outbound SMS for the demo number and production client intake
  - Use: prospect texts a number → Twilio webhook fires → n8n processes → Claude qualifies → Twilio sends reply
  - Auth: Twilio Account SID + Auth Token (not yet provisioned — flagged as open decision in `SYSTEM_PLAN.md` §7)
  - Cost: ~$1/mo per number + pennies/SMS
  - n8n templates: `workflows/Twilio/` (3 workflow templates: Typeform-triggered, Stickynote-triggered, Cron-scheduled)

**Calendar & Scheduling:**
- Google Calendar - Consultation booking target; n8n templates in `workflows/Googlecalendar/` (6 templates)
  - Auth: Google OAuth2 via n8n credentials
- Calendly - Alternative booking tool; listed in `outputs/lawfirm_pamphlet.js` tech stack table ("Free tier"); n8n templates in `workflows/Calendly/` (7 templates)
  - Auth: Calendly API key or OAuth via n8n

**Email Sending / Cold Outreach:**
- Gmail / Gmail API - Primary email sending channel; n8n templates in `workflows/Gmail/` (8 templates) and `workflows/Gmailtool/`
  - Auth: Google OAuth2 via n8n credentials
- Lemlist - Cold email sequencing platform; n8n templates in `workflows/Lemlist/` (3 templates — all Slack-notified)
  - Auth: Lemlist API key via n8n credentials
- Smartlead - Cold email sequencing alternative (mentioned in `SYSTEM_PLAN.md` §3 and §7); no dedicated workflow directory found — used via HTTP node or not yet implemented
  - Auth: Smartlead API key
- Emelia - Additional cold outreach tool; n8n template in `workflows/Emelia/` (1 template)
  - Auth: Emelia API key via n8n credentials

**CRM / Pipeline:**
- GoHighLevel (GHL) - The primary fulfillment CRM sold to signed law firm clients; provides AI conversations, calendar, and CRM in one platform
  - Status: Deferred until first client signs (see `SYSTEM_PLAN.md` §4); not yet integrated in this repo
  - Cost: ~$97–297/mo (ideally billed to client, not operator)
- Airtable - Lead tracking and pipeline visibility for the operator's own dashboard; listed in `outputs/lawfirm_pamphlet.js` tech stack table ("Free tier")
  - n8n templates: `workflows/Airtable/` (4 templates)
  - Auth: Airtable API key via n8n credentials
- HubSpot - Available in workflow library (`workflows/Hubspot/`, 3+ templates) but not referenced in `SYSTEM_PLAN.md` for PI funnel

**Legal Practice Management (Fulfillment Layer):**
- Clio - Mentioned in `SYSTEM_PLAN.md` §4 as target legal CRM integration for signed clients
  - Status: Deferred — integration built per signed client
- Filevine - Mentioned in `SYSTEM_PLAN.md` §4 as alternative legal CRM
  - Status: Deferred
- MyCase - Mentioned in `SYSTEM_PLAN.md` §4 as alternative legal CRM
  - Status: Deferred

## Data Storage

**Databases:**
- None deployed in this repo
- Planned (fulfillment layer): PostgreSQL templates available in `workflows/Postgres/` (5 templates); Supabase templates in `workflows/Supabase/` (3 templates)

**File Storage:**
- Local filesystem only - CSV lead lists stored in `uploads/law_firm_leads.csv`; generated `.docx` files written to `outputs/`
- AWS S3 templates available in `workflows/Awss3/` (not used in current build)

**Caching:**
- Redis templates available in `workflows/Redis/` (not deployed)

**Spreadsheets (lightweight data store):**
- Google Sheets - Used as a lightweight pipeline/lead store in n8n workflows; `workflows/Googlesheets/` contains 5+ templates
  - Auth: Google OAuth2 via n8n credentials

## Authentication & Identity

**Auth Provider:**
- No centralized auth system — each external service authenticates independently via n8n credential store or hardcoded keys
- n8n credential manager holds OAuth tokens and API keys for all connected services

## Monitoring & Observability

**Error Tracking:**
- `audit.jsonl` - JSONL audit log of all Claude agent interactions and tool calls; stored at `/home/joeyg/claude/lawfirm/audit.jsonl`
- n8n built-in execution history - n8n logs all workflow runs with input/output and error state

**Logs:**
- `console.log` / `console.error` in all JS scripts (`outputs/lawfirm_pamphlet.js`, `outputs/lawfirm_emails.js`, `outputs/medspa_pamphlet.js`)
- `print()` statements in `outputs/scrape_leads.py`
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- WSL2 / Ubuntu on local Windows machine — all services run locally
- n8n: self-hosted (free tier, already running)

**CI Pipeline:**
- None

## Environment Configuration

**Required env vars (not all provisioned yet):**
- `APIFY_TOKEN` — Apify scraping platform (stored in `~/.bashrc`)
- `ANTHROPIC_API_KEY` — Claude API for demo qualification bot (not yet set up in lawfirm env)
- Twilio Account SID + Auth Token — for demo SMS number (not yet provisioned)
- Google OAuth2 credentials — for Gmail / Google Calendar n8n nodes
- Hunter.io API key — for email enrichment fallback
- Calendly API key — for booking link generation (if using Calendly over Google Calendar)
- Lemlist / Smartlead API key — for cold email sequencing (decision pending per `SYSTEM_PLAN.md` §7)

**Secrets location:**
- `APIFY_TOKEN` in `~/.bashrc`
- All other API keys managed inside n8n credential store (not stored in this repo)
- `outputs/scrape_leads.py` contains a hardcoded Scrapeless key (deprecated script — do not use)

## Webhooks & Callbacks

**Incoming:**
- Demo SMS webhook: inbound Twilio SMS fires an n8n webhook trigger → Claude qualify flow → Twilio reply (architecture described in `SYSTEM_PLAN.md` §3; not yet built)
- Google Ads lead webhook: inbound ad form submissions fire into n8n for intake processing (fulfillment layer — deferred; template in `workflows/Webhook/`)
- Calendly webhook: booking confirmation fires n8n to log and notify (template in `workflows/Calendly/0430_Calendly_Filter_Create_Triggered.json`)

**Outgoing:**
- Twilio SMS replies — sent by n8n after Claude qualification
- Google Calendar / Calendly booking link — sent to qualified leads via SMS reply
- Email follow-up sequences — sent via Gmail / Lemlist / Smartlead from n8n over a 14-day drip

---

*Integration audit: 2026-06-13*
