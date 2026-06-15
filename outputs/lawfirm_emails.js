const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, PageBreak
} = require('/sessions/hopeful-trusting-ramanujan/mnt/outputs/node_modules/docx');
const fs = require('fs');

const NAVY = "1B2A4A";
const NAVY_LIGHT = "E8ECF4";
const GOLD = "B8922A";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F7F7F7";
const MID_GRAY = "E2E2E2";
const DARK = "1A1A2E";
const GREEN = "1A5C38";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function sp(pts = 100) {
  return new Paragraph({ spacing: { before: 0, after: pts }, children: [new TextRun("")] });
}

function divider(color = GOLD) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 1 } },
    spacing: { before: 60, after: 60 },
    children: [new TextRun("")]
  });
}

function txt(text, opts = {}) {
  return new TextRun({
    text,
    font: "Arial",
    size: opts.size || 20,
    bold: opts.bold || false,
    italics: opts.italic || false,
    color: opts.color || DARK,
  });
}

function para(texts, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 60, after: opts.after || 60 },
    alignment: opts.align || AlignmentType.LEFT,
    children: Array.isArray(texts) ? texts : [texts],
  });
}

const leads = [
  { name: "Weitz & Luxenberg NYC",       to: "info@weitzlux.com",             cc: "marketing@weitzlux.com, media@weitzlux.com" },
  { name: "Lebedin Kofman LLP",          to: "info@lebedinkofmanlaw.com",      cc: "" },
  { name: "The Shapiro Law Firm, LLC",   to: "contact@theshapirolawyers.com",  cc: "" },
  { name: "Pierce & Kwok LLP",           to: "info@piercekwok.com",            cc: "" },
  { name: "Law Office of Biana Borukhovich, PLLC", to: "info@bb-lawfirm.com", cc: "" },
  { name: "Kulen Law Firm P.C.",         to: "kulen@kulenlawfirm.com",         cc: "" },
  { name: "Dilendorf Law Firm PLLC",     to: "info@dilendorf.com",             cc: "" },
  { name: "Law Offices of Nathaniel Muller, PC", to: "nm@legalmuller.com",     cc: "" },
  { name: "Avenue Law Firm",             to: "peter@avenuelawfirm.com",        cc: "" },
  { name: "Mekhtiyev Law Firm, P.C.",    to: "info@mekhlaw.com",               cc: "" },
  { name: "Linden Law",                  to: "jason@linden.law",               cc: "" },
  { name: "ILGANAYEV LAW FIRM, PLLC",   to: "ilganayevlaw@gmail.com",         cc: "" },
];

// Extract first name / short name for greeting
function greeting(fullName) {
  const map = {
    "Weitz & Luxenberg NYC":                  "Weitz & Luxenberg Team",
    "Lebedin Kofman LLP":                     "Lebedin Kofman Team",
    "The Shapiro Law Firm, LLC":              "Shapiro Law Team",
    "Pierce & Kwok LLP":                      "Pierce & Kwok Team",
    "Law Office of Biana Borukhovich, PLLC":  "Biana",
    "Kulen Law Firm P.C.":                    "Kulen Law Team",
    "Dilendorf Law Firm PLLC":               "Dilendorf Team",
    "Law Offices of Nathaniel Muller, PC":    "Nathaniel",
    "Avenue Law Firm":                        "Peter",
    "Mekhtiyev Law Firm, P.C.":              "Mekhtiyev Team",
    "Linden Law":                             "Jason",
    "ILGANAYEV LAW FIRM, PLLC":              "Ilganayev Law Team",
  };
  return map[fullName] || fullName;
}

