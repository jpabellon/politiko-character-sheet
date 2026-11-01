import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { MiniSheet, T } from "@/components/hud";
import { AXES, MEMBERS, REGIONS, SCOUTING, TAGS, fullName, scoredCount, type Confidence } from "@/data/members";

type Search = { tag?: string | undefined; region?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tag: typeof s["tag"] === "string" ? s["tag"] : undefined,
    region: typeof s["region"] === "string" ? s["region"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Roster — Politiko Character Sheet" },
      { name: "description", content: "Find your House representative and read their character sheet: four stats, scouting levels and a quest log of filed bills." },
      { property: "og:title", content: "Roster — Politiko Character Sheet" },
      { property: "og:description", content: "Evidence-based, game-style profiles of every House member." },
    ],
  }),
  component: Roster,
});

const selectCls = "h-11 w-full border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none";

function Roster() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [scouting, setScouting] = useState<"" | Confidence | "any">("");
  const [party, setParty] = useState("");
  const parties = [...new Set(MEMBERS.map((m) => m.party))].sort();
  const set = (k: keyof Search, v: string) => navigate({ search: (p: Search) => ({ ...p, [k]: v || undefined }), replace: true });

  const list = useMemo(() => {
    const ql = q.toLowerCase();
    return MEMBERS.filter((m) =>
      (!ql || `${fullName(m)} ${m.municipality} ${m.province} ${m.office}`.toLowerCase().includes(ql)) &&
      (!search.region || m.region === search.region) &&
      (!search.tag || m.tags.includes(search.tag)) &&
      (!party || m.party === party) &&
      (!scouting || (scouting === "insufficient" ? scoredCount(m) === 0 : AXES.some((a) => m.stats[a.key].confidence === scouting))),
    );
  }, [q, search.region, search.tag, party, scouting]);

  const active = [search.region, search.tag, party, scouting].filter(Boolean).length;

  return (
    <div>
      <section className="rise-in mb-8 max-w-3xl">
        <p className="hud-label text-primary">20th Congress · House of Representatives</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
          <T game="Choose a character." plain="Find your representative." />
        </h1>
        <p className="mt-3 text-muted-foreground sm:text-lg">
          Every member as a character sheet: four stats from the bills they filed, how much evidence backs each one, and a log of what they authored. Where evidence is thin, we say so.
        </p>
      </section>

      <div className="hud-panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, city or province" aria-label="Filter by name or district" className={selectCls + " lg:col-span-1"} />
        <select aria-label="Region" value={search.region ?? ""} onChange={(e) => set("region", e.target.value)} className={selectCls}>
          <option value="">All regions</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select aria-label="Topic" value={search.tag ?? ""} onChange={(e) => set("tag", e.target.value)} className={selectCls}>
          <option value="">All topics</option>{TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Scouting level" value={scouting} onChange={(e) => setScouting(e.target.value as Confidence)} className={selectCls}>
          <option value="">Any scouting level</option>
          {(Object.keys(SCOUTING) as Confidence[]).map((c) => <option key={c} value={c}>{c === "insufficient" ? "Fully unscouted" : `Has a ${SCOUTING[c].game.toLowerCase()} stat`}</option>)}
        </select>
        <select aria-label="Party" value={party} onChange={(e) => setParty(e.target.value)} className={selectCls}>
          <option value="">All parties</option>{parties.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{list.length} members · sorted A–Z by last name</p>
        {active > 0 && (
          <button onClick={() => { setParty(""); setScouting(""); navigate({ search: {}, replace: true }); }} className="inline-flex min-h-11 items-center gap-1 text-sm text-primary">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((m, i) => <MiniSheet key={m.slug} m={m} delay={Math.min(i, 8) * 75} />)}
        </div>
      ) : (
        <p className="fog-hatch border border-fog p-8 text-center text-muted-foreground">No members match these filters.</p>
      )}
      <p className="mt-8 text-xs text-muted-foreground">Sample data: these are fictional demonstration members, not real officials.</p>
    </div>
  );
}
