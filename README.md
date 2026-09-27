# 🎯 GATE CSE 2027 Tracker — target AIR < 100

Ek static website (sirf HTML/CSS/JS) jo GitHub Pages pe chalti hai. Data aapke browser ke localStorage me save hota hai.

**Live site:** `https://anshu7372.github.io/GATE_CSE_TRACKER/` (Pages enable hone ke baad — neeche steps dekho)

## Kya hai isme

| Tab | Kaam |
|---|---|
| **Aaj** | Aaj ka checklist (auto, date ke hisab se), hours / questions log, spaced revisions due, 14-din ka graph, subject-wise progress |
| **Plan** | 27 Sep 2026 → exam tak day-by-day plan (3 phases) + daily timetable |
| **Syllabus** | Official GATE 2027 CS syllabus (IIT Madras) → Topic → Subtopic → points. Har subtopic pe **depth** (BASIC / STANDARD / DEEP), **PYQ frequency**, **PYQ pattern**, aur **kya skip karna hai**. Har topic pe **🤖 Claude prompt** + **PYQs ↗** (GATE Overflow) |
| **Mocks** | Mock scores + trend graph (target line 75) |
| **Error Log** | Har galat question — type (concept/silly/calc/time) ke saath |
| **Claude** | Claude se padhne ke prompts |
| **⚙️** | Exam date, targets, backup export/import |

## Plan (short)

- **Phase 1 (27 Sep → 30 Nov):** New subjects — OS (3 hafte), COA (2 hafte), Discrete ka baaki hissa (2 hafte), Aptitude (1 hafta), + roz done subjects ka Revision Round 1 + PYQs. **30 Nov = syllabus complete.**
- **Phase 2 (1 Dec → 10 Jan):** Revision Round 2, PYQ 2nd pass, har subject ka test, har Sunday full mock.
- **Phase 3 (11 Jan → exam):** Alternate din full-length mock + analysis. Last 7 din sirf formula sheets + error log.

## Claude ke saath kaise padhna hai

1. Syllabus tab → topic → **🤖 Claude prompt** dabao (copy ho jayega).
2. Claude me paste karo + apne notes attach karo.
3. Prompt me har subtopic ki exact depth, compulsory points, PYQ pattern aur skip list hai. Isliye Claude na zyada padhayega, na kam. End me coverage checklist, PYQ drill aur new-type questions bhi aayenge.
4. Phir **PYQs ↗** se actual GATE PYQs solve karo → tabhi "Learned" + "PYQs ✓" tick karo.

## GitHub Pages enable karna (ek baar)

1. Repo → **Settings → Pages**.
2. **Source: GitHub Actions** choose karo.
3. **Actions** tab → "Deploy tracker to GitHub Pages" → **Run workflow** (ya koi bhi push).
4. 1–2 minute baad site `https://anshu7372.github.io/GATE_CSE_TRACKER/` pe live ho jayegi.

> Note: GATE 2027 syllabus me CS ke 3 sections badle hain: Digital Logic me Quine-McCluskey add hua; COA me control unit design aur memory interfacing explicit hue, secondary storage hata; CN me ARP/DHCP/ICMP/UDP/SMTP/FTP/email ab named nahi hain. Tracker me ye already reflect hai (low priority mark kiya hai).
