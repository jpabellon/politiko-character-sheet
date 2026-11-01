"""Copy party, political_alignment (with their as-of dates) and municipality/province from the profile CSV into the generated member JSON.
Use this when the scraped House pages needed by build-data.py are not on hand; build-data.py writes the same fields."""
import csv, json, pathlib

SMALL = {"of", "de", "del", "and", "the", "ng"}
def tcase(s):  # same casing as build-data.py
    out = []
    for i, w in enumerate(s.lower().split()):
        if w in ("ncr", "car", "barmm", "armm"): out.append(w.upper())
        elif i and w in SMALL: out.append(w)
        elif w[:1].isdigit(): out.append(w)
        else: out.append("-".join(x[:1].upper() + x[1:] for x in w.split("-")))
    return " ".join(out)
root = pathlib.Path(__file__).resolve().parent.parent
rows = {r["politician_name"]: r for r in csv.DictReader(open(root / "scripts/data/house_political_profiles_geo_links.csv", encoding="utf-8"))}
def patch(path):
    d = json.loads(path.read_text())
    r = rows[d["politicianName"]]
    d["party"] = None if r["party_affiliation"] in ("", "Unknown") else r["party_affiliation"]
    d["partyAsOf"] = r["party_as_of"] or None
    d["alignment"] = None if r["political_alignment"] in ("", "Unknown") else r["political_alignment"]
    d["alignmentAsOf"] = r["alignment_as_of"] or None
    d["municipality"], d["province"] = tcase(r["Municipality"]), tcase(r["Province"])
    path.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")))
roster = root / "src/data/roster.json"
data = json.loads(roster.read_text())
for m in data:
    r = rows[m["politicianName"]]
    m["party"] = None if r["party_affiliation"] in ("", "Unknown") else r["party_affiliation"]
    m["partyAsOf"] = r["party_as_of"] or None
    m["alignment"] = None if r["political_alignment"] in ("", "Unknown") else r["political_alignment"]
    m["alignmentAsOf"] = r["alignment_as_of"] or None
    m["municipality"], m["province"] = tcase(r["Municipality"]), tcase(r["Province"])
roster.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
for m in data: patch(root / "src/data/members" / f"{m['slug']}.json")
print(len(data), "members patched;", sum(1 for m in data if m["party"]), "with party")
