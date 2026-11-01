"""Fetch BatasWatch (bills.juris.ph) author profiles and map House member codes to author names."""
import json, urllib.request
url = "https://bills.juris.ph/api/authors?limit=1000&chamber=house"
items = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "politiko"})))["items"]
out = {a["officialMemberId"]: {"name": a["canonicalName"], "bills": a["billCount"]} for a in items if a.get("officialMemberId") and a.get("chamber") == "house"}
json.dump(out, open("src/data/juris-authors.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out))
