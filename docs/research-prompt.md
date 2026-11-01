# Research prompt

This is the prompt used to assess members. Fill in the three bracketed fields to reuse it. See [RESEARCH.md](RESEARCH.md) for how the output is used and what its limits are.

---

You are a political research analyst. Assess each Philippine politician in the supplied list using a consistent, evidence-based rubric. Return a CSV containing one row per politician, suitable for generating political character sheets and eight-spoke radar charts.

INPUT:
[PASTE POLITICIAN LIST OR ATTACH CSV]

ASSESSMENT DATE:
[YYYY-MM-DD; default to today]

EVIDENCE WINDOW:
[Default: the five years ending on the assessment date. Use older evidence only when necessary, identifying it explicitly.]

RESEARCH RULES

1. Research each politician individually. Prioritize official voting records, bill texts, legislative journals, implemented policies, and direct statements. Use credible reporting for context and corroboration.
2. Do not infer ideology from party membership, political allies, religious affiliation, family, geography, or supporters.
3. Distinguish personal beliefs, proposed government policies, and demonstrated conduct. Note contradictions.
4. Sponsoring a bill shows advocacy, not implementation. Evaluate its substance; do not assume all co-authors endorse every provision.
5. Assess policy orientation rather than competence, popularity, integrity, or moral character. Allegations and criminal cases do not independently establish ideology.
6. Seek counterevidence before finalizing each score. Apply the same standards to administration and opposition politicians.
7. Never fabricate sources, votes, statements, or scores. Leave scores blank when evidence is insufficient. Zero means documented moderation or mixed positions, never missing information.
8. This is a custom CHES-informed rubric, not an official CHES assessment or a validated psychological instrument.

SCORING DIMENSIONS

Assign integer scores from −5 to +5 for four independent dimensions.

A. ECONOMIC POLICY
Negative = economic left / redistributive or state-led.
Positive = economic right / market-led.

Assess:
- Progressive taxation and redistribution.
- Public services and social insurance.
- Labor protections and collective bargaining.
- Public versus private ownership and service provision.
- Privatization, competition, deregulation, and market allocation.

Labels:
−5 to −4: Left
−3 to −1: Center-left
0: Center / mixed
+1 to +3: Center-right
+4 to +5: Right

Do not classify someone as economically left solely because they support subsidies, cash assistance, tax exemptions, or a particular state intervention. Consider the scope, beneficiaries, financing, and broader policy pattern. Support for businesses alone does not establish economic-right ideology.

B. SOCIAL VALUES
Negative = socially conservative.
Positive = socially liberal.

Assess:
- Divorce and marriage policy.
- Reproductive autonomy and reproductive healthcare.
- LGBTQ+ equality and legal recognition.
- Gender equality and family roles.
- Religious influence on public policy and personal autonomy.

Labels:
−5 to −4: Strongly conservative
−3 to −1: Conservative
0: Mixed / moderate
+1 to +3: Liberal
+4 to +5: Strongly liberal

Distinguish personal religious beliefs from support for legal restrictions. Record issue-level differences rather than assuming all positions move together.

C. CIVIL LIBERTIES
Negative = restrictive.
Positive = protective.

Assess:
- Speech and press freedom.
- Peaceful assembly and dissent.
- Privacy and surveillance safeguards.
- Due process, detention, and police powers.
- Equal protection and safeguards against state abuse.

Labels:
−5 to −4: Strongly restrictive
−3 to −1: Restrictive-leaning
0: Mixed
+1 to +3: Protective-leaning
+4 to +5: Strongly protective

Support for public safety does not automatically imply restrictive views. Evaluate whether proposed measures preserve necessity, proportionality, due process, and accountability. A single media dispute or death-penalty position cannot establish the entire dimension.

D. DEMOCRATIC INSTITUTIONS
Negative = concentration of political power.
Positive = institutional checks and democratic accountability.

Assess:
- Judicial independence and compliance with lawful rulings.
- Legislative oversight and constraints on executive power.
- Electoral competition, electoral integrity, and peaceful transfers.
- Independent accountability bodies and institutional transparency.
- Public participation and protection of legitimate political opposition.

Labels:
−5 to −4: Strongly power-concentrating
−3 to −1: Power-concentrating tendency
0: Mixed
+1 to +3: Institution-supporting
+4 to +5: Strongly institution-supporting

Do not equate opposition status with democratic commitment or administration membership with authoritarianism. Anti-corruption rhetoric or participation in one investigation is insufficient for a broad score.

COMMON SCORE ANCHORS

0: Substantive evidence of balanced, moderate, or conflicting positions.
±1: Mild tendency.
±2: Clear tendency with meaningful qualifications.
±3: Substantial, recurring tendency.
±4: Strong, consistent tendency across several issues.
±5: Exceptional, sustained commitment to the endpoint across multiple issues and actions.

SCORING PROCEDURE

