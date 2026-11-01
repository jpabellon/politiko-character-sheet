import { describe, expect, it } from "vitest";

import {
  PUBLISHED_ERRATA,
  memberLabel,
  parseErrataLog,
  reportsToText,
  statLabel,
  type ErrataEntry,
} from "@/data/errata";

const SAMPLE = [
  "# Politiko Character Sheet - public corrections log",
  "# comment that must be ignored",
  "",
  "date: 2026-11-01",
  "member: abante-bienvenido-m-jr",
  "stat: economic",
  "issue: The photo on this profile is of the wrong person.",
  "outcome: Photo replaced with the current House portrait.",
  "",
  "date: 2026-10-28",
  "member: general",
  "stat: whole",
  "issue: The compare page said two bills were passed that were only filed.",
  "",
  "date: 2026-10-20",
  "member: general",
].join("\n");

describe("Errata plain-text log", () => {
  it("reads published corrections from the txt format", () => {
    const entries = parseErrataLog(SAMPLE);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      date: "2026-11-01",
      member: "abante-bienvenido-m-jr",
      stat: "economic",
      issue: "The photo on this profile is of the wrong person.",
      outcome: "Photo replaced with the current House portrait.",
    });
    expect(entries[1]?.outcome).toBe("");
  });

  it("skips a block with no issue and sorts newest first", () => {
    const entries = parseErrataLog(SAMPLE);

    expect(entries.map((e) => e.date)).toEqual(["2026-11-01", "2026-10-28"]);
    expect(entries.some((e) => e.date === "2026-10-20")).toBe(false);
  });

  it("round-trips reports through the exported txt", () => {
    const report: ErrataEntry = {
      date: "2026-11-01",
      member: "abante-bienvenido-m-jr",
      stat: "whole",
      issue: "Committee list is out of date.",
      outcome: "Not reviewed yet.",
    };

    expect(parseErrataLog(reportsToText([report]))).toEqual([report]);
  });

  it("ships with an empty published log", () => {
    expect(PUBLISHED_ERRATA).toEqual([]);
  });

  it("labels members and stats in plain words", () => {
    expect(statLabel("whole")).toBe("Whole sheet");
    expect(statLabel("economic")).toBe("Economic");
    expect(memberLabel("general")).toBe("General");
    expect(memberLabel("abante-bienvenido-m-jr")).toBe("Bienvenido Jr. M. Abante");
    expect(memberLabel("not-a-real-slug")).toBe("not-a-real-slug");
  });
});
