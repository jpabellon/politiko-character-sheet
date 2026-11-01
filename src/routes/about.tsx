import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/hud";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & data — Politiko Character Sheet" },
      { name: "description", content: "Credits, data sources and reuse for the Politiko Character Sheet." },
      { property: "og:title", content: "About & data — Politiko Character Sheet" },
      { property: "og:description", content: "Open data, sources and credits." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="rise-in">
        <p className="hud-label text-primary">About &amp; data</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Open data, open method</h1>
      </header>
      <Panel title="Sources">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Bill records from <a className="text-primary underline" href="https://open-congress.bettergov.ph" target="_blank" rel="noreferrer">BetterGov Open Congress</a> and the House of Representatives website.</li>
          <li>Rubric scores assessed 1 Nov 2026 over a five-year evidence window.</li>
          <li>UI foundation: the Kapwa design system by BetterGov.</li>
        </ul>
      </Panel>
      <Panel title="Data notes">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>254 member profiles from the Politiko rubric dataset, assessed 1 Nov 2026.</li>
          <li>Photos, authored and co-authored bills and committee memberships from each member's page on congress.gov.ph, retrieved 1 Nov 2026. The Open Congress API was offline at build time.</li>
          <li>Party affiliation is not recorded in this dataset.</li>
        </ul>
      </Panel>
      <a href="https://bettergov.ph" target="_blank" rel="noreferrer" className="hud-panel hud-interactive flex items-center gap-4 p-5">
        <img src="/logos/BetterGov_Horizontal-White.svg" alt="BetterGov" className="h-8" />
        <span className="text-sm text-muted-foreground">Part of the BetterGov.ph family of civic tools. Visit bettergov.ph →</span>
      </a>
    </div>
  );
}
