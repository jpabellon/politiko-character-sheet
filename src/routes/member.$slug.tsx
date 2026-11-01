import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Copy, ExternalLink, FileWarning, MapPin, Share2, Swords } from "lucide-react";
import { toast } from "sonner";
import { Crest, Panel, RadarChart, StatBlock, T } from "@/components/hud";
import { AXES, MEMBERS, STATUS_TEXT, billUrl, fmtDate, fullName, getMember, type Bill } from "@/data/members";

export const Route = createFileRoute("/member/$slug")({
  loader: ({ params }) => {
    const m = getMember(params.slug);
    if (!m) throw notFound();
    return { slug: m.slug };
  },
  head: ({ loaderData }) => {
    const m = loaderData ? getMember(loaderData.slug) : undefined;
    if (!m) return { meta: [{ title: "Member not found — Politiko" }, { name: "robots", content: "noindex" }] };
    const t = `${fullName(m)} — Character Sheet`;
    return {
      meta: [
        { title: t },
        { name: "description", content: m.summary },
        { property: "og:title", content: t },
        { property: "og:description", content: m.summary },
      ],
    };
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
  const { slug } = Route.useLoaderData();
  const m = getMember(slug)!;
  const authored = [...m.bills.filter((b) => b.role === "authored")].sort((a, b) => b.date.localeCompare(a.date));
  const coauthored = m.bills.filter((b) => b.role === "coauthored");
  const other = MEMBERS.find((x) => x.slug !== m.slug)!;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: fullName(m), url }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };
  const cite = async () => {
    await navigator.clipboard.writeText(`Politiko Character Sheet. "${fullName(m)}." Assessed ${m.assessmentDate}; evidence window ${m.windowStart} to ${m.windowEnd}. ${window.location.href}`);
    toast.success("Citation copied");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {m.status !== "active" && (
        <div role="status" className="rise-in flex items-start gap-2 border border-border bg-panel-strong px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span><strong>{STATUS_TEXT[m.status]}</strong>{m.statusDate && <> on {fmtDate(m.statusDate)}</>}. Stats remain as assessed on {fmtDate(m.assessmentDate)}.</span>
        </div>
      )}

      {/* Row 1-2 */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel className="lg:col-span-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Crest m={m} size="lg" />
            <div className="min-w-0">
              <p className="hud-label text-primary">{m.profileLabel}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">{fullName(m)}</h1>
              <p className="mt-1 text-muted-foreground">{m.office}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{m.municipality}, {m.province} · {m.region}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/versus/$pair" params={{ pair: `${m.slug}~${other.slug}` }} className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Swords className="h-4 w-4" /> <T game="Versus" plain="Compare" />
            </Link>
            <button onClick={share} className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary"><Share2 className="h-4 w-4" />Share</button>
            <Link to="/errata" search={{ member: m.slug }} className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm hover:border-primary"><FileWarning className="h-4 w-4" />Report a correction</Link>
          </div>
        </Panel>
        <Panel className="lg:col-span-4" delay={75}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm lg:grid-cols-1">
            <div><dt className="hud-label">Party (fact)</dt><dd>{m.party} <span className="text-xs text-muted-foreground">as of {fmtDate(m.partyAsOf)}</span></dd></div>
            <div><dt className="hud-label">Status</dt><dd>{STATUS_TEXT[m.status]}</dd></div>
            <div><dt className="hud-label">As of</dt><dd className="font-mono">{m.assessmentDate}</dd></div>
            <div><dt className="hud-label">Evidence window</dt><dd className="font-mono text-xs">{m.windowStart} → {m.windowEnd}</dd></div>
          </dl>
        </Panel>
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel title="Stat block" sub="Tap a stat to see the bills behind it" className="lg:col-span-7" delay={150}><StatBlock m={m} /></Panel>
        <Panel title="Radar" sub="Eight poles, opposite pairs on opposite spokes" className="lg:col-span-5" delay={225}><RadarChart members={[m]} /></Panel>
      </div>

      {/* Row 4 */}
      <Panel delay={300}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="hud-label mb-1">Summary</p><p>{m.summary}</p></div>
          <div className="border-l-4 border-primary bg-background/60 p-3">
            <p className="hud-label mb-1 text-foreground">Known unknowns</p>
            <p className="text-sm">{m.caveat}</p>
            <p className="mt-1 text-xs text-muted-foreground">Based on bills only — not votes, speeches or conduct.</p>
          </div>
        </div>
      </Panel>

      {/* Row 5 */}
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Panel title="Quest log" sub="Bills authored · newest first" className="lg:col-span-8" delay={375}>
          {authored.length ? <QuestList bills={authored} /> : (
            <p className="fog-hatch border border-fog p-4 text-sm text-muted-foreground">No bills found in this evidence window ({m.windowStart} to {m.windowEnd}).</p>
          )}
          {coauthored.length > 0 && (
            <div className="mt-6 opacity-80">
              <p className="hud-label mb-2"><T game="Ally moves" plain="Co-authored bills" /> · co-authored, weighted lower</p>
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
          <Panel title="Realm" delay={525}>
            <p className="text-sm">{m.municipality}<br /><span className="text-muted-foreground">{m.province} · {m.region}</span></p>
            <Link to="/realm" search={{ region: m.region }} className="mt-2 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-2">See members in {m.region}</Link>
          </Panel>
          <Panel title="Sources" delay={600}>
            <ul className="space-y-1 text-sm">
              <li className="text-muted-foreground">Open Congress profile <span className="font-mono text-[0.65rem] uppercase">(unverified link)</span></li>
              <li><a href="https://congress.gov.ph" target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-primary">House bill pages <ExternalLink className="h-3 w-3" /></a></li>
            </ul>
            <button onClick={cite} className="mt-2 inline-flex min-h-11 items-center gap-2 border border-border px-3 text-sm hover:border-primary"><Copy className="h-4 w-4" />Copy citation</button>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function QuestList({ bills, quiet }: { bills: Bill[]; quiet?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? bills : bills.slice(0, 8);
  return (
    <>
      <ul className="divide-y divide-border border-y border-border">
        {shown.map((b) => {
          const ax = AXES.find((a) => a.key === b.informs);
          return (
            <li key={b.id}>
              <a href={billUrl(b.id)} target="_blank" rel="noreferrer" className="flex min-h-14 flex-col gap-1 py-3 hover:bg-panel-strong/50 sm:flex-row sm:items-center sm:gap-4 sm:px-2">
                <span className={`font-mono text-xs ${quiet ? "text-muted-foreground" : "text-primary"} sm:w-20`}>{b.id}</span>
                <span className="flex-1 text-sm">{b.title}</span>
                <span className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-muted px-1.5 py-0.5 text-muted-foreground">{b.topic}</span>
                  {ax && <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="h-2 w-2" style={{ background: ax.colorVar }} />{ax.name}</span>}
                  <span className="font-mono text-muted-foreground">{b.date.slice(0, 7)}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      {bills.length > 8 && <button onClick={() => setShowAll(!showAll)} className="mt-2 min-h-11 text-sm text-primary">{showAll ? "Show fewer" : `Show all ${bills.length}`}</button>}
    </>
  );
}
