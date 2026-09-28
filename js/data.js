// GATE CSE 2027 Tracker — plan configuration (syllabus map js/syllabus.js me hai).
// Plan ab AUTO banta hai (js/core.js → planner): topic ka status (NEW / REVISE) + depth + PYQ count
// se har din ka kaam nikalta hai. Kuch miss hua to baaki kaam apne aap aage ke dino me shift ho jata hai.

// ---- Key dates ----
const PLAN_START = "2026-09-28";   // plan yahan se shuru
const MOCK_PHASE_FROM = "2027-01-01"; // 1 Jan se full-length mock phase

// ---- Aapka current status (28 Sep 2026) ----
// Subject ka default status syllabus.js me hai; yahan topic-level exceptions.
// "new" = abhi padhna hai (Track A), "revise" = padh chuke ho, sirf revision + PYQ (Track B).
// Syllabus tab me har topic pe "Padha hua / Naya" toggle se isse badal sakte ho — plan khud update ho jayega.
const TOPIC_STATUS_OVERRIDES = {
  "em:1": "new",    // Calculus — nahi hua
  "dl:2": "new",    // Sequential circuits — nahi hua
  "dbms:3": "new",  // File organisation & indexing — nahi hua
};
const SUBJECT_STATUS = { // subject-level default (syllabus.js ke status ko override karta hai)
  ga: "new", dm: "new", em: "revise", dl: "revise", coa: "new", c: "revise", ds: "revise",
  algo: "revise", toc: "revise", cd: "revise", os: "new", dbms: "revise", cn: "revise",
};

// ---- Track order ----
// Track A = naya padhna (high-weight pehle). Track B = revision + PYQ. Track G = Aptitude roz.
const TRACK_ORDER = {
  A: ["os", "coa", "dm", "em", "dl", "dbms", "c", "ds", "algo", "toc", "cd", "cn"],
  B: ["c", "ds", "algo", "toc", "cd", "cn", "dbms", "dl", "em", "dm", "os", "coa"],
};

// Hours per subtopic by depth (1 BASIC, 2 STANDARD, 3 DEEP). PYQ = minutes per question incl. checking.
const STUDY_HOURS = { 1: 2, 2: 4, 3: 6 };
const REVISE_HOURS = { 1: 0.5, 2: 1, 3: 1.5 };
const MIN_PER_PYQ = 5;
// PYQ bank aane tak topic ke PYQ count ka andaza (frequency se).
const EST_PYQ = { H: 30, M: 15, L: 6 };

// ---- Daily routine ----
const DAILY_TIMETABLE = [
  ["05:45 – 06:00", "Utho, paani, fresh", "o"],
  ["06:00 – 07:00", "🔁 Revision queue (due topics) + kal ke short notes (2 🍅)", "s"],
  ["07:00 – 09:30", "📘 Track A — naya topic (Claude prompt + notes) (5 🍅)", "s"],
  ["09:30 – 10:00", "Breakfast", "o"],
  ["10:00 – 12:00", "📘 Track A — contd. + usi topic ke PYQs (4 🍅)", "s"],
  ["12:00 – 12:30", "🧩 Aptitude (GA) — aaj ka GA task (1 🍅)", "s"],
  ["12:30 – 13:30", "Lunch + 20 min power nap", "o"],
  ["13:30 – 16:00", "🔁 Track B — revision topic (5 🍅)", "s"],
  ["16:00 – 16:30", "Walk / exercise (phone nahi)", "o"],
  ["16:30 – 18:30", "✍️ Track B — PYQ Quiz (aaj ka target) (4 🍅)", "s"],
  ["18:30 – 19:30", "Snacks + break", "o"],
  ["19:30 – 20:30", "❌ Error Log: galat PYQs dobara + short notes likho (2 🍅)", "s"],
  ["20:30 – 21:30", "Dinner + family", "o"],
  ["21:30 – 22:00", "📝 Tracker update + kal ka plan (Today page) dekho", "s"],
  ["22:15", "Sleep — 7 h (non-negotiable)", "o"],
];

