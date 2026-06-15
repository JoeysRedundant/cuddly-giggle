<!-- refreshed: 2026-06-13 -->
# Architecture

**Analysis Date:** 2026-06-13

## System Overview

This is a **personal-injury law AI sales-funnel workspace** — not a single deployable application, but a collection of assets organized around a five-subsystem go-to-market machine. The repo stores collateral, lead data, scripts, and a library of reusable n8n workflow templates. All automation logic is intended to run externally in a self-hosted n8n instance and (for the demo) via Twilio + Claude API.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                        SALES MACHINE (build first)                        │
├─────────────────┬──────────────────────┬─────────────────────────────────┤
│ 1. LEAD ENGINE  │  2. OUTREACH ENGINE  │  3. THE DEMO                    │
│  scrape + enrich│  email + LinkedIn    │  Twilio SMS → Claude → Calendar │
│  PI firms (ICP) │  personalized copy   │  <60s AI qualify + book         │
│  `uploads/`     │  `outputs/lawfirm_   │  (not yet built)                │
│  `new-leads-    │   emails.js`         │  Target: n8n webhook or FastAPI │
│   scraper skill`│  `outputs/lawfirm_   │                                 │
│                 │   outreach_emails    │                                 │
│                 │   .docx`             │                                 │
└────────┬────────┴──────────┬───────────┴──────────────┬──────────────────┘
         │                   │                           │ books call
         │                   │                           ▼
         │                   │              ┌─────────────────────────────┐
         │                   │              │  4. THE PRODUCT / FULFILL.  │
         │                   │              │  GHL + Clio/Filevine + n8n  │
         │                   │              │  (per signed client only)   │
         │                   │              └──────────────┬──────────────┘
         │                   │                             │
         │                   │                             ▼
         │                   │              ┌─────────────────────────────┐
         │                   │              │  5. OPS / REPORTING         │
         │                   │              │  weekly signed-case attr.   │
         │                   │              │  upsells + retention        │
         │                   │              └─────────────────────────────┘
         │                   │
         ▼                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW LIBRARY  (`workflows/`)                                         │
│  188 n8n template dirs organized by trigger/service node                 │
│  Twilio, Gmail, Lemlist, LinkedIn, Calendly, GoogleCalendar,             │
│  Webhook, Hunter, GoogleSheets, OpenAI, etc.                             │
└──────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File/Path |
|-----------|----------------|-----------|
| Lead data store | Raw scraped leads (general NYC law, wrong ICP) | `uploads/law_firm_leads.csv` |
| Lead scraper (legacy) | Scrapeless API Google Maps scraper — broken path, wrong niche | `outputs/scrape_leads.py` |
| Lead scraper (active) | Apify-backed scrape → verify → Excel pipeline | `~/.claude/skills/new-leads-scraper/` |
| Outreach email generator | Node.js script generating personalized cold email .docx | `outputs/lawfirm_emails.js` |
| Outreach email collateral | Rendered Word doc of personalized emails (NYC general law) | `outputs/lawfirm_outreach_emails.docx` |
| Sales pamphlet generator | Script generating the law firm automation pitch deck .docx | `outputs/lawfirm_pamphlet.js` |
| Sales pamphlet collateral | Rendered Word pitch deck — current template | `outputs/lawfirm_automation_pamphlet.docx` |
| Offer document | PDF defining the product, pricing, and compliance constraints | `AI_Funnel_PersonalInjuryLaw_Edition (1).pdf` |
| System strategy | 5-subsystem machine map and 30-day build checklist | `SYSTEM_PLAN.md` |
| Workflow library | 188 n8n workflow JSON templates organized by node type | `workflows/` |
| Legacy lead intelligence | Scored content-agency leads for a prior niche (not PI) | `outputs/ai_workflow_leads.md` |
| Multi-vertical pamphlets | Medspa and real-estate variations of the pamphlet scripts | `outputs/medspa_pamphlet.js`, `outputs/realestate_pamphlet.js` |

## Pattern Overview

