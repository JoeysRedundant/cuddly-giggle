# CLAUDE.md

Med-spa edition of the PI-law AI sales-funnel workspace. Lives inside the lawfirm project at
`lawfirm/med spa version/` — the parent repo's CLAUDE.md has the full architecture; everything
there applies here with names swapped.

## The med spa intake funnel — the core deliverable

Two importable n8n workflows in `outputs/`, both **generated from config by the
`medspa-intake-funnel-builder` skill** (`~/.claude/skills/medspa-intake-funnel-builder/`):

| Workflow file | Webhook | Credentials |
|---|---|---|
| `medspa_intake_funnel_workflow.json` | `/webhook/medspa-intake` | Anthropic, Google Calendar, Twilio, (optional) Sheets |
| `medspa_inbound_bot_workflow.json` | `/webhook/medspa-inbound` | Anthropic, Google Calendar **only** |

- `outputs/medspa_intake_landing.html` — landing page; form POSTs to `/webhook/medspa-intake`
  (field `treatment_interest`, not `case_description`).
- `outputs/demo_config.json` — the build input (Glow Aesthetics Med Spa demo; same n8n/Twilio/calendar
  infra as the PI demo: `josesn8n.win`, WhatsApp sandbox `+17372583742`, calendar `josemor1669@gmail.com`).

### ⚠️ Same one rule as the PI edition

**Never hand-edit the generated workflow JSON, never edit on the n8n canvas.** All changes go
through the skill (funnel template in `assets/`, bot logic in `scripts/author_inbound_bot_template.py`),
then rebuild and **re-import fresh**:

```bash
# regenerate bot template only if changing bot logic:
python3 ~/.claude/skills/medspa-intake-funnel-builder/scripts/author_inbound_bot_template.py
# build both workflows:
python3 ~/.claude/skills/medspa-intake-funnel-builder/scripts/build_workflow.py \
  outputs/demo_config.json --out outputs/medspa_intake_funnel_workflow.json \
  --inbound-out outputs/medspa_inbound_bot_workflow.json
```

### Compliance (non-negotiable)

Qualify and schedule ONLY — never medical advice, never treatment-suitability or outcome
assessments, never diagnosing or interpreting symptoms, never price/discount promises, no
provider-patient relationship formed. Emergencies / active complications → direct to their
provider or medical care, nothing more. The AI never collects medical history, medications, or
conditions (keeps intake out of PHI territory). See
`~/.claude/skills/medspa-intake-funnel-builder/references/offer-and-compliance.md`.
Keep intact through every rebuild; refuse requests to weaken.

## Verifying

No test suite. (1) Builder prints `VALIDATION: PASS`; (2) every Code node passes `node --check`;
(3) `curl` the production webhooks (see `outputs/medspa_intake_funnel_README.md`); (4) end-to-end via
the landing page + WhatsApp sandbox, watching n8n **Executions**.
