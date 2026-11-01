import { createFileRoute } from "@tanstack/react-router";
import { ConfidenceBadge, MeterBar, Panel } from "@/components/hud";
import { AXES, SCOUTING, type Confidence } from "@/data/members";

export const Route = createFileRoute("/rulebook")({
  head: () => ({
    meta: [
      { title: "Rulebook — How the Character Sheet scores" },
      { name: "description", content: "A simple guide to the four scores, how sure we are, and how each score is picked." },
      { property: "og:title", content: "Rulebook — Politiko Character Sheet" },
      { property: "og:description", content: "A simple guide to how every score is picked." },
    ],
  }),
  component: Rulebook,
});

const examples: Record<Confidence, number | null> = { high: 3, medium: -2, low: 1, insufficient: null };

const BANDS: [string, string][] = [
  ["0", "Balanced. The member takes both sides, or stays in the middle."],
  ["±1", "Leans a little to one side."],
  ["±2", "Clearly leans to one side, with some exceptions."],
  ["±3", "Leans to one side again and again."],
  ["±4", "Strongly on one side, across many topics."],
  ["±5", "Always on one side, in both words and actions, across many topics."],
];

function Rulebook() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary">Rulebook</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">How the scores work</h1>
        <p className="mt-2 text-muted-foreground">Every member gets four scores. Each score shows where they stand on one big question. We use public records, mostly the bills they wrote, from Nov 1, 2021 to Nov 1, 2026.</p>
      </header>

      <Panel title="How to read a score" sub="Every score goes from −5 to +5">
        <div className="space-y-3 text-sm">
          <p>Think of each score like a tug-of-war rope. One side is −5. The other side is +5. The middle, 0, means balanced.</p>
          <p className="border-l-4 border-primary pl-3"><b>A score is not good or bad.</b> −5 is not worse than +5. It only shows which side a member leans toward. It is not a power level and not a ranking.</p>
          <dl className="grid gap-2 sm:grid-cols-2">
            {BANDS.map(([k, v]) => <div key={k} className="flex gap-3 border border-border p-2"><dt className="w-8 shrink-0 font-mono font-bold text-primary">{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </Panel>

      <Panel title="The four stats" sub="Four big questions about how to run the country">
        <div className="space-y-6">
          {AXES.map((a) => (
            <div key={a.key} className="border-l-4 pl-4" style={{ borderColor: a.colorVar }}>
              <p className="text-lg font-semibold">{a.name}</p>
              <p className="text-sm text-muted-foreground">{a.plain}</p>
              <p className="mt-2 text-sm">{a.explain}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="border border-border p-3 text-sm"><p className="font-mono text-xs uppercase text-muted-foreground">Toward −5 · {a.negPole}</p><p className="mt-1">{a.negMeans}</p></div>
                <div className="border border-border p-3 text-sm"><p className="font-mono text-xs uppercase text-muted-foreground">Toward +5 · {a.posPole}</p><p className="mt-1">{a.posMeans}</p></div>
              </div>
              <p className="mt-3 text-sm font-medium">What we look at:</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{a.looksAt.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="mt-2 text-sm"><span className="font-medium">Be careful:</span> {a.careful}</p>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Colors only tell the four stats apart. They do not mean left, right, good or bad.</p>
        </div>
      </Panel>

      <Panel title="Scouting levels" sub="How sure are we about a score?">
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(SCOUTING) as Confidence[]).map((c) => (
            <div key={c} className="border border-border p-3">
              <ConfidenceBadge c={c} />
              <p className="mt-2 text-sm font-medium">{SCOUTING[c].plain}</p>
              <p className="text-sm text-muted-foreground">{SCOUTING[c].desc}</p>
              <div className="mt-3"><MeterBar axis={AXES[0]!} score={examples[c]} confidence={c} /></div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="How we pick a score" sub="The rules we follow, step by step">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>We split each stat into smaller topics. For example, "taxes" or "worker pay."</li>
          <li>We give each topic its own score from −5 to +5.</li>
          <li>We average the topic scores and round to a whole number.</li>
          <li>If a member says the same thing many times, it still counts as one topic.</li>
          <li>If a member changed their mind, we use their newest view, and we note the change.</li>
          <li>What a member <i>does</i> (like filing a bill) counts more than what they only <i>say</i>.</li>
          <li>We need proof on at least two topics to give a score. If not, the score stays blank (shown as fog). Blank is not the same as 0.</li>
          <li>We give ±4 or ±5 only when there is proof on at least three topics, including real actions.</li>
          <li>We never use party, family, religion, hometown or social media to guess a score.</li>
        </ol>
      </Panel>

      <Panel title="The radar chart" sub="The spider-web shape on each profile">
        <div className="space-y-2 text-sm">
          <p>The radar has eight points, but it shows only the same four scores. Each score is drawn twice, once on each side, so opposite points always add up to 10.</p>
          <p>The size or shape of the web does <b>not</b> mean a member is better, stronger or more extreme overall. It is just a picture of the four scores.</p>
        </div>
      </Panel>

      <Panel title="Topics vs. beliefs">
        <p className="text-sm">The "Skills" tags (like Education or Health) show what a member works on most. They do not show which side the member is on. A member's party is also listed apart from their scores. If we could not confirm it, we write "Unknown."</p>
      </Panel>

      <Panel title="Limits" sub="What these scores cannot tell you">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>We mostly looked at bills. We did not check how members voted.</li>
          <li>Many scores come from bill titles only. They may change once the full bills are read.</li>
          <li>There is no overall score and no "best" member.</li>
        </ul>
      </Panel>

      <Panel title="Word list" sub="Game words and what they mean">
        <p className="mb-3 text-sm text-muted-foreground">The Gamer / Boomer switch in the top bar swaps these words everywhere on the site.</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Character sheet", "A member's profile page"], ["Stat", "One of the four scores"],
            ["Quest log", "Bills the member wrote"], ["Ally moves", "Bills the member helped write"],
            ["Skills", "Topics the member works on"], ["Fog", "Not enough proof to give a score"],
            ["Scouting level", "How sure we are about a score"], ["Versus", "Compare two members side by side"],
            ["Realm", "The place a member represents"], ["Errata", "List of fixes we made"],
          ].map(([g, p]) => <div key={g}><dt className="font-mono text-xs uppercase text-primary">{g}</dt><dd>{p}</dd></div>)}
        </dl>
      </Panel>
    </div>
  );
}
