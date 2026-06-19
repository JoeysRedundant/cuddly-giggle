# Live n8n Update Checklist — PI Intake Funnel **v2**

Brings your already-wired live workflow up to the new v2 logic **without re-importing** (so you
keep your 4 credentials + WhatsApp settings). Do the steps **in order** and press **Ctrl+S / Save
after each one** — your live workflow always runs the *last saved* version.

> What's new in v2: 3-way verdict (qualified / needs_info / declined), phone auto-hardened to
> E.164 inside the flow, resilient Google Sheets logging (can't blank the response), `verdict`
> added to the webhook response. Compliance block is unchanged.

---

## 0. Create the Google Sheet (logging target)
1. Make a new Google Sheet. In **row 1**, add these headers (exact order):
   `Timestamp` `Name` `Phone` `Email` `Qualified` `Status` `Reason` `Consult Slot` `SMS Sent` `Case Description`
2. Copy the **Sheet ID** from the URL — the long string between `/d/` and `/edit`.
3. Confirm the Google account behind your n8n **Google Sheets account** credential can edit it.
4. Send me the Sheet ID so I can bake it into the saved artifact too (optional but keeps them in sync).

---

## 1. `Set: Normalize Lead` — harden the phone to E.164
Open the node → field **phone** → make sure it's in **Expression** mode → replace its value with:

```
{{ (() => { const r = ($json.body.phone || $json.body.phone_number || $json.body.tel || '').toString().trim(); if (!r) return ''; if (r.charAt(0) === '+') return '+' + r.slice(1).replace(/\D/g, ''); const d = r.replace(/\D/g, ''); if (d.length === 10) return '+1' + d; if (d.length === 11 && d.charAt(0) === '1') return '+' + d; return '+' + d; })() }}
```

Save. *(This makes any phone format — from the form, an ad, or a CRM — come out as `+1…`.)*

---

## 2. `Set: AI Config` — paste the new 3-way system prompt
Open the node → click the **system_prompt** value → select-all, delete, and paste this **exactly**
(keep the literal `{{CONSULT_SLOT}}` — the workflow fills it in at runtime):

```
You are an AI intake assistant for Sunshine Injury Law, a personal injury law firm. Your ONLY job is to (1) qualify inbound leads against the firm's criteria and (2) tee qualified leads up for scheduling a consultation. You are not a lawyer and you are not the firm's representative.

PRACTICE AREAS: auto accidents, slip & fall / premises, workers' comp, medical malpractice
QUALIFYING CRITERIA (the firm's must-haves): incident recent / within statute of limitations; the person was injured and received medical treatment; a clear at-fault other party; not already represented by another attorney; insurance available

=== HARD COMPLIANCE RULES (never violate) ===
- You QUALIFY and SCHEDULE ONLY.
- NEVER give legal advice of any kind.
- NEVER assess, estimate, or comment on case value, merit, strength, or likely outcome.
- NEVER guarantee or imply any result.
- NEVER make promises or representations on behalf of Sunshine Injury Law.
- Do NOT state or imply that an attorney-client relationship exists; it does not.
- If the lead asks for legal advice or "what is my case worth / will I win," the sms_reply must politely decline to give advice and steer them to the consultation. Example tone: "I can't give legal advice, but an attorney can cover that during your consult."

=== INPUT ===
You receive the lead's submitted info as fields: name, phone, email, case_description.

=== DECISION MODEL (choose EXACTLY ONE status) ===
1. "declined" — the lead is clearly NOT a fit. Use when ANY hard disqualifier is true:
   - The incident does not fall within any PRACTICE AREA (e.g. family/divorce, criminal, contract, landlord/tenant, general consumer complaint).
   - No injury at all / only property damage / the person says they are fine.
   - The incident is clearly outside the statute of limitations (e.g. "a few years ago" with nothing suggesting it is still timely).
   - The lead is already represented by another attorney for this matter.
   - There is plainly no other at-fault party (the lead is solely at fault).
   Do NOT book. Reply politely and briefly; give no legal reasons and no advice.
2. "needs_info" — the incident plausibly fits a practice area, but at least one MUST-HAVE is simply unknown/missing (not failed). Must-haves: when it happened (recency/SOL); injury & medical treatment; another at-fault party; whether they already have a lawyer; insurance involved. ALSO use this when case_description is empty, blank, or gibberish. Do NOT book. Ask for the SINGLE most important missing item only.
3. "qualified" — the incident fits a PRACTICE AREA, NO hard disqualifier is present, AND every must-have is known and satisfied. Only then schedule.

Be robust to messy, informal, or partial input. NEVER fabricate facts the lead did not provide. When unsure between qualified and needs_info, choose needs_info and ask for the missing item.

=== SMS RULES ===
- Friendly, warm, plain-English, concise (aim ~160 characters; never long). No markdown, no emoji spam, no links unless provided to you.
- qualified: warmly confirm the consult is being scheduled and reference {{CONSULT_SLOT}}; sign off with Sunshine Injury Law. Example shape: "Thanks! Sunshine Injury Law can help. We're booking your free consult for {{CONSULT_SLOT}}. See you then!"
- needs_info: ask the SINGLE most important missing question, warmly. Never list multiple questions. Never give legal advice.
- declined: be kind and brief; thank them and let them know this is not something the firm can take on, without giving legal advice or reasons that resemble advice. Do not promise a callback.
If the lead is qualified but may be unable to attend, you may include this reschedule link in the SMS: https://sunshineinjurylaw.com/reschedule

=== OUTPUT (STRICT) ===
Respond with ONLY a single minified JSON object. No markdown, no code fences, no prose before or after. Exactly these keys:
{"qualified":boolean,"status":"qualified|needs_info|declined","reason":"short internal-only explanation","missing_info":["..."],"sms_reply":"the message to text the lead"}

Rules for output:
- "status": exactly one of "qualified", "needs_info", "declined".
- "qualified": boolean; it MUST be true if and only if status is "qualified".
- "reason": brief internal note for the firm (not sent to the lead). Never contains legal advice.
- "missing_info": array of strings — the must-haves still unknown. Use an empty array [] for qualified or declined.
- "sms_reply": the SMS text per SMS RULES above. Always present, for every status.
- Output must be valid, parseable JSON. No trailing commas, no comments, no text outside the JSON object.
```

Save.

---

## 3. `Code: Parse AI JSON` — paste the new code
Open the node → replace **all** the code with:

```javascript
let raw = "";
try { raw = $json.content[0].text || ""; } catch (e) { raw = ""; }

let parsed = null;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = null; } }
}

if (!parsed || (typeof parsed.qualified === "undefined" && typeof parsed.status === "undefined")) {
  parsed = {
    qualified: false,
    status: "needs_info",
    reason: "AI response was unparseable; defaulted to follow-up.",
    missing_info: ["incident details"],
    sms_reply: "Thanks for reaching out! Could you share a few details about what happened and any injuries, so we can help?"
  };
}

const allowed = ["qualified", "needs_info", "declined"];
let status = String(parsed.status || "").toLowerCase().trim();
if (!allowed.includes(status)) {
  status = parsed.qualified === true ? "qualified" : "needs_info";
}
const qualified = status === "qualified";

return [{ json: {
  qualified: qualified,
  status: status,
  reason: String(parsed.reason || ""),
  missing_info: Array.isArray(parsed.missing_info) ? parsed.missing_info : [],
  sms_reply: String(parsed.sms_reply || "Thanks for reaching out — a team member will follow up shortly.")
} }];

```

Save.

---

## 4. `Google Sheets: Log Lead` — re-enable + make it resilient
1. Click the node and press **D** to **enable** it (it was disabled/greyed earlier).
2. **Document** → *By ID* → paste your **Sheet ID**. **Sheet** → `Sheet1`.
3. **Credential** → pick your existing **Google Sheets account**.
4. **Columns** → *Map Each Column Manually* → make sure every header maps (add **Status** if missing):
- **Timestamp** → `{{ $('Set: Normalize Lead').item.json.receivedAt }}`
- **Name** → `{{ $('Set: Normalize Lead').item.json.name }}`
- **Phone** → `{{ $('Set: Normalize Lead').item.json.phone }}`
- **Email** → `{{ $('Set: Normalize Lead').item.json.email }}`
- **Qualified** → `{{ $('Code: Parse AI JSON').item.json.qualified }}`
- **Status** → `{{ $('Code: Parse AI JSON').item.json.status }}`
- **Reason** → `{{ $('Code: Parse AI JSON').item.json.reason }}`
- **Consult Slot** → `{{ $('Code: Parse AI JSON').item.json.qualified ? $('Code: Prepare Request').item.json.human : '' }}`
- **SMS Sent** → `{{ $('Code: Parse AI JSON').item.json.sms_reply }}`
- **Case Description** → `{{ $('Set: Normalize Lead').item.json.case_description }}`
5. Open the node's **Settings** tab → **On Error** → choose **"Continue (using regular output)"**.
   *(This is the fix for the old empty-response bug — logging can no longer halt the flow.)*
6. Confirm the wiring runs **through** it: `Twilio: Confirm Booking SMS → Google Sheets: Log Lead`,
   `Twilio: Follow-up SMS → Google Sheets: Log Lead`, and `Google Sheets: Log Lead → Respond to Webhook`.
   If you'd bypassed it when you disabled it, reconnect so it sits before **Respond to Webhook**.

Save.

---

## 5. `Respond to Webhook` — add the verdict to the response
Open the node → **Response Body** (Expression mode) → replace with:

```
{{ JSON.stringify({ status: 'ok', qualified: $('Code: Parse AI JSON').item.json.qualified, verdict: $('Code: Parse AI JSON').item.json.status, consult_slot: $('Code: Parse AI JSON').item.json.qualified ? $('Code: Prepare Request').item.json.human : null, sms_reply: $('Code: Parse AI JSON').item.json.sms_reply }) }}
```

Save.

---

## 6. Verify (already wired earlier — just confirm)
- **Webhook** node → *Options* → **Allowed Origins (CORS)** = `*`
- Both **Twilio** nodes → **From** = `+14155238886`, **To Whatsapp** = ON
- Workflow toggle (top-right) = **Active**. Save once more if you flipped anything.

---

## 7. Test the three paths
1. Text **`hi`** to **+14155238886** from your phone to reopen the 24-hour WhatsApp window.
2. Go to **https://pi-landing-site.vercel.app**, click each demo button, **put your own joined
   number in the phone field**, and submit:
   - **Qualified lead** → on-page "your case qualifies", calendar event booked, WhatsApp confirm, log row `Status=qualified`
   - **Needs info** → one follow-up question, no booking, log row `Status=needs_info`
   - **Junk / declined** → polite decline, no booking, log row `Status=declined`
3. Open your Google Sheet — you should see three rows, each with its **Status**.

---

## Appendix — optional field-name aliases (already in the v2 build)
If you want the live **Normalize** node to also accept leads whose fields are named differently
(e.g. from an ad platform or CRM), set these values too:
- **name** → `{{ $json.body.name || $json.body.full_name || $json.body.fullname || '' }}`
- **email** → `{{ $json.body.email || $json.body.email_address || '' }}`
- **case_description** → `{{ $json.body.case_description || $json.body.message || $json.body.details || $json.body.what_happened || '' }}`
