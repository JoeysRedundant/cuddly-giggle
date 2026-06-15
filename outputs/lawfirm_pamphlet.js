const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, Header, Footer
} = require('/sessions/hopeful-trusting-ramanujan/mnt/outputs/node_modules/docx');
const fs = require('fs');

const BRAND_NAVY = "1B2A4A";
const BRAND_NAVY_LIGHT = "E8ECF4";
const BRAND_GOLD = "B8922A";
const BRAND_GOLD_LIGHT = "FDF6E3";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F7F7F7";
const MID_GRAY = "EEEEEE";
const DARK_TEXT = "1A1A2E";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: 0, after: pts }, children: [new TextRun("")] });
}

function divider(color = BRAND_GOLD) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
    spacing: { before: 80, after: 80 },
    children: [new TextRun("")]
  });
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: BRAND_NAVY, font: "Arial" })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: DARK_TEXT })]
  });
}

function bodyText(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, size: options.size || 20, font: "Arial", color: options.color || DARK_TEXT, bold: options.bold || false, italics: options.italic || false })]
  });
}

function weekBox(week, title, items) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: noBorders,
          width: { size: 1800, type: WidthType.DXA },
          shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: week, bold: true, size: 22, font: "Arial", color: WHITE })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title, size: 17, font: "Arial", color: BRAND_GOLD_LIGHT })] }),
          ]
        }),
        new TableCell({
          borders: noBorders,
          width: { size: 7560, type: WidthType.DXA },
          shading: { fill: BRAND_NAVY_LIGHT, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 160 },
          children: items.map(i => new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: `• ${i}`, size: 19, font: "Arial", color: DARK_TEXT })] }))
        })
      ]
    })]
  });
}

