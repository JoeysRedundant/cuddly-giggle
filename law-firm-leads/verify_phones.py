#!/usr/bin/env python3
"""
Phone Verification Scraper
--------------------------
For each lead, fetches the business website and checks whether the phone
number listed in Google Maps actually appears on the site (homepage +
common contact pages). This confirms the lead's contact info is accurate.

Verification logic:
  - Normalize phones to their digit sequence (last 10 digits, US).
  - Scrape homepage; if not found, try /contact, /contact-us, /about.
  - Also inspect tel: links, which are the most reliable signal.

Outputs verify_results.json with a 'phone_verified' status per lead:
  VERIFIED       - the exact number was found on the site
  NOT_FOUND      - site loaded but the number wasn't present
  NO_WEBSITE     - lead had no website to check
  UNREACHABLE    - site failed to load (timeout, DNS, 4xx/5xx)
"""
import json
import re
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}
CONTACT_PATHS = ["", "contact", "contact-us", "contacts", "about", "about-us"]
TIMEOUT = 15


def normalize(phone):
    """Return the last 10 digits of a phone number, or '' if none."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    return digits[-10:] if len(digits) >= 10 else digits


def digits_in_text(text):
    """All 10-digit sequences found in arbitrary text (loose match)."""
    found = set()
    # Match common US phone formats then normalize each to 10 digits.
    for m in re.findall(r"[\(\)\d][\d\-\.\s\(\)]{7,}\d", text):
        d = re.sub(r"\D", "", m)
        if len(d) >= 10:
            found.add(d[-10:])
    return found


def fetch(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code == 200 and r.text:
            return r.text
    except requests.RequestException:
        return None
    return None


def check_site(website, target_digits):
    """Return (status, evidence) by scanning homepage + contact pages."""
    if not website:
        return "NO_WEBSITE", ""

    parsed = urlparse(website)
    base = f"{parsed.scheme}://{parsed.netloc}" if parsed.netloc else website

    reached_any = False
    for path in CONTACT_PATHS:
        url = website if path == "" else urljoin(base + "/", path)
        html = fetch(url)
        if html is None:
            continue
        reached_any = True
        soup = BeautifulSoup(html, "lxml")

        # 1) tel: links are the strongest signal
        for a in soup.find_all("a", href=True):
            if a["href"].lower().startswith("tel:"):
                if normalize(a["href"]) == target_digits:
                    return "VERIFIED", f"tel: link on {url}"

        # 2) visible text match
        text = soup.get_text(separator=" ")
        if target_digits in digits_in_text(text):
            return "VERIFIED", f"text match on {url}"

        time.sleep(0.5)  # be polite

    if reached_any:
        return "NOT_FOUND", "site reached, number not present"
    return "UNREACHABLE", "no page could be loaded"


def main():
    leads = json.load(open("leads.json"))
    results = []
    for i, lead in enumerate(leads, 1):
        target = normalize(lead.get("phone"))
        status, evidence = check_site(lead.get("website"), target)
        lead["phone_verified"] = status
        lead["verification_evidence"] = evidence
        results.append(lead)
        print(f"[{i:2}/{len(leads)}] {lead['name'][:35]:35} -> {status}")

    json.dump(results, open("verify_results.json", "w"), indent=2)
    verified = sum(1 for r in results if r["phone_verified"] == "VERIFIED")
    print(f"\nVerified {verified}/{len(results)} phone numbers.")


if __name__ == "__main__":
    main()
