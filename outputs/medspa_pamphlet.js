const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageNumber, Header, Footer
} = require('/sessions/hopeful-trusting-ramanujan/mnt/outputs/node_modules/docx');
const fs = require('fs');

const BRAND_TEAL = "0D7C6E";
const BRAND_TEAL_LIGHT = "E6F4F1";
const BRAND_DARK = "1A1A2E";
const ACCENT = "F4A623";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F7F7F7";
const MID_GRAY = "EEEEEE";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: 0, after: pts }, children: [new TextRun("")] });
}

function divider(color = BRAND_TEAL) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
    spacing: { before: 80, after: 80 },
    children: [new TextRun("")]
  });
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: BRAND_TEAL, font: "Arial" })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, bold, size: 20, font: "Arial", color: BRAND_DARK })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: BRAND_DARK })]
  });
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, size: options.size || 20, font: "Arial", color: options.color || BRAND_DARK, bold: options.bold || false, italics: options.italic || false })]
  });
}

function weekBox(week, title, items) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 1800, type: WidthType.DXA },
            shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: week, bold: true, size: 22, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title, size: 18, font: "Arial", color: WHITE })] }),
            ]
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 7560, type: WidthType.DXA },
            shading: { fill: BRAND_TEAL_LIGHT, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 160 },
            children: items.map(i => new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: `• ${i}`, size: 19, font: "Arial", color: BRAND_DARK })] }))
          })
        ]
      })
    ]
  });
}

function highlightBox(label, text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "Arial", color: WHITE })] }),
          new Paragraph({ children: [new TextRun({ text, size: 20, font: "Arial", color: WHITE })] }),
        ]
      })]
    })]
  });
}

function twoColRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 3000, type: WidthType.DXA },
        shading: { fill: MID_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19, font: "Arial", color: BRAND_TEAL })] })]
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 6360, type: WidthType.DXA },
        shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 19, font: "Arial", color: BRAND_DARK })] })]
      })
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_TEAL, space: 1 } },
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "AI Automation for Med Spas  |  Confidential", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND_TEAL, space: 1 } },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Joey G. | AI Automation Services | josemor1669@gmail.com", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    children: [

      // ── HERO BLOCK ──────────────────────────────────────────
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR },
            margins: { top: 440, bottom: 440, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "MED SPA AI AUTOMATION", bold: true, size: 52, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "Never miss a booking. Never lose a lead. Never chase a no-show again.", size: 24, font: "Arial", color: "D4F0EA", italics: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AI-Powered Booking, Lead Response & Client Reactivation System", size: 20, font: "Arial", color: WHITE })] }),
            ]
          })]
        })]
      }),

      spacer(200),

      // ── THE PROBLEM ─────────────────────────────────────────
      sectionHeader("The Problem You're Facing Right Now"),
      divider(),
      spacer(60),

      bodyText("Every day your med spa loses money you never see — not because you lack clients, but because the gaps in your follow-up are invisible."),
      spacer(60),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4560, 4800],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 4560, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Instagram DMs go unanswered", bold: true, size: 20, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "A potential Botox client messages at 9pm. By morning they've booked somewhere else.", size: 18, font: "Arial", color: BRAND_DARK })] })
                ]
              }),
              new TableCell({ borders: noBorders, width: { size: 4800, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "No-shows kill your revenue", bold: true, size: 20, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "A $600 filler slot sits empty. No reminder was sent. That money is gone.", size: 18, font: "Arial", color: BRAND_DARK })] })
                ]
              }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 4560, type: WidthType.DXA }, shading: { fill: MID_GRAY, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Past clients go silent", bold: true, size: 20, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "Clients who visited 90 days ago never got a reason to come back. They've moved on.", size: 18, font: "Arial", color: BRAND_DARK })] })
                ]
              }),
              new TableCell({ borders: noBorders, width: { size: 4800, type: WidthType.DXA }, shading: { fill: MID_GRAY, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "You're stretched thin", bold: true, size: 20, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "You're the practitioner, owner, and front desk. You can't respond to everything instantly.", size: 18, font: "Arial", color: BRAND_DARK })] })
                ]
              }),
            ]
          }),
        ]
      }),

      spacer(200),

      // ── THE SOLUTION ────────────────────────────────────────
      sectionHeader("The Solution: Your AI Booking & Lead System"),
      divider(),
      spacer(80),

      bodyText("We install a fully automated AI system that runs 24/7 — responding to leads, booking appointments, reducing no-shows, and reactivating past clients — without you lifting a finger."),
      spacer(120),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          twoColRow("Instagram DM Responder", "Responds to every DM within minutes — answers pricing questions, handles booking requests, sends your booking link automatically."),
          twoColRow("Web Lead Capture", "Anyone who fills out your website form gets an instant SMS + email follow-up. Qualifies them and gets them booked before they move on."),
          twoColRow("No-Show Reduction", "Automated reminders at 48 hours, 24 hours, and 2 hours before every appointment — via SMS. Dramatically reduces empty slots."),
          twoColRow("Client Reactivation", "Every 60 days, clients who haven't returned get a personalized text with a reason to come back. Turns dormant clients into rebookings."),
          twoColRow("Appointment Logging", "Every lead, booking, and interaction is automatically logged so you always know your pipeline."),
        ]
      }),

      spacer(200),

      // ── HOW IT WORKS ────────────────────────────────────────
      sectionHeader("How It Works"),
      divider(),
      spacer(80),

      numbered("A new DM lands on your Instagram — the system reads it and replies instantly, 24/7."),
      numbered("It classifies the intent: booking request, pricing question, or general inquiry."),
      numbered("It responds with the right message and sends your booking link if they're ready."),
      numbered("Once booked, reminders fire automatically at 48hrs, 24hrs, and 2hrs out."),
      numbered("60 days after a client's last visit, they get a personal re-engagement text."),
      numbered("You see everything in a clean dashboard — no manual work required."),

      spacer(200),

      // ── TOOL STACK ──────────────────────────────────────────
      sectionHeader("What We Build It On"),
      divider(),
      spacer(80),

      bodyText("Everything is built on proven, stable tools — no proprietary lock-in. You own the workflows."),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 3580, 3580],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Tool", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
            ]
          }),
          ...[
            ["n8n", "Automation backbone — all workflows", "Free (self-hosted)"],
            ["Meta Graph API", "Instagram DM trigger & response", "Free"],
            ["Twilio", "SMS reminders & reactivation texts", "~$1–3/mo per client"],
            ["Calendly / Acuity", "Appointment booking", "Free tier"],
            ["OpenAI API", "Natural language DM handling", "~$5–10/mo per client"],
            ["Airtable", "Lead & client tracking", "Free tier"],
          ].map(([tool, purpose, cost], i) => new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? LIGHT_GRAY : MID_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: tool, bold: true, size: 18, font: "Arial", color: BRAND_DARK })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? LIGHT_GRAY : MID_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: purpose, size: 18, font: "Arial", color: BRAND_DARK })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? LIGHT_GRAY : MID_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: cost, size: 18, font: "Arial", color: BRAND_DARK })] })] }),
            ]
          }))
        ]
      }),

      spacer(200),

      // ── 30 DAY PLAN ─────────────────────────────────────────
      sectionHeader("Your 30-Day Launch Plan"),
      divider(),
      spacer(100),

      weekBox("WEEK 1", "Build & Connect", [
        "Complete build of Instagram DM responder, booking flow, and no-show reminders",
        "Connect to your Instagram Business account (one-time 30-minute setup)",
        "Link to your existing booking calendar (Vagaro, Acuity, or Calendly)",
        "Run live test with dummy leads to confirm everything fires correctly",
      ]),
      spacer(120),
      weekBox("WEEK 2", "Go Live", [
        "System goes live on your real Instagram and web form",
        "All new DMs and leads handled automatically from Day 1",
        "No-show reminders begin firing for all upcoming appointments",
        "Daily review of lead log together to catch any edge cases",
      ]),
      spacer(120),
      weekBox("WEEK 3", "Optimize", [
        "Review DM response rate and booking conversion",
        "Tune AI response language to match your brand voice",
        "Launch reactivation sequence for clients inactive 60+ days",
        "Adjust reminder timing based on your no-show patterns",
      ]),
      spacer(120),
      weekBox("WEEK 4", "Results", [
        "Full 30-day performance review: leads responded to, bookings made, no-shows reduced",
        "Decide on continued engagement — month-to-month, no contracts",
        "Optional: add upsell sequences for post-appointment follow-up",
      ]),

      spacer(200),

      // ── OFFER ───────────────────────────────────────────────
      highlightBox("The Offer: 30-Day Free Pilot", "I install everything, connect it to your Instagram and booking calendar, and run the full system live for 30 days — at no cost. You keep every appointment it books. If you want to keep it running after 30 days, it's $397/month. If not, I disconnect it. No contracts. No risk."),

      spacer(200),

      // ── INVESTMENT ──────────────────────────────────────────
      sectionHeader("Investment"),
      divider(),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_TEAL_LIGHT, type: ShadingType.CLEAR }, margins: { top: 180, bottom: 180, left: 240, right: 160 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "30-Day Pilot", bold: true, size: 26, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "$0", bold: true, size: 48, font: "Arial", color: BRAND_TEAL })] }),
                  new Paragraph({ children: [new TextRun({ text: "Full system, live on your account", size: 18, font: "Arial", color: BRAND_DARK })] }),
                ]
              }),
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_TEAL, type: ShadingType.CLEAR }, margins: { top: 180, bottom: 180, left: 240, right: 160 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Monthly Retainer", bold: true, size: 26, font: "Arial", color: WHITE })] }),
                  new Paragraph({ children: [new TextRun({ text: "$397/mo", bold: true, size: 48, font: "Arial", color: WHITE })] }),
                  new Paragraph({ children: [new TextRun({ text: "No setup fee. Cancel anytime.", size: 18, font: "Arial", color: "D4F0EA" })] }),
                ]
              }),
            ]
          })
        ]
      }),

      spacer(120),
      bodyText("Consider: one recovered no-show at $600 pays for the entire month. The system runs every appointment, every day.", { italic: true, color: "666666" }),

      spacer(200),

      // ── CTA ─────────────────────────────────────────────────
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_DARK, type: ShadingType.CLEAR },
            margins: { top: 300, bottom: 300, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Ready to see it in action?", bold: true, size: 32, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "Reply to this email or text/call to schedule a 15-minute live demo.", size: 20, font: "Arial", color: "AAAAAA" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "josemor1669@gmail.com", bold: true, size: 22, font: "Arial", color: ACCENT })] }),
            ]
          })]
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/hopeful-trusting-ramanujan/mnt/outputs/medspa_automation_pamphlet.docx', buffer);
  console.log('Med Spa pamphlet created successfully.');
}).catch(err => console.error(err));
