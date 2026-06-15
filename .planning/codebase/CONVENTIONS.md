# Coding Conventions

**Analysis Date:** 2026-06-13

## Source Files Examined

- `outputs/lawfirm_pamphlet.js` — DOCX pamphlet generator (391 lines)
- `outputs/lawfirm_emails.js` — Outreach email doc generator (318 lines)
- `outputs/medspa_pamphlet.js` — Med spa variant pamphlet (415 lines)
- `outputs/realestate_pamphlet.js` — Real estate variant pamphlet (385 lines)
- `outputs/scrape_leads.py` — Google Maps lead scraper via Scrapeless API (79 lines)

## Naming Patterns

**Files:**
- Kebab-case with underscore separators: `lawfirm_pamphlet.js`, `medspa_pamphlet.js`, `scrape_leads.py`
- All lowercase, no camelCase in filenames
- Descriptive purpose-first naming: `<target>_<artifact>.js`

**Functions (JS):**
- camelCase for all functions: `spacer()`, `divider()`, `sectionHeader()`, `bodyText()`, `weekBox()`, `twoColRow()`, `buildEmailBlock()`, `greeting()`
- Names describe what the function returns/builds, not what it does procedurally
- Short abbreviations used in `lawfirm_emails.js` specifically: `sp()` (spacer), `txt()` (text run), `para()` (paragraph)

**Constants (JS):**
- SCREAMING_SNAKE_CASE for all color/brand constants at module top
- Grouping pattern: primary brand colors first, then neutrals
- Descriptive semantic names: `BRAND_NAVY`, `BRAND_GOLD`, `DARK_TEXT`, `MID_GRAY`, not raw values

Example from `outputs/lawfirm_pamphlet.js`:
```js
const BRAND_NAVY = "1B2A4A";
const BRAND_NAVY_LIGHT = "E8ECF4";
const BRAND_GOLD = "B8922A";
const BRAND_GOLD_LIGHT = "FDF6E3";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F7F7F7";
const MID_GRAY = "EEEEEE";
const DARK_TEXT = "1A1A2E";
```

**Variables (JS):**
- camelCase for all locals and parameters
- Short names acceptable in mapping contexts: `i`, `q`, `alt`
- Data array items use descriptive names: `lead`, `leads`, `allEmailElements`

**Functions (Python):**
- snake_case throughout: `scrape_google_maps(query)`, no classes
- Module-level constants in SCREAMING_SNAKE_CASE: `SCRAPELESS_API_KEY`

## Code Style

**Formatting:**
- No linter or formatter config detected (no `.eslintrc`, `.prettierrc`, `biome.json`, or `pyproject.toml`)
- JS scripts use 2-space indentation consistently
- Python uses 4-space indentation (PEP 8 compatible)
- Single quotes for JS strings; double quotes in Python (except f-strings)
- No trailing semicolons inconsistency — semicolons used in all JS files

**Line length:**
- No enforced limit; some inline object literals run long (constructor call chains on one line are common)
- Table cell definitions are particularly dense inline — accepted pattern for this codebase

**Linting:**
- Not detected. No ESLint, Prettier, Pylint, or Flake8 configuration present.

## Module Structure

**JS files follow a fixed three-zone layout:**

1. **Imports** — destructured `require` from `docx`, then `fs`
2. **Constants block** — brand color hex strings, shared border objects
3. **Helper functions** — reusable DOCX element builders
4. **Data** — inline arrays/objects (leads list, content strings)
5. **Document assembly** — `new Document({...})` with `children:` array built by calling helpers
6. **Output** — `Packer.toBuffer(doc).then(...)` write to disk

Example structural pattern (all four pamphlet/email scripts):
```js
// 1. Imports
const { Document, Packer, Paragraph, ... } = require('...docx');
const fs = require('fs');

// 2. Constants
const BRAND_NAVY = "1B2A4A";
const noBorders = { top: noBorder, ... };

// 3. Helpers
function spacer(pts = 120) { ... }
function sectionHeader(text) { ... }

// 4. Data (inline in pamphlet scripts; leads array in emails script)

// 5. Assembly
const doc = new Document({ sections: [{ children: [...] }] });

// 6. Output
Packer.toBuffer(doc).then(buffer => fs.writeFileSync(...)).catch(err => console.error(err));
```

**Python script follows linear script pattern:**
- No functions except the one scraper function
- Module-level globals for API key and headers
- Sequential execution: define queries → loop → deduplicate → save → print

## Import Organization

**JS:**
- Single destructured import from `docx` at top (all needed exports listed together)
- `fs` import immediately follows
- No other imports; no path aliases

**Python:**
- Standard library imports first: `json`, `time`
- Third-party imports: `requests`
- No internal imports (single-file scripts)

## Error Handling

**JS pattern — minimal, promise-based only:**

