import { createFileRoute } from "@tanstack/react-router";
import { ConfidenceBadge, MeterBar, Panel } from "@/components/hud";
import { AXES, SCOUTING, type Confidence } from "@/data/members";

export const Route = createFileRoute("/rulebook")({
  head: () => ({
    meta: [
      { title: "Rulebook — How the Character Sheet scores" },
      { name: "description", content: "The four axes, scoring rules, scouting levels, evidence window and limits behind every character sheet." },
      { property: "og:title", content: "Rulebook — Politiko Character Sheet" },
      { property: "og:description", content: "How every stat is scored, and what it cannot tell you." },
    ],
  }),
  component: Rulebook,
});

const examples: Record<Confidence, number | null> = { high: 3, medium: -2, low: 1, insufficient: null };

function Rulebook() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary">Rulebook</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">How the sheet is scored</h1>
        <p className="mt-2 text-muted-foreground">Every stat comes from bills the member filed between 1 Nov 2021 and 1 Nov 2026. Nothing else.</p>
      </header>

      <Panel title="The four axes" sub="Each runs from −5 to +5. These are positions, not power levels.">
        <div className="space-y-5">
          {AXES.map((a) => (
            <div key={a.key}>
              <p className="flex items-center gap-2 font-semibold"><span className="h-3 w-3" style={{ background: a.colorVar }} />{a.name} <span className="text-sm font-normal text-muted-foreground">— {a.plain}</span></p>
              <div className="mt-1 flex justify-between font-mono text-[0.65rem] uppercase text-muted-foreground"><span>−5 {a.negPole}</span><span>{a.posPole} +5</span></div>
              <p className="mt-1 text-sm text-muted-foreground">Evidence: {a.evidence}.</p>
            </div>
          ))}
          <p className="border-l-4 border-primary pl-3 text-sm">On the economic axis, negative means redistributive. Most of the House scores below zero there because many bills fund subsidies, wages and social protection. Color shows which axis, never left or right.</p>
        </div>
      </Panel>

      <Panel title="Scouting levels" sub="How much evidence backs a stat">
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(SCOUTING) as Confidence[]).map((c) => (
            <div key={c} className="border border-border p-3">
              <ConfidenceBadge c={c} />
              <p className="mt-2 text-sm font-medium">{SCOUTING[c].plain}</p>
              <p className="text-xs text-muted-foreground">{SCOUTING[c].desc}</p>
              <div className="mt-3"><MeterBar axis={AXES[0]} score={examples[c]} confidence={c} /></div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Scoring rules">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>A stat is scored only when bills cover at least two distinct issues. Otherwise it shows as fog — never as zero.</li>
          <li>Bills a member authored count fully. Co-authored bills count for less.</li>
          <li>Bills alone can move a score at most three points from center.</li>
          <li>Every score has a rationale, an issue count and the bill numbers behind it.</li>
          <li>Party, family, religion, region and social media are never used to infer a stat.</li>
        </ul>
      </Panel>

      <Panel title="Limits" sub="What the sheet cannot tell you">
        <p className="text-sm">Stats come from bills only — not votes, speeches, attendance or conduct. Many profiles were built from bill titles; treat those as provisional until the full text is read. There is no ranking, no overall score and no "best" member.</p>
      </Panel>

      <Panel title="Glossary">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Character sheet", "A member's profile page"], ["Quest log", "Bills the member authored"],
            ["Ally moves", "Bills the member co-authored"], ["Skills", "Topic tags, not positions"],
            ["Fog / unscouted", "Not enough evidence to score"], ["Versus", "Side-by-side comparison"],
            ["Realm", "District, province and region"], ["Errata", "Public corrections log"],
          ].map(([g, p]) => <div key={g}><dt className="font-mono text-xs uppercase text-primary">{g}</dt><dd>{p}</dd></div>)}
        </dl>
      </Panel>
    </div>
  );
}
