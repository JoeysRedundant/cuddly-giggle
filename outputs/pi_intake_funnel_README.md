# PI Intake Funnel — n8n Workflow Prototype

A working prototype of the **AI Funnel Machine (Personal Injury Law Edition)** offer, realized
as an importable n8n workflow. It implements the linchpin "AI intake" subsystem: contact every
lead in **under 60 seconds**, qualify on the firm's case criteria, and book a consult — while
**only qualifying and scheduling** (no legal advice).

- Workflow: `pi_intake_funnel_workflow.json` (built for sample firm "Sunshine Injury Law")
- Built by the skill: `~/.claude/skills/pi-intake-funnel-builder/`
- Rebuild for any firm: `python3 ~/.claude/skills/pi-intake-funnel-builder/scripts/build_workflow.py <config.json>`
  (see `pi_intake_sample_config.json` for the config shape)

## Flow

```
POST /webhook/pi-intake   (ad-form lead: name, phone, email, case_description)
   → Set: Normalize Lead
   → Set: AI Config          (holds the qualify-only system prompt)
   → Code: Prepare Request   (computes next business-hours consult slot via luxon)
   → HTTP: Claude Qualify    (Anthropic Messages API → strict JSON)
   → Code: Parse AI JSON      (robust parse + safe fallback)
   → If: Qualified?
        ├─ TRUE  → Google Calendar: Book Consult → Twilio: Confirm Booking SMS ┐
        └─ FALSE → Twilio: Follow-up SMS ───────────────────────────────────────┤
                                                  → Google Sheets: Log Lead → Respond to Webhook
```

If `log_sheet_id` is omitted at build time, the Google Sheets node is removed and both SMS
branches go straight to the webhook response.

## Import into n8n

1. n8n → **Workflows → Import from File** → select `pi_intake_funnel_workflow.json`.
2. Open the workflow and resolve the 4 credential placeholders (below).
3. **Activate** the workflow to enable the production webhook URL.

## Credentials to configure (never stored in the JSON)

| Node | Credential type | What to enter |
|------|-----------------|---------------|
| HTTP: Claude Qualify | **`httpHeaderAuth`** | Header **name** `x-api-key`, **value** = your Anthropic API key. (The node also sends `anthropic-version: 2023-06-01`.) |
| Twilio: Confirm/Follow-up SMS | `twilioApi` | Twilio Account SID + Auth Token |
| Google Calendar: Book Consult | `googleCalendarOAuth2Api` | OAuth for the calendar that owns `attorney_calendar_id` |
| Google Sheets: Log Lead | `googleSheetsOAuth2Api` | OAuth for the log sheet *(skip if logging disabled)* |

If logging is enabled, give the sheet this header row:
`Timestamp, Name, Phone, Email, Qualified, Reason, Consult Slot, SMS Sent, Case Description`

## Test it end-to-end

After activating, fire a sample lead at the production webhook URL:

```bash
curl -X POST https://<your-n8n-host>/webhook/pi-intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Tester",
    "phone": "+1813XXXXXXX",
    "email": "jane@example.com",
    "case_description": "Rear-ended on I-275 last week, neck pain, seeing a chiropractor, the other driver was insured and cited, no lawyer yet"
  }'
```

Expected:
- **HTTP 200** JSON: `{ "status":"ok", "qualified": true, "consult_slot":"<next business slot>", "sms_reply":"..." }`
- A **calendar event** ("PI Consult — Jane Tester") on the attorney calendar.
- An **SMS** to the lead confirming the consult time.
- A **log row** (if logging enabled).

Try an unqualified/missing-info lead (e.g. empty `case_description`) to see the follow-up SMS
path with no booking.

## What "working prototype" means here

The workflow is **structurally valid and imports cleanly**; it becomes live the moment you
attach the 4 credentials above. Secrets are never embedded — only credential references. The
qualification model defaults to a fast Claude model (`claude-haiku-4-5-20251001`) with
`max_tokens` 512 and a single synchronous call to stay within the <60-second SLA.

## Compliance (non-negotiable)

The Claude system prompt (in the `Set: AI Config` node) enforces: **qualify and schedule only —
never give legal advice, never assess case merit/value, never make representations for the
firm.** Keep this in the workflow *and* in the firm's service agreement, and QA interactions
before any client go-live. See `~/.claude/skills/pi-intake-funnel-builder/references/offer-and-compliance.md`.

## Customizing / rebuilding

Edit a config JSON (fields: `firm_name`, `attorney_calendar_id`, `twilio_from_number`,
`timezone`, `business_hours`, `consult_duration_minutes`, `practice_areas`,
`qualifying_criteria`, `log_sheet_id`, `reschedule_link`, `claude_model`) and re-run the builder.
Don't hand-edit the generated JSON — re-run so validation stays intact.
