// Corrections log that works on static hosting (GitHub Pages): no server, no database.
// Published fixes live in public/errata-log.txt (plain text, hand-edited, served with the site).
// New reports are kept in this browser and exported as a .txt file the team can review.
import { AXES, ROSTER, fullName, type AxisKey } from "./members";

export type ErrataStat = AxisKey | "whole";

export interface ErrataEntry {
  date: string;
  member: string;
  stat: ErrataStat;
  issue: string;
  outcome: string;
}

const FIELDS = ["date", "member", "stat", "issue", "outcome"] as const;

/** Reads "key: value" blocks separated by blank lines; # lines are comments. */
export function parseErrataLog(text: string): ErrataEntry[] {
  const entries: ErrataEntry[] = [];
  let block: Record<string, string> = {};

  const flush = () => {
    const issue = block["issue"];
    if (issue) {
      entries.push({
        date: block["date"] ?? "",
        member: block["member"] ?? "general",
        stat: (block["stat"] ?? "whole") as ErrataStat,
        issue,
        outcome: block["outcome"] ?? "",
      });
    }
    block = {};
  };

  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t === "") { flush(); continue; }
    if (t.startsWith("#")) continue;
    const cut = t.indexOf(":");
    if (cut < 0) continue;
    const key = t.slice(0, cut).trim();
    if ((FIELDS as readonly string[]).includes(key)) block[key] = t.slice(cut + 1).trim();
  }
  flush();

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

const LOG_PATH = `${import.meta.env.BASE_URL || "/"}errata-log.txt`;

/** Corrections the team has published, read from public/errata-log.txt when the page opens. */
export async function loadPublishedErrata(): Promise<ErrataEntry[]> {
  try {
    const res = await fetch(LOG_PATH, { cache: "no-store" });
    if (!res.ok) return [];
    return parseErrataLog(await res.text());
  } catch {
    return [];
  }
}

export const statLabel = (stat: ErrataStat) =>
  stat === "whole" ? "Whole sheet" : AXES.find((a) => a.key === stat)?.name ?? stat;

export const memberLabel = (slug: string) => {
  if (slug === "general") return "General";
  const m = ROSTER.find((r) => r.slug === slug);
  return m ? fullName(m) : slug;
};

const STORE_KEY = "politiko-errata-v1";

export function readLocalReports(): ErrataEntry[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ErrataEntry[]) : [];
  } catch {
    return [];
  }
}

export function addLocalReport(entry: ErrataEntry): ErrataEntry[] {
  const next = [entry, ...readLocalReports()];
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked (private mode): the report still shows in this session
  }
  return next;
}

export function clearLocalReports() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    // nothing to clean up
  }
}

/** Writes reports back in errata-log.txt format, so the file can be pasted straight in. */
export function reportsToText(list: ErrataEntry[]): string {
  const header = [
    "# Politiko Character Sheet - reports received",
    `# Exported ${new Date().toISOString().slice(0, 10)}`,
    "# Paste a block into public/errata-log.txt once a fix is live, and fill in outcome.",
  ].join("\n");
  const blocks = list
    .map((e) => FIELDS.map((f) => `${f}: ${e[f]}`).join("\n"))
    .join("\n\n");
  return `${header}\n\n${blocks}\n`;
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
