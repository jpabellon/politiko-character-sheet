"""Build member JSON from the profile CSV + scraped House member pages.
Usage: python3 scripts/build-data.py <dir-of-scraped-markdown>
Scraped pages: https://www.congress.gov.ph/house-members/view/<CODE> as markdown, saved <CODE>.md
"""
import csv, json, re, sys, os
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
MD = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/hm")
OUT = ROOT / "src/data/members"; OUT.mkdir(parents=True, exist_ok=True)
EXTRA_CODES = {"ACOP, ROMEO M.": "G002", "MERCADO, ROGER GAVIOLA": "0118"}
AXES = {"economic": "economic", "social": "social_values", "civil": "civil_liberties", "democratic": "democratic_institutions"}

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("ñ", "n")).strip("-")

SMALL = {"of", "de", "del", "and", "the", "ng"}
def tcase(s):
    out = []
    for i, w in enumerate(s.lower().split()):
        if w in ("ncr", "car", "barmm", "armm"): out.append(w.upper())
        elif i and w in SMALL: out.append(w)
        elif re.match(r"\d", w): out.append(w)
        else: out.append("-".join(x[:1].upper() + x[1:] for x in w.split("-")))
    return " ".join(out)

def clean_title(t):
    t = t.replace("AN AC?", "AN ACT").strip()
    return t[:1] + t[1:].lower() if t.isupper() else t

def parse_sources(s):
    out = []
    for part in (s or "").split(" | "):
        part = part.strip()
        if not part: continue
        m = re.search(r"(https?://\S+)\s*$", part)
        out.append({"text": part[: m.start()].strip() if m else part, "url": m.group(1) if m else None})
    return out

def field(block, name):
    m = re.search(rf"^{re.escape(name)}:\s*\n+\s*(.+)$", block, re.M)
    if not m: return None
    v = m.group(1).strip()
    v = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", v)
    return v

def parse_page(text):
    info = {}
    m = re.search(r"!\[[^\]]*\]\((https://docs\.congress\.hrep\.online/members/[^)]+)\)", text)
    info["photo"] = m.group(1) if m else None
    m = re.search(r"^## (.+)$", text, re.M); info["houseName"] = m.group(1).strip() if m else None
    m = re.search(r"^## .+\n+(.+)$", text, re.M); info["role"] = m.group(1).strip() if m else None
    head = text.split("- [Principal Authored")[0]
    lines = [l.strip(" ,") for l in head.split("\n")]
    room = next((l for l in lines if l.startswith("Room")), None)
    phones = [l for l in lines if re.search(r"\d{3,}-\d{3,}", l)]
    info["contact"] = {"room": room, "phones": phones[:3]}
    def section(start, end):
        i = text.find(f"##### {start}")
        if i < 0: return ""
        j = text.find(f"##### {end}", i + 10) if end else -1
        return text[i: j if j > 0 else len(text)]
    def bills(sec, role):
        res = []
        for blk in re.split(r"^##### ", sec, flags=re.M)[1:]:
            idm = re.match(r"(H[BR]\d{5})", blk)
            if not idm: continue
            title = field(blk, "Full Title") or ""
            b = {"id": idm.group(1), "title": clean_title(title), "date": field(blk, "Date Filed"), "role": role,
                 "status": field(blk, "Bill Status"), "referral": field(blk, "Primary Referral")}
            ra = re.search(r"\b(RA\d{5})\b", blk)
            if ra and "Republic Act" in (b["status"] or ""): b["ra"] = ra.group(1)
            if role == "coauthored": b.pop("referral")
            res.append({k: v for k, v in b.items() if v})
        return res
    info["authored"] = bills(section("Principal Authored Bills", "Co-Authored Bills"), "authored")
    info["coauthored"] = bills(section("Co-Authored Bills", "Committee Membership"), "coauthored")
    comm = []
    for m in re.finditer(r"^\| \[\d+\\?\. ([^\]]+)\]\([^)]+\) \| ([^|]+?)(?:Journal No\. \d+)? \|$", section("Committee Membership", None), re.M):
        comm.append({"name": m.group(1).strip(), "position": m.group(2).strip()})
    info["committees"] = comm
    return info

