export type AxisKey = "economic" | "social" | "civil" | "democratic";
export type Confidence = "high" | "medium" | "low" | "insufficient";
export type Status = "active" | "deceased" | "expelled" | "changed_office";

export interface Bill {
  id: string; // e.g. HB-01234
  title: string;
  topic: string;
  date: string; // ISO
  role: "authored" | "coauthored";
  informs?: AxisKey;
}

export interface Stat {
  score: number | null; // -5..+5, null = not scored
  label: string;
  confidence: Confidence;
  issueCount: number;
  rationale: string;
  sources: string[]; // bill ids
}

export interface Member {
  slug: string;
  firstName: string;
  lastName: string;
  office: string;
  party: string;
  partyAsOf: string;
  municipality: string;
  province: string;
  region: string;
  status: Status;
  statusDate?: string;
  openCongressUrl?: string;
  assessmentDate: string;
  windowStart: string;
  windowEnd: string;
  profileLabel: string;
  summary: string;
  caveat: string;
  tags: string[];
  stats: Record<AxisKey, Stat>;
  bills: Bill[];
}

export interface AxisDef {
  key: AxisKey;
  name: string;
  plain: string;
  negPole: string;
  posPole: string;
  negRadar: string;
  posRadar: string;
  colorVar: string;
  evidence: string;
  /** Middle 50% of scored House members, only where >= 20 scored */
  houseBand?: [number, number];
  scoredInHouse: number;
}

// Poles are read from this dictionary — never hard-coded in components.
export const AXES: AxisDef[] = [
  {
    key: "economic",
    name: "Economic",
    plain: "How the economy should be run",
    negPole: "Redistributive, state-led",
    posPole: "Market-led",
    negRadar: "Redistributive",
    posRadar: "Market-led",
    colorVar: "var(--axis-economic)",
    evidence: "Wage, social pension, tax and subsidy bills",
    houseBand: [-2, -1],
    scoredInHouse: 151,
  },
  {
    key: "social",
    name: "Social values",
    plain: "Family, gender and moral questions",
    negPole: "Socially conservative",
    posPole: "Socially liberal",
    negRadar: "Social conservatism",
    posRadar: "Social liberalism",
    colorVar: "var(--axis-social)",
    evidence: "Family law, gender, reproductive and gambling bills",
    scoredInHouse: 25,
  },
  {
    key: "civil",
    name: "Civil liberties",
    plain: "Personal freedoms vs. state powers",
    negPole: "State restriction",
    posPole: "Civil liberties protection",
    negRadar: "State restriction",
    posRadar: "Civil liberties",
    colorVar: "var(--axis-civil)",
    evidence: "Surveillance, speech, policing and detention bills",
    scoredInHouse: 25,
  },
  {
    key: "democratic",
    name: "Democratic institutions",
    plain: "How power is checked",
    negPole: "Concentrated power",
    posPole: "Institutional checks",
    negRadar: "Concentrated power",
    posRadar: "Institutional checks",
    colorVar: "var(--axis-democratic)",
    evidence: "Transparency, anti-dynasty, election and oversight bills",
    houseBand: [0, 1],
    scoredInHouse: 66,
  },
];

export const SCOUTING: Record<Confidence, { game: string; plain: string; desc: string }> = {
  high: { game: "Verified", plain: "High confidence", desc: "Strong, consistent bill evidence" },
  medium: { game: "Scouted", plain: "Medium confidence", desc: "Several bills point the same way" },
  low: { game: "Rumored", plain: "Low confidence", desc: "Limited evidence" },
  insufficient: { game: "Unidentified", plain: "Not enough evidence", desc: "Fewer than two distinct issues" },
};

const ASSESS = { assessmentDate: "2026-11-01", windowStart: "2021-11-01", windowEnd: "2026-11-01" };

const fog = (n = 0): Stat => ({
  score: null,
  label: "Not scored",
  confidence: "insufficient",
  issueCount: n,
  rationale: "",
  sources: [],
});

const s = (score: number, label: string, confidence: Confidence, issueCount: number, rationale: string, sources: string[]): Stat => ({
  score, label, confidence, issueCount, rationale, sources,
});