**Overall:** Assets-first monorepo — no runnable application lives here. The workspace is a staging area for collateral, data, and workflow templates that are deployed into external platforms (n8n, Twilio, GHL).

**Key Characteristics:**
- All automation execution happens externally (n8n self-hosted instance, Twilio, GoHighLevel)
- Scripts in `outputs/` are one-shot generators that produce `.docx` files, not servers
- Workflow templates in `workflows/` are importable JSON definitions, not running code
- The `new-leads-scraper` skill is the only currently-active executable pipeline (external to this repo, invoked via `~/.claude/skills/`)
- Subsystems 1–3 are the build priority; subsystems 4–5 are deferred until a client signs

## Layers

**Strategy Layer:**
- Purpose: Define the machine, build order, and open decisions
- Location: `SYSTEM_PLAN.md`, `AI_Funnel_PersonalInjuryLaw_Edition (1).pdf`
- Contains: 5-subsystem spec, 30-day checklist, cost projections, compliance guardrails
- Depends on: Nothing — this is the top-level design doc
- Used by: Everything downstream

**Collateral Generation Layer:**
- Purpose: Produce formatted Word documents for outreach and sales
- Location: `outputs/lawfirm_emails.js`, `outputs/lawfirm_pamphlet.js`
- Contains: Node.js scripts using the `docx` npm package; hardcoded lead lists + copy
- Depends on: `outputs/node_modules/docx` (installed locally)
- Used by: Manual distribution via email; the generated `.docx` files are the deliverables

**Lead Data Layer:**
- Purpose: Store raw lead input for the outreach engine
- Location: `uploads/law_firm_leads.csv`
- Contains: Scraped Google Maps data (Name, Rating, Reviews, Category, Phone, Website, Email, Address, Profile URL)
- Status: General NYC law firms — **wrong ICP for PI funnel**; must be replaced with PI-specific metro scrape via `new-leads-scraper` skill
- Depends on: Apify Google Maps actor (external)
- Used by: Outreach engine when repointed to correct target

**Workflow Template Library:**
- Purpose: Reusable n8n workflow JSON definitions, imported into n8n UI
- Location: `workflows/` — 188 subdirectories organized by primary trigger/service node name
- Contains: `.json` workflow files named `{ID}_{Node1}_{Node2}_{Action}_{TriggerType}.json`
- Key subdirs for the PI funnel:
  - `workflows/Twilio/` (4 files) — SMS send/receive triggers
  - `workflows/Gmail/` (8 files) — email send/receive
  - `workflows/Lemlist/` (3 files) — cold email sequencing
  - `workflows/Linkedin/` (13 files) — LinkedIn outreach/automation
  - `workflows/Calendly/` (7 files) — booking triggers
  - `workflows/Googlecalendar/` (8 files) — calendar event management
  - `workflows/Webhook/` (65 files) — webhook trigger patterns (largest library; relevant to demo inbound SMS relay)
  - `workflows/Hunter/` (5 files) — email enrichment
  - `workflows/Openai/` (8 files) — AI completion nodes
  - `workflows/Googlesheets/` (26 files) — data logging/CRM-lite
  - `workflows/Schedule/` — cron-triggered workflows
  - `workflows/Facebookleadads/` (1 file) — ad lead webhooks (relevant to Subsystem 4)
- Depends on: n8n instance with appropriate credentials configured
- Used by: All subsystems (pick relevant template, adapt, import)

**External Platform Layer (not in this repo):**
- n8n: Runs automation workflows; self-hosted and already operational
- Twilio: SMS/phone number for the demo (Subsystem 3) — account needed
- Claude API (Anthropic): AI qualification in the demo flow
- GoHighLevel: Fulfillment platform for signed clients (Subsystem 4) — deferred
- Clio / Filevine / MyCase: Legal CRM integrations (Subsystem 4) — deferred
- Apify: Google Maps scraping backend for `new-leads-scraper` skill

## Data Flow

### Subsystem 1 — Lead Engine (target state)

