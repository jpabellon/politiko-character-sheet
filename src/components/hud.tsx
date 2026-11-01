import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff, HelpCircle, Lock, Map, ScrollText, Search, ShieldCheck, Swords, Users, Radar as RadarIcon, FileWarning } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AXES, SCOUTING, ROSTER, BETTERGOV_URL, billUrl, fullName, monogram, place, regionShort,
  type AxisDef, type Confidence, type Member, type RosterMember, radarValues,
} from "@/data/members";
import { cn } from "@/lib/utils";

/* ---------- Plain mode (swap game labels for plain labels) ---------- */
export function usePlainMode() {
  const [plain, setPlain] = useState(false);
  useEffect(() => {
    setPlain(localStorage.getItem("plain-mode") === "1");
    const h = () => setPlain(localStorage.getItem("plain-mode") === "1");
    window.addEventListener("plain-mode", h);
    return () => window.removeEventListener("plain-mode", h);
  }, []);
  const toggle = () => {
    localStorage.setItem("plain-mode", plain ? "0" : "1");
    window.dispatchEvent(new Event("plain-mode"));
  };
  return { plain, toggle };
}

export function T({ game, plain }: { game: string; plain: string }) {
  const { plain: isPlain } = usePlainMode();
  return <>{isPlain ? plain : game}</>;
}

/* ---------- Panel ---------- */
export function Panel({ title, sub, children, className, delay = 0, action }: {
  title?: string; sub?: string; children: ReactNode; className?: string; delay?: number; action?: ReactNode;
}) {
  return (
    <section className={cn("hud-panel rise-in p-4 sm:p-5", className)} style={{ animationDelay: `${delay}ms` }}>
      {title && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="hud-label text-foreground">{title}</h2>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ---------- Crest ---------- */
export function Crest({ m, size = "md" }: { m: RosterMember; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-12 w-12 text-sm", md: "h-16 w-16 text-lg", lg: "h-28 w-28 text-2xl sm:h-36 sm:w-36 sm:text-3xl" }[size];
  const [failed, setFailed] = useState(false);
  if (m.photo && !failed) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden border-2 border-primary bg-panel-strong", dims)}>
        <img src={m.photo} alt={`Official House photo of ${fullName(m)}`} loading="lazy" referrerPolicy="no-referrer"
          onError={() => setFailed(true)} className="h-full w-full object-cover object-top" />
      </div>
    );
  }
  return (
    <div aria-hidden className={cn("grid shrink-0 place-items-center border-2 border-primary bg-panel-strong font-mono font-bold text-primary", dims)}
      style={{ clipPath: "polygon(50% 0, 100% 18%, 100% 72%, 50% 100%, 0 72%, 0 18%)" }}>
      {monogram(m)}
    </div>
  );
}

/* ---------- Confidence badge ---------- */
const CONF_ICON: Record<Confidence, typeof Eye> = { high: ShieldCheck, medium: Eye, low: HelpCircle, insufficient: Lock };

export function ConfidenceBadge({ c, className }: { c: Confidence; className?: string }) {
  const Icon = CONF_ICON[c];
  const s = SCOUTING[c];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider",
      c === "high" && "border-foreground text-foreground",
      c === "medium" && "border-muted-foreground text-foreground",
      c === "low" && "border-dashed border-muted-foreground text-muted-foreground",
      c === "insufficient" && "fog-hatch border-fog text-muted-foreground",
      className,
    )}>
      <Icon className="h-3 w-3" aria-hidden />
      <T game={s.game} plain={s.plain} />
    </span>
  );
}

/* ---------- Stat meter ---------- */
const fmt = (n: number) => (n > 0 ? `+${n}` : n === 0 ? "0" : `−${Math.abs(n)}`);

