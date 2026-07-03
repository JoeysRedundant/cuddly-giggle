# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **Personal Injury (PI) law AI sales-funnel workspace** — not a deployable app. It stores the
collateral, lead data, config, and generated n8n workflows for the "AI Funnel Machine (Personal
Injury Law Edition)" offer. The offer is defined in `AI_Funnel_PersonalInjuryLaw_Edition (1).pdf`;
the go-to-market machine is mapped in `SYSTEM_PLAN.md` (read this first for strategy). All
automation actually *runs* externally — a self-hosted **n8n** instance, **Twilio**, the **Claude
API**, and **Google Calendar**. Nothing here runs as a persistent process.

The five-subsystem plan: (1) lead engine → (2) outreach → (3) **the demo/intake funnel** ←
the linchpin and current focus → (4) per-client fulfillment (deferred until a firm signs) →
(5) ops/reporting (deferred). "Sell the demo, build the product only after a firm signs."

Deeper analysis lives in `.planning/codebase/` (ARCHITECTURE, STRUCTURE, STACK, INTEGRATIONS,
CONVENTIONS, TESTING, CONCERNS) — generated 2026-06-13, so treat the funnel sections as outdated
(they predate the built demo). The live, current state of the funnel is the deployment-state
**memory** (auto-loaded each session), which is the operational ground truth.

## The PI intake funnel — the core deliverable

Two importable n8n workflows, both **generated from config by a skill**, not hand-written:

| Workflow file (`outputs/`) | Webhook | Role | Credentials |
|---|---|---|---|
| `pi_intake_funnel_workflow.json` | `/webhook/pi-intake` | Landing-page lead → Claude qualifies (3-way: qualified / needs_info / declined) → returns availability slots or books on Google Calendar → texts the lead → logs | Anthropic, Google Calendar, Twilio, (optional) Google Sheets |
| `pi_inbound_bot_workflow.json` | `/webhook/pi-inbound` | Conversational WhatsApp/SMS bot (LangChain **AI Agent** + window memory) — qualifies in-thread, offers times in plain language, books deterministically. Replies via **TwiML** (no Twilio node) | Anthropic, Google Calendar **only** |

- `outputs/pi_intake_landing.html` — the landing page; its form POSTs to `/webhook/pi-intake`.
- `outputs/demo_config.json` — **the build input** (firm name, calendar id, Twilio number,
  `messaging_channel` sms|whatsapp, timezone, practice areas, qualifying criteria, `n8n_base_url`, etc.).

### ⚠️ The one rule that prevents recurring breakage

**Never hand-edit the generated workflow JSON, and never edit the workflows on the n8n canvas.**
Doing either has repeatedly caused split-brain sessions, stuck booking loops, and merge bugs (the
bot's Code nodes reference each other by exact name like `$('Code: Decide')`, which renames/merges
break). All changes go through the builder skill, then **re-import fresh** (Import from File as a
*new* workflow — never paste onto an existing canvas).

### Rebuild commands

The source of truth is the skill at `~/.claude/skills/pi-intake-funnel-builder/`, **not** the
`outputs/*.json` (those are generated artifacts):

```bash
# Funnel + bot from config (writes both outputs/*.json):
python3 ~/.claude/skills/pi-intake-funnel-builder/scripts/build_workflow.py \
  outputs/demo_config.json --out outputs/pi_intake_funnel_workflow.json

# Regenerate the bot's template asset before building (only if changing bot logic):
python3 ~/.claude/skills/pi-intake-funnel-builder/scripts/author_inbound_bot_template.py
```

To change behavior: edit the skill's templates (`assets/pi_*.template.json`) or scripts, rebuild,
then have the user re-import. Config field tokens flow as `{{TOKEN}}` in templates → filled by
`build_workflow.py`. Both workflows must be **Active** in n8n (static data + agent memory only
persist on active production runs — *not* the canvas "Execute" button).

### Compliance (non-negotiable)

