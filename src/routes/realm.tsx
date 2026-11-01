import { createFileRoute, Link } from "@tanstack/react-router";
import { Crest, Panel, T } from "@/components/hud";
import { MEMBERS, REGIONS, fullName } from "@/data/members";

// Approximate positions on a simplified archipelago (percent of box)
const POS: Record<string, [number, number]> = {
  "Cordillera Administrative Region": [38, 18], "Central Luzon": [36, 30], NCR: [38, 37], CALABARZON: [42, 42],
  "Bicol Region": [60, 48], "Western Visayas": [42, 62], "Central Visayas": [56, 64], "Northern Mindanao": [62, 78],
  "Davao Region": [74, 86], BARMM: [56, 86],
};

export const Route = createFileRoute("/realm")({
  validateSearch: (s: Record<string, unknown>): { region?: string | undefined } => ({ region: typeof s["region"] === "string" ? s["region"] : undefined }),
  head: () => ({
    meta: [
      { title: "Realm Map — Politiko Character Sheet" },
      { name: "description", content: "Browse House members by region and province." },
      { property: "og:title", content: "Realm Map — Politiko Character Sheet" },
      { property: "og:description", content: "Browse House members by region and province." },
    ],
  }),
  component: Realm,
});

function Realm() {
  const { region } = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = MEMBERS.filter((m) => !region || m.region === region);
  const pick = (r?: string) => navigate({ search: { region: r === region ? undefined : r }, replace: true });

  return (
    <div className="space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary"><T game="Realm Map" plain="Browse by place" /></p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Who represents where</h1>
        <p className="mt-2 text-muted-foreground">Pins mark regions. No shading by score.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <div className="relative mx-auto aspect-[3/4] max-w-sm">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M34 8 L44 10 L46 26 L44 40 L50 44 L64 46 L66 52 L56 52 L48 48 L40 46 L34 36 L30 24 Z M38 56 L48 58 L46 68 L38 66 Z M52 58 L62 60 L60 68 L52 66 Z M50 74 L70 72 L80 84 L76 94 L60 92 L50 86 Z"
                fill="var(--panel-strong)" stroke="var(--border)" strokeWidth="0.5" />
            </svg>
            {REGIONS.map((r) => {
              const [x, y] = POS[r] ?? [50, 50];
              const n = MEMBERS.filter((m) => m.region === r).length;
              const on = region === r;
              return (
                <button key={r} onClick={() => pick(r)} aria-pressed={on} aria-label={`${r}, ${n} members`}
                  className={`absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center`} style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className={`grid h-7 w-7 place-items-center border-2 font-mono text-xs font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-primary bg-background text-primary"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </Panel>
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Regions">
            <button onClick={() => pick(undefined)} className={`min-h-11 border px-3 text-sm ${!region ? "border-primary text-primary" : "border-border"}`}>All</button>
            {REGIONS.map((r) => (
              <button key={r} onClick={() => pick(r)} className={`min-h-11 border px-3 text-sm ${region === r ? "border-primary text-primary" : "border-border hover:border-muted-foreground"}`}>{r}</button>
            ))}
          </div>
          <ul className="hud-panel divide-y divide-border">
            {list.map((m) => (
              <li key={m.slug}>
                <Link to="/member/$slug" params={{ slug: m.slug }} className="flex min-h-14 items-center gap-3 p-3 hover:bg-panel-strong">
                  <Crest m={m} size="sm" />
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{fullName(m)}</span><span className="block truncate text-xs text-muted-foreground">{m.municipality}, {m.province}</span></span>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{m.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
