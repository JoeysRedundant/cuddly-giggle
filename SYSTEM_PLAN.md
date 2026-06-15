# AI Funnel Machine — Full System Map & Go-to-Market Plan
**Personal Injury Law Edition** · drafted 2026-06-13

The offer is already defined (see the PDF). This document maps the **machine that
delivers it** and the **sequence to first revenue**. Guiding principle:
**sell the demo, build the product only after a firm signs.** You reach first
dollar by booking calls, not by finishing software.

---

## 1. The Machine — five subsystems

```
  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
  │ 1. LEAD ENGINE  │ → │ 2. OUTREACH      │ → │ 3. THE DEMO         │
  │ scrape + enrich │   │ email + LinkedIn │   │ live "text it" #    │
  │ PI firms (ICP)  │   │ personalized CTA │   │ <60s AI qualify     │
  └─────────────────┘   └──────────────────┘   └──────────┬──────────┘
                                                            │ books call
                                                            ▼
                          ┌──────────────────┐   ┌─────────────────────┐
                          │ 5. OPS / REPORT  │ ← │ 4. THE PRODUCT      │
                          │ attribution,     │   │ GHL/n8n AI intake   │
                          │ weekly reports,  │   │ for the signed firm │
                          │ upsells          │   │ (fulfillment)       │
                          └──────────────────┘   └─────────────────────┘
```