Every AI system prompt (funnel `Set: AI Config` node and the bot's agent message) must **qualify
and schedule ONLY** — never give legal advice, assess case merit/value, or make representations for
the firm. This is a hard mandate from the offer PDF; keep it intact through every rebuild. See
`~/.claude/skills/pi-intake-funnel-builder/references/offer-and-compliance.md`.

## Verifying the funnel

There is no test suite. Verify with these (in order of cost):

1. **Code-node syntax:** every generated n8n Code node body must pass `node --check`. The builder's
   validation does this; a "VALIDATION: PASS" from `build_workflow.py` is the build gate.
2. **Live deploy state:** `curl` the production webhooks directly — this is the fastest way to prove
   what's actually deployed without touching the n8n UI:
   ```bash
   curl -X POST https://josesn8n.win/webhook/pi-intake -H "Content-Type: application/json" \
     -d '{"name":"Jane Tester","phone":"+1813XXXXXXX","email":"jane@example.com",
          "case_description":"rear-ended last week, neck pain, saw a doctor, other driver insured, no lawyer"}'
   ```
   A qualifying lead returns `qualified:true` + slots/booking. The inbound bot endpoint takes
   Twilio-style form-encoded POSTs.
3. **End-to-end demo:** landing page → "Continue on WhatsApp"/text the sandbox number. Twilio uses a
   **WhatsApp sandbox** (recipient must text the join code once; 24-hour window applies). Watch n8n's
   **Executions** tab, not the canvas.

Note: the claude.ai **n8n MCP integration points at a different n8n instance** (not `josesn8n.win`),
so it cannot inspect these workflows — `curl` is the verification path.

## Lead generation & outreach collateral (`outputs/`, `uploads/`)

- **Leads:** use the `new-leads-scraper` skill (`~/.claude/skills/new-leads-scraper/`, Apify-backed:
  scrape → verify phones → Excel). It needs `APIFY_TOKEN` (in `~/.bashrc`). Apify MCP tool calls are
  pre-approved in `outputs/.claude/settings.local.json`.
- **DEPRECATED — do not run:** `outputs/scrape_leads.py` (broken Scrapeless scraper, wrong niche,
  exposed key) and `uploads/law_firm_leads.csv` (general NYC law, wrong ICP). Superseded by the skill.
- **Collateral generators:** `outputs/lawfirm_emails.js`, `outputs/lawfirm_pamphlet.js` (+ `medspa_`,
  `realestate_` variants) are one-shot Node scripts using the `docx` package to emit `.docx` files.
  Each is a standalone copy with brand-color constants + inline data swapped (no shared base module).
  **They currently fail** — every `require()`/`writeFileSync` uses a dead absolute sandbox path
  (`/sessions/hopeful-trusting-ramanujan/mnt/...`). To run one: fix paths to relative
  (`./node_modules/docx`), run `npm install` **inside `outputs/`** (local `node_modules`, single dep
  `docx`), then `cd outputs && node lawfirm_emails.js`.

## `workflows/` — generic n8n template library

188 subdirectories (one per service node: `Twilio/`, `Webhook/`, `Gmail/`, `Googlecalendar/`,
`Lemlist/`, `Hunter/`, etc.), each holding importable n8n JSON named
`{NNNN}_{Node1}_{Node2}_{Action}_{TriggerType}.json`. These are a **generic reference catalog** — none
are PI-configured. The actual PI funnel is the skill-generated pair in `outputs/`, not anything here.
Don't modify these templates; copy/adapt patterns when building net-new workflows.

## Conventions & secrets

- JS: 2-space indent, single quotes, `SCREAMING_SNAKE_CASE` brand-color constants, camelCase factory
  helpers returning `docx` elements. No linter/formatter config. Python: PEP 8, single-file scripts.
- `.gitignore` already excludes the sensitive files — `.env`, `.audit-key`, `audit.jsonl`, `.claude/`,
  `node_modules/`. Keep secrets out of committed source; n8n holds all credentials in its own store
  (workflow JSON ships only `REPLACE_*_CRED` placeholders, never keys).
