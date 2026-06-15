# Testing Patterns

**Analysis Date:** 2026-06-13

## No Formal Test Suite Exists

There are no test files, test runners, or test configuration in this codebase.

Confirmed absent:
- No `*.test.js`, `*.spec.js`, `*.test.py`, or `*.spec.py` files
- No `jest.config.*`, `vitest.config.*`, `pytest.ini`, or `setup.cfg`
- No test-related entries in `outputs/package.json` (only `docx` dependency listed)
- No `requirements.txt` (Python deps not formalized at all)
- No `scripts.test` entry in any `package.json`

This is expected for the project type: the JS scripts are single-run DOCX generation scripts, and the Python script is a one-shot scraper. Neither is structured as reusable library code with testable units.

## What the Code Actually Does (Testing Context)

**JS pamphlet/email scripts** (`outputs/lawfirm_pamphlet.js`, `outputs/lawfirm_emails.js`, `outputs/medspa_pamphlet.js`, `outputs/realestate_pamphlet.js`):
- Import `docx`, construct a `Document` object tree, call `Packer.toBuffer()`, write a `.docx` file
- No network calls, no async beyond the Promise returned by `Packer`
- "Testing" is currently done visually: run the script, open the `.docx` file, check it looks right

**Python scraper** (`outputs/scrape_leads.py`):
- Makes HTTP requests to `api.scrapeless.com`
- Handles 200 (sync) and 201 (async/poll) response codes
- Deduplicates results by title, writes `raw_leads.json`, prints summary
- "Testing" is currently done by running against the live API and inspecting the JSON output

## What Testing Would Look Like for This Kind of Work

If tests were introduced, they would follow these patterns:

### JS Document Generator Testing

**Framework recommendation:** Vitest (lightweight, no config required, ESM-friendly)

```bash
npm install -D vitest
npx vitest run           # Run all tests once
npx vitest               # Watch mode
```

**What to test:**

The helper functions (`spacer`, `divider`, `sectionHeader`, `bodyText`, `weekBox`, `twoColRow`, `buildEmailBlock`) are pure factory functions that return DOCX element objects. They are testable without file I/O.

```js
// Example: outputs/__tests__/helpers.test.js
import { describe, it, expect } from 'vitest';
import { Paragraph, Table } from 'docx';

// Import helpers once refactored to named exports
import { spacer, sectionHeader, twoColRow } from '../pamphlet-helpers.js';

describe('spacer()', () => {
  it('returns a Paragraph', () => {
    expect(spacer(120)).toBeInstanceOf(Paragraph);
  });
  it('uses default pts when called with no args', () => {
    // Verify spacing property on returned Paragraph
    const result = spacer();
    expect(result.root[0].root[0].spacing.after).toBe(120);
  });
});

describe('twoColRow()', () => {
  it('returns a TableRow with two cells', () => {
    const row = twoColRow('Label', 'Value', false);
    expect(row.cells).toHaveLength(2);
  });
});
```

**What not to test:** The final `Document` assembly block and `Packer.toBuffer()` call — these are docx library internals. Focus tests on the helper functions.

**Integration verification (manual):**
- Run `node outputs/lawfirm_pamphlet.js` and open the `.docx` to verify layout
- This remains the most practical validation for document fidelity

### Python Scraper Testing

**Framework recommendation:** pytest

```bash
pip install pytest pytest-mock requests-mock
pytest outputs/                    # Run all tests
pytest outputs/ -v                 # Verbose
```

**What to test:**

The scraper logic inside `scrape_google_maps()` is testable by mocking HTTP responses.

```python
# Example: outputs/test_scrape_leads.py
import pytest
import requests_mock as req_mock
from scrape_leads import scrape_google_maps

def test_scrape_returns_local_results_on_200(requests_mock):
    requests_mock.post(
        "https://api.scrapeless.com/api/v1/scraper/request",
        json={"local_results": [{"title": "Test Firm", "phone": "555-1234"}]},
        status_code=200
    )
    results = scrape_google_maps("personal injury attorney Tampa")
    assert len(results) == 1
    assert results[0]["title"] == "Test Firm"

def test_scrape_returns_empty_on_error(requests_mock):
    requests_mock.post(
        "https://api.scrapeless.com/api/v1/scraper/request",
        json={"error": "unauthorized"},
        status_code=401
    )
    results = scrape_google_maps("personal injury attorney Tampa")
    assert results == []

def test_deduplication_removes_duplicates():
    leads = [
        {"title": "Acme Law", "phone": "111"},
        {"title": "acme law", "phone": "222"},  # duplicate by lowercase title
        {"title": "Other Firm", "phone": "333"},
    ]
    seen = set()
    unique = []
    for lead in leads:
        name = lead.get("title", "").strip().lower()
        if name and name not in seen:
            seen.add(name)
            unique.append(lead)
    assert len(unique) == 2
```

**What not to test:** The Scrapeless async polling loop against a live endpoint — mock the HTTP layer instead.

### n8n Workflow Testing

The `workflows/` directory contains ~190 n8n workflow JSON files organized by service. n8n workflows are not unit-testable as code — they are configuration. Testing patterns for this type of artifact:

- **Import validation:** Check that JSON parses without error and has required top-level keys (`nodes`, `connections` or `name`)
- **Schema lint:** n8n provides a CLI (`npx n8n` locally or self-hosted) to import and validate workflows
- **Manual execution:** Run in n8n's test/manual trigger mode against sandbox credentials
- **Integration test:** End-to-end run in a staging n8n instance with real (test) credentials

No automated workflow test tooling is currently set up.

## Verification Approach (Current Practice)

Based on the code and the `SYSTEM_PLAN.md`, the current verification model is:

| Artifact | Verification Method |
|----------|---------------------|
| `lawfirm_pamphlet.js` | Run `node outputs/lawfirm_pamphlet.js`, open `.docx`, visually inspect layout |
| `lawfirm_emails.js` | Run `node outputs/lawfirm_emails.js`, open `.docx`, check all 12 email cards |
| `medspa_pamphlet.js` | Same visual inspection pattern |
| `realestate_pamphlet.js` | Same visual inspection pattern |
| `scrape_leads.py` | Run against live API, inspect `raw_leads.json` and printed summary |
| n8n workflows | Manual trigger in n8n UI, review execution log |

## Recommended First Tests to Write

If adding tests, prioritize in this order:

1. **Python deduplication logic** — pure function, no mocking needed, highest value
2. **`scrape_google_maps()` error path** — mock HTTP, verify empty-list return and no crash
3. **JS `buildEmailBlock()`** — verify it returns the expected number of child elements for a given lead
4. **JS color constant presence** — trivially verify brand constants aren't undefined (catches copy-paste errors across variants)

## Dependencies Required to Add Tests

**JS:**
```json
{
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

**Python:**
```
pytest>=8.0
pytest-mock>=3.0
requests-mock>=1.11
```

Neither is currently installed. `outputs/package.json` has no `devDependencies` section.

---

*Testing analysis: 2026-06-13*
