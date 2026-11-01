import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Panel } from "@/components/hud";
import { AXES, ROSTER, fullName } from "@/data/members";
import {
  loadPublishedErrata,
  addLocalReport,
  clearLocalReports,
  downloadText,
  memberLabel,
  readLocalReports,
  reportsToText,
  statLabel,
  type ErrataEntry,
} from "@/data/errata";

type S = { member?: string | undefined; stat?: string | undefined };

export const Route = createFileRoute("/errata")({
  validateSearch: (s: Record<string, unknown>): S => ({
    member: typeof s["member"] === "string" ? s["member"] : undefined,
    stat: typeof s["stat"] === "string" ? s["stat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Errata — Corrections and right of reply" },
      { name: "description", content: "Public log of corrections to character sheets, and a form for members' offices and the public to report errors." },
      { property: "og:title", content: "Errata — Politiko Character Sheet" },
      { property: "og:description", content: "Corrections log and right of reply." },
    ],
  }),
  component: Errata,
});

const field = "w-full border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none";
const today = () => new Date().toISOString().slice(0, 10);

function Errata() {
  const search = Route.useSearch();
  const [member, setMember] = useState(search.member ?? "");
  const [stat, setStat] = useState(search.stat ?? "");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState<ErrataEntry[]>([]);
  const [published, setPublished] = useState<ErrataEntry[] | null>(null);

  useEffect(() => {
    setSaved(readLocalReports());
    loadPublishedErrata().then(setPublished);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || text.trim().length < 10) { setErr("Choose a member and describe the issue (at least 10 characters)."); return; }
    setErr("");
    const entry: ErrataEntry = {
      date: today(),
      member,
      stat: (stat || "whole") as ErrataEntry["stat"],
      issue: text.trim(),
      outcome: "Not reviewed yet.",
    };
    setSaved(addLocalReport(entry));
    setText("");
    toast.success("Saved on this device", {
      description: "Use “Download log (.txt)” below to send it to the team.",
    });
  };

  const download = () => {
    if (!saved.length) return;
    downloadText(`politiko-errata-${today()}.txt`, reportsToText(saved));
    toast.success("Log downloaded", { description: "Send the file to the team, or keep it for your records." });
  };

  const wipe = () => {
    clearLocalReports();
    setSaved([]);
    toast.success("Cleared reports from this device");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <header className="rise-in lg:col-span-12">
        <p className="hud-label text-primary">Errata</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Corrections and right of reply</h1>
        <p className="mt-2 text-muted-foreground">Every fix is dated and public. Target response: 5 working days.</p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          This site is a plain page with no inbox of its own. A report you send is kept on the device you are
          using, and you can download it as a text file to hand to the team. Fixes the team has published are
          listed in the log below.
        </p>
      </header>

      <Panel title="Report a correction" className="lg:col-span-5">
        <form onSubmit={submit} className="space-y-3" noValidate>
          <label className="block text-sm">Member
            <select value={member} onChange={(e) => setMember(e.target.value)} className={field + " mt-1 h-11"}>
              <option value="">Choose…</option>{ROSTER.map((m) => <option key={m.slug} value={m.slug}>{fullName(m)}</option>)}
            </select>
          </label>
          <label className="block text-sm">Stat (optional)
            <select value={stat} onChange={(e) => setStat(e.target.value)} className={field + " mt-1 h-11"}>
              <option value="">Whole sheet</option>{AXES.map((a) => <option key={a.key} value={a.key}>{a.name}</option>)}
            </select>
          </label>
          <label className="block text-sm">What is wrong?
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={2000} className={field + " mt-1 py-2"} />
          </label>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <button className="min-h-11 w-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Submit</button>
          <p className="text-xs text-muted-foreground">Saved on this device only. Download it below to send it in. Members' offices may include a statement to be published alongside the outcome.</p>
        </form>
      </Panel>

      <Panel
        title="Public log"
        sub="Fixes the team has published, from a plain text file in the site"
        className="lg:col-span-7"
      >
        {published === null ? (
          <p className="text-sm text-muted-foreground">Loading the corrections log…</p>
        ) : published.length === 0 ? (
          <p className="fog-hatch border border-fog p-6 text-center text-sm text-muted-foreground">No corrections logged yet for this assessment (1 Nov 2026).</p>
        ) : (
          <ol className="space-y-3">
            {published.map((e, i) => (
              <li key={`${e.date}-${i}`} className="border border-border bg-panel-strong/40 p-3">
                <p className="hud-label text-muted-foreground">{e.date} · {memberLabel(e.member)} · {statLabel(e.stat)}</p>
                <p className="mt-1 text-sm">Was wrong: {e.issue}</p>
                {e.outcome && <p className="mt-1 text-sm text-muted-foreground">Fixed: {e.outcome}</p>}
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <Panel
        title="Your reports on this device"
        sub={saved.length ? `${saved.length} saved here · nothing leaves this device until you download it` : "Nothing saved here yet"}
        className="lg:col-span-12"
      >
        {saved.length === 0 ? (
          <p className="text-sm text-muted-foreground">Reports you send with the form above appear here. They stay in this browser, so use “Download log (.txt)” to pass them on.</p>
        ) : (
          <ul className="space-y-2">
            {saved.map((e, i) => (
              <li key={`${e.date}-${i}`} className="border border-border bg-panel-strong/40 p-3">
                <p className="hud-label text-muted-foreground">{e.date} · {memberLabel(e.member)} · {statLabel(e.stat)}</p>
                <p className="mt-1 text-sm">{e.issue}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            onClick={download}
            disabled={!saved.length}
            className="inline-flex min-h-11 items-center gap-2 border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            <Download className="h-4 w-4" />Download log (.txt)
          </button>
          <button
            onClick={wipe}
            disabled={!saved.length}
            className="inline-flex min-h-11 items-center gap-2 border border-border px-3 text-sm text-muted-foreground hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />Clear
          </button>
        </div>
      </Panel>
    </div>
  );
}