1. Invoke `new-leads-scraper` skill with query `"personal injury attorney"` + metro (Tampa/Houston/Miami/Atlanta)
2. `scrape_leads.py` hits Apify Google Maps actor → writes `leads.json`
3. `verify_phones.py` scrapes each business website → writes `verify_results.json` with `VERIFIED/NOT_FOUND/UNREACHABLE/NO_WEBSITE`
4. `export_excel.py` produces styled `.xlsx` to `~/claude/leads/<slug>/`
5. Score and filter: review count, has-website, 2–15 attorney size, PI practice area
6. Output: Excel lead list per metro (~50 leads, ~$0.20 cost)

### Subsystem 2 — Outreach Engine (current state: general NYC law, needs repoint)

1. Edit hardcoded `leads` array in `outputs/lawfirm_emails.js` to use PI firms from Step 1
2. Update email copy to target PI speed-to-lead pain + demo CTA
3. Run `node outputs/lawfirm_emails.js` → generates `outputs/lawfirm_outreach_emails.docx`
4. Import 4-touch email sequence into n8n using Gmail/Lemlist workflow templates from `workflows/`
5. Mirror outreach to LinkedIn via `workflows/Linkedin/` templates
6. CTA points to the demo number (Subsystem 3), not a calendar link

### Subsystem 3 — Demo (planned, not yet built)

```text
Prospect SMS → Twilio number → n8n Webhook trigger
    → Claude API (qualify-only system prompt — no legal advice, PI criteria only)
    → Twilio reply SMS + Google Calendar / Calendly booking link
    → Log transcript (Google Sheets or local file)
```

Relevant workflow templates to adapt: `workflows/Twilio/`, `workflows/Webhook/`, `workflows/Googlecalendar/`, `workflows/Googlesheets/`

### Subsystem 4 — Fulfillment (deferred — post signature only)

1. Client's Google Ads lead webhook → n8n or GHL trigger
2. Instant AI SMS + voice in <60s → Claude qualify → book consult on attorney calendar
3. Push warm case to CRM (Clio/Filevine) → notify intake team
4. Relevant templates: `workflows/Facebookleadads/`, `workflows/Webhook/`, `workflows/Googlecalendar/`

**State Management:**
- No persistent in-memory state — everything is file-based (CSV, JSON, xlsx, docx)
- n8n stores workflow execution state in its own database (external)
- Lead data lives in `uploads/` (input) and `~/claude/leads/<slug>/` (output of skill)

## Key Abstractions

**Workflow Template:**
- Purpose: A reusable n8n automation blueprint, adapted per use case
- Location: `workflows/{ServiceName}/{ID}_{Node1}_{Node2}_{Action}_{TriggerType}.json`
- Pattern: Named by primary service + secondary service + action + trigger type; imported directly into n8n UI

**Collateral Script:**
- Purpose: A Node.js one-shot generator that produces a formatted `.docx`
- Examples: `outputs/lawfirm_emails.js`, `outputs/lawfirm_pamphlet.js`
- Pattern: Hardcoded data arrays + `docx` package construction → `Packer.toBuffer()` → `fs.writeFileSync()`

**Lead List:**
- Purpose: Structured prospect data feeding the outreach engine
- Examples: `uploads/law_firm_leads.csv`, skill output xlsx files
- Pattern: CSV or Excel with columns: Name, Rating, Reviews, Category, Phone, Website, Email, Address

## Entry Points

**Lead generation (active):**
- Invocation: `~/.claude/skills/new-leads-scraper/scripts/scrape_leads.py --query "personal injury attorney" --locations "Tampa, FL" --count 50`
- Triggers: Manual CLI invocation
- Responsibilities: Apify scrape + phone verify + Excel export

**Collateral generation:**
- Invocation: `cd outputs && node lawfirm_emails.js`
- Triggers: Manual run when leads/copy need updating
- Responsibilities: Generates `lawfirm_outreach_emails.docx`

**Demo SMS flow (target entry point):**
- Invocation: Prospect sends SMS to Twilio number
- Triggers: Inbound SMS webhook → n8n workflow
- Responsibilities: AI qualify via Claude, reply with booking link

