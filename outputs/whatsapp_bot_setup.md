# WhatsApp Two-Way Bot — Setup (v3.1)

This adds a real back-and-forth WhatsApp assistant on top of the funnel. A lead can text replies;
the bot re-qualifies as they add detail, then offers open times by text ("reply 1, 2, or 3") and
books the one they pick — all inside WhatsApp.

**v3.1 change:** the bot now keeps its conversation memory **in n8n itself** (workflow static data,
keyed by phone), not in a Google Sheet. That removes the whole class of "it forgot what I said /
it re-asked / it replied twice" bugs, and it means **the bot needs no Google Sheet and no
credentials at all.**

## What gets imported
- **`pi_intake_funnel_workflow.json`** — the main funnel (re-import; has the `silent` flag so the bot
  can drive it without the funnel double-texting).
- **`pi_inbound_bot_workflow.json`** — the inbound bot. It listens on `/webhook/pi-inbound` and calls
  the main funnel internally for all the qualify/booking logic (so the compliance prompt and booking
  live in exactly one place).

## One-time setup

**1. Import both workflows.** Re-import the main funnel (replaces the old one — deactivate/delete the
old first; same `/webhook/pi-intake` path). Import the inbound bot.

**2. Wire credentials.**
- Main funnel: Anthropic, Twilio, Google Calendar, Google Sheets (as before).
- Inbound bot: **none.** It replies via TwiML (no Twilio node), keeps state in memory (no Sheets), and
  calls the main webhook with no auth.

**3. Activate BOTH workflows.** They use different webhook paths (`/pi-intake` and `/pi-inbound`), so
there's no conflict. **The bot must be Active** — n8n only persists workflow static data for active
(production) runs, *not* for manual "Execute workflow" test runs. (So don't test the bot with the
canvas "Execute" button; just text it once it's active.)

**4. Point Twilio at the bot.** Twilio Console → **Messaging → Try it out → Send a WhatsApp message →
Sandbox settings** → **"When a message comes in"** = `https://josesn8n.win/webhook/pi-inbound`,
method **POST** → Save.
*(This is exactly what the "Configure your WhatsApp Sandbox's Inbound URL to change this message"
echo was telling you to do.)*

## Test it
1. Text the sandbox number a thin case ("I slipped and fell at a store").
2. The bot asks the next missing detail. Reply ("last week, hurt my ankle, saw a doctor") → it asks
   the next item and **remembers** everything you've said so far (no restart, no re-asking).
3. Keep replying until you qualify → the bot texts a numbered list of open consult times.
4. Reply **"2"** → it books that exact slot on the calendar and texts **"Booked …"**.

## Notes
- **Conversation state is in-memory**, keyed by phone digits. To restart a chat for testing, you can
  add a `RESET` command (ask me to add it), or temporarily deactivate→reactivate the workflow to clear
  all in-memory sessions.
- The bot replies inside the same WhatsApp thread (TwiML), so the 24-hour sandbox window applies — if
  it's been >24h, text `hi` to `+14155238886` first.
- A **Twilio retry** (it re-POSTs an inbound if your reply is slow) is de-duplicated by `MessageSid`:
  the bot replays the exact same reply instead of processing the message twice — so you never get two
  divergent answers to one text.
- If a slot is taken between the offer and the reply, the bot says so and re-offers fresh times — no
  double-booking.
- If your n8n host/URL ever changes, rebuild with the new `n8n_base_url` so the bot's internal call
  still points at the main funnel.

## Trade-off you should know about
Because memory now lives inside *this* workflow, a lead who fills out the **landing page** and then
replies on **WhatsApp** starts a fresh chat in the bot (the bot can't see the landing-page submission —
that lived in the old shared Sheet). In practice it's seamless: the lead just restates in their first
text and the bot collects from there. If you later want true cross-channel continuity (landing page →
WhatsApp picks up the same case), that needs a shared store (e.g. Redis or the n8n DB) — ask me and
I'll wire it in for production.

## Already tested an earlier build?
Earlier builds kept the conversation in a Google Sheet `Conversations` tab and broke because Sheets
coerces the phone key (a leading `+` becomes a formula; a digit string becomes a number), so the row
the bot *read* wasn't the row it *wrote* → duplicate/stale rows → it re-asked questions and sometimes
replied twice with different "personas." v3.1 removes the Sheet entirely. To adopt:
1. **Re-import** `pi_inbound_bot_workflow.json` (and the main funnel) — replace the old versions, and
   make sure only **one** inbound workflow is Active (an old copy still listening would double-reply).
2. The old `Conversations` tab is no longer used — you can delete it (or just ignore it).
3. Re-activate both and re-test: the bot now remembers each detail and answers each text exactly once.
