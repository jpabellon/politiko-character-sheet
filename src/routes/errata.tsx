import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/hud";
import { AXES, ERRATA, MEMBERS, fullName, getMember } from "@/data/members";

type S = { member?: string; stat?: string };

export const Route = createFileRoute("/errata")({
  validateSearch: (s: Record<string, unknown>): S => ({
    member: typeof s.member === "string" ? s.member : undefined,
    stat: typeof s.stat === "string" ? s.stat : undefined,
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

function Errata() {
  const search = Route.useSearch();
  const [member, setMember] = useState(search.member ?? "");
  const [stat, setStat] = useState(search.stat ?? "");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || text.trim().length < 10) { setErr("Choose a member and describe the issue (at least 10 characters)."); return; }
    setErr("");
    setText("");
    toast.success("Correction received. It will appear in the log once reviewed.");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <header className="rise-in lg:col-span-12">
        <p className="hud-label text-primary">Errata</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Corrections and right of reply</h1>
        <p className="mt-2 text-muted-foreground">Every fix is dated and public. Target response: 5 working days.</p>
      </header>
      <Panel title="Report a correction" className="lg:col-span-5">
        <form onSubmit={submit} className="space-y-3" noValidate>
          <label className="block text-sm">Member
            <select value={member} onChange={(e) => setMember(e.target.value)} className={field + " mt-1 h-11"}>
              <option value="">Choose…</option>{MEMBERS.map((m) => <option key={m.slug} value={m.slug}>{fullName(m)}</option>)}
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
          <p className="text-xs text-muted-foreground">Members' offices may include a statement to be published alongside the outcome.</p>
        </form>
      </Panel>
      <Panel title="Public log" className="lg:col-span-7">
        <ol className="space-y-3">
          {ERRATA.map((e) => {
            const m = getMember(e.member);
            return (
              <li key={e.id} className="border border-border p-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="text-primary">{e.id}</span><span className="text-muted-foreground">{e.date}</span>
                  <span className="border border-border px-1.5 uppercase">{e.status}</span>
                  {m && <span className="text-muted-foreground">{fullName(m)}</span>}
                </div>
                <p className="mt-2 text-sm">{e.text}</p>
                {"reason" in e && e.reason && <p className="mt-1 text-sm text-muted-foreground">Reason: {e.reason}</p>}
                {e.reply && <p className="mt-2 border-l-2 border-primary pl-2 text-sm italic text-muted-foreground">{e.reply}</p>}
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}
