# 🎯 GATE CSE 2027 Tracker — target AIR 1

Static website (HTML/CSS/JS, koi server nahi) jo GitHub Pages pe chalti hai. Data aapke browser ke localStorage me save hota hai.

**Live site:** https://anshu7372.github.io/GATE_CSE_TRACKER/

## Pages

| Page | Kaam |
|---|---|
| **📊 Dashboard** | Countdown (31 Dec revision deadline, exam), on-track / behind-plan, roz kitne ghante chahiye, subject-wise progress + PYQ accuracy, hours chart, mock trend |
| **📅 Aaj** | **Auto plan**: Track A (naya padhna), Track B (revision + PYQs), GA — har item me topic › subtopic, depth, ghante, aur **kitne PYQs aaj**. Revision due, day log, routine. Sunday = weekly test + backlog |
| **📚 Syllabus** | Official GATE 2027 syllabus → topic → subtopic → points, depth (BASIC/STANDARD/DEEP), PYQ pattern, skip list. Har topic pe **NEW ⇄ REVISE** status (plan apne aap badalta hai), confidence, 🔥 tough, Claude prompt |
| **✍️ PYQ Quiz** | Topic/subtopic/type/year-wise PYQs. MCQ/MSQ/NAT answer do → **page khud check karta hai**; galat pe possible galti, kaunsa topic revise karna hai, Claude prompt; **Error Log + Revision queue me apne aap** |
| **🗺 PYQ Map** | Topic × year heat-map (PYQ bank se) |
| **🗓 Schedule** | Din-ba-din rolling plan, subject timeline (Gantt), buffer week, Sunday plan |
| **🍅 Pomodoro** | 25/5/15 timer, topic logging, hours apne aap day log me |
| **🔁 Revision** | Tough-topic queue (auto: galat PYQ, accuracy <60%, confidence ★1–2, mock weak topics) with 1→3→7→14→30 din spacing + R1/R2/R3 of completed topics |
| **📝 Mocks** | Mock PDF analysis (Claude) + manual log; weak topics apne aap Revision queue me |
| **🗒 Short Notes** | Har topic ke notes + must-know points, .md download / print |
| **❌ Error Log** | Quiz ke galat questions apne aap, "Dobara solve" button |

## Auto-plan kaise kaam karta hai

- Har topic ka status **NEW** (Track A) ya **REVISE** (Track B). Kaam = subtopics (depth ke hisaab se ghante) + us topic ke saare PYQs (~5 min/question).
- Aaj se buffer week tak ke study dino (Sunday chhod ke) me baaki kaam **barabar baant diya jata hai**. Kuch miss hua → baaki dino me apne aap shift; Dashboard batata hai kitna peeche ho.
- Aaj ka plan din bhar ke liye freeze rehta hai (tick karne se reshuffle nahi hota). Status badla to "Re-plan today".
- 25–31 Dec buffer week (grand revision + 2 mocks), 1 Jan se mock phase.

## PYQ bank

`js/pyq-bank.js` me questions (format file ke upar comment me) + `pyq/img/` me question images. Official GATE CSE papers + answer keys se banaya jata hai.

## Security

- CSP: script sirf isi site se; network sirf `api.anthropic.com` (Mocks → Auto analysis). Koi third-party script/CDN nahi (`js/vendor/anthropic-sdk.js` pinned v0.128.0, MIT).
- Saara stored / imported / Claude-generated data validate + HTML-escape hota hai. Clickjacking guard. API key default sirf current tab me, backup me kabhi nahi.

## GitHub Pages
Settings → Pages → Source: **GitHub Actions**. Har push pe `.github/workflows/pages.yml` deploy karta hai.