export function MeterBar({ axis, score, confidence, compact }: { axis: AxisDef; score: number | null; confidence: Confidence; compact?: boolean }) {
  const h = compact ? "h-2.5" : "h-4";
  if (score === null) {
    return (
      <div className={cn("relative w-full border border-fog/70 fog-hatch", h)}>
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-muted-foreground/60" />
      </div>
    );
  }
  const left = score < 0 ? 50 + score * 10 : 50;
  const width = Math.abs(score) * 10;
  const fillStyle: React.CSSProperties =
    confidence === "low"
      ? { background: `repeating-linear-gradient(135deg, ${axis.colorVar} 0 3px, transparent 3px 6px)`, ["--origin" as string]: score < 0 ? "right" : "left" }
      : { background: axis.colorVar, ["--origin" as string]: score < 0 ? "right" : "left" };
  return (
    <div className={cn("relative w-full border border-border bg-background", h)}>
      {/* segmented ticks */}
      <div className="absolute inset-0 grid grid-cols-10">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} className="border-r border-border/50 last:border-0" />)}
      </div>
      {!compact && axis.houseBand && (
        <span className="absolute inset-y-0 bg-foreground/10" title="Middle 50% of scored House members"
          style={{ left: `${50 + axis.houseBand[0] * 10}%`, width: `${Math.max((axis.houseBand[1] - axis.houseBand[0]) * 10, 2)}%` }} />
      )}
      <span className="meter-fill absolute inset-y-0" style={{ left: `${left}%`, width: `${width}%`, ...fillStyle }} />
      {confidence === "medium" && width > 0 && (
        <span className="absolute inset-y-0 border-2 border-foreground/80" style={{ left: `${left}%`, width: `${width}%` }} />
      )}
      <span className="absolute inset-y-[-4px] left-1/2 w-0.5 -translate-x-1/2 bg-foreground" />
      <span className="absolute top-1/2 h-[calc(100%+8px)] w-1.5 -translate-x-1/2 -translate-y-1/2 border border-background bg-foreground"
        style={{ left: `${50 + score * 10}%` }} />
    </div>
  );
}

function ariaFor(axis: AxisDef, st: Member["stats"][keyof Member["stats"]]) {
  if (st.score === null) return `${axis.name}: not scored, not enough evidence.`;
  const word = st.score < 0 ? `minus ${Math.abs(st.score)}` : st.score > 0 ? `plus ${st.score}` : "zero";
  return `${axis.name}: ${word} of 5, ${st.label}, ${SCOUTING[st.confidence].plain}, ${st.issueCount} issues.`;
}

