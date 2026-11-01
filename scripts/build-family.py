"""Build src/data/family.json (politicianName -> [{name, rel, bio}]) from scripts/data/house_family.csv."""
import csv, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
names = {m["politicianName"] for m in json.load(open(root / "src/data/roster.json"))}
out, miss = {}, set()
for r in csv.DictReader(open(root / "scripts/data/house_family.csv", encoding="utf-8")):
    n = r["Primary Congress Member"].strip()
    if n not in names: miss.add(n); continue
    out.setdefault(n, []).append({"name": r["Family Member Name"].strip(), "rel": r["Relationship"].strip(),
        "bio": r["Public Office / Professional Background & Dynastic Ties"].strip()})
json.dump(out, open(root / "src/data/family.json", "w"), indent=0, ensure_ascii=False)
print(len(out), "members; unmatched:", sorted(miss))
