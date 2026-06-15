const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, Header, Footer
} = require('/sessions/hopeful-trusting-ramanujan/mnt/outputs/node_modules/docx');
const fs = require('fs');

const BRAND_GREEN = "1A5C38";
const BRAND_GREEN_LIGHT = "E8F4ED";
const BRAND_ORANGE = "D4621A";
const BRAND_ORANGE_LIGHT = "FDF0E8";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F7F7F7";
const MID_GRAY = "EEEEEE";
const DARK_TEXT = "1A1A2E";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: 0, after: pts }, children: [new TextRun("")] });
}

function divider(color = BRAND_GREEN) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
    spacing: { before: 80, after: 80 },
    children: [new TextRun("")]
  });
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: BRAND_GREEN, font: "Arial" })]
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
          shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: week, bold: true, size: 22, font: "Arial", color: WHITE })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title, size: 17, font: "Arial", color: "C8E6D5" })] }),
          ]
        }),
        new TableCell({
          borders: noBorders,
          width: { size: 7560, type: WidthType.DXA },
          shading: { fill: BRAND_GREEN_LIGHT, type: ShadingType.CLEAR },
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
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19, font: "Arial", color: BRAND_GREEN })] })]
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
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_GREEN, space: 1 } },
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "AI Lead Response for Real Estate Agents  |  Confidential", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND_GREEN, space: 1 } },
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
            shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
            margins: { top: 440, bottom: 440, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "REAL ESTATE LEAD RESPONSE AI", bold: true, size: 48, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "The first agent to respond wins the client. Stop losing to agents who are just faster.", size: 24, font: "Arial", color: "C8E6D5", italics: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Instant Lead Response, Qualification & Appointment Booking — Running 24/7", size: 20, font: "Arial", color: "AAD4BE" })] }),
            ]
          })]
        })]
      }),

      spacer(200),

      // THE PROBLEM
      sectionHeader("The Lead Response Problem"),
      divider(),
      spacer(60),
      bodyText("You're paying for leads — Zillow, Realtor.com, your website, referrals. But the moment a lead submits their info, a countdown starts. They've filled out three other agent forms at the same time. The race is already on, and it's measured in minutes, not hours."),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3040, 3040, 3280],
        rows: [new TableRow({
          children: [
            new TableCell({ borders: noBorders, width: { size: 3040, type: WidthType.DXA }, shading: { fill: BRAND_ORANGE_LIGHT, type: ShadingType.CLEAR }, margins: { top: 180, bottom: 180, left: 200, right: 160 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "78%", bold: true, size: 52, font: "Arial", color: BRAND_ORANGE })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "of buyers go with the first agent who responds", size: 18, font: "Arial", color: DARK_TEXT })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [new TextRun({ text: "(industry estimate)", size: 14, font: "Arial", color: "999999", italics: true })] }),
              ]
            }),
            new TableCell({ borders: noBorders, width: { size: 3040, type: WidthType.DXA }, shading: { fill: BRAND_GREEN_LIGHT, type: ShadingType.CLEAR }, margins: { top: 180, bottom: 180, left: 200, right: 160 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "< 60s", bold: true, size: 52, font: "Arial", color: BRAND_GREEN })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "how fast this system responds to every new lead", size: 18, font: "Arial", color: DARK_TEXT })] }),
              ]
            }),
            new TableCell({ borders: noBorders, width: { size: 3280, type: WidthType.DXA }, shading: { fill: BRAND_ORANGE_LIGHT, type: ShadingType.CLEAR }, margins: { top: 180, bottom: 180, left: 200, right: 160 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "24/7", bold: true, size: 52, font: "Arial", color: BRAND_ORANGE })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "operational — nights, weekends, holidays, showing days", size: 18, font: "Arial", color: DARK_TEXT })] }),
              ]
            }),
          ]
        })]
      }),

      spacer(120),
      bodyText("The average agent responds to leads in 2–5 hours. You're at a showing, driving between appointments, or asleep. The lead has moved on before you even see the notification.", { italic: true, color: "666666" }),

      spacer(200),

      // THE SOLUTION
      sectionHeader("The Solution: Your AI Lead Response System"),
      divider(),
      spacer(80),
      bodyText("We install a fully automated lead response and qualification system that works the moment a new lead comes in — no matter when, no matter where you are. It responds, qualifies, and books the call before your competition even checks their phone."),
      spacer(120),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          twoColRow("Instant Multi-Channel Response", "Every new lead gets an SMS and email within 60 seconds. Personalized, professional, and on-brand — automatically.", false),
          twoColRow("Smart Lead Qualification", "The AI asks the right questions: buying or selling timeline, pre-approval status, target area and budget. You receive only qualified, categorized leads.", true),
          twoColRow("Automatic Appointment Booking", "Qualified leads receive a direct link to book a call or showing with you. It syncs with your calendar — no back-and-forth.", false),
          twoColRow("Zillow & Web Form Integration", "Zillow lead emails are parsed automatically and entered into the workflow. Your website form connects via webhook. Zero manual entry.", true),
          twoColRow("14-Day Nurture Sequence", "Leads who don't book immediately receive a structured 14-day SMS and email follow-up sequence — so no prospect is abandoned.", false),
          twoColRow("Pipeline Dashboard", "Every lead, response, and booking is logged in a clean dashboard. Always know where your pipeline stands.", true),
        ]
      }),

      spacer(200),

      // HOW IT WORKS
      sectionHeader("How It Works"),
      divider(),
      spacer(80),
      numbered("A Zillow notification or website form submission comes in — any time of day."),
      numbered("Within 60 seconds, the lead receives a personalized SMS and email from you."),
      numbered("The AI asks 2-3 qualifying questions to understand their needs and timeline."),
      numbered("Qualified leads get your booking link — they schedule a call or showing directly."),
      numbered("The appointment appears on your calendar. You show up prepared, not cold."),
      numbered("Leads who don't book enter a 14-day follow-up sequence — automated, not spammy."),
      numbered("Everything is logged. You can review your full pipeline anytime."),

      spacer(200),

      // TOOL STACK
      sectionHeader("Built On Proven Tools"),
      divider(),
      spacer(80),
      bodyText("No proprietary lock-in. You own the system. If you ever move on, the workflows are yours."),
      spacer(80),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 3580, 3580],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Tool", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
              new TableCell({ borders: noBorders, width: { size: 3580, type: WidthType.DXA }, shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true, size: 19, font: "Arial", color: WHITE })] })] }),
            ]
          }),
          ...[
            ["n8n", "Automation backbone — all workflows", "Free (self-hosted)", false],
            ["Twilio", "SMS responses and follow-up sequences", "~$1–3/mo per client", true],
            ["Gmail / SMTP", "Email responses and nurture sequences", "Free", false],
            ["Calendly", "Appointment booking, calendar sync", "Free tier", true],
            ["OpenAI API", "Natural language qualification", "~$5–10/mo per client", false],
            ["Airtable", "Lead tracking and pipeline dashboard", "Free tier", true],
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
      sectionHeader("30-Day Launch Plan"),
      divider(),
      spacer(100),

      weekBox("WEEK 1", "Build & Integrate", [
        "Complete build of lead response workflow: Zillow parser, SMS, email, qualification, Calendly",
        "Connect to your Zillow lead notifications and website contact form",
        "End-to-end test with simulated leads across all entry points",
        "Configure response language to match your personal style and market",
      ]),
      spacer(120),
      weekBox("WEEK 2", "Go Live", [
        "System goes live on your real Zillow and website leads",
        "Every new lead handled automatically from Day 1",
        "Daily review of lead log for first week to catch any edge cases",
        "Confirm Calendly bookings are syncing correctly to your calendar",
      ]),
      spacer(120),
      weekBox("WEEK 3", "Nurture & Optimize", [
        "Activate 14-day nurture sequence for leads from Week 2 who did not book",
        "Review qualification accuracy — adjust AI prompts based on lead quality",
        "Tune follow-up message timing based on response patterns",
      ]),
      spacer(120),
      weekBox("WEEK 4", "Results & Decision", [
        "Full 30-day performance report: leads responded to, qualification rate, appointments booked",
        "Compare to your baseline: how many leads were you converting before?",
        "Decision point: continue at $297/month or walk away — zero contracts",
      ]),

      spacer(200),

      // OFFER
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_ORANGE, type: ShadingType.CLEAR },
            margins: { top: 240, bottom: 240, left: 360, right: 360 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "THE 30-DAY FREE PILOT", bold: true, size: 30, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "I connect the system to your live Zillow leads and website — and run it for 30 days at zero cost. Every appointment it books is yours to keep. At the end of 30 days, if you want to keep it running, it is $297/month. If not, I disconnect it. You owe nothing.", size: 19, font: "Arial", color: WHITE })] }),
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
            new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_GREEN_LIGHT, type: ShadingType.CLEAR }, margins: { top: 200, bottom: 200, left: 240, right: 160 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "30-Day Pilot", bold: true, size: 26, font: "Arial", color: BRAND_GREEN })] }),
                new Paragraph({ children: [new TextRun({ text: "$0", bold: true, size: 48, font: "Arial", color: BRAND_GREEN })] }),
                new Paragraph({ children: [new TextRun({ text: "Full system live on your real leads", size: 18, font: "Arial", color: DARK_TEXT })] }),
              ]
            }),
            new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR }, margins: { top: 200, bottom: 200, left: 240, right: 160 },
              children: [
                new Paragraph({ children: [new TextRun({ text: "Monthly Retainer", bold: true, size: 26, font: "Arial", color: WHITE })] }),
                new Paragraph({ children: [new TextRun({ text: "$297/mo", bold: true, size: 48, font: "Arial", color: WHITE })] }),
                new Paragraph({ children: [new TextRun({ text: "No setup fee. No contracts. Cancel anytime.", size: 18, font: "Arial", color: "C8E6D5" })] }),
              ]
            }),
          ]
        })]
      }),

      spacer(120),
      bodyText("One additional closed transaction per year is worth more than 10 years of this retainer. The system works every lead, every day, so you never have to.", { italic: true, color: "666666" }),

      spacer(200),

      // CTA
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
            margins: { top: 300, bottom: 300, left: 480, right: 480 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Want to see it respond to a lead live?", bold: true, size: 32, font: "Arial", color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "15-minute demo — I'll show you the full system in real time.", size: 20, font: "Arial", color: "AAD4BE" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "josemor1669@gmail.com", bold: true, size: 22, font: "Arial", color: BRAND_ORANGE_LIGHT })] }),
            ]
          })]
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/hopeful-trusting-ramanujan/mnt/outputs/realestate_automation_pamphlet.docx', buffer);
  console.log('Real Estate pamphlet created successfully.');
}).catch(err => console.error(err));