## Architectural Constraints

- **No application server:** Nothing in this repo runs as a persistent process. All execution is external (n8n, Twilio, Apify, Claude API).
- **Hardcoded lead data:** `outputs/lawfirm_emails.js` and `outputs/lawfirm_outreach_emails.docx` contain NYC general law firm contact data — these are the wrong ICP for the PI funnel and must be replaced before outreach.
- **Legacy scraper is broken:** `outputs/scrape_leads.py` uses Scrapeless API (wrong niche, hardcoded API key exposed in file, wrong output path `/sessions/hopeful-trusting-ramanujan/mnt/...`). It is superseded by the `new-leads-scraper` skill.
- **Compliance hard constraint:** Every Claude system prompt in Subsystem 3 and 4 must qualify and schedule ONLY — never give legal advice, assess case merit, or make representations for the firm. This is a non-negotiable design constraint from the offer document.
- **Build order constraint:** Subsystems 4–5 must not be built until a client signs. The client's setup fee ($3–5K) funds fulfillment.
- **Module-level state:** The `outputs/` Node.js scripts are stateless one-shot programs with no side effects beyond writing `.docx` files.

## Anti-Patterns

### Using scrape_leads.py for new lead generation

**What happens:** `outputs/scrape_leads.py` is invoked to scrape leads.
**Why it's wrong:** It uses Scrapeless API (broken credentials path), targets wrong niches (content marketing agencies), and writes to a hardcoded ephemeral session path (`/sessions/hopeful-trusting-ramanujan/mnt/`). The API key is exposed in plain text.
**Do this instead:** Use the `new-leads-scraper` skill (`~/.claude/skills/new-leads-scraper/scripts/`), which uses Apify, verifies phones, and exports to a proper Excel file.

### Sending outreach with the current lawfirm_outreach_emails.docx

**What happens:** The existing generated email document is used for PI firm outreach.
**Why it's wrong:** The hardcoded `leads` array in `outputs/lawfirm_emails.js` targets NYC general law firms (Weitz & Luxenberg, Lebedin Kofman, etc.) — not personal injury firms in target metros (Tampa, Houston, Miami, Atlanta).
**Do this instead:** Replace the `leads` array with PI-specific firms from the `new-leads-scraper` output, update copy to target speed-to-lead pain, insert demo CTA, then regenerate.

### Building fulfillment (GHL/Clio integration) before a client signs

**What happens:** Subsystem 4 (the product) is built speculatively.
**Why it's wrong:** The strategy is "sell the demo, build the product only after a firm signs." Building GHL setup speculatively burns time and ~$97–297/mo with no revenue.
**Do this instead:** Focus on Subsystems 1–3. Only trigger Subsystem 4 work after a signed agreement; the client's setup fee funds it.

## Error Handling

**Strategy:** No formal error handling architecture exists — scripts are manual one-shot tools. The `new-leads-scraper` skill handles partial failures gracefully (a lead with `UNREACHABLE` phone still exports to Excel; the script does not abort).

**Patterns:**
- `scrape_leads.py` polls Scrapeless async tasks with a 20-iteration retry loop (sleep 3s each); exits silently on failure
- `new-leads-scraper` skill scripts are independent stages — if verify fails, scrape output is still intact and can be re-processed

## Cross-Cutting Concerns

**Compliance:** Every AI interaction (Subsystem 3 demo, Subsystem 4 fulfillment) must be constrained to qualifying and scheduling only. This must be enforced in system prompts, service agreements, and pre-launch QA review.
**Cost tracking:** Lead scraping costs ~$0.004/lead (Apify). Demo costs pennies/convo (Twilio + Claude API). Fulfillment costs $97–297/mo (GHL) — deferred and client-funded.
**Niche targeting:** All new work must target PI firms (auto/slip-fall/workers-comp/med-mal, 2–15 attorneys, FL/TX/CA/NY/GA). Existing collateral targets wrong verticals or wrong geographies.

---

*Architecture analysis: 2026-06-13*
