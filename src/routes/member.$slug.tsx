import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Facebook, Instagram, AlertTriangle, Copy, ExternalLink, FileWarning, MapPin, Phone, Swords } from "lucide-react";
import { toast } from "sonner";
import SOCIALS from "@/data/socials.json";
import FAMILY from "@/data/family.json";
import { Crest, Panel, RadarChart, StatBlock, T } from "@/components/hud";
import { AXES, ROSTER, STATUS_TEXT, billUrl, jurisAuthorUrl, fmtDate, fullName, place, loadMember, regionShort, type Bill } from "@/data/members";

export const Route = createFileRoute("/member/$slug")({
  loader: async ({ params }) => {
    const m = await loadMember(params.slug);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData: m }) => {
    if (!m) return { meta: [{ title: "Member not found — Politiko" }, { name: "robots", content: "noindex" }] };
    const t = `${fullName(m)} — Character Sheet`;
    const meta = [
      { title: t },
      { name: "description", content: m.summary.slice(0, 160) },
      { property: "og:title", content: t },
      { property: "og:description", content: m.summary.slice(0, 200) },
    ];
    if (m.photo) meta.push({ property: "og:image", content: m.photo }, { name: "twitter:image", content: m.photo });
    return { meta };
  },
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <p className="hud-label">404</p>
      <h1 className="mt-2 text-2xl font-bold">No sheet for this member</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">Back to roster</Link>
    </div>
  ),
  component: Sheet,
});

