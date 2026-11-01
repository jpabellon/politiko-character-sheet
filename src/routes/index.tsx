import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Gamepad2, X } from "lucide-react";
import { MiniSheet, ModeSwitch, T, useViewMode } from "@/components/hud";
import { AXES, ROSTER, REGIONS, SCOUTING, TAGS, fullName, regionShort, scoredCount, type Confidence } from "@/data/members";

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

/** Dismissible callout that explains the character-sheet idea, in both wordings. */
function IntroCallout() {
  const { plain } = useViewMode();
  const [hidden, setHidden] = useState(true);
  useEffect(() => setHidden(localStorage.getItem("intro-dismissed") === "1"), []);
  if (hidden) return null;
  const dismiss = () => { localStorage.setItem("intro-dismissed", "1"); setHidden(true); };
  return (
    <section className="hud-panel rise-in relative mb-6 border-primary/50 p-4 sm:p-5" aria-label="About this site">
      <button onClick={dismiss} aria-label="Hide this explanation"
        className="absolute right-2 top-2 grid min-h-11 min-w-11 place-items-center text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
      <p className="hud-label flex items-center gap-2 text-primary"><Gamepad2 className="h-4 w-4" aria-hidden /> Why does this look like a game?</p>
      {plain ? (
        <div className="mt-3 max-w-3xl space-y-2 text-sm">
          <p>We show every member of the House like a character in a video game, with a profile page and four scores. It is not a real game, and nobody wins or loses.</p>
          <p>Why do it this way? Long reports are hard to read. A simple picture — four scores from −5 to +5, plus a note on how sure we are — makes it easy to see where a member stands and to compare two members side by side.</p>
          <p>The scores come from public records, mostly the bills each member wrote. A score is not good or bad, and a blank score just means we did not find enough proof yet.</p>
        </div>
      ) : (
        <div className="mt-3 max-w-3xl space-y-2 text-sm">
          <p>Every House member gets a <b>character sheet</b>: four <b>stats</b> from −5 to +5, a <b>scouting level</b> showing how much evidence backs each one, and a <b>quest log</b> of the bills they authored. Stats still fogged? That just means we haven't scouted enough proof yet.</p>
          <p>Why the game look? Because civic data is usually buried in long PDFs nobody opens. A character sheet turns it into something you can read in seconds — and comparing two members feels like a <b>versus</b> screen.</p>
          <p>The build is real, though: every stat is computed from public records, mostly filed bills. A score is a position, not a power level — no stat is "better" than another.</p>
        </div>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>Prefer {plain ? "game words" : "plain words"}? Switch any time:</span>
        <ModeSwitch />
        <Link to="/rulebook" className="text-primary underline underline-offset-2">Read the full guide</Link>
      </p>
    </section>
  );
}

function Roster() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(24);
  const [scouting, setScouting] = useState<"" | Confidence | "any">("");
  const set = (k: keyof Search, v: string) => navigate({ search: (p: Search) => ({ ...p, [k]: v || undefined }), replace: true });

  const list = useMemo(() => {
    const ql = q.toLowerCase();
    return ROSTER.filter((m) =>
      (!ql || `${fullName(m)} ${m.politicianName} ${m.municipality} ${m.province} ${m.office}`.toLowerCase().includes(ql)) &&
      (!search.region || m.region === search.region) &&
      (!search.tag || m.tags.includes(search.tag)) &&
      (!scouting || (scouting === "insufficient" ? scoredCount(m) === 0 : AXES.some((a) => m.scores[a.key].confidence === scouting))),
    );
  }, [q, search.region, search.tag, scouting]);

  const active = [search.region, search.tag, scouting].filter(Boolean).length;

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

      <div className="hud-panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, city or province" aria-label="Filter by name or district" className={selectCls + " lg:col-span-1"} />
        <select aria-label="Region" value={search.region ?? ""} onChange={(e) => set("region", e.target.value)} className={selectCls}>
          <option value="">All regions</option>{REGIONS.map((r) => <option key={r} value={r}>{regionShort(r)}</option>)}
        </select>
        <select aria-label="Topic" value={search.tag ?? ""} onChange={(e) => set("tag", e.target.value)} className={selectCls}>
          <option value="">All topics</option>{TAGS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Scouting level" value={scouting} onChange={(e) => setScouting(e.target.value as Confidence)} className={selectCls}>
          <option value="">Any scouting level</option>
          {(Object.keys(SCOUTING) as Confidence[]).map((c) => <option key={c} value={c}>{c === "insufficient" ? "Fully unscouted" : `Has a ${SCOUTING[c].game.toLowerCase()} stat`}</option>)}
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{list.length} members · sorted A–Z by last name</p>
        {active > 0 && (
          <button onClick={() => { setScouting(""); navigate({ search: {}, replace: true }); }} className="inline-flex min-h-11 items-center gap-1 text-sm text-primary">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.slice(0, limit).map((m, i) => <MiniSheet key={m.slug} m={m} delay={Math.min(i % 24, 8) * 75} />)}
        </div>
      ) : null}
      {list.length > limit && (
        <div className="mt-6 text-center"><button onClick={() => setLimit(limit + 48)} className="min-h-11 border border-border px-6 text-sm hover:border-primary">Show more ({list.length - limit} remaining)</button></div>
      )}
      {list.length === 0 && (
        <p className="fog-hatch border border-fog p-8 text-center text-muted-foreground">No members match these filters.</p>
      )}
      <p className="mt-8 text-xs text-muted-foreground">Profiles assessed 1 Nov 2026. Photos and bill records from the House of Representatives website.</p>
    </div>
  );
}
