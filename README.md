# 🎯 GATE CSE 2027 Tracker — target AIR < 100

Ek static website (sirf HTML/CSS/JS) jo GitHub Pages pe chalti hai. Data aapke browser ke localStorage me save hota hai.

**Live site:** `https://anshu7372.github.io/GATE_CSE_TRACKER/` (Pages enable hone ke baad — neeche steps dekho)

## Kya hai isme

| Tab | Kaam |
|---|---|
| **Aaj** | Aaj ka checklist (auto, date ke hisab se), hours / questions log, spaced revisions due, 14-din ka graph, subject-wise progress |
| **Plan** | 27 Sep 2026 → exam tak day-by-day plan (3 phases) + daily timetable |
| **Syllabus** | Official GATE 2027 CS syllabus (IIT Madras) → Topic → Subtopic → points. Har subtopic pe **depth** (BASIC / STANDARD / DEEP), **PYQ frequency**, **PYQ pattern**, aur **kya skip karna hai**. Har topic pe **🤖 Claude prompt** + **PYQs ↗** (GATE Overflow) |
| **Mocks** | **🔬 Mock paper analysis:** question paper + result PDF upload → har question ka status, reason (padha nahi / concept galat / approach nahi bana / silly / calculation / time), topic-wise diagnosis, marks kahan gaye, 7-din ka action plan. 1 click me Mocks list, Error Log aur weak topics me add. Saath me manual mock entry + trend graph |
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

## Mock analysis kaise karein

- **Tareeka 1 (Auto):** ⚙️ Settings me Claude API key daalo (console.anthropic.com se; ye API billing hai, claude.ai subscription/credit se alag, ~$0.5–1.5 per mock). Mocks tab → PDF choose → **⚡ Auto analysis**.
- **Tareeka 2 (free, claude.ai se):** Mocks tab → **📋 Prompt copy** → claude.ai me PDF attach + prompt paste → Claude ka JSON wapas website me paste → **📊 Show analysis**.

Dono me tumhara Syllabus tab ka status saath jaata hai, isliye "padha hi nahi" aur "padha par galat hua" alag-alag pehchana jaata hai.

## GitHub Pages enable karna (ek baar)

1. Repo → **Settings → Pages**.
2. **Source: GitHub Actions** choose karo.
3. **Actions** tab → "Deploy tracker to GitHub Pages" → **Run workflow** (ya koi bhi push).
4. 1–2 minute baad site `https://anshu7372.github.io/GATE_CSE_TRACKER/` pe live ho jayegi.

> Note: GATE 2027 syllabus me CS ke 3 sections badle hain: Digital Logic me Quine-McCluskey add hua; COA me control unit design aur memory interfacing explicit hue, secondary storage hata; CN me ARP/DHCP/ICMP/UDP/SMTP/FTP/email ab named nahi hain. Tracker me ye already reflect hai (low priority mark kiya hai).

## Security

- **Koi server / login nahi:** saara data sirf aapke browser (localStorage) me rehta hai.
- **Content Security Policy:** script sirf isi site se chalti hai; network request sirf `api.anthropic.com` pe ja sakti hai (Auto analysis ke liye). Koi third-party script/CDN nahi.
- **Claude SDK vendored:** `js/vendor/anthropic-sdk.js` (@anthropic-ai/sdk v0.128.0, MIT) repo me pinned hai.
- **Untrusted data sanitised:** imported backup, pasted/API se aaya Claude JSON — sab validate + HTML-escape hota hai. PDF ke andar likhe instructions ko ignore karne ka rule prompt me hai.
- **API key:** default sirf current tab (sessionStorage) me; "Remember" pe hi localStorage me. Backup file me kabhi nahi jaati. console.anthropic.com pe spend limit set karo.
- **Clickjacking guard:** site kisi dusri site ke iframe me nahi chalti.
- **Deploy:** workflow minimum permissions ke saath sirf site files publish karta hai.
