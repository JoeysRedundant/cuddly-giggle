import requests
import json
import time

SCRAPELESS_API_KEY = "sk_3lzQtA30c8hclmO3VMfnigfoF7wozKcTT7xdmOnYE1rF1W14hkkfJ2FXYzuqCkya"

headers = {
    "x-api-token": SCRAPELESS_API_KEY,
    "Content-Type": "application/json"
}

def scrape_google_maps(query):
    payload = {
        "actor": "scraper.google.maps",
        "input": {
            "q": query,
            "gl": "us",
            "hl": "en",
            "type": "search"
        }
    }
    response = requests.post(
        "https://api.scrapeless.com/api/v1/scraper/request",
        headers=headers,
        json=payload
    )
    print(f"Status: {response.status_code} for query: {query}")
    
    if response.status_code == 200:
        data = response.json()
        return data.get("local_results", [])
    elif response.status_code == 201:
        task_id = response.json().get("taskId")
        print(f"Async task: {task_id}, polling...")
        for _ in range(20):
            time.sleep(3)
            poll = requests.get(
                f"https://api.scrapeless.com/api/v1/scraper/request/{task_id}",
                headers=headers
            )
            if poll.status_code == 200:
                return poll.json().get("local_results", [])
    else:
        print(f"Error: {response.text}")
    return []

# Search for content marketing agencies and social media agencies
queries = [
    "content marketing agency USA",
    "social media marketing agency",
    "video content agency"
]

all_leads = []
for q in queries:
    results = scrape_google_maps(q)
    print(f"Got {len(results)} results for '{q}'")
    all_leads.extend(results)
    time.sleep(2)

# Deduplicate by name
seen = set()
unique_leads = []
for lead in all_leads:
    name = lead.get("title", "").strip().lower()
    if name and name not in seen:
        seen.add(name)
        unique_leads.append(lead)

print(f"\nTotal unique leads: {len(unique_leads)}")

# Save raw results
with open("/sessions/hopeful-trusting-ramanujan/mnt/outputs/raw_leads.json", "w") as f:
    json.dump(unique_leads, f, indent=2)

# Print summary
for i, lead in enumerate(unique_leads[:20]):
    print(f"{i+1}. {lead.get('title')} | {lead.get('phone','N/A')} | {lead.get('website','N/A')}")

