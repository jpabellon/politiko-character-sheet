"""Build src/data/socials.json (politicianName -> {fb, ig}) from scripts/data/house_members_socials.csv."""
import csv, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
names = {m["politicianName"] for m in json.load(open(root / "src/data/roster.json"))}
out, miss = {}, []
for r in csv.DictReader(open(root / "scripts/data/house_members_socials.csv", encoding="utf-8")):
    fb, ig = (r.get("Facebook_URL") or "").strip(), (r.get("Instagram_URL") or "").strip()
    if r["Name"] not in names: miss.append(r["Name"]); continue
    if fb or ig: out[r["Name"]] = {k: v for k, v in (("fb", fb), ("ig", ig)) if v}
json.dump(out, open(root / "src/data/socials.json", "w"), indent=0, ensure_ascii=False)
print(len(out), "with socials; unmatched:", miss)
