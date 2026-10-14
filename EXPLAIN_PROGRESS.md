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