Subsystems 1–3 are the **sales machine** (build first, cheap, reusable across all
prospects). Subsystems 4–5 are **fulfillment** (build per-client, only after a
signature — the client's retainer funds them).

---

## 2. Build order (what comes first and why)

| Phase | Build | Why this order | Time |
|-------|-------|----------------|------|
| **0** | PI-specific lead list (one metro) | Everything downstream needs the right ICP. Current CSV is general NYC law — wrong target. | 1 day |
| **1** | The demo number | The single asset that closes. Reusable for every prospect forever. | 2–4 days |
| **2** | Outreach engine | Repoint existing collateral at PI partners + demo CTA. Start booking calls. | 2–3 days |
| **3** | Discovery → close | Run calls, sign first firm. | ongoing |
| **4** | Fulfillment build | Only after firm #1 signs. Their setup fee pays for it. | 1–2 wks/client |
| **5** | Ops & reporting | Stand up once you have a live client to report on. | ongoing |

You can be **booking discovery calls inside a week** (phases 0–2). You do not
touch phase 4 until money is committed.

---

## 3. Subsystem specs

### 1 — Lead Engine
- **Goal:** a clean, verified list of PI firms matching the ICP (2–15 attorneys;
  FL/TX/CA/NY/GA; auto/slip-fall/workers-comp/med-mal).
- **Tool:** your **`new-leads-scraper` skill** (already built, Apify-backed). It
  replaces the old `scrape_leads.py` (Scrapeless, broken path, wrong niche).
- **Process:** scrape `"personal injury attorney"` in one metro at a time
  (Tampa, Houston, Miami, Atlanta). Verify phones. Then **enrich emails** — Apify
  returns most, fill gaps with Hunter.io or the contact-enrichment add-on.
- **Score leads** on fit signals: review count (proxy for ad spend / volume),
  has-website, 2–15 attorney size, practice area match.
- **Output:** Excel lead list per metro. ~$0.004/lead → 50 leads ≈ $0.20.

### 2 — Outreach Engine
- **Goal:** get the demo in front of managing partners.
- **Reuse:** `outputs/lawfirm_emails.js` + `lawfirm_outreach_emails.docx` already
  generate personalized cold emails — **repoint copy to PI speed-to-lead pain**
  and insert the demo CTA ("text this number, watch it qualify you in 5 seconds").
- **Channels (from the PDF):** cold email → LinkedIn to partners/administrators →
  retarget with before/after response-time data.
- **Sequencing:** 4-touch follow-up. Can run through your **n8n** library
  (Gmail/Lemlist/Smartlead nodes already present in `workflows/`).
- **The CTA is the demo, not a call.** Lower friction = higher reply rate.

### 3 — The Demo (the linchpin) ⭐
- **Goal:** a phone number a prospect texts and watches the AI respond in <60s,
  qualify on PI criteria, and offer a booking link. This *is* the product, shrunk.
- **Architecture (buildable now, no GHL needed):**
  ```
  Prospect SMS → Twilio number → n8n webhook (or small FastAPI app)
       → Claude API (qualify-only system prompt)
       → Twilio reply  +  Google Calendar / Calendly booking link
       → log transcript
  ```
- **Why n8n:** you already run it and have the nodes. Twilio trigger → Claude →
  Twilio + Calendar is a short workflow. Alternatively a ~100-line FastAPI app.
- **Compliance baked in:** the system prompt qualifies and books ONLY — never
  legal advice, never case-merit opinions, never representations. (PDF mandate.)
- **Cost:** Twilio ~$1/mo number + pennies/SMS; Claude pennies/convo. Trivial.

### 4 — The Product / Fulfillment (per signed client)
- **Goal:** the real intake system wired into the firm's lead sources + CRM.
- **Stack (PDF):** GoHighLevel (AI convos + calendar) + Clio/Filevine/MyCase
  integration + their Google Ads lead webhook + Twilio/GHL SMS.
- **Flow:** new lead (ad form / call) → instant AI SMS+voice in <60s → qualify →
  book consult on attorney calendar → push warm case to CRM → notify intake team.
- **Note:** GHL is what the model "sells," but n8n could power an MVP delivery too
  and is cheaper — decide per client. Either way, **client pays the $3–5K setup**,
  so this phase is self-funding.
- **Onboarding (PDF):** Wk 1–2 scripts + CRM integration → Wk 3 QA'd soft launch →
  Mo 2+ optimize + weekly signed-case reports.

### 5 — Ops, Reporting & Retention
- **Weekly signed-case attribution report** — the thing that keeps them paying.
- **Upsells (PDF):** lead reactivation on old CRM leads, post-settlement review
  automation, referral-network nurture. All buildable in n8n.

---

## 4. Cost to launch (phases 0–2)

| Item | Cost |
|------|------|
| Apify scraping (a few hundred leads) | ~$1–3 |
| Twilio number + SMS for demo | ~$1/mo + pennies |
| Claude API (demo convos) | pennies |
| n8n | already running (free, self-hosted) |
| Email sending (Gmail/Smartlead) | existing |
| **Total to be live and pitching** | **< $20** |

GoHighLevel (~$97–297/mo) is **deferred until a client signs** and is arguably
the client's cost. You are not blocked on it.

---

## 5. Compliance guardrails (non-negotiable, from the PDF)
The AI **qualifies and schedules only**. It must never give legal advice, assess
case merit, or make representations for the firm. This belongs in:
1. every demo + production system prompt,
2. the service agreement,
3. a QA review of interactions before any client go-live.

---

## 6. First 30 days — concrete checklist
- [ ] **Wk1:** Scrape + verify 50 PI firms in one metro (Tampa or Houston). Enrich emails.
- [ ] **Wk1:** Build the demo number (Twilio + Claude + Calendar via n8n). QA the qualify-only flow.
- [ ] **Wk2:** Repoint cold-email + pamphlet copy to PI / speed-to-lead + demo CTA.
- [ ] **Wk2:** Send batch 1 (25 firms), 4-touch sequence; mirror to LinkedIn.
- [ ] **Wk3:** Take discovery calls; on the call, text the demo live in front of them.
- [ ] **Wk3–4:** Close firm #1 → kick off the Wk1–2 fulfillment onboarding.
- **Target:** 1 signed firm = $3–5K + $3.5–6K/mo. 3 firms = $13.5K MRR (PDF projection).

---

## 7. Open decisions / what I need from you
1. **First metro?** (Tampa, Houston, Miami, Atlanta — pick one to dominate first.)
2. **Twilio account?** Need one for the demo (I can scaffold everything else).
3. **Demo engine:** n8n workflow (leverages what you run) **or** a standalone
   FastAPI app (more portable). Recommend n8n.
4. **Email-sending tool** you want to standardize on (Gmail API, Smartlead, Lemlist).

> Recommended first action: **Phase 0 + the demo** in parallel — they're cheap,
> independent, and together they make every sales conversation real.
