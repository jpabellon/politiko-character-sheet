import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";
import { ConfidenceBadge, Crest, MeterBar, Panel, RadarChart, T } from "@/components/hud";
import { AXES, ROSTER, fullName, place, loadMember, type Member } from "@/data/members";

export const Route = createFileRoute("/versus/$pair")({
  loader: async ({ params }) => {
    const [a = "", b = ""] = params.pair.split("~");
    const [A, B] = await Promise.all([loadMember(a), loadMember(b)]);
    if (!A || !B) throw notFound();
    return { A, B };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.A;
    const b = loaderData?.B;
    const t = a && b ? `${a.lastName} vs ${b.lastName} — Versus` : "Versus — Politiko";
    const d = "Compare two House members on the same four axes. No winner, no ranking.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  notFoundComponent: () => <p className="py-20 text-center">One of these members was not found. <Link to="/" className="text-primary underline">Back to roster</Link></p>,
  component: Versus,
});

function Picker({ value, other, onChange, label }: { value: string; other: string; onChange: (s: string) => void; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none">
      {ROSTER.filter((m) => m.slug !== other).map((m) => <option key={m.slug} value={m.slug}>{m.lastName}, {m.firstName}</option>)}
    </select>
  );
}

function Versus() {
  const { A, B } = Route.useLoaderData();
  const a = A.slug, b = B.slug;
  const navigate = useNavigate();
  const go = (x: string, y: string) => navigate({ to: "/versus/$pair", params: { pair: `${x}~${y}` } });
  const shared = A.tags.filter((t) => B.tags.includes(t));

  return (
    <div className="space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary"><T game="Versus" plain="Compare" /></p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Same axes. Same scale. No winner.</h1>
      </header>

      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Picker label="First member" value={a} other={b} onChange={(s) => go(s, b)} />
        <button onClick={() => go(b, a)} aria-label="Swap sides" className="mx-auto grid h-11 w-11 place-items-center border border-border hover:border-primary"><ArrowLeftRight className="h-4 w-4" /></button>
        <Picker label="Second member" value={b} other={a} onChange={(s) => go(a, s)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[A, B].map((m, i) => <Head key={m.slug} m={m} side={i} />)}
      </div>

      <Panel title="Stat block" sub="Solid = first member · outlined row below = second member">
        <div className="space-y-6">
          {AXES.map((ax) => (
            <div key={ax.key}>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-3 w-3" style={{ background: ax.colorVar }} /><span className="text-sm font-semibold">{ax.name}</span>
              </div>
              {[A, B].map((m) => {
                const st = m.stats[ax.key];
                return (
                  <div key={m.slug} className="mb-2 grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 sm:grid-cols-[8rem_1fr_auto] sm:gap-3">
                    <span className="truncate text-xs text-muted-foreground">{m.lastName}</span>
                    <MeterBar axis={ax} score={st.score} confidence={st.confidence} compact />
                    <span className="flex items-center gap-2">
                      <span className="hidden sm:inline"><ConfidenceBadge c={st.confidence} /></span>
                      <span className="w-7 text-right font-mono text-sm font-bold">{st.score === null ? "??" : st.score > 0 ? `+${st.score}` : st.score}</span>
                    </span>
                  </div>
                );
              })}
              <div className="ml-[6rem] flex justify-between font-mono text-[0.6rem] uppercase text-muted-foreground sm:ml-[8.75rem] sm:mr-[7.5rem]">
                <span>{ax.negPole}</span><span>{ax.posPole}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Overlaid radar" sub={`Solid: ${A.lastName} · dashed: ${B.lastName}`}><RadarChart members={[A, B]} /></Panel>
        <Panel title="Skills">
          <p className="hud-label mb-2">Shared topics</p>
          <div className="mb-4 flex flex-wrap gap-2">{shared.length ? shared.map((t) => <span key={t} className="border border-primary px-2 py-1 text-sm">{t}</span>) : <span className="text-sm text-muted-foreground">None in common</span>}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[A, B].map((m) => (
              <div key={m.slug}>
                <p className="hud-label mb-2">Only {m.lastName}</p>
                <div className="flex flex-wrap gap-2">{m.tags.filter((t) => !shared.includes(t)).map((t) => <span key={t} className="bg-muted px-2 py-1 text-sm text-muted-foreground">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Head({ m, side }: { m: Member; side: number }) {
  return (
    <Link to="/member/$slug" params={{ slug: m.slug }} className="hud-panel hud-interactive rise-in flex items-center gap-3 p-4" style={{ animationDelay: `${side * 75}ms` }}>
      <Crest m={m} />
      <div className="min-w-0">
        <p className="truncate text-lg font-bold">{fullName(m)}</p>
        <p className="truncate text-xs text-muted-foreground">{place(m)}</p>
        <p className="mt-1 font-mono text-[0.65rem] uppercase text-muted-foreground">{m.authoredCount} bills authored</p>
      </div>
    </Link>
  );
}
