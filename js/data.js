// GATE CSE 2027 Tracker — master plan data (syllabus map js/syllabus.js me hai).

// ---------- PHASE 1: 27 Sep – 30 Nov 2026 (syllabus completion + revision round 1) ----------
// Har din: [NEW subject block, REVISION block]. Sunday = weekly test day.
const PHASE1_WEEKS = [
  {
    start: "2026-09-28", newSubj: "os", revSubj: "c", title: "Week 1 — OS start + C revision",
    days: [
      ["OS: System calls, process states, PCB, fork() counting", "C: data types, operators, precedence, tricky printf outputs"],
      ["OS: Threads (user/kernel), context switch, IPC", "C: control flow, loops, functions, storage classes"],
      ["OS: CPU scheduling FCFS, SJF, SRTF — Gantt charts, avg WT/TAT", "C: pointers, pointer arithmetic, arrays vs pointers"],
      ["OS: Priority, Round Robin, multilevel queue, MLFQ numericals", "C: strings, 2D arrays, pointer to array / array of pointers"],
      ["OS: Critical section, Peterson, test-and-set, busy waiting", "C: recursion & recursion tracing"],
      ["OS: Semaphores (binary/counting), mutex, producer-consumer", "C: structures, unions, malloc, parameter passing, static/dynamic scoping"],
      { test: "WEEKLY TEST: OS (process + scheduling + sync) 25 Q + C 25 Q → analysis → backlog clear" },
    ],
  },
  {
    start: "2026-10-05", newSubj: "os", revSubj: "ds", title: "Week 2 — OS (sync, deadlock, memory) + DS revision",
    days: [
      ["OS: Readers-writers, dining philosophers, monitors + semaphore PYQs", "DS: arrays (row/column major), stacks"],
      ["OS: Deadlock — conditions, RAG, prevention, avoidance", "DS: infix/postfix/prefix, queues, circular queue"],
      ["OS: Banker's algorithm, detection & recovery, min-resource numericals", "DS: linked lists (single/double/circular) code questions"],
      ["OS: Contiguous allocation, fragmentation, paging, page-table size", "DS: binary trees — properties, traversals, counting"],
      ["OS: Multi-level paging, TLB, EAT, inverted page table, segmentation", "DS: BST, AVL rotations & height bounds"],
      ["OS: Virtual memory, demand paging, EAT with page faults", "DS: binary heaps, hashing (chaining, probing)"],
      { test: "WEEKLY TEST: OS (sync + deadlock + memory) + DS full → analysis → backlog clear" },
    ],
  },
  {
    start: "2026-10-12", newSubj: "os", revSubj: "algo", title: "Week 3 — OS finish + Algorithms revision",
    days: [
      ["OS: Page replacement FIFO, Optimal, LRU, Belady's anomaly", "Algo: asymptotic notation, comparing functions"],
      ["OS: Thrashing, working set, frame allocation + paging PYQ marathon", "Algo: recurrences — master theorem, recursion tree"],
      ["OS: File allocation (contiguous/linked/indexed), inode, max file size", "Algo: searching, sorting (stability, in-place, cases), hashing"],
      ["OS: Directory structure, free-space mgmt, disk scheduling (SSTF/SCAN/C-SCAN/LOOK)", "Algo: divide & conquer — merge sort, quick sort, binary search"],
      ["OS: Disk scheduling numericals + OS weak-topic fix", "Algo: greedy + MST (Prim, Kruskal), BFS/DFS, topological sort"],
      ["OS: Full OS PYQ sweep (jo PYQ reh gaye)", "Algo: DP (LCS, knapsack, MCM) + shortest paths (Dijkstra, Bellman-Ford, Floyd)"],
      { test: "SUBJECT TEST: OS full (GATE level, 65 min) + Algo full → analysis. OS ✅ DONE" },
    ],
  },
  {
    start: "2026-10-19", newSubj: "coa", revSubj: "toc", title: "Week 4 — COA start + TOC revision",
    days: [
      ["COA: Machine instructions, instruction formats, addressing modes", "TOC: DFA, NFA, NFA→DFA, minimization"],
      ["COA: Expanding opcodes, CPU performance (CPI, MIPS)", "TOC: regular expressions, RE↔FA, Arden's theorem"],
      ["COA: ALU, datapath, control unit design — hardwired vs microprogrammed (control word/memory size)", "TOC: closure properties, pumping lemma, regular or not"],
      ["COA: Pipelining — stages, speedup, efficiency, throughput", "TOC: CFG, ambiguity, simplification, CNF/GNF"],
      ["COA: Hazards — RAW/WAR/WAW, forwarding, stalls, branch penalty", "TOC: PDA, DPDA vs NPDA, CFL closure, CFL pumping lemma"],
      ["COA: Pipeline numericals PYQ marathon", "TOC: Turing machines, REC/RE, decidability, Rice's theorem"],
      { test: "WEEKLY TEST: COA (instructions + pipeline) + TOC full → analysis → backlog clear" },
    ],
  },
  {
    start: "2026-10-26", newSubj: "coa", revSubj: "cd", title: "Week 5 — COA finish + Compiler Design revision",
    days: [
      ["COA: Memory hierarchy, locality, avg access time (hierarchical vs simultaneous)", "CD: phases, lexical analysis, token counting, FIRST & FOLLOW"],
      ["COA: Cache mapping — direct, associative, set-associative (tag/index/offset)", "CD: left recursion/factoring, LL(1) table, recursive descent"],
      ["COA: Replacement, write-through/write-back, multi-level cache numericals", "CD: LR(0), SLR(1) items, tables, conflicts"],
      ["COA: Cache PYQ marathon (miss counting on array loops)", "CD: CLR(1), LALR(1), parser comparison"],
      ["COA: Memory interfacing — chips needed, address decoding, interleaving", "CD: SDT — S-attributed, L-attributed, evaluation questions"],
      ["COA: I/O — programmed, interrupt, DMA (cycle stealing / burst)", "CD: runtime env, 3AC, SSA, DAG, basic blocks, CFG"],
      { test: "CD: liveness, constant propagation, CSE (1.5 h) → SUBJECT TEST: COA full + CD full. COA ✅ DONE" },
    ],
  },
  {
    start: "2026-11-02", newSubj: "dm", revSubj: "dbms", title: "Week 6 — Discrete (logic, sets, algebra) + DBMS revision",
    days: [
      ["DM: Propositional logic — tautology, equivalences, normal forms", "DBMS: ER model, ER→relational, keys"],
      ["DM: Inference rules, validity, first-order logic (translation, negation)", "DBMS: FDs, closure, candidate keys, minimal cover"],
      ["DM: Sets, relations — properties, counting relations, equivalence, partitions", "DBMS: normal forms, lossless & dependency-preserving decomposition"],
      ["DM: Functions counting, POSETs, Hasse diagrams", "DBMS: relational algebra, tuple relational calculus"],
      ["DM: Lattices — distributive, complemented, boolean algebra", "DBMS: SQL — joins, nested/correlated, group by/having, NULLs"],
      ["DM: Monoids, groups, subgroups, Lagrange, cyclic groups", "DBMS: transactions, serializability, recoverability"],
      { test: "DBMS: concurrency control + B/B+ tree indexing (2 h) → WEEKLY TEST: DM (logic+sets+algebra) + DBMS full" },
    ],
  },
  {
    start: "2026-11-09", newSubj: "dm", revSubj: "cn", title: "Week 7 — Discrete (graphs, combinatorics) + CN revision",
    days: [
      ["DM: Graph basics — degree, handshake, isomorphism, connectivity, cut vertex/edge", "CN: OSI/TCP-IP, switching, delay calculations"],
      ["DM: Euler & Hamiltonian, planar graphs (Euler formula), trees", "CN: framing, CRC/checksum/Hamming, stop-and-wait, GBN, SR"],
      ["DM: Colouring, matching, vertex/edge cover, independent set", "CN: ALOHA, CSMA/CD min frame size, Ethernet, bridges"],
      ["DM: Counting, P&C, pigeonhole, inclusion-exclusion", "CN: IPv4, subnetting, CIDR, longest prefix match"],
      ["DM: Recurrence relations (solve + form recurrences)", "CN: IPv4 header, fragmentation offsets, NAT (ARP/DHCP/ICMP sirf one-liner)"],
      ["DM: Generating functions + Discrete full PYQ sweep", "CN: routing (DV, LS, count-to-infinity), TCP header & handshake"],
      { test: "CN: TCP congestion control, socket API, DNS & HTTP (2 h) → SUBJECT TEST: Discrete full + CN full. Discrete ✅ DONE" },
    ],
  },
  {
    start: "2026-11-16", newSubj: "ga", revSubj: "dl", title: "Week 8 — General Aptitude + Digital + Linear Algebra",
    days: [
      ["GA: number system, percentages, ratio, averages, mixtures", "DL: Boolean algebra, K-maps, prime implicants, Quine-McCluskey (new 2027)"],
      ["GA: time & work, speed/distance, profit/loss, powers/logs", "DL: MUX (function implementation), decoder, adders"],
      ["GA: P&C, probability, mensuration, geometry, DI", "DL: flip-flops, counters, registers, FSMs"],
      ["GA: grammar, vocabulary, sentence completion, RC", "DL: number systems, complements, IEEE 754 floating point"],
      ["GA: logical reasoning, arrangements, syllogisms, analogies", "EM: matrices, rank, determinants, system of equations"],
      ["GA: spatial (paper folding, patterns) + 10 years GA PYQs", "EM: eigenvalues/vectors, LU decomposition"],
      { test: "WEEKLY TEST: GA section of 3 PYQ papers + Digital full + Linear Algebra" },
    ],
  },
  {
    start: "2026-11-23", newSubj: null, revSubj: "em", title: "Week 9 — Backlog, weak areas + Calculus & Probability",
    days: [
      ["2nd pass: OS weak topics (error log se)", "EM: limits, continuity, differentiability"],
      ["2nd pass: COA cache + pipeline", "EM: maxima/minima, MVT, integration"],
      ["2nd pass: Discrete weak parts", "EM: probability basics, conditional, Bayes"],
      ["Backlog clear + har subject ke short notes complete", "EM: random variables, expectation, variance, distributions"],
      ["Formula sheet har subject ka (1-2 page)", "EM: statistics + probability PYQs"],
      { test: "GRAND TEST 1: full-length GATE mock (3 h) + detailed analysis" },
      { test: "Grand Test 1 ki galtiyan fix + weak topics re-read + error log revision" },
    ],
  },
];

