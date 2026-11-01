# How the research was done

This page explains where the scores come from, what they can and cannot tell you, and how to challenge them.

## In one paragraph

An AI model was given a list of House members and a fixed written rubric (reproduced in [research-prompt.md](research-prompt.md)). For each member it was asked to gather evidence, score four independent dimensions from −5 to +5, rate its confidence, cite sources, and leave a score blank when the evidence was too thin. The output was one CSV row per member. That CSV is the source of truth for the site: [`scripts/data/house_political_profiles_geo_links.csv`](../scripts/data/house_political_profiles_geo_links.csv). A script turns it into the JSON the app reads.

This is a custom rubric informed by the Chapel Hill Expert Survey (CHES). It is **not** an official CHES assessment and **not** a validated psychological or political-science instrument.

## What was assessed

| Item            | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Assessment date | 2026-11-01                                                                    |
| Evidence window | 2021-11-01 to 2026-11-01 (five years)                                         |
| Profiles        | 254                                                                           |
| Subject         | Policy orientation only. Not competence, popularity, integrity, or character. |

Allegations and criminal cases do not by themselves establish ideology, so they are not scored as such.

## The four dimensions

Each is an independent score from −5 to +5.

| Dimension               | −5                              | +5                                 | Issues considered                                                                                                                           |
| ----------------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Economic policy         | Left: redistributive, state-led | Right: market-led                  | Progressive taxation, public services and social insurance, labor protections, public vs. private provision, privatization and deregulation |
| Social values           | Socially conservative           | Socially liberal                   | Divorce and marriage, reproductive autonomy, LGBTQ+ equality, gender equality, religious influence on policy                                |
| Civil liberties         | Restrictive                     | Protective                         | Speech and press, peaceful assembly, privacy and surveillance, due process and police powers, equal protection                              |
| Democratic institutions | Concentrates power              | Supports checks and accountability | Judicial independence, legislative oversight, electoral integrity, independent accountability bodies, public participation                  |

Score meaning, applied to every dimension:

| Score | Meaning                                                              |
| ----- | -------------------------------------------------------------------- |
| 0     | Substantive evidence of balanced, moderate, or conflicting positions |
| ±1    | Mild tendency                                                        |
| ±2    | Clear tendency with meaningful qualifications                        |
| ±3    | Substantial, recurring tendency                                      |
| ±4    | Strong, consistent tendency across several issues                    |
| ±5    | Exceptional, sustained commitment across multiple issues and actions |

**Zero is a finding, not a default.** A 0 means documented moderate or mixed positions. Missing evidence is a blank, never a 0.

## How a score is built

1. Identify the distinct issues within a dimension (for example, divorce and cannabis access are two social-values issues).
2. Score each issue on the same −5 to +5 scale.
3. Average the issue scores with equal weight and round to the nearest integer (halves round away from zero).
4. Repeated statements on one issue count as one issue.
5. If a member's position changed, use the most recent explicit position and keep the contradiction in the rationale.
6. Documented actions outweigh unsupported rhetoric.
7. **At least two distinct issues are required** to publish a dimension score. Otherwise the score is blank and labelled "Insufficient evidence".
8. A score of ±4 or ±5 needs at least three distinct issues and meaningful demonstrated conduct.

## Confidence

| Level        | Requirement                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| High         | At least three distinct issues, multiple independent sources, demonstrated conduct, consistent pattern                |
| Medium       | At least two distinct issues with credible evidence, but limited conduct, some contradictions, or incomplete coverage |
| Low          | At least two distinct issues, but evidence is sparse, dated, ambiguous, or mostly rhetorical                          |
| Insufficient | Fewer than two adequately evidenced issues; score left blank                                                          |

## Rules the researcher followed

- Research each member individually. Prioritize official voting records, bill texts, legislative journals, implemented policy, and direct statements. Use credible reporting for corroboration.
- Do not infer ideology from party, allies, religion, family, geography, or supporters.
- Separate personal beliefs, proposed policy, and demonstrated conduct. Note contradictions.
- Sponsoring a bill shows advocacy, not implementation, and co-authors do not necessarily endorse every provision.
- Look for counterevidence before finalizing a score. Apply the same standard to administration and opposition.
- Never fabricate sources, votes, statements, or scores.

## What the evidence actually looks like

