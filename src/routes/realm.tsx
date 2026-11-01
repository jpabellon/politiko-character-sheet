import { createFileRoute, Link } from "@tanstack/react-router";
import { Crest, Panel, T } from "@/components/hud";
import { PH_BOUNDS, PH_PATH } from "@/data/ph-map";
import { ROSTER, REGIONS, fullName, place, regionShort } from "@/data/members";

// Approximate region centers as [lon, lat]
const POS: Record<string, [number, number]> = {
  "REGION I (ILOCOS REGION)": [120.4, 16.6], "CORDILLERA ADMINISTRATIVE REGION (CAR)": [121.0, 17.4], "REGION II (CAGAYAN VALLEY)": [121.8, 17.2],
  "REGION III (CENTRAL LUZON)": [120.7, 15.4], "NATIONAL CAPITAL REGION (NCR)": [121.0, 14.6], "REGION IV-A (CALABARZON)": [121.4, 14.1],
  "REGION IV-B (MIMAROPA)": [119.3, 11.0], "REGION V (BICOL REGION)": [123.4, 13.4], "REGION VI (WESTERN VISAYAS)": [122.5, 10.9],
  "REGION VII (CENTRAL VISAYAS)": [123.8, 10.1], "REGION VIII (EASTERN VISAYAS)": [124.9, 11.6], "REGION IX (ZAMBOANGA PENINSULA)": [122.6, 7.8],
  "REGION X (NORTHERN MINDANAO)": [124.6, 8.3], "REGION XIII (Caraga)": [125.8, 8.9], "REGION XI (DAVAO REGION)": [125.8, 7.1],
  "REGION XII (SOCCSKSARGEN)": [124.8, 6.4], "BARMM (CENTRAL MINDANAO)": [124.2, 7.3], "AUTONOMOUS REGION IN MUSLIM MINDANAO (ARMM)": [121.0, 6.0],
};
const toPct = ([lon, lat]: [number, number]): [number, number] => [
  ((lon - PH_BOUNDS.lon0) / (PH_BOUNDS.lon1 - PH_BOUNDS.lon0)) * 100,
  ((PH_BOUNDS.lat1 - lat) / (PH_BOUNDS.lat1 - PH_BOUNDS.lat0)) * 100,
];

export const Route = createFileRoute("/realm")({
  validateSearch: (s: Record<string, unknown>): { region?: string | undefined } => ({ region: typeof s["region"] === "string" ? s["region"] : undefined }),
  head: () => ({
    meta: [
      { title: "Realm — Politiko Character Sheet" },
      { name: "description", content: "Browse House members by region and province." },
      { property: "og:title", content: "Realm — Politiko Character Sheet" },
      { property: "og:description", content: "Browse House members by region and province." },
    ],
  }),
  component: Realm,
});

function Realm() {
  const { region } = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = ROSTER.filter((m) => !region || m.region === region);
  const pick = (r?: string) => navigate({ search: { region: r === region ? undefined : r }, replace: true });

  return (
    <div className="space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary"><T game="Realm" plain="Browse by place" /></p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Who represents where</h1>
        <p className="mt-2 text-muted-foreground">Pins mark regions on the map of the Philippines. No shading by score.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <div className="relative mx-auto max-w-sm" style={{ aspectRatio: `${PH_BOUNDS.w} / ${PH_BOUNDS.h}` }}>
            <svg viewBox={`0 0 ${PH_BOUNDS.w} ${PH_BOUNDS.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <path d={PH_PATH} fill="var(--panel-strong)" stroke="var(--muted-foreground)" strokeWidth="0.25" strokeLinejoin="round" />
            </svg>
            {REGIONS.map((r) => {
              const [x, y] = POS[r] ? toPct(POS[r]) : [50, 50];
              const n = ROSTER.filter((m) => m.region === r).length;
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
              <button key={r} onClick={() => pick(r)} className={`min-h-11 border px-3 text-sm ${region === r ? "border-primary text-primary" : "border-border hover:border-muted-foreground"}`}>{regionShort(r)}</button>
            ))}
          </div>
          <ul className="hud-panel divide-y divide-border">
            {list.map((m) => (
              <li key={m.slug}>
                <Link to="/member/$slug" params={{ slug: m.slug }} className="flex min-h-14 items-center gap-3 p-3 hover:bg-panel-strong">
                  <Crest m={m} size="sm" />
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{fullName(m)}</span><span className="block truncate text-xs text-muted-foreground">{place(m)}</span></span>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{regionShort(m.region)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