function twoColRow(label, value, alt) {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 3000, type: WidthType.DXA },
        shading: { fill: alt ? MID_GRAY : LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19, font: "Arial", color: BRAND_NAVY })] })]
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 6360, type: WidthType.DXA },
        shading: { fill: alt ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 19, font: "Arial", color: DARK_TEXT })] })]
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
  styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
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
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_GOLD, space: 1 } },
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "AI Client Intake for Law Firms  |  Confidential", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND_GOLD, space: 1 } },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Joey G. | AI Automation Services | josemor1669@gmail.com", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    children: [

      // HERO
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR },
            margins: { top: 440, bottom: 440, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "LAW FIRM AI INTAKE SYSTEM", bold: true, size: 52, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "Every missed lead is a case worth $5,000 to $50,000 — gone.", size: 24, font: "Arial", color: "C8B97A", italics: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24/7 Automated Client Intake, Qualification & Consultation Booking", size: 20, font: "Arial", color: "AABBD4" })] }),
            ]
          })]
        })]
      }),

      spacer(200),

      // THE PROBLEM
      sectionHeader("The Intake Problem Costing You Cases"),
      divider(),
      spacer(60),
      bodyText("Small and mid-size law firms operate with lean staff. When a potential client reaches out after hours, fills out your contact form, or finds you on Google — the typical response time is measured in hours or days. In legal intake, that delay is fatal."),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4560, 4800],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 4560, type: WidthType.DXA }, shading: { fill: BRAND_GOLD_LIGHT, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "The Speed Problem", bold: true, size: 20, font: "Arial", color: BRAND_NAVY })] }),
                  new Paragraph({ children: [new TextRun({ text: "The first firm to respond wins the case. Potential clients contact multiple attorneys simultaneously. Whoever replies first gets hired.", size: 18, font: "Arial", color: DARK_TEXT })] })
                ]
              }),
              new TableCell({ borders: noBorders, width: { size: 4800, type: WidthType.DXA }, shading: { fill: BRAND_NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "The After-Hours Problem", bold: true, size: 20, font: "Arial", color: BRAND_NAVY })] }),
                  new Paragraph({ children: [new TextRun({ text: "Legal emergencies don't happen at 9am on a Tuesday. When someone needs help at 10pm, your firm is dark. A competitor's website isn't.", size: 18, font: "Arial", color: DARK_TEXT })] })
                ]
              }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 4560, type: WidthType.DXA }, shading: { fill: BRAND_NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "The Staff Capacity Problem", bold: true, size: 20, font: "Arial", color: BRAND_NAVY })] }),
                  new Paragraph({ children: [new TextRun({ text: "Your team is handling active cases, calls, and court prep. Manually chasing every web form lead isn't realistic — so leads fall through.", size: 18, font: "Arial", color: DARK_TEXT })] })
                ]
              }),
              new TableCell({ borders: noBorders, width: { size: 4800, type: WidthType.DXA }, shading: { fill: BRAND_GOLD_LIGHT, type: ShadingType.CLEAR }, margins: { top: 160, bottom: 160, left: 200, right: 160 },
                children: [
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "The ROI Problem", bold: true, size: 20, font: "Arial", color: BRAND_NAVY })] }),
                  new Paragraph({ children: [new TextRun({ text: "A single personal injury case can be worth $10,000–$50,000 in fees. Losing three leads per month due to slow intake is a six-figure annual problem.", size: 18, font: "Arial", color: DARK_TEXT })] })
                ]
              }),
            ]
          }),
        ]
      }),

      spacer(200),

      // THE SOLUTION
      sectionHeader("The Solution: AI-Powered Client Intake"),
      divider(),
      spacer(80),
      bodyText("We install a fully automated intake system that responds to every inbound lead in under 60 seconds — any time of day or night — qualifies the potential client, and books a consultation directly on your calendar. Your team wakes up to scheduled appointments, not cold lead lists."),
      spacer(120),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          twoColRow("Instant Lead Response", "Every web form submission triggers an immediate email and SMS reply — within 60 seconds, 24/7. The potential client hears from your firm first.", false),
          twoColRow("AI Qualification", "The system asks two to three qualifying questions (practice area, urgency, preferred contact method) and classifies each lead before it ever reaches your team.", true),
          twoColRow("Automated Consultation Booking", "Qualified leads receive a direct booking link and can schedule a consultation without any staff involvement. Syncs with your calendar automatically.", false),
          twoColRow("14-Day Follow-Up Sequence", "Leads who don't book immediately receive a structured follow-up sequence over 14 days — so no potential client is forgotten.", true),
          twoColRow("Lead Logging & Tracking", "Every inquiry, response, and booking is logged automatically. Know your pipeline at a glance without manually tracking anything.", false),
        ]
      }),

      spacer(200),

      // HOW IT WORKS
      sectionHeader("How It Works — Step by Step"),
      divider(),
      spacer(80),
      numbered("A potential client submits your web form or sends an inquiry at any hour."),
      numbered("Within 60 seconds, they receive a personalized email and SMS from your firm."),
      numbered("The AI asks qualifying questions and classifies the lead (fit, not a fit, needs more info)."),
      numbered("Qualified leads receive a consultation booking link — they pick a time that works."),
      numbered("The booking appears on your calendar. Your team reviews and prepares — no cold outreach required."),
      numbered("Unbooked leads enter an automated 14-day follow-up sequence until they convert or opt out."),
      numbered("Every interaction is logged in your lead dashboard for full visibility."),

      spacer(200),

      // TOOL STACK
      sectionHeader("The Technology Stack"),
      divider(),
      spacer(80),
      bodyText("Built on established, secure tools. No proprietary software. You own the system."),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 3580, 3580],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Tool", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
            ]
          }),
          ...[
            ["n8n", "Workflow automation backbone", "Free (self-hosted)", false],
            ["Twilio", "SMS responses and follow-ups", "~$1–3/mo per client", true],
            ["Gmail / SMTP", "Email responses and nurture sequences", "Free", false],
            ["Calendly", "Consultation booking and calendar sync", "Free tier", true],
            ["OpenAI API", "Natural language qualification", "~$5–10/mo per client", false],
            ["Airtable", "Lead tracking and pipeline visibility", "Free tier", true],
          ].map(([tool, purpose, cost, alt]) => new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: alt ? MID_GRAY : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: tool, bold: true, size: 18, font: "Arial", color: DARK_TEXT })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: alt ? MID_GRAY : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: purpose, size: 18, font: "Arial", color: DARK_TEXT })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: alt ? MID_GRAY : LIGHT_GRAY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: cost, size: 18, font: "Arial", color: DARK_TEXT })] })] }),
            ]
          }))
        ]
      }),

      spacer(200),

      // 30-DAY PLAN
      sectionHeader("30-Day Implementation Plan"),
      divider(),
      spacer(100),

      weekBox("WEEK 1", "Build & Test", [
        "Build complete intake workflow: web form trigger, SMS, email, AI qualification, Calendly booking",
        "Test end-to-end with simulated leads across multiple scenarios",
        "Confirm all responses match your firm's tone and practice areas",
      ]),
      spacer(120),
      weekBox("WEEK 2", "Connect & Launch", [
        "Connect to your live website contact form via webhook",
        "Link your Calendly or preferred calendar for consultation booking",
        "System goes live — first real leads handled automatically",
        "Daily review of lead log for first 5 days to catch edge cases",
      ]),
      spacer(120),
      weekBox("WEEK 3", "Optimize", [
        "Review qualification accuracy — tune AI prompts based on lead quality",
        "Activate 14-day follow-up sequence for unbooked leads from Week 2",
        "Adjust response language per practice area (PI vs. family law vs. immigration)",
      ]),
      spacer(120),
      weekBox("WEEK 4", "Review & Decide", [
        "Full performance report: total leads, response rate, consultations booked",
        "Compare to your baseline intake performance from before",
        "Decision point: continue at $497/month or walk away — no pressure, no contract",
      ]),

      spacer(200),

      // OFFER BOX
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_GOLD, type: ShadingType.CLEAR },
            margins: { top: 240, bottom: 240, left: 360, right: 360 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "THE 14-DAY FREE PILOT", bold: true, size: 30, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Run the full intake system live on your real leads for 14 days at zero cost. See exactly how many inquiries get responded to instantly and how many consultations get booked automatically. If you want to keep it after 14 days, it's $497/month. If not, I shut it off. You owe nothing.", size: 19, font: "Arial", color: WHITE })] }),
            ]
          })]
        })]
      }),

      spacer(200),

      // PRICING
      sectionHeader("Investment"),
      divider(),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [new TableRow({
          children: [
            new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 200, bottom: 200, left: 240, right: 160 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "14-Day Pilot", bold: true, size: 26, font: "Arial", color: BRAND_NAVY })] }),
                new Paragraph({ children: [new TextRun({ text: "$0", bold: true, size: 48, font: "Arial", color: BRAND_NAVY })] }),
                new Paragraph({ children: [new TextRun({ text: "Full system, live on your real leads", size: 18, font: "Arial", color: DARK_TEXT })] }),
              ]
            }),
            new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR }, margins: { top: 200, bottom: 200, left: 240, right: 160 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "Monthly Retainer", bold: true, size: 26, font: "Arial", color: WHITE })] }),
                new Paragraph({ children: [new TextRun({ text: "$497/mo", bold: true, size: 48, font: "Arial", color: WHITE })] }),
                new Paragraph({ children: [new TextRun({ text: "No setup fee. No contracts. Cancel anytime.", size: 18, font: "Arial", color: "AABBD4" })] }),
              ]
            }),
          ]
        })]
      }),

      spacer(120),
      bodyText("One additional consultation booked per month more than covers the entire retainer. The system runs every lead, every day.", { italic: true, color: "666666" }),

      spacer(200),

      // CTA
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_NAVY, type: ShadingType.CLEAR },
            margins: { top: 300, bottom: 300, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Schedule a 15-minute demo.", bold: true, size: 32, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "See the system respond to a live lead — in real time.", size: 20, font: "Arial", color: "AABBD4" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "josemor1669@gmail.com", bold: true, size: 22, font: "Arial", color: BRAND_GOLD_LIGHT })] }),
            ]
          })]
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/hopeful-trusting-ramanujan/mnt/outputs/lawfirm_automation_pamphlet.docx', buffer);
  console.log('Law Firm pamphlet created successfully.');
}).catch(err => console.error(err));