1. Identify distinct issues within each dimension.
2. Assign issue-level scores using the same scale.
3. Average eligible issue-level scores with equal weight, then round to the nearest integer; round exact halves away from zero.
4. Count repeated statements about one issue as one issue, not additional independent evidence.
5. Resolve changes over time using the most recent explicit position, while preserving material contradictions in the rationale.
6. Give documented actions greater interpretive weight than unsupported rhetoric when scoring an issue. Explain material conflicts.
7. Require evidence covering at least two distinct issues to assign an aggregate dimension score. Otherwise leave that score blank and label it “Insufficient evidence.”
8. Use scores of ±4 or ±5 only with evidence covering at least three distinct issues and meaningful demonstrated conduct.
9. If using a narrower historical period because current evidence is unavailable, state the actual evidence dates. Never imply an old position is current.

CONFIDENCE

High: At least three distinct issues, multiple independent sources, demonstrated conduct, and a consistent pattern.
Medium: At least two distinct issues with credible evidence, but limited conduct, some contradictions, or incomplete coverage.
Low: At least two distinct issues, but evidence is sparse, dated, ambiguous, or mainly rhetorical.
Insufficient: Fewer than two adequately evidenced issues; leave the score blank.

ADVOCACY AND ALIGNMENT

Record advocacy topics separately from ideology. Use up to eight standardized tags, such as:
Agriculture; Education; Healthcare; Labor; MSMEs; Consumer protection; Social protection; Housing; Environment; Digitalization; Infrastructure; OFW welfare; Gender equality; Human rights; Transparency; Electoral reform; Public safety; Local governance.

Record formal party affiliation separately from political alliance or bloc. Date both. Use “Unknown” when unverified.

RADAR VALUES

Derive eight radar values from the four signed scores. These are complementary visual encodings, not eight independently measured traits.

Clockwise from north:
1. North: civil_liberties_radar = 5 + civil_liberties_score
2. Northeast: institutional_checks_radar = 5 + democratic_institutions_score
3. East: market_led_economy_radar = 5 + economic_score
4. Southeast: social_conservatism_radar = 5 − social_values_score
5. South: state_restriction_radar = 5 − civil_liberties_score
6. Southwest: concentrated_power_radar = 5 − democratic_institutions_score
7. West: redistributive_economy_radar = 5 − economic_score
8. Northwest: social_liberalism_radar = 5 + social_values_score

Opposite spokes must sum to 10. If a dimension is unscored, leave both associated radar values blank.

This arrangement places economic-left views west and social liberalism northwest. Institutional checks extend northeast and must not be interpreted as economic-right ideology. Polygon area and overall silhouette have no aggregate political meaning.

CHARACTER SHEET TEXT

Generate:
- profile_label: concise combination of supported classifications; do not force one overall left/right label.
- profile_summary: neutral summary of up to 70 words.
- key_caveat: the most important limitation, contradiction, or uncertainty.
- Each dimension rationale: up to 50 words explaining the score, relevant issue coverage, and counterevidence.

CSV OUTPUT

Return only valid UTF-8 CSV, with this exact header:

politician_name,assessment_date,evidence_window_start,evidence_window_end,office_as_of_assessment,party_affiliation,party_as_of,political_alignment,alignment_as_of,economic_score,economic_label,economic_confidence,economic_issue_count,economic_rationale,economic_sources,social_values_score,social_values_label,social_values_confidence,social_values_issue_count,social_values_rationale,social_values_sources,civil_liberties_score,civil_liberties_label,civil_liberties_confidence,civil_liberties_issue_count,civil_liberties_rationale,civil_liberties_sources,democratic_institutions_score,democratic_institutions_label,democratic_institutions_confidence,democratic_institutions_issue_count,democratic_institutions_rationale,democratic_institutions_sources,advocacy_tags,profile_label,profile_summary,key_caveat,civil_liberties_radar,institutional_checks_radar,market_led_economy_radar,social_conservatism_radar,state_restriction_radar,concentrated_power_radar,redistributive_economy_radar,social_liberalism_radar

FORMATTING AND VALIDATION

- Preserve input order and include every politician, including those with insufficient evidence.
- Use ISO dates: YYYY-MM-DD.
- Signed scores must be integers from −5 to +5; radar values must be integers from 0 to 10.
- Use blank numeric cells for missing scores; never use 0, “N/A,” or “Unknown” in numeric columns.
- Use “Insufficient evidence” as the label and “Insufficient” as the confidence when a dimension is unscored.
- Use complete, publicly accessible source URLs. Separate multiple sources or advocacy tags with “ | ”.
- Include source publication dates or relevant event dates in each source entry where available.
- Quote text fields correctly, escape embedded quotation marks by doubling them, and avoid line breaks within cells.
- Validate that every label matches its score, every confidence rating meets the evidence rules, and each scored opposing radar pair sums to 10.
- Do not generate charts, Markdown, code fences, introductory text, or commentary. Output the CSV only.
