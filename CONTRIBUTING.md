# Contributing

Anyone can file an issue or open a pull request. You do not need permission or prior discussion. For anything large, opening an issue first saves you rework, but it is not required.

## Ways to help

- **Report a wrong or missing score.** Most valuable, see below.
- **Report a bug or a confusing screen.**
- **Fix a typo or improve wording**, in either the Gamer or Boomer mode.
- **Improve the code, tests, or docs.**
- **Fix a data gap**: a missing bill, a wrong photo, a broken social link, a missing family member.

## Report a wrong or missing score

Open an issue using the "Data correction" template. Include:

1. The member (name or page URL).
2. Which score: economic, social values, civil liberties, democratic institutions, or the whole sheet.
3. What is wrong or missing.
4. **A specific, public source**: a bill number, a recorded vote, a dated statement, or a credible news report. Corrections without a source cannot be acted on.

Please read [docs/RESEARCH.md](docs/RESEARCH.md) first. Two things come up often:

- The scores measure policy orientation, not whether someone is good or bad at their job.
- Most scores rest on authored bills, not votes. "You missed how they voted on X" is exactly the kind of evidence that helps.

Corrections are handled the same way regardless of which party or bloc the member belongs to.

You can also use the Errata page on the site. Reports there are stored in your browser and exported as a `.txt` file, so attach that file to an issue to send it to us. There is intentionally no server or inbox.

## Set up

```sh
git clone https://github.com/<your-username>/politiko-character-sheet.git
cd politiko-character-sheet
bun install
bun run dev
```

Fork first if you do not have write access. Before opening a PR, run the tests and a build. `bun run lint` currently reports existing formatting errors in the codebase, so just make sure you do not add new ones in files you touch.

```sh
bun run test
bun run build
```

## Pull requests

1. Branch from `main`.
2. Keep each PR focused on one change.
3. Match the surrounding code style. Prettier config is in the repo (`bun run format`).
4. Add or update tests when you change behavior.
5. Explain what changed and why. For data changes, link the source.

By submitting a pull request you agree that your contribution is licensed under the [MIT License](LICENSE).

## Project rules to know

These are deliberate. A PR that breaks one will be asked to change.

- **Do not hand-edit generated data.** `src/data/roster.json`, `src/data/members/*.json`, `src/data/socials.json`, and `src/data/family.json` come from the scripts in `scripts/`. Edit the source CSV in `scripts/data/` and rerun the script. See [Updating the data](README.md#updating-the-data).
- **Scores and rationales live in** `scripts/data/house_political_profiles_geo_links.csv`. A score change needs a source in the rationale and the matching label, confidence, issue count, and radar values (opposite spokes sum to 10). A score needs at least two distinct issues; otherwise it stays blank.
- **Published corrections** are hand-edited plain-text blocks in `public/errata-log.txt`. The format is in the file header.
- **No server, database, or inbox for corrections.** The site must keep working on static hosting.
- **Two wording modes.** Gamer (default) and Boomer (plain). Swap text with the `<T game=... plain=...>` helper from `src/components/hud.tsx`. If you add visible text, provide both versions.
- **Axis and pole definitions** live in `AXES` in `src/data/members.ts`. Components read poles from there, so a rubric change cannot flip a meter.
- **Do not rewrite published git history.** No force-pushes, and no rebasing, amending, or squashing commits that are already pushed to `main`.

## Standards for content

- Stay neutral. Describe policy positions; do not editorialize about a person.
- Do not add ideology inferred from party, family, religion, region, or allies.
- Do not add unsourced claims, accusations, or private information about anyone, including family members. Family entries should be publicly documented relationships and offices.
- Be civil in issues and reviews. Disagreement about a score is fine; personal attacks are not.

## Questions

Open an issue and ask.
