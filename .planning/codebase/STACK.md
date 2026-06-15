# Technology Stack

**Analysis Date:** 2026-06-13

## Languages

**Primary:**
- JavaScript (Node.js) - Document generation scripts in `outputs/lawfirm_pamphlet.js`, `outputs/lawfirm_emails.js`, `outputs/medspa_pamphlet.js`

**Secondary:**
- Python 3.12.3 - Lead scraping script in `outputs/scrape_leads.py`

## Runtime

**Environment:**
- Node.js v22.21.1 - Used for document generation scripts in `outputs/`
- Python 3.12.3 - Used for `outputs/scrape_leads.py` lead scraper

**Package Manager:**
- npm (Node.js) - `outputs/package.json` present with `outputs/node_modules/`
- pip (Python) - No `requirements.txt` present; `requests` and `json` used in scraper (stdlib + requests)
- Lockfile: `outputs/node_modules/.package-lock.json` present

## Frameworks

**Core:**
- None (no web server framework) - all scripts are standalone CLI tools run directly with `node` or `python3`

**Build/Dev:**
- None - scripts run directly, no build step required
- `docx` 9.6.1 - Used in all JS document generators to produce `.docx` output files

**Automation Platform:**
- n8n (self-hosted, free tier) - central workflow automation platform; 188 workflow template categories in `workflows/`; Twilio, Gmail, Google Calendar, Calendly, Lemlist, OpenAI, Airtable, Hunter, and 180+ other service connectors present as n8n workflow JSON templates

## Key Dependencies

**Critical (installed in `outputs/node_modules/`):**
- `docx` 9.6.1 - Office Open XML document generation; used by all three JS scripts to produce `.docx` pamphlets and email documents
- `jszip` 3.10.1 - Transitive dependency of `docx`; handles ZIP packaging of OOXML format
- `nanoid` 5.1.11 - Unique ID generation; transitive dependency of `docx`
- `xml-js` 1.6.11 - XML serialization; transitive dependency of `docx`
- `pako` 1.0.11 - zlib compression; transitive dependency of `docx`

**Python (not in a lockfile — must install manually):**
- `requests` - HTTP client used in `outputs/scrape_leads.py` for Scrapeless API calls
- `json`, `time` - Standard library modules (no install needed)

**Infrastructure:**
- n8n (self-hosted) - no version pinned in this repo; manages all third-party workflow integrations
- Node.js standard library (`fs`) - used in all JS scripts for file writes

## Configuration

**Environment:**
- No `.env` file present in the lawfirm directory
- API keys referenced by name in `SYSTEM_PLAN.md`: `APIFY_TOKEN` stored in `~/.bashrc` (per user memory)
- Scrapeless API key is hardcoded in `outputs/scrape_leads.py` (deprecated script, wrong niche — replaced by Apify `new-leads-scraper` skill)
- Claude API key required for demo SMS qualify flow (not yet configured in this repo)
- Twilio credentials not yet set up (identified as a pending requirement in `SYSTEM_PLAN.md`)

**Build:**
- No build config — scripts are run directly: `node outputs/lawfirm_pamphlet.js`
- Output `.docx` files written to `outputs/` directory

## Platform Requirements

**Development:**
- Node.js v22+ (confirmed at v22.21.1)
- Python 3.12+ (confirmed at 3.12.3)
- n8n self-hosted instance (already running per `SYSTEM_PLAN.md`)
- WSL2 / Linux environment (Ubuntu on WSL2)

**Production:**
- n8n self-hosted for all automation workflows
- Twilio account (required for demo SMS flow — not yet provisioned)
- Claude API account (required for AI qualification in demo)
- GoHighLevel (~$97–297/mo) — deferred until first client signs

---

*Stack analysis: 2026-06-13*