const SUNDAY_PLAN = [
  ["3 h", "Weekly test: is hafte ke topics ke 40 timed PYQs (Quiz → 'Is hafte ke topics' + timer), GATE marking"],
  ["1.5 h", "Test analysis: har galat question dobara solve, Error Log me reason tag karo"],
  ["2.5 h", "Backlog: Dashboard pe jo 'behind' dikhe wo khatam karo"],
  ["2 h", "Weekly revision: is hafte ke saare short notes + Error Log"],
  ["1 h", "GA mixed PYQ set (20 Qs)"],
  ["20 min", "Agle hafte ka Schedule dekho, notes ready rakho"],
];

// GA topic rotation by weekday (0 = Sunday). Index = GA topic index in syllabus.js.
const GA_ROTATION = { 1: 1, 2: 0, 3: 1, 4: 2, 5: 1, 6: 3, 0: 1 };

// Revision deadline se pehle ka last week = buffer (grand revision + mocks). Key = days before deadline.
const BUFFER_PLAN = [
  ["Grand revision 1: C, DS, Algo, TOC ke short notes + Error Log", "Backlog clear"],
  ["Grand revision 2: CD, CN, DBMS, Digital ke short notes + Error Log", "Backlog clear"],
  ["Grand revision 3: OS, COA, Discrete, Maths, GA ke short notes + Error Log", "Weak topics (Revision queue) khatam"],
  ["FULL MOCK 1 (3 h, exam time slot pe) → Mocks page pe analysis upload", "Analysis ke weak topics fix"],
  ["Mock 1 ke galat questions + unke topics dobara", "Formula sheets final"],
  ["Revision queue ke saare 'due' topics + galat PYQs retry (Quiz → Galat wale)", ""],
  ["FULL MOCK 2 → analysis. 🎯 31 Dec: saara syllabus revised + PYQs solved", ""],
];

// January–February mock plan (exam ~6 Feb). Alternate days mock + analysis.
const MOCK_PHASE_RULES = {
  mockDay: ["FULL-LENGTH MOCK (3 h) exam ke time slot pe", "Deep analysis (3 h): Mocks page pe PDF upload → auto analysis", "GA 10 PYQs"],
  fixDay: ["Kal ke mock ke weak topics re-read + unke PYQs (Quiz)", "2 subjects ki formula sheet + short notes", "Error Log + Revision queue due", "GA 10 PYQs"],
};

const CLAUDE_PROMPTS = [
  {
    title: "1. Notes se topic samjho",
    text: `Tum GATE CSE AIR 1 mentor ho. Main tumhe [SUBJECT] – [TOPIC] ke notes de raha hoon.
1) Pehle topic ko Hinglish me simple language me samjhao, intuition ke saath.
2) Har concept ke baad 1 solved GATE-level example do.
3) GATE me is topic se kaise questions aate hain aur common traps kya hain, batao.
4) End me 5 MCQ/MSQ/NAT questions do (answers baad me, jab main maangu).

NOTES:
[yahan notes paste karo / photo attach karo]`,
  },
  {
    title: "2. Doubt clear karo",
    text: `[SUBJECT] – [TOPIC] me mera doubt hai:
[doubt likho]
Mujhe step by step samjhao, aur ek counter-example ya edge case bhi batao jahan students galti karte hain.`,
  },
  {
    title: "3. Mera solution check karo",
    text: `Ye GATE question hai:
[question]
Mera answer: [answer]  Mera approach: [approach]
Check karo sahi hai ya nahi. Galat hai to batao galti concept ki thi ya calculation ki, aur sahi shortcut kya hai.`,
  },
  {
    title: "4. Short notes / formula sheet banao",
    text: `Maine [SUBJECT] – [TOPIC] padh liya hai. Iske GATE-oriented 1-page short notes banao:
- saare formulas
- important results / properties
- PYQ me baar-baar aane wale patterns
- common traps
Bullet points me, revision friendly.`,
  },
  {
    title: "5. Practice test lo",
    text: `Mujhe [SUBJECT] – [TOPIC(S)] par 10 GATE-level questions do (mix: 4 MCQ, 3 MSQ, 3 NAT; difficulty GATE PYQ jaisi).
Answers mat batana. Main answers dunga, phir evaluate karna aur har galat answer ka concept samjhana.`,
  },
  {
    title: "6. Weekly analysis",
    text: `Is hafte mera data:
- Hours studied: [x]
- PYQs attempted/correct: [x/y]
- Test score: [x]
- Error log ki main galtiyan: [list]
Ek GATE topper ki tarah analysis karo: kya theek chal raha hai, kya weak hai, aur agle hafte ke liye 3 specific action points do.`,
  },
];