def status_of(office):
    o = office.lower()
    d = re.search(r"\d{4}-\d{2}-\d{2}", office)
    if "died" in o: return "deceased", d and d.group(0)
    if "expel" in o: return "expelled", d and d.group(0)
    if o.startswith("former"): return "changed_office", d and d.group(0)
    return "active", None

roster = []
rows = list(csv.DictReader(open(ROOT / "scripts/data/house_political_profiles_geo_links.csv", encoding="utf-8")))
slugs = set()
for r in rows:
    name = r["politician_name"]
    srcs = " ".join(r[f"{v}_sources"] for v in AXES.values())
    cm = re.search(r"house-members/view/([A-Z0-9]{4})", srcs)
    code = cm.group(1) if cm else EXTRA_CODES.get(name)
    page = parse_page((MD / f"{code}.md").read_text()) if code and (MD / f"{code}.md").exists() else {}
    hn = page.get("houseName") or name.title()
    last, _, first = hn.partition(",")
    slug = slugify(name)
    assert slug not in slugs, slug; slugs.add(slug)
    stats = {}
    informs = {}
    for k, p in AXES.items():
        sc = r[f"{p}_score"]
        conf = r[f"{p}_confidence"].lower()
        src = r[f"{p}_sources"]
        ids = sorted(set(re.findall(r"H[BR]\d{5}", src)))
        for i in ids: informs.setdefault(i, k)
        stats[k] = {"score": int(sc) if sc not in ("", None) else None, "label": r[f"{p}_label"], "confidence": conf if conf in ("high","medium","low") else "insufficient",
                    "issueCount": int(r[f"{p}_issue_count"] or 0), "rationale": r[f"{p}_rationale"], "sources": parse_sources(src), "billIds": ids}
    status, sdate = status_of(r["office_as_of_assessment"])
    bills = page.get("authored", []) + page.get("coauthored", [])
    for b in bills:
        if b["id"] in informs: b["informs"] = informs[b["id"]]
    radar = {k: int(r[f"{k}_radar"]) if r[f"{k}_radar"] else None for k in ["market_led_economy","social_liberalism","civil_liberties","institutional_checks","redistributive_economy","social_conservatism","state_restriction","concentrated_power"]}
    summary = {
        "slug": slug, "politicianName": name, "firstName": first.strip(), "lastName": last.strip().title() if last.isupper() else last.strip(),
        "office": r["office_as_of_assessment"], "role": page.get("role"), "houseCode": code,
        "party": None if r["party_affiliation"] in ("", "Unknown") else r["party_affiliation"],
        "partyAsOf": r["party_as_of"] or None,
        "alignment": None if r["political_alignment"] in ("", "Unknown") else r["political_alignment"],
        "alignmentAsOf": r["alignment_as_of"] or None,
        "municipality": tcase(r["Municipality"]), "province": tcase(r["Province"]), "region": r["Region"],
        "status": status, "statusDate": sdate, "photo": page.get("photo"),
        "tags": [t.strip() for t in r["advocacy_tags"].split("|") if t.strip()],
        "profileLabel": r["profile_label"],
        "scores": {k: {"score": v["score"], "confidence": v["confidence"]} for k, v in stats.items()},
        "authoredCount": len(page.get("authored", [])), "coauthoredCount": len(page.get("coauthored", [])),
    }
    detail = {**summary, "openCongressId": r["open_congress_person_id"], "openCongressUrl": r["open_congress_profile_url"],
              "houseUrl": f"https://www.congress.gov.ph/house-members/view/{code}" if code else None,
              "assessmentDate": r["assessment_date"], "windowStart": r["evidence_window_start"], "windowEnd": r["evidence_window_end"],
              "summary": r["profile_summary"], "caveat": r["key_caveat"], "stats": stats, "radar": radar,
              "contact": page.get("contact"), "committees": page.get("committees", []), "bills": bills}
    (OUT / f"{slug}.json").write_text(json.dumps(detail, ensure_ascii=False, separators=(",", ":")))
    roster.append(summary)
roster.sort(key=lambda m: (m["lastName"].lower(), m["firstName"].lower()))
(ROOT / "src/data/roster.json").write_text(json.dumps(roster, ensure_ascii=False, separators=(",", ":")))
print(len(roster), "members;", sum(1 for m in roster if m["photo"]), "photos;", sum(m["authoredCount"] for m in roster), "authored bills")
