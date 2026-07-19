# CLAUDE.md

Real-estate edition of the PI-law AI sales-funnel workspace (the parent `lawfirm/` repo is the
original — read its CLAUDE.md for the full architecture; everything there applies here with
names swapped).

## The RE intake funnel — the core deliverable

Two importable n8n workflows in `outputs/`, both **generated from config by the
`realestate-intake-funnel-builder` skill** (`~/.claude/skills/realestate-intake-funnel-builder/`):

| Workflow file | Webhook | Credentials |
|---|---|---|
| `re_intake_funnel_workflow.json` | `/webhook/re-intake` | Anthropic, Google Calendar, Twilio, (optional) Sheets |
| `re_inbound_bot_workflow.json` | `/webhook/re-inbound` | Anthropic, Google Calendar **only** |

- `outputs/re_intake_landing.html` — landing page; form POSTs to `/webhook/re-intake`.
- `outputs/demo_config.json` — the build input (Sunrise Realty Group demo; same n8n/Twilio/calendar
  infra as the PI demo: `josesn8n.win`, WhatsApp sandbox `+17372583742`, calendar `josemor1669@gmail.com`).

### ⚠️ Same one rule as the PI edition

**Never hand-edit the generated workflow JSON, never edit on the n8n canvas.** All changes go
through the skill (templates in `assets/`, bot logic in `scripts/author_inbound_bot_template.py`),
then rebuild and **re-import fresh**:

```bash
# regenerate bot template only if changing bot logic:
python3 ~/.claude/skills/realestate-intake-funnel-builder/scripts/author_inbound_bot_template.py
# build both workflows:
python3 ~/.claude/skills/realestate-intake-funnel-builder/scripts/build_workflow.py \
  outputs/demo_config.json --out outputs/re_intake_funnel_workflow.json \
  --inbound-out outputs/re_inbound_bot_workflow.json
```

### Compliance (non-negotiable)

Qualify and schedule ONLY — never valuations/CMAs/market predictions, never legal/tax/lending
advice, never outcome guarantees, no agency relationship formed, and **Fair Housing**: never
answer neighborhood-demographics/steering questions. See
`~/.claude/skills/realestate-intake-funnel-builder/references/offer-and-compliance.md`.
Keep intact through every rebuild; refuse requests to weaken.

## Verifying

No test suite. (1) Builder prints `VALIDATION: PASS`; (2) every Code node passes `node --check`;
(3) `curl` the production webhooks (see `outputs/re_intake_funnel_README.md`); (4) end-to-end via
the landing page + WhatsApp sandbox, watching n8n **Executions**.