const SPECIAL_DAYS = {
  "2026-09-27": {
    title: "Day 0 — Setup + Diagnostic",
    tasks: [
      ["setup", "Tracker setup: Syllabus tab me Discrete ke jo topics ho gaye unko 'Learned' tick karo"],
      ["diag", "Diagnostic: GATE CSE 2025 (ya 2024) paper 3 hour me attempt karo — Mocks tab me score dalo"],
      ["analysis", "Paper analysis: har galat question Error Log me daalo"],
      ["notes", "OS ke notes ready rakho (kal se OS start)"],
    ],
  },
  "2026-11-30": {
    title: "🎯 SYLLABUS COMPLETE DAY",
    tasks: [
      ["mock", "GRAND TEST 2: full-length mock (3 h)"],
      ["analysis", "Analysis + Syllabus tab me check: koi topic 'Learned' bina tick ke to nahi?"],
      ["plan", "Phase 2 ka plan dekho — kal se Revision Round 2 + subject tests"],
    ],
  },
};

// ---------- PHASE 2: 1 Dec 2026 – 10 Jan 2027 (Revision round 2 + subject tests) ----------
const PHASE2_BLOCKS = [
  { from: "2026-12-01", to: "2026-12-04", subj: ["c", "ds"], label: "C + Data Structures" },
  { from: "2026-12-05", to: "2026-12-08", subj: ["algo"], label: "Algorithms" },
  { from: "2026-12-09", to: "2026-12-11", subj: ["toc"], label: "TOC" },
  { from: "2026-12-12", to: "2026-12-13", subj: ["cd"], label: "Compiler Design" },
  { from: "2026-12-14", to: "2026-12-17", subj: ["os"], label: "Operating Systems" },
  { from: "2026-12-18", to: "2026-12-21", subj: ["coa"], label: "COA" },
  { from: "2026-12-22", to: "2026-12-24", subj: ["dbms"], label: "DBMS" },
  { from: "2026-12-25", to: "2026-12-27", subj: ["cn"], label: "Computer Networks" },
  { from: "2026-12-28", to: "2026-12-29", subj: ["dl"], label: "Digital Logic" },
  { from: "2026-12-30", to: "2027-01-02", subj: ["dm"], label: "Discrete Maths" },
  { from: "2027-01-03", to: "2027-01-05", subj: ["em"], label: "Engineering Maths" },
  { from: "2027-01-06", to: "2027-01-07", subj: ["ga"], label: "General Aptitude" },
  { from: "2027-01-08", to: "2027-01-10", subj: [], label: "Weak areas + multi-subject tests" },
];

const PHASE3_START = "2027-01-11";

const DAILY_TIMETABLE = [
  ["06:00 – 06:45", "Aptitude (GA) — 10 PYQs daily + 1 formula page revision"],
  ["07:00 – 10:30", "BLOCK 1: NEW subject — notes Claude ke saath samjho (Pomodoro 50/10)"],
  ["10:30 – 11:00", "Break"],
  ["11:00 – 13:30", "BLOCK 2: REVISION subject — short notes + standard questions"],
  ["13:30 – 15:00", "Lunch + rest (20 min power nap)"],
  ["15:00 – 17:30", "BLOCK 3: PYQs — aaj ke NEW + REVISION topics (25–35 Q, timer ke saath)"],
  ["17:30 – 18:30", "Walk / exercise"],
  ["18:30 – 20:00", "BLOCK 4: Galat PYQs dobara solve + Error Log + short notes update"],
  ["20:00 – 21:00", "Dinner"],
  ["21:00 – 22:00", "Spaced revisions due (Dashboard) + kal ka plan dekho"],
  ["22:30", "Sleep — 7 hours minimum (non-negotiable)"],
];

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
