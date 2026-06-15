# Codebase Structure

**Analysis Date:** 2026-06-13

## Directory Layout

```
lawfirm/
├── SYSTEM_PLAN.md                          # 5-subsystem machine map + 30-day checklist (master strategy)
├── AI_Funnel_PersonalInjuryLaw_Edition (1).pdf  # Offer document — pricing, compliance, onboarding
├── audit.jsonl                             # Claude session audit log
│
├── uploads/                                # Lead input data (raw CSVs from scraping runs)
│   └── law_firm_leads.csv                  # NYC general law firms — wrong ICP, must be replaced
│
├── outputs/                                # Generated collateral + scripts
│   ├── package.json                        # Node.js manifest — single dep: docx ^9.6.1
│   ├── package-lock.json
│   ├── node_modules/                       # docx library + transitive deps (jszip, etc.)
│   │
│   ├── lawfirm_emails.js                   # ACTIVE: generates lawfirm_outreach_emails.docx
│   ├── lawfirm_outreach_emails.docx        # Generated outreach emails (NYC general law — stale ICP)
│   ├── lawfirm_pamphlet.js                 # ACTIVE: generates lawfirm_automation_pamphlet.docx
│   ├── lawfirm_automation_pamphlet.docx    # Generated pitch deck for law firm vertical
│   │
│   ├── medspa_pamphlet.js                  # Medspa vertical pamphlet generator (prior niche)
│   ├── medspa_automation_pamphlet.docx     # Generated medspa pitch deck
│   ├── realestate_pamphlet.js              # Real estate vertical pamphlet generator (prior niche)
│   ├── realestate_automation_pamphlet.docx # Generated real estate pitch deck
│   │
│   ├── ai_workflow_leads.md                # Scored content-agency leads (prior niche, not PI)
│   └── scrape_leads.py                     # DEPRECATED: Scrapeless scraper — wrong niche + broken path
│
├── workflows/                              # n8n workflow template library (188 subdirs)
│   ├── Twilio/                             # 4 templates — SMS trigger/send
│   ├── Gmail/                              # 8 templates — email send/receive
│   ├── Lemlist/                            # 3 templates — cold email sequencing
│   ├── Linkedin/                           # 13 templates — LinkedIn outreach/scraping
│   ├── Calendly/                           # 7 templates — booking event triggers
│   ├── Googlecalendar/                     # 8 templates — calendar event management
│   ├── Googlecalendartool/                 # Calendar tool-node variants
│   ├── Webhook/                            # 65 templates — webhook trigger patterns (largest)
│   ├── Hunter/                             # 5 templates — email enrichment
│   ├── Openai/                             # 8 templates — AI completion nodes
│   ├── Googlesheets/                       # 26 templates — data logging / CRM-lite
│   ├── Googlesheetstool/                   # Sheets tool-node variants
│   ├── Schedule/                           # Cron/time-based triggers
│   ├── Facebookleadads/                    # 1 template — ad lead webhook
│   ├── Hubspot/                            # CRM integration templates
│   ├── Slack/                              # Team notification templates
│   ├── Postgres/ Postgrestool/             # Database integration
│   ├── Supabase/                           # Supabase integration
│   └── [160+ other service dirs] ...       # Full SaaS integration catalog
│
└── .planning/
    └── codebase/
        ├── ARCHITECTURE.md
        └── STRUCTURE.md
```

## Directory Purposes

**`uploads/`:**
- Purpose: Staging area for lead CSVs imported or scraped for use as outreach targets
- Contains: One CSV file per lead batch; columns: Name, Rating, Reviews, Category, Phone, Website, Email, All Emails, Firecrawl Emails, Firecrawl Phones, Address, Profile (Google Maps URL)
- Key files: `uploads/law_firm_leads.csv` (1 batch, ~200+ NYC general law firms — wrong ICP)
- Status: Stale — needs replacement with PI-specific metro scrapes

**`outputs/`:**
- Purpose: Collateral generation scripts + their rendered output files
- Contains: Node.js generator scripts (`.js`) and the `.docx` files they produce; also legacy Python scraper and prior-niche intelligence docs
- Key files: `outputs/lawfirm_emails.js` (outreach generator), `outputs/lawfirm_pamphlet.js` (pitch deck generator)
- Run: `cd outputs && node lawfirm_emails.js` to regenerate the email doc
- Note: `node_modules/` is local to `outputs/` — `npm install` must be run from `outputs/`, not repo root

**`workflows/`:**
- Purpose: Importable n8n workflow JSON template library, organized by the primary service/trigger node
- Contains: 188 subdirectories, each holding one or more `.json` workflow files. File naming: `{ID}_{PrimaryNode}_{SecondaryNode}_{Action}_{TriggerType}.json`
- Usage: Browse by trigger type, copy the JSON, import into n8n UI, configure credentials, adapt for PI funnel use case
- Not executable here: these are n8n import artifacts, not standalone scripts

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents consumed by plan-phase and execute-phase
- Contains: ARCHITECTURE.md, STRUCTURE.md (and future analysis docs)
- Generated: By `gsd:map-codebase` agent
- Committed: Yes