// SAMPLE DATA — fictional members for demonstration. Replace with the 254-row dataset.
export const MEMBERS: Member[] = ([
  {
    slug: "dela-cruz-maria-luz",
    firstName: "Maria Luz", lastName: "Dela Cruz",
    office: "Representative, 2nd District", party: "Independent", partyAsOf: "2026-06-30",
    municipality: "Quezon City", province: "Metro Manila", region: "NCR",
    status: "active", ...ASSESS,
    profileLabel: "Center-left, checks-leaning",
    summary: "Authored bills raising the senior social pension, expanding freedom-of-information rules and capping campaign spending.",
    caveat: "Several scores rest on bill titles; full text has not been reviewed for all entries.",
    tags: ["Senior citizens", "Transparency", "Elections", "Labor"],
    stats: {
      economic: s(-2, "Center-left", "medium", 4, "Four authored bills expand social pensions and wage floors through state programs.", ["HB-01021", "HB-01388", "HB-02210"]),
      social: fog(1),
      civil: s(1, "Leans protective", "low", 2, "Two bills add due-process safeguards to warrantless arrest procedures.", ["HB-03302"]),
      democratic: s(2, "Checks-leaning", "medium", 3, "Bills on freedom of information, campaign finance limits and a public SALN registry.", ["HB-00412", "HB-02977"]),
    },
    bills: [
      { id: "HB-02977", title: "Campaign Spending Ceiling Act", topic: "Elections", date: "2026-03-14", role: "authored", informs: "democratic" },
      { id: "HB-03302", title: "Arrest Procedure Safeguards Act", topic: "Justice", date: "2025-11-02", role: "authored", informs: "civil" },
      { id: "HB-02210", title: "Minimum Wage Review Board Reform", topic: "Labor", date: "2025-06-20", role: "authored", informs: "economic" },
      { id: "HB-01388", title: "Expanded Senior Social Pension Act", topic: "Senior citizens", date: "2024-08-09", role: "authored", informs: "economic" },
      { id: "HB-01021", title: "Barangay Health Worker Allowance Act", topic: "Health", date: "2023-02-15", role: "authored", informs: "economic" },
      { id: "HB-00412", title: "Freedom of Information Act", topic: "Transparency", date: "2022-09-01", role: "authored", informs: "democratic" },
      { id: "HB-04410", title: "National Cancer Registry Act", topic: "Health", date: "2026-01-11", role: "coauthored" },
    ],
  },
  {
    slug: "santos-rafael",
    firstName: "Rafael", lastName: "Santos",
    office: "Representative, Lone District", party: "Partido Bagong Daan", partyAsOf: "2026-06-30",
    municipality: "Tagbilaran City", province: "Bohol", region: "Central Visayas",
    status: "active", ...ASSESS,
    profileLabel: "Center, market-leaning",
    summary: "Authored bills easing business registration, reducing port fees and creating tourism enterprise zones.",
    caveat: "Economic score based on titles only; tourism bills may include subsidies not visible in titles.",
    tags: ["Tourism", "Trade", "Infrastructure"],
    stats: {
      economic: s(1, "Leans market-led", "low", 2, "Two bills reduce regulatory fees and simplify business permits.", ["HB-01512", "HB-02703"]),
      social: fog(0), civil: fog(0), democratic: fog(1),
    },
    bills: [
      { id: "HB-02703", title: "Port Fee Rationalization Act", topic: "Trade", date: "2025-09-30", role: "authored", informs: "economic" },
      { id: "HB-01512", title: "Ease of Business Registration Act", topic: "Trade", date: "2024-04-18", role: "authored", informs: "economic" },
      { id: "HB-01190", title: "Bohol Tourism Enterprise Zone Act", topic: "Tourism", date: "2023-07-07", role: "authored" },
    ],
  },
  {
    slug: "abdullah-norhana",
    firstName: "Norhana", lastName: "Abdullah",
    office: "Representative, 1st District", party: "Independent", partyAsOf: "2026-06-30",
    municipality: "Marawi City", province: "Lanao del Sur", region: "BARMM",
    status: "active", ...ASSESS,
    profileLabel: "Center-left, liberties-protective",
    summary: "Authored bills on rehabilitation of displaced families, anti-profiling safeguards and indigenous land titling.",
    caveat: "Civil liberties score depends on two closely related bills; one more distinct issue would firm it up.",
    tags: ["Peace and order", "Indigenous peoples", "Housing", "Human rights"],
    stats: {
      economic: s(-2, "Center-left", "medium", 3, "Bills fund state housing and livelihood grants for displaced families.", ["HB-00733", "HB-01944"]),
      social: s(-1, "Leans conservative", "low", 2, "Two bills strengthen customary family dispute processes.", ["HB-02455"]),
      civil: s(2, "Protective", "medium", 3, "Bills ban religious and ethnic profiling and require body cameras during raids.", ["HB-02010", "HB-03115"]),
      democratic: s(1, "Leans checks", "low", 2, "Bills require public reporting of rehabilitation funds.", ["HB-01944"]),
    },
    bills: [
      { id: "HB-03115", title: "Body-Worn Camera in Law Enforcement Act", topic: "Human rights", date: "2026-02-03", role: "authored", informs: "civil" },
      { id: "HB-02455", title: "Customary Dispute Resolution Recognition Act", topic: "Indigenous peoples", date: "2025-07-21", role: "authored", informs: "social" },
      { id: "HB-02010", title: "Anti-Profiling Act", topic: "Human rights", date: "2025-01-12", role: "authored", informs: "civil" },
      { id: "HB-01944", title: "Marawi Rehabilitation Transparency Act", topic: "Housing", date: "2024-10-05", role: "authored", informs: "democratic" },
      { id: "HB-00733", title: "Displaced Families Livelihood Act", topic: "Housing", date: "2022-12-01", role: "authored", informs: "economic" },
    ],
  },
  {
    slug: "villanueva-jose-antonio",
    firstName: "Jose Antonio", lastName: "Villanueva",
    office: "Representative, 3rd District", party: "Lakas ng Bayan", partyAsOf: "2026-06-30",
    municipality: "Cabanatuan City", province: "Nueva Ecija", region: "Central Luzon",
    status: "active", ...ASSESS,
    profileLabel: "Unscouted",
    summary: "Authored local bills renaming roads and converting a provincial school into a state college.",
    caveat: "Local and naming bills do not inform any axis; this sheet is fully fogged.",
    tags: ["Education", "Local roads"],
    stats: { economic: fog(1), social: fog(0), civil: fog(0), democratic: fog(0) },
    bills: [
      { id: "HB-02881", title: "Renaming of Maharlika Highway Segment Act", topic: "Local roads", date: "2025-10-10", role: "authored" },
      { id: "HB-01405", title: "Nueva Ecija State College Conversion Act", topic: "Education", date: "2024-03-22", role: "authored" },
    ],
  },
  {
    slug: "reyes-carmela",
    firstName: "Carmela", lastName: "Reyes",
    office: "Party-list Representative", party: "Kabataan Muna", partyAsOf: "2026-06-30",
    municipality: "Manila", province: "Metro Manila", region: "NCR",
    status: "active", ...ASSESS,
    profileLabel: "Left, socially liberal, checks-leaning",
    summary: "Authored bills on free tertiary education, divorce, anti-discrimination and a ban on political dynasties.",
    caveat: "One of three members with all four axes scored; social score relies on two high-profile bills.",
    tags: ["Education", "Gender", "Anti-dynasty", "Youth"],
    stats: {
      economic: s(-3, "Left", "medium", 5, "Five bills expand state-funded education, transport and student aid.", ["HB-00211", "HB-01760"]),
      social: s(3, "Liberal", "high", 4, "Bills legalize divorce, ban SOGIE discrimination and expand reproductive health access.", ["HB-00980", "HB-01555"]),
      civil: s(2, "Protective", "medium", 3, "Bills repeal criminal libel and limit data retention by telcos.", ["HB-02304"]),
      democratic: s(3, "Checks", "medium", 4, "Anti-dynasty enabling law and stronger Ombudsman independence.", ["HB-00105", "HB-02600"]),
    },
    bills: [
      { id: "HB-02600", title: "Ombudsman Independence Act", topic: "Anti-dynasty", date: "2025-12-01", role: "authored", informs: "democratic" },
      { id: "HB-02304", title: "Decriminalization of Libel Act", topic: "Human rights", date: "2025-05-15", role: "authored", informs: "civil" },
      { id: "HB-01760", title: "Student Fare Discount Expansion Act", topic: "Youth", date: "2024-09-09", role: "authored", informs: "economic" },
      { id: "HB-01555", title: "SOGIE Equality Act", topic: "Gender", date: "2024-02-14", role: "authored", informs: "social" },
      { id: "HB-00980", title: "Absolute Divorce Act", topic: "Gender", date: "2023-03-08", role: "authored", informs: "social" },
      { id: "HB-00211", title: "Free Tertiary Education Expansion Act", topic: "Education", date: "2022-08-01", role: "authored", informs: "economic" },
      { id: "HB-00105", title: "Anti-Political Dynasty Act", topic: "Anti-dynasty", date: "2022-07-25", role: "authored", informs: "democratic" },
    ],
  },
  {
    slug: "garcia-benjamin",
    firstName: "Benjamin", lastName: "Garcia",
    office: "Representative, 1st District", party: "Partido Bagong Daan", partyAsOf: "2026-06-30",
    municipality: "Davao City", province: "Davao del Sur", region: "Davao Region",
    status: "deceased", statusDate: "2025-12-20", ...ASSESS,
    profileLabel: "Center-left, state-restriction-leaning",
    summary: "Authored bills on mandatory SIM registration upgrades, a curfew framework for minors and rice price support.",
    caveat: "Assessment frozen at last filing; no new bills after the status date.",
    tags: ["Peace and order", "Agriculture", "Telecoms"],
    stats: {
      economic: s(-1, "Leans left", "low", 2, "Two bills fund rice price support and farm credit.", ["HB-00840"]),
      social: fog(1),
      civil: s(-2, "Restrictive", "medium", 3, "Bills widen SIM data access for police and set a minors' curfew.", ["HB-01633", "HB-02108"]),
      democratic: fog(0),
    },
    bills: [
      { id: "HB-02108", title: "Minors Curfew Framework Act", topic: "Peace and order", date: "2025-04-02", role: "authored", informs: "civil" },
      { id: "HB-01633", title: "SIM Registration Amendments Act", topic: "Telecoms", date: "2024-05-27", role: "authored", informs: "civil" },
      { id: "HB-00840", title: "Rice Farmers Price Support Act", topic: "Agriculture", date: "2022-11-14", role: "authored", informs: "economic" },
    ],
  },
  {
    slug: "lim-patricia",
    firstName: "Patricia", lastName: "Lim",
    office: "Representative, 4th District", party: "Lakas ng Bayan", partyAsOf: "2026-06-30",
    municipality: "Cebu City", province: "Cebu", region: "Central Visayas",
    status: "active", ...ASSESS,
    profileLabel: "Center-left",
    summary: "Authored bills on public transport modernization subsidies, a coastal resilience fund and MSME tax relief.",
    caveat: "MSME tax relief may read as market-led; scored as redistributive because it targets small firms.",
    tags: ["Transport", "Climate", "MSMEs"],
    stats: {
      economic: s(-1, "Leans left", "medium", 3, "Bills subsidize jeepney modernization and fund coastal resilience.", ["HB-01299", "HB-02044"]),
      social: fog(0), civil: fog(0),
      democratic: s(0, "Center", "low", 2, "One bill adds audit rules, another expands local executive discretion.", ["HB-02566"]),
    },
    bills: [
      { id: "HB-02566", title: "Local Disaster Fund Discretion Act", topic: "Climate", date: "2025-08-18", role: "authored", informs: "democratic" },
      { id: "HB-02044", title: "Coastal Resilience Fund Act", topic: "Climate", date: "2025-01-30", role: "authored", informs: "economic" },
      { id: "HB-01299", title: "PUV Modernization Subsidy Act", topic: "Transport", date: "2023-11-11", role: "authored", informs: "economic" },
      { id: "HB-00770", title: "MSME Tax Relief Act", topic: "MSMEs", date: "2022-10-20", role: "coauthored" },
    ],
  },
  {
    slug: "mangubat-ernesto",
    firstName: "Ernesto", lastName: "Mangubat",
    office: "Representative, 2nd District", party: "Independent", partyAsOf: "2026-06-30",
    municipality: "Iloilo City", province: "Iloilo", region: "Western Visayas",
    status: "expelled", statusDate: "2026-06-02", ...ASSESS,
    profileLabel: "Unscouted",
    summary: "Co-authored several health bills; authored one bill declaring a local holiday.",
    caveat: "Co-authored bills are discounted, so no axis reaches two distinct issues.",
    tags: ["Health", "Local holidays"],
    stats: { economic: fog(1), social: fog(0), civil: fog(0), democratic: fog(0) },
    bills: [
      { id: "HB-01802", title: "Dinagyang Festival Local Holiday Act", topic: "Local holidays", date: "2024-01-05", role: "authored" },
      { id: "HB-01410", title: "Universal Health Care Amendments", topic: "Health", date: "2023-09-12", role: "coauthored" },
      { id: "HB-00999", title: "Mental Health Services Expansion Act", topic: "Health", date: "2023-04-04", role: "coauthored" },
    ],
  },
  {
    slug: "bautista-ana-teresa",
    firstName: "Ana Teresa", lastName: "Bautista",
    office: "Representative, 1st District", party: "Kilusang Pagbabago", partyAsOf: "2026-06-30",
    municipality: "Baguio City", province: "Benguet", region: "Cordillera Administrative Region",
    status: "active", ...ASSESS,
    profileLabel: "Checks-leaning",
    summary: "Authored bills on open budget data, regional autonomy for the Cordillera and watershed protection.",
    caveat: "Economic axis unscored; watershed bills read as environmental, not economic.",
    tags: ["Transparency", "Regional autonomy", "Environment"],
    stats: {
      economic: fog(1), social: fog(0), civil: fog(0),
      democratic: s(2, "Checks-leaning", "medium", 3, "Bills mandate open budget data and devolve powers to an elected regional body.", ["HB-00620", "HB-01977"]),
    },
    bills: [
      { id: "HB-01977", title: "Open Budget Data Act", topic: "Transparency", date: "2024-11-19", role: "authored", informs: "democratic" },
      { id: "HB-01102", title: "Upper Agno Watershed Protection Act", topic: "Environment", date: "2023-08-08", role: "authored" },
      { id: "HB-00620", title: "Cordillera Regional Autonomy Act", topic: "Regional autonomy", date: "2022-09-27", role: "authored", informs: "democratic" },
    ],
  },
  {
    slug: "torres-miguel",
    firstName: "Miguel", lastName: "Torres",
    office: "Representative, 5th District", party: "Lakas ng Bayan", partyAsOf: "2026-06-30",
    municipality: "Calamba City", province: "Laguna", region: "CALABARZON",
    status: "changed_office", statusDate: "2026-07-01", ...ASSESS,
    profileLabel: "Center-left",
    summary: "Authored bills on industrial worker housing and a rail extension; now serving in another office.",
    caveat: "Record covers House service only; assessment ends at the change of office.",
    tags: ["Housing", "Transport", "Labor"],
    stats: {
      economic: s(-2, "Center-left", "low", 2, "Bills fund worker housing and a state-built rail extension.", ["HB-00888", "HB-01650"]),
      social: fog(0), civil: fog(0), democratic: fog(0),
    },
    bills: [
      { id: "HB-01650", title: "South Commuter Rail Extension Act", topic: "Transport", date: "2024-06-01", role: "authored", informs: "economic" },
      { id: "HB-00888", title: "Industrial Worker Housing Act", topic: "Housing", date: "2022-12-12", role: "authored", informs: "economic" },
    ],
  },
  {
    slug: "ocampo-liza",
    firstName: "Liza", lastName: "Ocampo",
    office: "Representative, 2nd District", party: "Partido Bagong Daan", partyAsOf: "2026-06-30",
    municipality: "Legazpi City", province: "Albay", region: "Bicol Region",
    status: "active", ...ASSESS,
    profileLabel: "Unscouted",
    summary: "No authored bills were found in the evidence window.",
    caveat: "An empty quest log may reflect data gaps rather than inactivity.",
    tags: ["Disaster response"],
    stats: { economic: fog(0), social: fog(0), civil: fog(0), democratic: fog(0) },
    bills: [],
  },
  {
    slug: "salazar-fernando",
    firstName: "Fernando", lastName: "Salazar",
    office: "Representative, 1st District", party: "Kilusang Pagbabago", partyAsOf: "2026-06-30",
    municipality: "Cagayan de Oro", province: "Misamis Oriental", region: "Northern Mindanao",
    status: "active", ...ASSESS,
    profileLabel: "Center, socially conservative-leaning",
    summary: "Authored bills on a national gambling ban near schools, livestock insurance and a provincial airport upgrade.",
    caveat: "Social score from two gambling-related bills; may overstate a single concern.",
    tags: ["Gambling", "Agriculture", "Infrastructure"],
    stats: {
      economic: s(0, "Center", "low", 2, "One subsidy bill, one deregulation bill.", ["HB-01333", "HB-02222"]),
      social: s(-2, "Conservative-leaning", "medium", 2, "Two bills restrict online and land-based gambling.", ["HB-01877", "HB-02499"]),
      civil: fog(0), democratic: fog(0),
    },
    bills: [
      { id: "HB-02499", title: "Online Gambling Prohibition Act", topic: "Gambling", date: "2025-08-01", role: "authored", informs: "social" },
      { id: "HB-02222", title: "Airport Concession Liberalization Act", topic: "Infrastructure", date: "2025-03-03", role: "authored", informs: "economic" },
      { id: "HB-01877", title: "Gambling-Free School Zones Act", topic: "Gambling", date: "2024-10-30", role: "authored", informs: "social" },
      { id: "HB-01333", title: "Livestock Insurance Subsidy Act", topic: "Agriculture", date: "2024-01-22", role: "authored", informs: "economic" },
    ],
  },
] as Member[]).sort((a, b) => a.lastName.localeCompare(b.lastName));