All four JS scripts use the same tail pattern with no try/catch in helper functions:
```js
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('...path...', buffer);
  console.log('Pamphlet created successfully.');
}).catch(err => console.error(err));
```
- `fs.writeFileSync` is not wrapped in try/catch; file write errors will be caught by the outer `.catch`
- Helper functions (`spacer`, `sectionHeader`, etc.) have no error handling — they are pure constructors that will throw if called with bad arguments
- No input validation on function parameters

**Python pattern — conditional status-code branching:**
```python
if response.status_code == 200:
    data = response.json()
    return data.get("local_results", [])
elif response.status_code == 201:
    # async polling loop
    ...
else:
    print(f"Error: {response.text}")
return []
```
- Returns empty list on error — caller proceeds silently with zero results
- No exceptions raised; no logging beyond `print()`
- Poll loop runs at most 20 iterations with `time.sleep(3)` between; no error if poll never succeeds

## Logging

**Framework:** None. Raw `print()` and `console.log()` / `console.error()` only.

**JS patterns:**
- `console.log('Pamphlet created successfully.')` — success confirmation only
- `console.error(err)` — in `.catch()` handler only

**Python patterns:**
- `print(f"Status: {response.status_code} for query: {query}")` — per-request progress
- `print(f"Got {len(results)} results for '{q}'")` — per-query summary
- `print(f"Total unique leads: {len(unique_leads)}")` — final count
- `print(f"{i+1}. {lead.get('title')} | ...")` — preview of first 20 results

## Comments

**JS files use section-divider comments for visual navigation:**
```js
// HERO
// THE PROBLEM
// THE SOLUTION
// ── HERO BLOCK ──────────────────────────────────────────  (medspa variant)
```
- `medspa_pamphlet.js` uses longer ASCII-art divider comments
- No JSDoc on any function; no inline explanation of business logic
- Helper functions are self-documenting by name

**Python:**
- One comment block before the queries list: `# Search for content marketing agencies...`
- One comment before dedup section: `# Deduplicate by name`
- One comment before save: `# Save raw results`
- One comment before summary print: `# Print summary`
- No docstrings on any function

## Function Design

**JS helpers — short, single-purpose, return a DOCX element:**
- `spacer(pts)` — 3 lines, returns a blank Paragraph
- `divider(color)` — 6 lines, returns a bordered Paragraph
- `sectionHeader(text)` — 4 lines, returns a styled Paragraph
- `bodyText(text, options)` — 5 lines, returns a configurable Paragraph
- `weekBox(week, title, items)` — 25 lines, returns a two-column Table
- `twoColRow(label, value, alt)` — 20 lines, returns a TableRow

**Larger assembly functions:**
- `buildEmailBlock(lead, index)` in `lawfirm_emails.js` — ~130 lines, assembles a full multi-table email card; contains a nested `metaRow` arrow function
- These are the largest functions; everything else is a factory for one DOCX element

**Parameters:**
- Default parameter values used: `spacer(pts = 120)`, `divider(color = BRAND_GOLD)`
- Options objects used for flexible styling: `bodyText(text, options = {})` with `options.center`, `options.size`, `options.color`, `options.bold`, `options.italic`
- Boolean `alt` flag used for alternating row shading in table helpers

## Data Patterns

**Inline data — preferred over external files:**
- Lead contact list in `lawfirm_emails.js` is a hardcoded array of objects at module scope
- Greeting map is a hardcoded lookup object (12 entries)
- Content strings (body copy, feature descriptions) are inline template literals and string literals

**Data shapes:**
```js
// leads array
{ name: "...", to: "...", cc: "..." }

// tech stack table rows
["Tool name", "Purpose string", "Cost string", altBoolean]
```

**Python data:**
- API key hardcoded at module top as a constant (no `.env` or environment variable loading)
- Queries list is a hardcoded array at module scope
- Output path is a hardcoded absolute string: `/sessions/hopeful-trusting-ramanujan/mnt/outputs/...`

## Hardcoded Paths (Notable)

All JS `require()` calls and `fs.writeFileSync()` calls use an absolute session path:
```js
require('/sessions/hopeful-trusting-ramanujan/mnt/outputs/node_modules/docx')
fs.writeFileSync('/sessions/hopeful-trusting-ramanujan/mnt/outputs/lawfirm_automation_pamphlet.docx', buffer)
```
- This path is tied to the sandbox session where the scripts were originally run
- Scripts will fail if run outside that specific session environment
- Same pattern in `scrape_leads.py` output path

## Variant Pattern

The three pamphlet scripts (`lawfirm_pamphlet.js`, `medspa_pamphlet.js`, `realestate_pamphlet.js`) share the same structure with only brand color names and content strings swapped. There is no shared base module — each is a full standalone copy with theme variables changed at the top. `lawfirm_emails.js` has a slightly different helper naming convention (`sp`, `txt`, `para` instead of `spacer`, `bodyText`) suggesting it was authored separately.

---

*Convention analysis: 2026-06-13*
