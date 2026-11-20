# PYQ explanations — progress (resume from here)

Goal: every PYQ in the quiz gets 🏷 subtopic tag, GATE 2027 syllabus tag, 💡 Hint, 📘 Concept (from basics + tips & tricks), ✅ Solution (step by step + references). Language: Hinglish. Answers always follow the official key.

## Done (live on the site)
- [x] 2026 Set 1 — 65/65 (`pyq/explain/2026-1.md`)
- [x] 2026 Set 2 — 65/65 (`pyq/explain/2026-2.md`)

## Next, in this order
- [ ] 2025 Set 1  ← **start here** (figures already checked: Q5 map → (C), Q9 paper folding → (A))
- [ ] 2025 Set 2
- [ ] 2024 Set 1
- [ ] 2024 Set 2
- [ ] 2023
- [ ] 2022
- [ ] 2020
- [ ] 2019
- [ ] 2018
- [ ] 2017 Set 2

## How to add a paper
1. Write `pyq/explain/<paper>.md` (format at the top of `tools/build_explain.py`; one `@@ n` block per question with `syl:`, `== hint`, `== concept`, `== tips`, `== sol`, `== refs`).
2. `python3 tools/build_explain.py <paper>` → `js/explain/<paper>.js` (fails if any section is empty).
3. Smoke test in the browser (quiz → year filter → click Hint / Concept / Solution).
4. Commit, push to `claude/blissful-newton-6x5w6m`, then fast-forward `claude/gifted-fermat-8rnnn7` (that branch deploys the site; the user approved this).

## GATE 2027 syllabus tags (from the IIT Madras CS syllabus PDF)
- `syl: out` — ARP, DHCP, ICMP (network layer lists only IPv4 fragmentation, CIDR, NAT, routing).
- `syl: partial` — disk / secondary-storage timing (not named in COA; OS I/O scheduling covers disk basics); link-layer sliding window / stop-and-wait (data link lists only error detection, MAC, Ethernet; same idea appears under TCP flow control).
- Everything else in the papers so far: `syl: in`.

## Notes
- 2025 CS1 Q44: the official key says (C) (L1 not regular). By the |α| = 1 argument L1 looks regular; keep the official answer and mention the debate in the concept.
- The renderer (`mdLite` in `js/views.js`) supports **bold**, `code`, `-` lists, `1.` lists (indented lines continue a step), `###` headings and fenced code blocks. Single `*italics*` are not supported — don't use them.

## UGC NET Paper 2 explanations (deep format: full topic + "Is topic se aur kya puchha ja sakta hai")
- Done: June 2025 (100/100), Dec 2024 (100/100), June 2024 Re-Exam (100/100)
- Next order: Dec 2023, June 2023, Dec 2022 (Shift II), Dec 2022, Sep 2022, Nov 2021, Nov 2020
- Fixed: Dec 2024 Q93 key changed PW (D) → (B), marked self-solved (option B is the 4-state min DFA)
- Fixed: June 2024 Re-Exam Q41 key PW (A) → (C), self-solved (C and D both can't be BCNF + dependency preserving; A can)
- Fixed: June 2024 Re-Exam Q86 key PW (C) → (A), self-solved (B = Θ(log n) can't match "Θ(n) exact")

## UGC NET Expected Papers — Dec 2026 (Paper 2)
- 3 full sets × 100 MCQ, source: pyq/ugc/expected/2026-12-s{1,2,3}.md → `python3 tools/build_ugc_expected.py`
  (writes js/ugc-expected.js + js/explain/ugc-exp-*.js; validates units, options, answer letter vs solution).
- Blueprint: unit counts = 10-paper average (U1 11, U2 9, U3 10, U4 10, U5 11, U6 10, U7 9, U8 11, U9 11, U10 8);
  two 5-question passages per set (always one OS passage, as in recent papers); answers balanced A–D.
- All questions newly written (no PYQ copied); textbook-classic data replaced with fresh numbers; every numeric
  answer computed/verified with a script. Shown on the UGC NET page as "🔮 Expected Papers".