export const fullName = (m: Member) => `${m.firstName} ${m.lastName}`;
export const monogram = (m: Member) => `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
export const getMember = (slug: string) => MEMBERS.find((m) => m.slug === slug);
export const scoredCount = (m: Member) => AXES.filter((a) => m.stats[a.key].score !== null).length;
export const REGIONS = [...new Set(MEMBERS.map((m) => m.region))].sort();
export const TAGS = [...new Set(MEMBERS.flatMap((m) => m.tags))].sort();
export const billUrl = (id: string) =>
  `https://open-congress.bettergov.ph/bills?q=${encodeURIComponent(id)}`;

/** Radar value for a pole: positive pole = 5 + score, negative = 5 - score (pairs sum to 10). */
export const radarValues = (m: Member) =>
  AXES.flatMap((a) => {
    const sc = m.stats[a.key].score;
    return [
      { axis: a, pole: "pos" as const, label: a.posRadar, value: sc === null ? null : 5 + sc },
      { axis: a, pole: "neg" as const, label: a.negRadar, value: sc === null ? null : 5 - sc },
    ];
  });

export const STATUS_TEXT: Record<Status, string> = {
  active: "Active",
  deceased: "Deceased",
  expelled: "Expelled from the House",
  changed_office: "Changed office",
};

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export const ERRATA = [
  { id: "E-003", member: "lim-patricia", date: "2026-10-28", status: "reviewing", text: "Office asked whether the MSME tax relief bill should inform the economic axis.", reply: "" },
  { id: "E-002", member: "santos-rafael", date: "2026-10-15", status: "fixed", text: "HB-01190 was listed as co-authored; corrected to authored.", reply: "Thank you for the correction. — Office of Rep. Santos" },
  { id: "E-001", member: "garcia-benjamin", date: "2026-09-30", status: "declined", text: "Request to remove the civil liberties score.", reply: "", reason: "Score is supported by three linked bills; rationale expanded instead." },
] as const;