export function StatMeter({ m, axis, onOpen }: { m: Member; axis: AxisDef; onOpen: () => void }) {
  const st = m.stats[axis.key];
  const fogged = st.score === null;
  return (
    <button onClick={onOpen} aria-label={`${ariaFor(axis, st)} Open details.`}
      className="group block w-full min-h-11 p-2 -mx-2 text-left transition-colors hover:bg-panel-strong/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0" style={{ background: axis.colorVar }} aria-hidden />
          <span className="truncate text-sm font-semibold">{axis.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConfidenceBadge c={st.confidence} />
          <span className={cn("w-8 text-right font-mono text-base font-bold tabular-nums", fogged && "text-muted-foreground")}>
            {fogged ? "??" : fmt(st.score!)}
          </span>
        </div>
      </div>
      <MeterBar axis={axis} score={st.score} confidence={st.confidence} />
      <div className="mt-1.5 flex justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        <span>−5 {axis.negPole}</span>
        <span className="text-right">{axis.posPole} +5</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {fogged ? <><Lock className="mr-1 inline h-3 w-3" />Not enough evidence · {st.issueCount} of 2 issues needed</> : <>{st.label} · {st.issueCount} issues</>}
      </p>
    </button>
  );
}

export function StatBlock({ m }: { m: Member }) {
  const [open, setOpen] = useState<AxisDef | null>(null);
  const allFog = AXES.every((a) => m.stats[a.key].score === null);
  return (
    <>
      {allFog && (
        <p className="mb-3 border border-dashed border-fog px-3 py-2 text-sm text-muted-foreground">
          Not enough public bills to scout this yet.
        </p>
      )}
      <div className="space-y-4">
        {AXES.map((a) => <StatMeter key={a.key} m={m} axis={a} onOpen={() => setOpen(a)} />)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Stats are positions on an axis, not power levels. Higher is not better.{" "}
        <Link to="/rulebook" className="text-primary underline underline-offset-2">How we score</Link>
      </p>
      <StatDrawer m={m} axis={open} onClose={() => setOpen(null)} />
    </>
  );
}

function StatDrawer({ m, axis, onClose }: { m: Member; axis: AxisDef | null; onClose: () => void }) {
  const st = axis ? m.stats[axis.key] : null;
  const bills = axis ? m.bills.filter((b) => st!.billIds.includes(b.id)) : [];
  const billIdsMissing = axis ? st!.billIds.filter((id) => !m.bills.some((b) => b.id === id)) : [];
  return (
    <Sheet open={!!axis} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-l border-border bg-popover sm:max-w-md">
        {axis && st && (
          <>
            <SheetHeader className="text-left">
              <p className="hud-label">{fullName(m)}</p>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <span className="h-3.5 w-3.5" style={{ background: axis.colorVar }} />{axis.name}
              </SheetTitle>
              <SheetDescription>{axis.plain}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-6">
              <div>
                <MeterBar axis={axis} score={st.score} confidence={st.confidence} />
                <div className="mt-1.5 flex justify-between font-mono text-[0.65rem] uppercase text-muted-foreground">
                  <span>{axis.negPole}</span><span>{axis.posPole}</span>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="border border-border p-2"><dt className="hud-label">Score</dt><dd className="font-mono text-lg font-bold">{st.score === null ? "—" : fmt(st.score)}</dd></div>
                <div className="border border-border p-2"><dt className="hud-label">Issues</dt><dd className="font-mono text-lg font-bold">{st.issueCount}</dd></div>
                <div className="border border-border p-2"><dt className="hud-label">Scouting</dt><dd className="mt-1"><ConfidenceBadge c={st.confidence} /></dd></div>
              </dl>
              {st.score === null ? (
                <div className="fog-hatch border border-fog p-4">
                  <p className="font-semibold">Why is this unscouted?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A stat needs bills on at least two distinct issues. We found {st.issueCount}. This is not a neutral score of zero.
                  </p>
                  <p className="mt-3 font-semibold">What would light this</p>
                  <p className="mt-1 text-sm text-muted-foreground">Authored bills on: {axis.evidence.toLowerCase()}.</p>
                </div>
              ) : (
                <div>
                  <p className="hud-label mb-1">Rationale</p>
                  <p className="text-sm">{st.rationale}</p>
                  {axis.houseBand ? (
                    <p className="mt-2 text-xs text-muted-foreground">Shaded band: middle 50% of {axis.scoredInHouse} scored House members.</p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">House band hidden: only {axis.scoredInHouse} members scored on this axis.</p>
                  )}
                </div>
              )}
              {st.sources.length > 0 && (
                <div>
                  <p className="hud-label mb-2">Sources</p>
                  <ul className="space-y-1.5 text-sm">
                    {st.sources.map((src, i) => (
                      <li key={i} className="border-l-2 border-border pl-2">
                        {src.url ? <a href={src.url} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">{src.text || src.url}</a> : src.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(bills.length > 0 || billIdsMissing.length > 0) && (
                <div>
                  <p className="hud-label mb-2">Evidence bills</p>
                  <ul className="space-y-2">
                    {bills.map((b) => (
                      <li key={b.id}>
                        <a href={billUrl(b.id)} target="_blank" rel="noreferrer" className="block min-h-11 border border-border p-2 hover:border-primary">
                          <span className="font-mono text-xs text-primary">{b.id}</span>
                          <span className="line-clamp-3 block text-sm">{b.title}</span>
                        </a>
                      </li>
                    ))}
                    {billIdsMissing.map((id) => (
                      <li key={id}><a href={billUrl(id)} target="_blank" rel="noreferrer" className="block min-h-11 border border-border p-2 font-mono text-xs text-primary hover:border-primary">{id}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <Link to="/errata" search={{ member: m.slug, stat: axis.key }} className="inline-flex min-h-11 items-center gap-2 text-sm text-primary underline underline-offset-2">
                <FileWarning className="h-4 w-4" /> Report a correction for this stat
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Radar ---------- */
export function RadarChart({ members, size = 280 }: { members: Member[]; size?: number }) {
  const r = size / 2 - 44;
  const c = size / 2;
  // order spokes so opposite poles sit opposite: pos poles then neg poles
  const spokes = [...AXES.map((a) => ({ a, pole: "pos" as const })), ...AXES.map((a) => ({ a, pole: "neg" as const }))];
  const pt = (i: number, v: number) => {
    const ang = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    return [c + Math.cos(ang) * r * (v / 10), c + Math.sin(ang) * r * (v / 10)];
  };
  const strokes = ["var(--primary)", "var(--foreground)"];
  const anyScored = members.some((m) => AXES.some((a) => m.stats[a.key].score !== null));
  if (!anyScored) return <p className="fog-hatch border border-fog p-6 text-center text-sm text-muted-foreground">Radar hidden — no axis is scored yet.</p>;
  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-xs overflow-visible px-6" role="img" aria-label="Radar chart of eight pole values; see table below">
        {[2.5, 5, 7.5, 10].map((v) => (
          <polygon key={v} points={spokes.map((_, i) => pt(i, v).join(",")).join(" ")} fill="none" stroke="var(--border)" strokeDasharray={v === 5 ? "0" : "2 3"} />
        ))}
        {spokes.map(({ a, pole }, i) => {
          const [x, y] = pt(i, 10);
          const [lx, ly] = pt(i, 12.6);
          return (
            <g key={i}>
              <line x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
                {(pole === "pos" ? a.posRadar : a.negRadar).split(" ").map((w, j, arr) => (
                  <tspan key={j} x={lx} dy={j === 0 ? `${-(arr.length - 1) * 0.55}em` : "1.1em"}>{w}</tspan>
                ))}
              </text>
            </g>
          );
        })}
        {members.map((m, mi) => {
          const pts = spokes.map(({ a, pole }, i) => {
            const v = m.stats[a.key].score === null ? 5 : (m.radar[pole === "pos" ? a.posRadarKey : a.negRadarKey] ?? 5);
            return pt(i, v).join(",");
          });
          return (
            <polygon key={m.slug} points={pts.join(" ")} fill={strokes[mi]} fillOpacity={0.12} stroke={strokes[mi]} strokeWidth={2}
              strokeDasharray={mi === 1 ? "5 3" : undefined} />
          );
        })}
      </svg>
      <details className="mt-2 text-xs">
        <summary className="min-h-11 cursor-pointer py-2 text-primary">Show as table</summary>
        <table className="w-full border-collapse font-mono">
          <thead><tr><th className="py-1 text-left">Pole</th>{members.map((m) => <th key={m.slug} className="text-right">{m.lastName}</th>)}</tr></thead>
          <tbody>
            {radarValues(members[0]!).map((rv, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1">{rv.label}</td>
                {members.map((m) => {
                  const v = radarValues(m)[i]!.value;
                  return <td key={m.slug} className="text-right">{v === null ? "unscored" : v}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <figcaption className="mt-1 text-xs text-muted-foreground">Unscored axes sit at the center ring (5). Opposite spokes sum to 10.</figcaption>
    </figure>
  );
}

/* ---------- Search ---------- */
export function CommandSearch({ className }: { className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const ql = q.toLowerCase();
  const results = q ? ROSTER.filter((m) => `${fullName(m)} ${m.politicianName} ${m.province} ${m.municipality} ${m.office}`.toLowerCase().includes(ql)).slice(0, 6) : [];
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === "Enter" && results[0]) { navigate({ to: "/member/$slug", params: { slug: results[0].slug } }); setQ(""); ref.current?.blur(); } if (e.key === "Escape") ref.current?.blur(); }}
        placeholder="Search name or district" aria-label="Search members"
        className="h-10 w-full border border-input bg-background pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 border border-border px-1.5 font-mono text-[0.65rem] text-muted-foreground">/</kbd>
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-popover shadow-xl">
          {results.map((m) => (
            <li key={m.slug}>
              <Link to="/member/$slug" params={{ slug: m.slug }} onClick={() => setQ("")} className="flex min-h-11 items-center gap-3 px-3 py-2 hover:bg-accent">
                <Crest m={m} size="sm" />
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{fullName(m)}</span><span className="block truncate text-xs text-muted-foreground">{place(m)} · {regionShort(m.region)}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Shell ---------- */
const NAV = [
  { to: "/", label: "Roster", plain: "Members", icon: Users },
  { to: "/versus", label: "Versus", plain: "Compare", icon: Swords },
  { to: "/realm", label: "Realm Map", plain: "By place", icon: Map },
  { to: "/rulebook", label: "Rulebook", plain: "Method", icon: ScrollText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { plain, toggle } = usePlainMode();
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-6">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a href={BETTERGOV_URL} target="_blank" rel="noreferrer" aria-label="BetterGov.ph" className="flex items-center">
              <img src="/logos/BetterGov_Icon-Primary.svg" alt="" className="h-7 w-7" />
              <span className="ml-1.5 hidden text-sm font-bold tracking-tight lg:inline">BetterGov<span className="text-primary">.ph</span></span>
            </a>
            <span className="h-6 w-px bg-border" aria-hidden />
            <Link to="/" className="flex items-center gap-1.5">
              <RadarIcon className="h-5 w-5 text-primary" />
              <span className="font-mono text-sm font-bold uppercase leading-tight tracking-widest">Politiko</span>
            </Link>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground data-[status=active]:text-primary data-[status=active]:shadow-[inset_0_-2px_0_var(--primary)]">
                {plain ? n.plain : n.label}
              </Link>
            ))}
          </nav>
          <CommandSearch className="ml-auto w-full max-w-xs" />
          <button onClick={toggle} aria-pressed={plain} title="Plain mode swaps game labels for plain labels"
            className="hidden min-h-10 shrink-0 items-center gap-1.5 border border-border px-2.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground hover:text-foreground sm:flex">
            {plain ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} Plain
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-7xl border-t border-border px-4 py-6 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href={BETTERGOV_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
            <img src="/logos/BetterGov_Icon-Primary.svg" alt="" className="h-5 w-5" /> A BetterGov.ph civic project
          </a>
          <span>Data: House of Representatives, BetterGov Open Congress. Design: Kapwa.</span>
          <a href="https://open-congress-api.bettergov.ph" target="_blank" rel="noreferrer" className="hover:text-foreground">Open Congress API</a>
          <a href="https://github.com/bettergovph/kapwa" target="_blank" rel="noreferrer" className="hover:text-foreground">Kapwa</a>
          <Link to="/errata" className="hover:text-foreground">Errata</Link>
          <Link to="/about" className="hover:text-foreground">About &amp; data</Link>
          <button onClick={toggle} className="hover:text-foreground sm:hidden">Plain mode: {plain ? "on" : "off"}</button>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur md:hidden" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
            className="flex min-h-14 flex-col items-center justify-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground data-[status=active]:text-primary">
            <n.icon className="h-5 w-5" />
            {plain ? n.plain : n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* ---------- Mini sheet card ---------- */
export function MiniSheet({ m, delay = 0 }: { m: RosterMember; delay?: number }) {
  return (
    <Link to="/member/$slug" params={{ slug: m.slug }} className="hud-panel hud-interactive rise-in block min-w-0 p-4 hover:border-primary/60" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3">
        <Crest m={m} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{fullName(m)}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{(m.role ?? m.office).replace(/^(District|Party-list) Representative · /, "")}</p>
        </div>
      </div>
      {m.status !== "active" && <p className="mt-2 inline-block border border-border px-1.5 font-mono text-[0.6rem] uppercase text-muted-foreground">{m.status.replace("_", " ")}</p>}
      <div className="mt-3 space-y-1.5">
        {AXES.map((a) => (
          <div key={a.key} className="flex items-center gap-2">
            <span className="w-7 font-mono text-[0.6rem] uppercase text-muted-foreground">{a.name.slice(0, 3)}</span>
            <div className="min-w-0 flex-1"><MeterBar axis={a} score={m.scores[a.key].score} confidence={m.scores[a.key].confidence} compact /></div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[0.65rem] uppercase text-muted-foreground">{m.authoredCount} bills authored</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {m.tags.slice(0, 3).map((t) => <span key={t} className="bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">{t}</span>)}
      </div>
    </Link>
  );
}