function Sheet() {
  const m = Route.useLoaderData();
  const authored = useMemo(() => m.bills.filter((b) => b.role === "authored").sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")), [m]);
  const coauthored = useMemo(() => m.bills.filter((b) => b.role === "coauthored").sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")), [m]);
  const enacted = authored.filter((b) => b.ra).length;
  const other = ROSTER.find((x) => x.slug !== m.slug)!;

  const cite = async () => {
    await navigator.clipboard.writeText(`Politiko Character Sheet. "${fullName(m)}." Assessed ${m.assessmentDate}; evidence window ${m.windowStart} to ${m.windowEnd}. ${window.location.href}`);
    toast.success("Citation copied");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {m.status !== "active" && (
        <div role="status" className="rise-in flex items-start gap-2 border border-border bg-panel-strong px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span><strong>{STATUS_TEXT[m.status]}</strong>{m.statusDate && <> on {fmtDate(m.statusDate)}</>}. {m.office}. Stats remain as assessed on {fmtDate(m.assessmentDate)}.</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel className="lg:col-span-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Crest m={m} size="lg" />
            <div className="min-w-0">
              <p className="hud-label text-primary">{m.role?.split(" · ")[0] ?? "Representative"}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">{fullName(m)}</h1>
              <p className="mt-1 text-muted-foreground">{m.office}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{place(m)} · {regionShort(m.region)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground"><span className="hud-label mr-2">Profile</span>{m.profileLabel}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/versus/$pair" params={{ pair: `${m.slug}~${other.slug}` }} className="inline-flex min-h-11 items-center gap-2 bg-brand px-4 text-sm font-semibold text-foreground hover:opacity-90">
              <Swords className="h-4 w-4" /> <T game="Versus" plain="Compare" />
            </Link>
            {(() => { const so = (SOCIALS as Record<string, { fb?: string; ig?: string }>)[m.politicianName]; return so ? (<>
              {so.fb && <a href={so.fb} target="_blank" rel="noreferrer" aria-label="Facebook page" className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary"><Facebook className="h-4 w-4" /> Facebook</a>}
              {so.ig && <a href={so.ig} target="_blank" rel="noreferrer" aria-label="Instagram account" className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary"><Instagram className="h-4 w-4" /> Instagram</a>}
            </>) : null; })()}
            {jurisAuthorUrl(m.houseCode) && <a href={jurisAuthorUrl(m.houseCode)!} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary">All bills on BatasWatch ↗</a>}
            <Link to="/errata" search={{ member: m.slug }} className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary"><FileWarning className="h-4 w-4" />Report a correction</Link>
          </div>
        </Panel>
        <Panel className="lg:col-span-4" delay={75}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="hud-label">Bills authored</dt><dd className="font-mono text-2xl font-bold">{m.authoredCount}</dd></div>
            <div><dt className="hud-label">Co-authored</dt><dd className="font-mono text-2xl font-bold">{m.coauthoredCount}</dd></div>
            <div><dt className="hud-label">Became law</dt><dd className="font-mono text-2xl font-bold">{enacted}</dd></div>
            <div><dt className="hud-label">Committees</dt><dd className="font-mono text-2xl font-bold">{m.committees.length}</dd></div>
            <div><dt className="hud-label">Party (fact)</dt><dd>{m.party ?? <span className="text-muted-foreground">Not recorded</span>}{m.party && m.partyAsOf && <span className="block font-mono text-xs text-muted-foreground">as of {m.partyAsOf}</span>}</dd></div>
            <div><dt className="hud-label">Status</dt><dd>{STATUS_TEXT[m.status]}</dd></div>
            <div><dt className="hud-label">As of</dt><dd className="font-mono">{m.assessmentDate}</dd></div>
            <div><dt className="hud-label">Evidence window</dt><dd className="font-mono text-xs">{m.windowStart} → {m.windowEnd}</dd></div>
          </dl>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel title="Stat block" sub="Tap a stat to see the evidence behind it" className="lg:col-span-7" delay={150}>
          <StatBlock m={m} />
          <Link to="/rulebook" className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline">What do these scores mean? Read the Rulebook →</Link>
        </Panel>
        <Panel title="Radar" sub="The four scores drawn as a shape" className="lg:col-span-5" delay={225}>
          <RadarChart members={[m]} />
          <Link to="/rulebook" className="mt-4 inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline">How to read this chart →</Link>
        </Panel>
      </div>

      <Panel delay={300}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="hud-label mb-1">Summary</p><p>{m.summary}</p></div>
          <div className="border-l-4 border-primary bg-background/60 p-3">
            <p className="hud-label mb-1 text-foreground">Known unknowns</p>
            <p className="text-sm">{m.caveat}</p>
          </div>
        </div>
      </Panel>

      {(() => { const fam = (FAMILY as Record<string, { name: string; rel: string; bio: string }[]>)[m.politicianName]; return fam?.length ? (
        <Panel title="Family" sub="Known relatives and their public roles" delay={340}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fam.map((f) => (
              <li key={f.name} className="min-w-0 border border-border bg-background/60 p-3">
                <p className="font-semibold">{f.name}</p>
                <p className="hud-label mb-1 text-primary">{f.rel}</p>
                <p className="text-sm text-muted-foreground">{f.bio}</p>
              </li>
            ))}
          </ul>
        </Panel>) : null; })()}

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel title="Quest log" sub={`${authored.length} bills as principal author · newest first · links open BatasWatch (bills.juris.ph)`} className="lg:col-span-8" delay={375}>
          {authored.length ? <QuestList bills={authored} /> : (
            <p className="fog-hatch border border-fog p-4 text-sm text-muted-foreground">No principal-authored bills found on the member's House page.</p>
          )}
          {coauthored.length > 0 && (
            <div className="mt-8 opacity-85">
              <p className="hud-label mb-2"><T game="Ally moves" plain="Co-authored bills" /> · {coauthored.length} co-authored, weighted lower</p>
              <QuestList bills={coauthored} quiet />
            </div>
          )}
        </Panel>
        <div className="space-y-4 lg:col-span-4 lg:space-y-5">
          <Panel title="Skills" sub="Topics, not positions" delay={450}>
            <div className="flex flex-wrap gap-2">
              {m.tags.map((t) => (
                <Link key={t} to="/" search={{ tag: t }} className="inline-flex min-h-9 items-center border border-border px-2.5 text-sm hover:border-primary hover:text-primary">{t}</Link>
              ))}
            </div>
          </Panel>
          {m.committees.length > 0 && (
            <Panel title="Committees" delay={500}>
              <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1 text-sm">
                {m.committees.map((c) => (
                  <li key={c.name} className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
                    <span>{c.name}</span><span className="shrink-0 text-right text-xs text-muted-foreground">{c.position}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          <Panel title="Realm" delay={525}>
            <p className="text-sm">{place(m)}<br /><span className="text-muted-foreground">{m.region}</span></p>
            {m.contact?.room && (
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground"><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{m.contact.room}{m.contact.phones.length > 0 && <><br />{m.contact.phones.join(" · ")}</>}</span></p>
            )}
            <Link to="/realm" search={{ region: m.region }} className="mt-2 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-2">See members in {regionShort(m.region)}</Link>
          </Panel>
          <Panel title="Sources" delay={600}>
            <ul className="space-y-1 text-sm">
              {m.houseUrl && <li><a href={m.houseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-primary">House member page <ExternalLink className="h-3 w-3" /></a></li>}
              <li><a href={m.openCongressUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-primary">Open Congress profile <ExternalLink className="h-3 w-3" /></a>
                <span className="ml-1 font-mono text-[0.6rem] uppercase text-muted-foreground">(service may be offline)</span></li>
            </ul>
            <button onClick={cite} className="mt-2 inline-flex min-h-11 items-center gap-2 border border-border px-3 text-sm hover:border-primary"><Copy className="h-4 w-4" />Copy citation</button>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function QuestList({ bills, quiet }: { bills: Bill[]; quiet?: boolean }) {
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");
  const filtered = q ? bills.filter((b) => `${b.id} ${b.title} ${b.referral ?? ""}`.toLowerCase().includes(q.toLowerCase())) : bills;
  const shown = filtered.slice(0, limit);
  return (
    <>
      {bills.length > 10 && (
        <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(10); }} placeholder="Filter bills by number, title or committee" aria-label="Filter bills"
          className="mb-3 h-11 w-full border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none" />
      )}
      <ul className="divide-y divide-border border-y border-border">
        {shown.map((b) => {
          const ax = AXES.find((a) => a.key === b.informs);
          return (
            <li key={b.id}>
              <a href={billUrl(b.id)} target="_blank" rel="noreferrer" className="flex min-h-14 flex-col gap-1.5 py-3 hover:bg-panel-strong/50 sm:px-2">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`font-mono text-xs ${quiet ? "text-muted-foreground" : "text-primary"}`}>{b.id}</span>
                  {b.date && <span className="font-mono text-xs text-muted-foreground">{b.date}</span>}
                  {b.ra && <span className="border border-primary px-1.5 font-mono text-[0.65rem] uppercase text-primary">{b.ra}</span>}
                  {ax && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2" style={{ background: ax.colorVar }} />Informs {ax.name}</span>}
                </span>
                <span className="line-clamp-3 text-sm">{b.title}</span>
                <span className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {b.referral && <span className="bg-muted px-1.5 py-0.5 capitalize">{b.referral.toLowerCase()}</span>}
                  {b.status && <span className="line-clamp-1">{b.status}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && <p className="py-3 text-sm text-muted-foreground">No bills match.</p>}
      {filtered.length > limit && (
        <button onClick={() => setLimit(limit + 25)} className="mt-2 min-h-11 text-sm text-primary">Show more ({filtered.length - limit} remaining)</button>
      )}
    </>
  );
}
