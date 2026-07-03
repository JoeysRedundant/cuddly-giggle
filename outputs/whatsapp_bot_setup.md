# WhatsApp Intake Bot — Setup (v4.3 · AI Agent + form bridge)

The WhatsApp bot is a **single, self-contained n8n workflow** built on the LangChain **AI Agent** —
a real conversational chatbot with memory. A lead fills the website form, then continues the
conversation over WhatsApp: the bot already knows their name and what happened (handed off from the
form), so its **first reply is personalized**, it offers open times **conversationally**, and it
books the one they pick — all inside WhatsApp.

## What v4.3 adds (the form bridge)
The website funnel and the WhatsApp bot used to be completely independent — the bot started cold and
re-asked everything. Now:
1. **Form → bot handoff (seed).** When a lead submits the website form, the funnel POSTs the intake
   context (`name`, `case_description`, `preferred_date`, keyed by `phone`) to the bot at
   `/webhook/pi-inbound` as a `seed` call. The bot stashes it in workflow static data.
2. **Personalized first reply.** When the lead texts, the bot greets them by the **name they typed**,
   acknowledges their **actual incident**, and asks only the next **missing** detail — it never
   re-asks anything the form already captured.
3. **Conversational booking.** No more "reply 1, 2, or 3." The bot offers real times in plain
   language ("I have Tuesday at 10 or 1:30, or Wednesday at 9 — what works?") and accepts natural
   replies ("the 1:30 one", "Tuesday afternoon").
4. **Change the day / future dates.** Times span multiple days, and a `preferred_date` from the form
   (a day further out than today) is honored — the bot offers **that day's** openings, not just
   today's. The lead can ask for a different day anytime.

Booking stays **deterministic** (re-check the slot, then create the event) so it never double-books.

## What gets imported
- **`pi_inbound_bot_workflow.json`** — the WhatsApp bot. Listens on `/webhook/pi-inbound`.
  Credentials: **Anthropic** (chat model) + **Google Calendar** (availability + booking).
  **No Twilio node, no Google Sheet.**
- **`pi_intake_funnel_workflow.json`** — the landing-page funnel (`/webhook/pi-intake`). It qualifies
  the lead, returns the web verdict, and **seeds the bot** via `HTTP: Seed Bot Context`. Re-import it
  (it now contains that seed node).
- **`pi_intake_landing.html`** — the landing page. It posts `silent: true` (so the funnel does not
  send its own texts — the bot owns the WhatsApp conversation) and shows a **"Continue on WhatsApp"**
  button after submit.

## One-time setup

**1. Import both workflows FRESH.** In n8n: *Workflows → Import from File*.
   - ⚠️ **Delete/deactivate any older versions first** (one workflow per webhook path:
     `/pi-intake` and `/pi-inbound`).
   - ⚠️ **Do NOT merge onto another workflow's canvas** — import each as its own workflow so the
     `$('Node Name')` references stay intact.

**2. Wire credentials.**
   - **Funnel:** Anthropic (`HTTP: Claude Qualify`, `x-api-key`) + Google Calendar. There are **no
     Twilio nodes** (WhatsApp is lead-initiated and owned by the bot — a funnel-initiated WhatsApp
     text fails with Twilio 21654 "ContentSid Required") and **no Google Sheets** node (logging is
     off until you put a real id in `log_sheet_id`). The `HTTP: Seed Bot Context` node needs **no
     credential** (the bot webhook is open).
   - **Bot:** Anthropic Chat Model + Google Calendar (the 3 calendar nodes). Nothing else.

**3. Activate BOTH workflows.** ⚠️ The bot must be **Active**, not run via the canvas "Execute"
   button — n8n only persists static data (the seeded form context **and** the agent memory) for
   **active production** runs. Same for the funnel's seed to land.

**4. Point Twilio at the bot.** Twilio Console → **Messaging → Try it out → Send a WhatsApp message →
   Sandbox settings** → **"When a message comes in"** = `https://josesn8n.win/webhook/pi-inbound`,
   method **POST** → Save.

**5. Confirm the funnel's base URL.** The seed node posts to `https://josesn8n.win/webhook/pi-inbound`
   (from `n8n_base_url` in `demo_config.json`). If your n8n host changes, update the config and rebuild.

## Test it (the full demo path)
1. Open `pi_intake_landing.html`, fill it with **your own** WhatsApp number, describe a real PI case
   (e.g. "rear-ended last week, neck pain, saw a doctor, other driver insured, no lawyer yet"), pick a
   preferred date a few days out, and submit. The funnel qualifies you **and seeds the bot**.
2. Tap **"Continue on WhatsApp"** (or text the sandbox number yourself).
   - Twilio **sandbox** first: if you haven't joined, text the join code **`join twilio-trial`** to
     **`+17372583742`** once, then send any message.
3. The bot's **first reply is personalized**: *"Hi <your name>, sorry to hear about your car
   accident. Did you see a doctor for the neck pain?"* and it does **not** re-ask what you typed.
4. It offers times conversationally near your preferred day. Reply naturally (*"Tuesday afternoon"* /
   *"the 1:30 one"* / *"anything on Friday?"*). It re-checks the slot and books it, then confirms the
   actual time.
5. Want a clean slate while testing? Text **"reset"** (or wait 6h) — a brand-new conversation starts.

## Good to know
- **Bridge key = phone.** The seed is stored under the digits of the phone the lead typed on the form.
  For personalization to fire, the lead must **text from that same number**. If they don't, the bot
  falls back to the WhatsApp profile name and just asks what happened (still works, just less tailored).
- **"Empty `[]`" from Google Calendar is normal.** With *Always Output Data* ON, an empty array means
  *no events in that window* (the calendar is free) — the slot builder treats that as "everything
  open." It is not an error.
- **`silent: true`.** The landing page sends it so the funnel suppresses its own Twilio sends and the
  bot delivers the single, personalized first message. Remove it if you want the funnel to text too.
- **No double-booking.** If a slot is taken between the offer and the pick, the bot says so and
  re-offers fresh times.
- **24-hour window.** Replies go in the same WhatsApp thread (TwiML). If it's been >24h since the lead
  messaged, they must text the sandbox again first (sandbox rule).

## ⚠️ The one rule that prevents the recurring breakage
**Never hand-edit the generated JSON, and never tinker with the bot on the n8n canvas.** All changes go
through the builder, then re-import fresh:
```
python3 ~/.claude/skills/pi-intake-funnel-builder/scripts/author_inbound_bot_template.py   # if changing bot logic
python3 ~/.claude/skills/pi-intake-funnel-builder/scripts/build_workflow.py outputs/demo_config.json \
  --out outputs/pi_intake_funnel_workflow.json
```
Editing in the UI is what kept re-introducing the split-brain / stuck-loop / merge bugs.