The rubric asks for votes, journals, and statements. **What the dataset mostly contains is bill authorship.** Be aware of this when reading any sheet:

- The cited sources are overwhelmingly pages on congress.gov.ph (about 990 of roughly 1,000 source links), mainly bill records. A handful of news articles are cited, mostly for members who have died or left office.
- Many rationales state that they rest on authored bills only, with no votes reviewed.
- 31 of 254 caveats mention votes.
- 18 caveats note that the bill extractor may have under-reported a member's bills.

Coverage is correspondingly uneven:

| Dimension               | Scored | Left blank (insufficient) |
| ----------------------- | ------ | ------------------------- |
| Economic                | 151    | 103                       |
| Social values           | 25     | 229                       |
| Civil liberties         | 25     | 229                       |
| Democratic institutions | 66     | 188                       |

85 of the 254 profiles have no score in any dimension. Blank is the honest result: it means "not enough evidence found", not "moderate".

Other things to know:

- **Party affiliation was added after the scoring run.** The research run returned "Unknown" for every member, so party was filled in separately from Wikipedia's list of current House members (as of 2026-09-21), matched to each member by district and name. It is shown as a fact and never used to score. Majority or minority bloc comes from the same Wikipedia list and date. Two members (Romeo Acop, who died, and Kiko Barzaga, who was expelled) are left "Unknown" for both, because the list now shows other people for their seats; Gato's bloc is "Unknown" because his seat is vacant.
- **Only one dimension score in the whole dataset is rated High confidence** (one member's social values). Most scored dimensions are Medium or Low.
- Bills filed in the window tell you what a member put forward, not how they voted or what they believe. A member can author a bill on request, or co-author without endorsing every provision.
- One or two bills can move a score a lot when only two issues clear the bar.
- Members who died, left office, or were expelled during the window are marked as such and may be unscored.

## The radar chart

The eight spokes are derived from the four signed scores. They are a visual encoding, not eight independent measurements.

| Spoke (clockwise from north) | Formula                     |
| ---------------------------- | --------------------------- |
| Civil liberties              | 5 + civil_liberties         |
| Institutional checks         | 5 + democratic_institutions |
| Market-led economy           | 5 + economic                |
| Social conservatism          | 5 − social_values           |
| State restriction            | 5 − civil_liberties         |
| Concentrated power           | 5 − democratic_institutions |
| Redistributive economy       | 5 − economic                |
| Social liberalism            | 5 + social_values           |

Opposite spokes always sum to 10. If a dimension is unscored, both of its spokes are blank. The shape's area and silhouette have no overall political meaning. Institutional checks sit northeast and must not be read as economic-right.

## From CSV to website

```
scripts/data/house_political_profiles_geo_links.csv   (research output)
        │  + scraped congress.gov.ph member pages (photos, bills, committees)
        ▼
scripts/build-data.py  →  src/data/roster.json
                          src/data/members/<slug>.json
```

Do not hand-edit the generated JSON. To change a score, change the CSV row and rerun the script. Pole names and meter direction live in `AXES` in `src/data/members.ts`.

## Reproducing or extending the research

1. Take [research-prompt.md](research-prompt.md) and fill in the input list, assessment date, and evidence window.
2. Run it with a model that can browse and read primary sources. Check that it returns only the CSV with the exact header.
3. Spot-check the output against the cited sources before merging. The prompt forbids invented sources, but you should still open the links; a model can get this wrong.
4. Validate: labels match scores, confidence meets the evidence rules, scored opposite radar pairs sum to 10, no 0 in place of a blank.
5. Merge rows into the CSV and rerun `scripts/build-data.py`. See the [README](../README.md#updating-the-data).

## Known limitations

- AI-assisted scoring can misread a bill, miss a relevant one, or be inconsistent between members. Human review has not been exhaustive.
- The five-year window means older positions are not captured unless the model said otherwise.
- Bills sorted into a dimension are judged by title and substance as the model read them; reasonable people may classify some differently.
- The rubric's axes are a Western-derived frame. They may not capture how a Philippine issue maps to left/right.
- Aggregating issues with equal weight treats a minor bill and a landmark one the same.

## Disagree with a score?

That is welcome. See [CONTRIBUTING.md](../CONTRIBUTING.md#report-a-wrong-or-missing-score). The most useful report names the member, the dimension, and a specific source (a bill, a vote, a dated statement) that the current rationale missed or misread.