**External skill (not in this repo):**
- Path: `~/.claude/skills/new-leads-scraper/`
- Purpose: Active lead generation pipeline — Apify scrape → phone verify → Excel export
- Scripts: `scripts/scrape_leads.py`, `scripts/verify_phones.py`, `scripts/export_excel.py`
- Output landing zone: `~/claude/leads/<metro-slug>/` (e.g., `pi-attorneys-tampa/`)

## Key File Locations

**Strategy:**
- `SYSTEM_PLAN.md`: Master plan — read this first. Defines subsystems, build order, costs, compliance rules, 30-day checklist.
- `AI_Funnel_PersonalInjuryLaw_Edition (1).pdf`: Offer document with pricing ($3–5K setup + $3.5–6K/mo), GHL stack details, compliance mandates.

**Active collateral scripts:**
- `outputs/lawfirm_emails.js`: Outreach email generator — edit the `leads` array and email copy, then run to regenerate `.docx`.
- `outputs/lawfirm_pamphlet.js`: Pitch deck generator — produces the sales leave-behind.

**Generated collateral (stale ICP — needs regeneration):**
- `outputs/lawfirm_outreach_emails.docx`: Current outreach emails (NYC general law).
- `outputs/lawfirm_automation_pamphlet.docx`: Current pitch deck.

**Lead data:**
- `uploads/law_firm_leads.csv`: Current lead file (wrong ICP).

**Workflow templates (PI funnel priority):**
- `workflows/Twilio/`: SMS handling for the demo flow.
- `workflows/Webhook/`: Inbound webhook triggers — starting point for demo SMS relay.
- `workflows/Googlecalendar/` + `workflows/Calendly/`: Booking link integration.
- `workflows/Gmail/` + `workflows/Lemlist/`: Email sequencing for outreach.
- `workflows/Linkedin/`: LinkedIn outreach templates.
- `workflows/Hunter/`: Email enrichment for lead gaps.
- `workflows/Googlesheets/`: Transcript logging / light CRM.

**Deprecated:**
- `outputs/scrape_leads.py`: Do not use — broken Scrapeless scraper, wrong niche, hardcoded session path.
- `outputs/ai_workflow_leads.md`: Content-agency leads from a prior niche campaign.

## Naming Conventions

**Files:**
- Collateral scripts: `{vertical}_emails.js`, `{vertical}_pamphlet.js` (lowercase, underscore)
- Generated docs: `{vertical}_outreach_emails.docx`, `{vertical}_automation_pamphlet.docx`
- Lead CSVs: `{vertical}_leads.csv` (in `uploads/`)
- Workflow templates: `{NNNN}_{PrimaryNode}_{SecondaryNode}_{Action}_{TriggerType}.json` — IDs are padded 4-digit integers; `Action` is a verb (Create, Send, Update, Automate); `TriggerType` is Triggered/Scheduled/Webhook

**Directories:**
- `workflows/` subdirs: PascalCase, matching the n8n node name (e.g., `Googlecalendar`, `Facebookleadads`, `Googlesheetstool`)
- Lead output dirs (external skill): `~/claude/leads/{type}-{location}/` (e.g., `pi-attorneys-tampa/`)

## Where to Add New Code

**New PI-targeted lead list:**
- Drop scraped CSV here: `uploads/pi_leads_{metro}.csv`
- Excel output from skill lands at: `~/claude/leads/pi-attorneys-{metro}/`

**Updated outreach emails (new ICP):**
- Edit: `outputs/lawfirm_emails.js` — replace `leads` array with PI firms, update copy, regenerate
- Regenerated doc: `outputs/lawfirm_outreach_emails.docx` (overwritten in place)

**Demo n8n workflow (Subsystem 3):**
- Build in n8n UI using templates from: `workflows/Twilio/`, `workflows/Webhook/`, `workflows/Googlecalendar/`
- Export finished workflow JSON to: `workflows/Twilio/` or a new `workflows/PIDemoFlow/` subdirectory
- System prompt file (Claude qualify-only): store as `outputs/demo_system_prompt.txt`

**New vertical pamphlet:**
- Add script: `outputs/{vertical}_pamphlet.js` (copy from `lawfirm_pamphlet.js`, adapt copy)
- Generated output: `outputs/{vertical}_automation_pamphlet.docx`

**Fulfillment workflow (Subsystem 4 — after client signs):**
- Add per-client workflow exports to: `workflows/` in a new `PiFulfillment{ClientName}/` subdirectory, or in the relevant service dir
- Client-specific configs should not be committed; keep in n8n credential store

**New n8n workflow template:**
- Place in: `workflows/{PrimaryNode}/{ID}_{PrimaryNode}_{SecondaryNode}_{Action}_{TriggerType}.json`
- Follow existing naming convention for IDs (pick a unique 4-digit number not already in use)

## Special Directories

**`outputs/node_modules/`:**
- Purpose: Local npm dependencies for the collateral generation scripts
- Generated: Yes (via `npm install` run from `outputs/`)
- Committed: No (standard .gitignore exclusion expected)
- Note: `docx` is the only direct dependency; `jszip`, `nanoid`, `pako`, etc. are transitive

**`workflows/`:**
- Purpose: n8n import-ready workflow JSON library covering 188 service integrations
- Generated: No — curated template collection
- Committed: Yes — these are the reusable automation assets

**`.planning/`:**
- Purpose: GSD planning and codebase map documents
- Generated: By GSD agents
- Committed: Yes

---

*Structure analysis: 2026-06-13*