function buildEmailBlock(lead, index) {
  const isLast = index === leads.length - 1;
  const name = greeting(lead.name);

  const metaRow = (label, value) => new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 1200, type: WidthType.DXA },
        shading: { fill: NAVY_LIGHT, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [para(txt(label, { bold: true, size: 18, color: NAVY }), { before: 0, after: 0 })]
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 8160, type: WidthType.DXA },
        shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [para(txt(value, { size: 18, color: DARK }), { before: 0, after: 0 })]
      }),
    ]
  });

  const emailBodyRows = [
    // Greeting
    new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 0, left: 200, right: 200 },
        children: [para(txt(`Hey ${name},`, { bold: true, size: 22, color: NAVY }), { before: 0, after: 60 })]
      })]
    }),
    // Body paragraph 1
    new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 0, bottom: 0, left: 200, right: 200 },
        children: [para([
          txt("I'm Joey, and I build AI systems that automate client intake for small law firms — and I'm just looking for honest feedback on the idea, if it's something a law firm would actually find value in.")
        ], { before: 60, after: 80 })]
      })]
    }),
    // Body paragraph 2
    new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 0, bottom: 0, left: 200, right: 200 },
        children: [para([
          txt("It basically responds to every inbound lead instantly, qualifies them, and gets them booked — without you or your staff touching it.")
        ], { before: 0, after: 80 })]
      })]
    }),
    // Body paragraph 3
    new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 0, bottom: 0, left: 200, right: 200 },
        children: [para([
          txt("If your intake process is already perfect, ignore this. If there's any gap, worth 15 minutes.", { italic: true })
        ], { before: 0, after: 100 })]
      })]
    }),
    // Signature divider
    new TableRow({
      children: [new TableCell({
        borders: { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY }, left: noBorder, right: noBorder },
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 0, bottom: 0, left: 200, right: 200 },
        children: [para(txt(""), { before: 0, after: 0 })]
      })]
    }),
    // Signature
    new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 160, left: 200, right: 200 },
        children: [
          para([txt("— Joey", { bold: true, size: 20, color: NAVY })], { before: 0, after: 40 }),
          para([txt("AI Automation Services", { size: 18, color: "666666" })], { before: 0, after: 20 }),
          para([txt("josemor1669@gmail.com", { size: 18, color: GOLD })], { before: 0, after: 0 }),
        ]
      })]
    }),
  ];

  const elements = [
    // Card header with index and firm name
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [new TableRow({
        children: [new TableCell({
          borders: noBorders,
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 140, bottom: 140, left: 240, right: 240 },
          children: [
            para([
              txt(`${String(index + 1).padStart(2, '0')}  `, { bold: true, size: 28, color: GOLD }),
              txt(lead.name, { bold: true, size: 26, color: WHITE }),
            ], { before: 0, after: 0 }),
          ]
        })]
      })]
    }),
    // Meta info table (To, CC, Subject)
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1200, 8160],
      rows: [
        metaRow("To:", lead.to),
        ...(lead.cc ? [metaRow("CC:", lead.cc)] : []),
        metaRow("Subject:", "quick question about your intake process"),
      ]
    }),
    // Email body card
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: emailBodyRows,
    }),
    sp(isLast ? 60 : 20),
    ...(!isLast ? [new Paragraph({ children: [new PageBreak()] })] : []),
  ];

  return elements;
}

// Cover page content
const coverChildren = [
  sp(600),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 600, bottom: 600, left: 600, right: 600 },
        children: [
          para(txt("LAW FIRM", { bold: true, size: 60, color: GOLD }), { align: AlignmentType.CENTER, before: 0, after: 40 }),
          para(txt("OUTREACH EMAILS", { bold: true, size: 60, color: WHITE }), { align: AlignmentType.CENTER, before: 0, after: 120 }),
          para(txt("12 Personalized Drafts — Ready to Send", { size: 22, color: "AABBD4", italic: true }), { align: AlignmentType.CENTER, before: 0, after: 80 }),
          para(txt("Joey G.  |  josemor1669@gmail.com", { size: 20, color: "AABBD4" }), { align: AlignmentType.CENTER, before: 0, after: 0 }),
        ]
      })]
    })]
  }),
  sp(200),
  // Legend
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 3120, 3120],
    rows: [new TableRow({
      children: [
        new TableCell({ borders: noBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 160, right: 100 },
          children: [
            para(txt("12", { bold: true, size: 40, color: NAVY }), { align: AlignmentType.CENTER, before: 0, after: 20 }),
            para(txt("Leads with valid emails", { size: 18, color: DARK }), { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ]
        }),
        new TableCell({ borders: noBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 160, right: 100 },
          children: [
            para(txt("1", { bold: true, size: 40, color: NAVY }), { align: AlignmentType.CENTER, before: 0, after: 20 }),
            para(txt("Identical message body", { size: 18, color: DARK }), { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ]
        }),
        new TableCell({ borders: noBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: NAVY_LIGHT, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 160, right: 100 },
          children: [
            para(txt("0", { bold: true, size: 40, color: GREEN }), { align: AlignmentType.CENTER, before: 0, after: 20 }),
            para(txt("Junk emails included", { size: 18, color: DARK }), { align: AlignmentType.CENTER, before: 0, after: 0 }),
          ]
        }),
      ]
    })]
  }),
  sp(80),
  para(txt("Note: 18 leads had no valid email address and are excluded. Junk domains (netu.tv, ion.medical, visits.by, etc.) were filtered out automatically.", { size: 17, color: "888888", italic: true }), { before: 0, after: 0 }),
  new Paragraph({ children: [new PageBreak()] }),
];

// Build all email blocks
const allEmailElements = leads.flatMap((lead, i) => buildEmailBlock(lead, i));

const doc = new Document({
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
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 } },
          children: [
            new TextRun({ text: "Law Firm Outreach  |  Joey G.  |  josemor1669@gmail.com", size: 16, color: "999999", font: "Arial" }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: NAVY, space: 1 } },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "AI Automation Services  |  Law Firm Client Intake System  |  30-Day Free Pilot Available", size: 16, color: "999999", font: "Arial" })]
        })]
      })
    },
    children: [...coverChildren, ...allEmailElements]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/hopeful-trusting-ramanujan/mnt/outputs/lawfirm_outreach_emails.docx', buffer);
  console.log('Done.');
}).catch(err => console.error(err));
