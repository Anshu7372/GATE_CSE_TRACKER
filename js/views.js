// GATE CSE 2027 Tracker — page renderers (HTML strings). Every dynamic value goes through esc().
"use strict";

const ui = {
  view: "dashboard", date: today(), syllFilter: "all", open: new Set(), openT: new Set(), errFilter: "all", notesSubj: "os",
  quiz: { f: { sid: "", key: "", sj: "", ty: "", st: "new", y1: "", y2: "", order: "year" }, list: null, idx: 0, t0: 0, res: null, given: "", guess: false, done: [] },
};

const NAV = [
  ["dashboard", "📊", "Dashboard"], ["today", "📅", "Aaj"], ["syllabus", "📚", "Syllabus"], ["quiz", "✍️", "PYQ Quiz"],
  ["pyqmap", "🗺", "PYQ Map"], ["schedule", "🗓", "Schedule"], ["pomodoro", "🍅", "Pomodoro"], ["revision", "🔁", "Revision"],
  ["mocks", "📝", "Mocks"], ["notes", "🗒", "Short Notes"], ["errors", "❌", "Error Log"], ["claude", "🤖", "Claude"], ["settings", "⚙️", "Settings"],
];

// ---------- small UI helpers ----------
const bar = (p, cls = "") => `<div class="bar ${cls}"><span style="width:${Math.max(0, Math.min(100, +p || 0))}%"></span></div>`;
const statusChip = (s) => ({ revise: '<span class="chip ok">Revise</span>', partial: '<span class="chip warn">Partial</span>', new: '<span class="chip new">New</span>' }[s] || "");
const freqChip = (f) => `<span class="chip f${esc(f)}">PYQ: ${esc(FREQ_LABEL[f])}</span>`;
const depthChip = (d) => `<span class="depth d${+d}" title="${esc(DEPTH_HELP[d])}">${esc(DEPTH_LABEL[d])}</span>`;
const topicName = (key) => (TOPIC[key] ? `${TOPIC[key].s.name} › ${TOPIC[key].n}` : key);
const safeImg = (p) => (typeof p === "string" && /^pyq\/img\/[\w.-]+\.(png|webp|jpg|jpeg|svg)$/.test(p) ? p : "");
const pageHead = (title, sub) => `<div class="page-head"><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>`;

function hbars(rows, max, unit = "") {
  if (!rows.length) return '<p class="muted">Abhi data nahi.</p>';
  return rows.map((r) => `<div class="lost-row"><span>${esc(r.label)}</span>${bar((r.value / Math.max(1e-9, max)) * 100, r.cls || "")}<b>${esc(r1d(r.value))}${unit}</b></div>`).join("");
}
function hoursChart(days = 14) {
  const td = today(), tgt = state.settings.hoursTarget;
  let html = "", tot = 0;
  for (let k = days - 1; k >= 0; k--) {
    const ds = addDays(td, -k), h = r1d(hoursOn(ds)); tot += h;
    html += `<div class="hb" title="${esc(fmt(ds))}: ${h} h"><div class="hb-fill ${h >= tgt ? "hit" : ""}" style="height:${Math.min(100, (h / Math.max(tgt, 1)) * 100)}%"></div><small>${parse(ds).getDate()}</small></div>`;
  }
  return { html: `<div class="hbars">${html}</div>`, tot: r1d(tot) };
}

// ---------- Claude topic prompt ----------
function buildPrompt(key) {
  const tp = TOPIC[key], s = tp.s, isNew = tStatus(key) === "new";
  const lines = tp.subs.map((x, j) => `${j + 1}. ${x.n}  [DEPTH: ${DEPTH_LABEL[x.d]} · PYQ frequency: ${FREQ_LABEL[x.f]}]
   Cover karo: ${x.pts.join("; ")}
   PYQ pattern: ${x.pyq}${x.skip ? `\n   SKIP (itna deep mat jao): ${x.skip}` : ""}`).join("\n");
  const mode = isNew
    ? `MODE: NAYA TOPIC — maine ye pehle nahi padha. Basics se shuru karo.`
    : `MODE: REVISION — maine ye topic pehle padha hai. Har subtopic ka fast recap (key idea + formula + trap), phir seedha PYQ-level practice. Basics tabhi detail me jab main atkun.`;
  return `Tum GATE CSE AIR 1 mentor ho. Mujhe GATE CSE 2027 ke liye padhao.
SUBJECT: ${s.name}
TOPIC: ${tp.n}
Official GATE 2027 syllabus line: ${s.official}
${mode}

DEPTH LEVELS ka matlab:
- BASIC = definitions + direct formula, 1-mark conceptual level tak. Zyada deep mat jana.
- STANDARD = saare standard GATE PYQ types solve kar saku, numericals with speed.
- DEEP = high-frequency 2-mark area: har variation, edge case, trap aur shortcut.

SUBTOPICS — ye COMPLETE list hai (isi depth tak padhana — na zyada, na kam):
${lines}

STRICT RULES:
- Upar ka HAR point COMPULSORY hai — ek bhi miss nahi hona chahiye.
- DEPTH se zyada mat jao, aur SKIP wali cheezein bilkul mat padhao (time kam hai).
- GATE 2027 syllabus ke bahar kuch nahi.

Kaise padhana hai (step by step, ek subtopic ek baar me):
1) Subtopic Hinglish me simple language me samjhao — intuition + 1 solved GATE-level example.
2) Har formula/result ke saath "kyun" (1-2 line) batao, taaki rata na lagana pade aur naya question bhi solve ho sake.
3) Common traps + shortcut/trick jo exam me time bachaye.
4) Har subtopic ke baad 2 quick check questions do; mera answer check karke hi aage badho.

Topic khatam hone ke baad:
5) COVERAGE CHECKLIST: upar ke har point ke saamne ✅ lagao aur confirm karo ki sab cover hua. Kuch reh gaya ho to pehle wo padhao.
6) PYQ DRILL: is topic ke GATE PYQ patterns ke hisab se 10 GATE-style questions do — MCQ/MSQ/NAT mix, DEEP subtopics se zyada. Answers tab tak mat batana jab tak main na maangu. Uske baad main tracker ke PYQ Quiz me actual PYQs solve karunga.
7) NEW-TYPE READINESS: 3 "unseen" type ke questions do jo GATE PYQs se alag hon (2 concepts mix, twisted wording, ya naya scenario) — syllabus ke andar hi.
8) 10-line revision summary + formula box (short notes ke liye).

Topic tab COMPLETE maana jayega jab: checklist me sab ✅, PYQ drill me 80%+ sahi, aur new-type questions me approach sahi ho.

Mere notes (agar attach kiye hain) unhe base banao:
[yahan notes paste/attach karo]`;
}

// ---------- subject stats ----------
function subjStats(sid) {
  const keys = SUBJ[sid].topics.map((_, i) => `${sid}:${i}`);
  let pt = 0, pa = 0, pc = 0, pb = 0, est = false;
  keys.forEach((k) => { const p = topicPyq(k); pt += p.total; pa += p.att; pc += p.cor; pb += p.batt; if (p.est) est = true; });
  const fullH = sum(keys.flatMap((k) => workItems(k, true)).map((x) => x.h));
  const remH = sum(keys.flatMap((k) => workItems(k, false)).map((x) => x.h));
  return { n: keys.length, done: keys.filter(conceptDone).length, pt, pa, pc, pb, est, readiness: pct(fullH - remH, fullH), remH, status: subjStatus(sid) };
}

// ======================= DASHBOARD =======================
function viewDashboard() {
  const S = state.settings, td = today();
  const ps = progressSummary();
  const allT = ALL_TOPICS.length, doneT = ALL_TOPICS.filter((t) => conceptDone(t.key)).length;
  let pa = 0, pt = 0, pc = 0;
  let pb = 0;
  ALL_TOPICS.forEach((t) => { const p = topicPyq(t.key); pa += p.att; pt += p.total; pc += p.cor; pb += p.batt; });
  const hc = hoursChart();
  const behind = r1d(ps.behind);
  const onTrack = behind <= 2;
  const lastMock = state.mocks.length ? [...state.mocks].sort((a, b) => (a.date < b.date ? 1 : -1))[0] : null;
  const rows = SUBJECTS.map((s) => {
    const st = subjStats(s.id);
    return `<tr><td><a href="#syllabus" data-opensubj="${esc(s.id)}">${esc(s.name)}</a> ${statusChip(st.status)}</td>
      <td class="num">${st.done}/${st.n}</td><td class="num">${st.pa}/${st.pt}${st.est ? "*" : ""}</td><td class="num">${st.pb ? pct(st.pc, st.pb) + "%" : "—"}</td>
      <td class="num">${r1d(st.remH)} h</td><td class="wide">${bar(st.readiness)}</td></tr>`;
  }).join("");
  const due = dueRev().length + spacedDue(td).length;
  const pendingErr = state.errors.filter((e) => !e.revised).length;
  const tp = phaseOf(td) === "study" ? todayPlan() : null;
  const todayItems = tp ? [...tp.A, ...tp.B, ...tp.G] : [];
  const todayDone = todayItems.filter(pieceDone).length;
  return `${pageHead("📊 Dashboard", `${S.name ? esc(S.name) + " · " : ""}Target: AIR 1 · Revision deadline ${esc(fmt(deadline()))}`)}
  <section class="grid kpis">
    <div class="card kpi"><div class="kpi-n">${Math.max(0, diffDays(deadline(), td))}</div><div class="kpi-l">din — sab revise + PYQs (${esc(fmt(deadline()))})</div></div>
    <div class="card kpi"><div class="kpi-n">${Math.max(0, diffDays(S.examDate, td))}</div><div class="kpi-l">din — GATE exam (${esc(fmt(S.examDate))})</div></div>
    <div class="card kpi"><div class="kpi-n">${pct(doneT, allT)}%</div><div class="kpi-l">topics complete (${doneT}/${allT})</div></div>
    <div class="card kpi"><div class="kpi-n">${pa}</div><div class="kpi-l">PYQs solved / ${pt}${BANK_YEARS.length < PYQ_TARGET_YEARS ? " (kuch est.)" : ""} · quiz acc ${pct(pc, pb)}%</div></div>
    <div class="card kpi"><div class="kpi-n">🔥 ${streak()}</div><div class="kpi-l">day streak</div></div>
    <div class="card kpi"><div class="kpi-n">${lastMock ? esc(lastMock.marks) : "—"}</div><div class="kpi-l">last mock (target ${esc(S.mockTarget)}+)</div></div>
  </section>
  <section class="grid two">
    <div class="card ${onTrack ? "ok-card" : "bad-card"}">
      <h2>${onTrack ? "✅ On track" : "⚠️ Plan se peeche"}</h2>
      <p>${onTrack ? `Plan ke hisaab se chal rahe ho${behind < -2 ? ` (≈${-behind} h aage)` : ""}.` : `Plan se <b>≈${behind} h</b> peeche ho. Plan apne aap aage adjust ho gaya hai — ab roz <b>${r1d(ps.needPerDay)} h</b> chahiye. Sunday ka backlog slot use karo.`}</p>
      <div class="lost-row"><span>Kaam done</span>${bar(pct(ps.actual, ps.totalH), "ok")}<b>${pct(ps.actual, ps.totalH)}%</b></div>
      <div class="lost-row"><span>Plan ke hisaab se ab tak</span>${bar(pct(ps.expected, ps.totalH))}<b>${pct(ps.expected, ps.totalH)}%</b></div>
      <p class="muted">Baaki kaam: ${r1d(ps.remH)} h · ${ps.daysLeft} study din (Sunday chhod ke) · roz ~${r1d(ps.needPerDay)} h (target ${esc(S.hoursTarget)} h incl. revision)</p>
      ${ps.needPerDay > S.hoursTarget - 1 ? `<p class="warn-text">Load zyada hai: roz ${r1d(ps.needPerDay)} h plan-work + ~1 h revision. Hours badhao ya Sundays ka backlog slot poora use karo.</p>` : ""}
    </div>
    <div class="card">
      <h2>🎯 Aaj kya karna hai</h2>
      <ul class="rules">
        ${tp ? `<li><b>${todayDone}/${todayItems.length}</b> plan items done — <a href="#today">Aaj ka plan kholo</a></li>` : `<li><a href="#today">Aaj ka plan</a> (${esc(phaseOf(td))})</li>`}
        <li><b>${due}</b> revisions due — <a href="#revision">Revision</a></li>
        <li><b>${pendingErr}</b> galat questions revise karne baaki — <a href="#errors">Error Log</a></li>
        ${HAS_BANK ? `<li><a href="#quiz">PYQ Quiz</a>: ${BANK.length - Object.keys(state.quiz).filter((k) => QBYID[k]).length} questions baaki</li>` : `<li>PYQ bank abhi khaali — PDFs milte hi Quiz me questions aa jayenge</li>`}
      </ul>
    </div>
  </section>
  <section class="card"><h2>📚 Subject-wise progress</h2>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Subject</th><th>Topics done</th><th>PYQs</th><th>Accuracy</th><th>Baaki kaam</th><th>Readiness</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${HAS_BANK ? "" : '<p class="tiny">* PYQ count andaza hai (frequency se) — PYQ bank upload hone pe asli count aayega.</p>'}
  </section>
  <section class="grid two">
    <div class="card"><h2>⏱ Last 14 days <span class="count">${hc.tot} h</span></h2>${hc.html}<p class="muted">Pomodoro se apne aap + manual log. Green = target (${esc(S.hoursTarget)} h) hit.</p></div>
    <div class="card"><h2>📈 Mock trend</h2>${mockChart()}</div>
  </section>`;
}

// ======================= TODAY =======================
function qChip(id) {
  const q = QBYID[id]; if (!q) return "";
  const a = state.quiz[id], sub = TOPIC[`${q.sid}:${q.ti}`].subs[q.sj];
  return `<button class="qchip ${a ? (a.ok ? "ok" : "bad") : ""}" data-qretry="${esc(id)}" title="${esc(sub ? sub.n : "")}">${a ? (a.ok ? "✓ " : "✗ ") : ""}${esc(q.y)}${q.set ? "-" + esc(q.set) : ""} ${esc(qLabel(q))} <small>${+q.m}M ${esc(q.ty)}</small></button>`;
}
function pieceRow(p, live) {
  const tp = TOPIC[p.key]; if (!tp) return "";
  const done = pieceDone(p), k = esc(p.key);
  if (p.kind === "sub") {
    const x = tp.subs[p.j]; if (!x) return "";
    const nq = (QBYTOPIC[p.key] || []).filter((q) => q.sj === p.j).length;
    return `<div class="piece ${done ? "done" : ""}">
      ${live ? `<input type="checkbox" data-subck="${k}:${+p.j}" ${subDone(p.key, p.j) ? "checked" : ""} aria-label="Done">` : ""}
      <div class="piece-b"><div><b>${tStatus(p.key) === "new" ? "📘 Padho" : "🔁 Revise"}:</b> ${esc(tp.s.name)} › ${esc(tp.n)} › <b>${esc(x.n)}</b></div>
        <div class="depth-line">${depthChip(x.d)} <span>${esc(DEPTH_HELP[x.d])}</span> ${freqChip(x.f)}</div>
        <ul class="pts">${x.pts.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="meta"><b>PYQ me aise aata hai:</b> ${esc(x.pyq)}</div>
        ${x.skip ? `<div class="meta skip"><b>Skip (itna deep nahi):</b> ${esc(x.skip)}</div>` : ""}
        ${nq ? `<div class="meta">Is subtopic ke ${nq} PYQs quiz bank me hain — padhne ke baad wale ✍️ PYQ block me.</div>` : ""}</div>
      <em>${r1d(p.h)} h</em><button class="btn ghost sm" data-prompt="${k}" title="Claude prompt copy">🤖</button></div>`;
  }
  const ids = Array.isArray(p.ids) ? p.ids : [], go = Array.isArray(p.ids) ? p.go : +p.n;
  const ps = topicPyq(p.key);
  return `<div class="piece ${done ? "done" : ""}">
    ${go && live ? `<input type="checkbox" data-pyqflag="${k}" ${getT(p.key).pyq ? "checked" : ""} aria-label="GO wale PYQs done" title="Baaki saalon ke PYQs (GATE Overflow) ho gaye">` : "<span></span>"}
    <div class="piece-b"><div><b>✍️ PYQs: ${+p.n} questions</b> — ${esc(tp.s.name)} › ${esc(tp.n)}${tp.subs[p.j] ? ` › <b>${esc(tp.subs[p.j].n)}</b>` : ""}</div>
      ${ids.length ? `<div class="qchips">${ids.map(qChip).join("")}</div>` : ""}
      ${go ? `<div class="tiny">+ ~${go} questions un saalon se jo abhi bank me nahi — GATE Overflow (GO ↗) se karo, phir ☑ tick.</div>` : ""}
      ${ps.batt ? `<div class="tiny">Is topic ki accuracy: ${ps.acc}% (${ps.cor}/${ps.batt})</div>` : ""}</div>
    <em>${r1d(p.h)} h</em>
    <span class="btn-row">${ids.length ? `<button class="btn sm" data-qids="${esc(ids.join(","))}">▶ Ye ${ids.length} karo</button>` : ""}${go ? `<a class="btn ghost sm" href="${esc(goSearch(tp.n))}" target="_blank" rel="noopener">GO ↗</a>` : ""}</span></div>`;
}
function daySummary(plan, live) {
  const all = [...plan.A, ...plan.B, ...plan.G];
  const subs = all.filter((p) => p.kind === "sub"), pyq = all.filter((p) => p.kind === "pyq");
  const ids = pyq.flatMap((p) => p.ids || []), go = sum(pyq.map((p) => (Array.isArray(p.ids) ? p.go : p.n)));
  const nQ = sum(pyq.map((p) => +p.n)), h = r1d(sum(all.map((p) => p.h)));
  const doneQ = ids.filter((id) => state.quiz[id]).length;
  const rows = all.map((p) => {
    const t = TOPIC[p.key], x = t.subs[p.j];
    if (p.kind === "sub") return x ? `<tr><td>${tStatus(p.key) === "new" ? "📘 Padho" : "🔁 Revise"}</td><td>${esc(t.s.name)} › ${esc(t.n)} › <b>${esc(x.n)}</b></td><td>${depthChip(x.d)}</td><td class="num">${r1d(p.h)} h</td></tr>` : "";
    const g = Array.isArray(p.ids) ? p.go : p.n;
    return `<tr><td>✍️ PYQ</td><td>${esc(t.s.name)} › ${esc(t.n)}${x ? " › " + esc(x.n) : ""}</td><td>${(p.ids || []).length} quiz${g ? ` + ${g} GO` : ""}</td><td class="num">${r1d(p.h)} h</td></tr>`;
  }).join("");
  return `<section class="card"><h2>🎯 ${live ? "Aaj ka poora target" : "Is din ka target"}</h2>
    <div class="grid kpis">
      <div class="kpi"><div class="kpi-n">${h} h</div><div class="kpi-l">plan ka kaam (+ revision ~1 h)</div></div>
      <div class="kpi"><div class="kpi-n">${subs.length}</div><div class="kpi-l">subtopics padhne/revise karne</div></div>
      <div class="kpi"><div class="kpi-n">${nQ}</div><div class="kpi-l">PYQs (${ids.length} quiz me${go ? ` + ${go} GO` : ""})${live && ids.length ? ` · ${doneQ} done` : ""}</div></div>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Kaam</th><th>Topic › Subtopic</th><th>Depth / Qs</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${ids.length ? `<div class="pills"><button class="btn" data-qids="${esc(ids.join(","))}">▶ ${live ? "Aaj" : "Is din"} ke saare ${ids.length} PYQs</button></div>` : ""}
    <p class="tiny">Order: pehle subtopic padho (depth tak, Claude prompt 🤖 se) → phir usi topic ke PYQs. Depth: BASIC = definition + direct formula, STANDARD = saare PYQ types, DEEP = har variation + traps.</p></section>`;
}
function trackCard(title, pieces, live, hint) {
  const h = r1d(sum(pieces.map((p) => p.h))), done = pieces.filter(pieceDone).length;
  return `<div class="card"><h2>${title} <span class="count">${h} h · ${done}/${pieces.length}</span></h2>
    ${pieces.length ? pieces.map((p) => pieceRow(p, live)).join("") : `<p class="muted">${hint || "Is track me aaj kuch nahi — backlog / Revision queue karo."}</p>`}</div>`;
}
function checklist(prefix, items) {
  const d = (state.days[ui.date] || {}).tasks || {};
  return `<div class="tasks">${items.map((it, i) => `<label class="task ${d[prefix + i] ? "done" : ""}"><input type="checkbox" data-task="${esc(prefix + i)}" ${d[prefix + i] ? "checked" : ""}><span>${esc(Array.isArray(it) ? it[1] : it)}</span>${Array.isArray(it) ? `<em>${esc(it[0])}</em>` : ""}</label>`).join("")}</div>`;
}
function revisionDueCard() {
  const tough = dueRev(), sp = spacedDue(today());
  return `<div class="card"><h2>🔁 Revision due <span class="count">${tough.length + sp.length}</span></h2>
    ${tough.map((k) => `<div class="rev-row"><span>🔥 ${esc(topicName(k))}<div class="tiny">${esc((state.rev[k].reasons || []).slice(-2).join(" · "))}</div></span>
      <span class="btn-row"><button class="btn sm bad" data-rev="${esc(k)}|-1">Still hard</button><button class="btn sm warn" data-rev="${esc(k)}|1">OK</button><button class="btn sm good" data-rev="${esc(k)}|2">Easy</button></span></div>`).join("")}
    ${sp.map((x) => `<label class="rev-row"><span>${esc(x.stage.toUpperCase())} · ${esc(topicName(x.key))}${x.late > 0 ? ` <em class="late">${x.late}d late</em>` : ""}</span><input type="checkbox" data-spaced="${esc(x.key)}|${esc(x.stage)}"></label>`).join("")}
    ${tough.length + sp.length ? '<p class="tiny">Tough topic revise karne ka tareeka (2 🍅): short notes + must-know points → us topic ke galat PYQs retry → 3 naye PYQs → rate karo.</p>' : '<p class="muted">Aaj koi revision due nahi 👌</p>'}</div>`;
}
function viewToday() {
  const d = ui.date, td = today(), ph = phaseOf(d);
  const day = state.days[d] || { tasks: {}, hours: "", note: "" };
  const nav = `<div class="nav-date"><button class="btn ghost" data-act="day-prev" aria-label="Pichla din">◀</button>
    <input type="date" id="dayPick" value="${esc(d)}"><button class="btn ghost" data-act="day-next" aria-label="Agla din">▶</button>
    ${d !== td ? '<button class="btn ghost" data-act="day-today">Aaj</button>' : ""}</div>`;
  let body = "";
  if (ph === "study") {
    const live = d === td;
    let plan = null;
    if (live) plan = todayPlan();
    else if (d > td) plan = projectedPlan(d);
    if (plan) {
      body = `${d > td ? '<p class="hint">Ye aage ka <b>projection</b> hai — roz ke kaam ke hisaab se apne aap badlega.</p>' : ""}
        ${daySummary(plan, live)}
        <div class="grid two">
          ${trackCard("📘 Track A — naya padhna", plan.A, live, "Track A ke naye topics khatam 🎉 — Track B / revision pe zyada time do.")}
          ${trackCard("🔁 Track B — revision + PYQs", plan.B, live)}
        </div>
        <div class="grid two">
          ${trackCard("🧩 Aptitude (GA)", plan.G, live, "GA: 10 mixed PYQs.")}
          ${live ? revisionDueCard() : ""}
        </div>
        ${live ? '<div class="pills"><button class="btn ghost" data-act="replan">↻ Re-plan today (status badla ho to)</button></div>' : ""}`;
    } else body = '<p class="muted card">Ye din guzar gaya — neeche log dekh sakte ho.</p>';
  } else if (ph === "sunday") {
    const ps = progressSummary();
    body = `<div class="card"><h2>🗓 Sunday — test + backlog day</h2>${checklist("sun", SUNDAY_PLAN)}
      <div class="pills"><button class="btn" data-act="q-week">▶ Weekly test (40 PYQs is hafte ke topics se)</button></div>
      <p class="muted">Backlog: ${ps.behind > 0 ? `plan se ≈${r1d(ps.behind)} h peeche — aaj ka backlog slot isi ke liye hai.` : "koi backlog nahi 👌"}</p></div>
      ${d === td ? revisionDueCard() : ""}`;
  } else if (ph === "buffer") {
    const idx = diffDays(d, bufferFrom());
    body = `<div class="card"><h2>🏁 Buffer week — din ${idx + 1}/${BUFFER_PLAN.length}</h2>${checklist("buf", BUFFER_PLAN[idx].filter(Boolean))}</div>${d === td ? revisionDueCard() : ""}`;
  } else if (ph === "mock") {
    const left = diffDays(state.settings.examDate, d);
    let items;
    if (left < 0) items = ["Exam ho gaya — result ka wait, all the best! 🎉"];
    else if (left === 0) items = ["🎯 GATE EXAM DAY: easy questions pehle, NAT me negative nahi, MCQ me 2 option eliminate ho tabhi guess. All the best! 💪"];
    else if (left === 1) items = ["Sirf formula sheets + Error Log halka sa (max 3 h)", "Admit card, ID proof, centre route check", "Jaldi so jao — 8 h"];
    else if (left <= 7) items = ["Saare subjects ki formula sheets", "Error Log poora ek baar", left % 2 === 0 ? "Light mock / PYQ paper (exam slot pe)" : "Mixed 30 PYQs (Quiz → shuffle)", "Sleep cycle exam slot ke hisaab se"];
    else items = diffDays(d, MOCK_PHASE_FROM) % 2 === 0 ? MOCK_PHASE_RULES.mockDay : MOCK_PHASE_RULES.fixDay;
    body = `<div class="card"><h2>📝 Mock phase ${left > 7 ? (diffDays(d, MOCK_PHASE_FROM) % 2 === 0 ? "— Mock day" : "— Fix day") : ""}</h2>${checklist("mock", items)}</div>${d === td ? revisionDueCard() : ""}`;
  } else {
    body = `<div class="card"><p class="muted">${ph === "pre" ? "Plan 28 Sep 2026 se shuru hota hai." : "Deadline ke baad / mock phase se pehle: Revision queue + Error Log."}</p></div>${d === td ? revisionDueCard() : ""}`;
  }
  const pm = pomoMins(d);
  return `${pageHead("📅 " + (d === td ? "Aaj ka plan" : esc(fmt(d))), `Phase: ${esc({ study: "Study (Track A + B + GA)", sunday: "Sunday", buffer: "Buffer week", mock: "Mock phase", pre: "Plan se pehle", gap: "Revision" }[ph])} · plan apne aap bana hai — bas follow karo.`)}
    <div class="card-h">${nav}</div>
    ${body}
    <section class="card"><h2>📝 Day log</h2>
      <div class="log-grid"><label>Hours studied (manual)<input type="number" min="0" max="18" step="0.5" data-day="hours" value="${esc(day.hours)}"></label>
      <div class="muted">🍅 Pomodoro: <b>${r1d(pm / 60)} h</b> (${pm} min) — dono me se zyada wala count hota hai.</div></div>
      <label class="full">Note (kya weak laga, kya pending)<textarea rows="2" data-day="note">${esc(day.note)}</textarea></label></section>
    <details class="card"><summary><b>⏰ Daily routine</b></summary><div class="table-wrap"><table class="tbl">${DAILY_TIMETABLE.map(([t, l, k]) => `<tr class="${k === "s" ? "study-row" : ""}"><td class="nowrap">${esc(t)}</td><td>${esc(l)}</td></tr>`).join("")}</table></div></details>`;
}

// ======================= SYLLABUS =======================
function viewSyllabus() {
  const isWeak = (k) => { const c = getT(k).conf; return (c > 0 && c <= 2) || !!state.rev[k]; };
  const list = SUBJECTS.filter((s) => {
    const st = subjStatus(s.id);
    return ui.syllFilter === "all" || st === ui.syllFilter || (ui.syllFilter === "weak" && s.topics.some((_, i) => isWeak(`${s.id}:${i}`)));
  });
  const conf = (v) => `<select data-conf aria-label="Confidence">${[0, 1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${+v === n ? "selected" : ""}>${n ? "★".repeat(n) : "conf –"}</option>`).join("")}</select>`;
  const blocks = list.map((s) => {
    const st = subjStats(s.id), isOpen = ui.open.has(s.id);
    const topics = s.topics.map((tp, i) => {
      const key = `${s.id}:${i}`, t = getT(key), status = tStatus(key), isNew = status === "new";
      if (ui.syllFilter === "weak" && !isWeak(key)) return "";
      const tOpen = ui.openT.has(key), cd = conceptDone(key);
      const doneSubs = tp.subs.filter((_, j) => subDone(key, j)).length;
      const ps = topicPyq(key);
      const cb = (k, lbl) => `<label class="tk"><input type="checkbox" data-tk="${k}" ${t[k] ? "checked" : ""}>${lbl}</label>`;
      const subs = tOpen ? `<div class="subs">${tp.subs.map((x, j) => {
        const sk = `${key}:${j}`, qs = (QBYTOPIC[key] || []).filter((q) => q.sj === j).length;
        return `<div class="sub ${subDone(key, j) ? "done" : ""}">
          <label class="sub-h"><input type="checkbox" data-subck="${esc(sk)}" ${subDone(key, j) ? "checked" : ""}>
            <span class="sub-n">${esc(x.n)}</span>${depthChip(x.d)}${freqChip(x.f)}${qs ? `<span class="chip">${qs} PYQs</span>` : ""}</label>
          <ul class="pts">${x.pts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          <div class="meta"><b>PYQ pattern:</b> ${esc(x.pyq)}</div>
          ${x.skip ? `<div class="meta skip"><b>Skip:</b> ${esc(x.skip)}</div>` : ""}
          ${qs ? `<div class="meta"><button class="btn ghost sm" data-qsub="${esc(key)}|${j}">▶ Is subtopic ke PYQs</button></div>` : ""}
        </div>`;
      }).join("")}</div>` : "";
      return `<div class="topic ${isWeak(key) ? "weak" : ""} ${cd ? "tdone" : ""}" data-topic="${esc(key)}" id="t-${esc(key.replace(":", "-"))}">
        <div class="topic-h">
          <button class="topic-name" data-ttoggle="${esc(key)}"><span class="chev">${tOpen ? "▾" : "▸"}</span> ${esc(tp.n)}
            <small>${doneSubs}/${tp.subs.length} subtopics ${isNew ? "padhe" : "revise"}</small></button>
          <span class="btn-row">${freqChip(tp.f)}<button class="chip ${isNew ? "new" : "ok"} chip-btn" data-tstat="${esc(key)}" title="Status badlo — plan apne aap update hoga">${isNew ? "NEW (padhna hai)" : "REVISE (padha hua)"} ⇄</button></span>
        </div>
        <div class="topic-ctrl">
          ${isNew ? cb("learned", "Studied ✓") : cb("revDone", "Revised ✓")}
          ${cd ? cb("r1", "R1 +1d") + cb("r2", "R2 +7d") + cb("r3", "R3 +21d") : ""}
          ${ps.bank ? `<span class="chip">Quiz ${ps.batt}/${ps.bank} · ${ps.acc}%</span><button class="btn sm" data-qtopic="${esc(key)}">▶ Practice</button>` : ""}
          ${ps.estRest ? cb("pyq", `Baaki saal ✓ (~${ps.estRest}, GO)`) : ""}
          ${conf(t.conf)}
          <button class="btn ghost sm ${state.rev[key] ? "on" : ""}" data-tough="${esc(key)}">🔥 ${state.rev[key] ? "Tough (queue me)" : "Tough?"}</button>
          <button class="btn ghost sm" data-prompt="${esc(key)}">🤖 Claude prompt</button>
          <a class="btn ghost sm" href="${esc(goSearch(tp.n))}" target="_blank" rel="noopener">GO ↗</a>
        </div>
        ${t.learnedOn || t.revDoneOn ? `<div class="tiny">${t.learnedOn ? "studied " + esc(fmt(t.learnedOn)) : ""}${t.revDoneOn ? " · revised " + esc(fmt(t.revDoneOn)) : ""}</div>` : ""}
        ${subs}
      </div>`;
    }).join("");
    return `<div class="card subj ${isOpen ? "open" : ""}" id="s-${esc(s.id)}">
      <button class="subj-h" data-toggle="${esc(s.id)}">
        <span class="subj-name">${esc(s.name)} ${statusChip(st.status)}</span>
        <span class="subj-meta">~${esc(s.weight)} marks · ${st.done}/${st.n} topics done · PYQs ${st.pa}/${st.pt}${st.est ? "*" : ""} · ${r1d(st.remH)} h baaki</span>
        <span class="subj-bar">${bar(st.readiness)}</span><span class="chev">${isOpen ? "▾" : "▸"}</span>
      </button>
      ${isOpen ? `<div class="subj-b"><p class="official"><b>Official GATE 2027 syllabus:</b> ${esc(s.official)}</p><div class="topics">${topics}</div></div>` : ""}
    </div>`;
  }).join("");
  const f = (k, l) => `<button class="pill ${ui.syllFilter === k ? "on" : ""}" data-sf="${k}">${l}</button>`;
  return `${pageHead("📚 Syllabus Tracker", "Official GATE 2027 CS syllabus → topic → subtopic → points, har subtopic pe depth + PYQ pattern + skip list.")}
    <section class="card">
      <p class="muted"><b>Status:</b> har topic pe <span class="chip new">NEW</span> / <span class="chip ok">REVISE</span> button hai — jo padha hua hai use REVISE karo, plan (Aaj + Schedule) apne aap badal jayega.
      Subtopic tick karo → saare tick → topic complete → R1/R2/R3 spaced revision apne aap. Confidence ★1–2 ya 🔥 = Revision queue.</p>
      <div class="pills">${f("all", "All")}${f("new", "New")}${f("partial", "Partial")}${f("revise", "Revise")}${f("weak", "Weak / Tough")}
      <button class="pill" data-act="expand">Expand subjects</button><button class="pill" data-act="collapse">Collapse</button></div></section>
    ${blocks || '<p class="muted card">Koi weak topic nahi mila.</p>'}`;
}

// ======================= PYQ QUIZ =======================
function quizList(f) {
  let list = BANK.filter((q) => (!f.sid || q.sid === f.sid) && (!f.key || `${q.sid}:${q.ti}` === f.key) && (f.sj === "" || String(q.sj) === String(f.sj))
    && (!f.ty || q.ty === f.ty) && (!f.y1 || q.y >= +f.y1) && (!f.y2 || q.y <= +f.y2));
  const a = (q) => state.quiz[q.id];
  if (f.st === "new") list = list.filter((q) => !a(q));
  else if (f.st === "wrong") list = list.filter((q) => a(q) && !a(q).ok);
  else if (f.st === "bm") list = list.filter((q) => state.bm[q.id]);
  list.sort((x, y) => x.y - y.y || String(x.set || "").localeCompare(String(y.set || "")) || x.n - y.n);
  if (f.order === "shuffle") for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list.map((q) => q.id);
}
function quizExplainPrompt(q) {
  const key = `${q.sid}:${q.ti}`, sub = TOPIC[key].subs[q.sj], a = state.quiz[q.id];
  return `Tum GATE CSE AIR 1 mentor ho. Ye GATE ${q.y}${q.set ? " (set " + q.set + ")" : ""} ka ${qLabel(q)} hai (${q.m} mark, ${q.ty}).
Topic: ${TOPIC[key].s.name} › ${TOPIC[key].n}${sub ? " › " + sub.n : ""}
(Question ka screenshot attach kar raha hoon — text sirf reference ke liye, maths/figure screenshot me dekho.)
${q.q ? "Question text:\n" + q.q : ""}
${q.opts && q.opts.length ? "Options:\n" + q.opts.map((o, i) => `${LETTERS[i]}. ${o}`).join("\n") : ""}
Mera answer: ${a ? a.g || "—" : "—"} · Sahi answer: ${ansText(q)}

1) Sahi answer step by step samjhao (Hinglish, simple).
2) Mera answer kyun galat hai — kaunsa concept/trap miss hua, exactly batao.
3) Is type ke question ka fast approach / shortcut.
4) Isi concept pe 2 similar GATE-level questions do (answers baad me).`;
}
function viewQuiz() {
  if (!HAS_BANK) {
    return `${pageHead("✍️ PYQ Quiz", "Topic / subtopic-wise GATE PYQs — MCQ, MSQ, NAT — page khud check karega.")}
      <section class="card empty-card"><h2>PYQ bank abhi khaali hai</h2>
      <p>Aap GATE CSE <b>2000–2023 ke question papers + answer keys</b> (PDF) do — main har question ko <b>subject → topic → subtopic</b> me arrange karke yahan daal dunga. Uske baad:</p>
      <ul class="rules"><li>Topic / subtopic / MCQ / MSQ / NAT / year ke hisaab se filter</li><li>Option tick karo → <b>page khud batayega sahi ya galat</b></li>
      <li>Galat hone pe: <b>possible galti</b>, <b>kaunsa topic › subtopic revise karna hai</b>, Claude se samjhne ka prompt</li>
      <li>Galat question <b>apne aap Error Log</b> me, topic <b>apne aap Revision queue</b> me</li><li>Aaj ke plan ke PYQs ek click me (Aaj page → ▶ Quiz)</li></ul>
      <p class="muted">Tab tak: Aaj page pe PYQ items ke saath <b>GO ↗</b> link hai — GATE Overflow se solve karke topic ka "PYQs ✓" tick karo.</p></section>`;
  }
  const Q = ui.quiz, f = Q.f;
  if (Q.list) return viewQuizSession();
  const subjOpts = `<option value="">Sab subjects</option>` + SUBJECTS.map((s) => { const n = BANK.filter((q) => q.sid === s.id).length; return n ? `<option value="${esc(s.id)}" ${f.sid === s.id ? "selected" : ""}>${esc(s.name)} (${n})</option>` : ""; }).join("");
  const topicOpts = f.sid ? `<option value="">Sab topics</option>` + SUBJ[f.sid].topics.map((tp, i) => { const k = `${f.sid}:${i}`, n = (QBYTOPIC[k] || []).length; return n ? `<option value="${esc(k)}" ${f.key === k ? "selected" : ""}>${esc(tp.n)} (${n})</option>` : ""; }).join("") : "";
  const subOpts = f.key ? `<option value="">Sab subtopics</option>` + TOPIC[f.key].subs.map((x, j) => { const n = (QBYTOPIC[f.key] || []).filter((q) => q.sj === j).length; return n ? `<option value="${j}" ${String(f.sj) === String(j) ? "selected" : ""}>${esc(x.n)} (${n})</option>` : ""; }).join("") : "";
  const years = [...new Set(BANK.map((q) => q.y))].sort();
  const yOpt = (v) => `<option value="">—</option>` + years.map((y) => `<option value="${y}" ${String(v) === String(y) ? "selected" : ""}>${y}</option>`).join("");
  const n = quizList(f).length;
  const att = Object.keys(state.quiz).filter((k) => QBYID[k]).length, cor = Object.keys(state.quiz).filter((k) => QBYID[k] && state.quiz[k].ok).length;
  const wrong = Object.keys(state.quiz).filter((k) => QBYID[k] && !state.quiz[k].ok).length;
  return `${pageHead("✍️ PYQ Quiz", `${BANK.length} GATE CSE PYQs, topic/subtopic-wise. Galat → Error Log + Revision queue apne aap.`)}
    <section class="grid kpis">
      <div class="card kpi"><div class="kpi-n">${att}/${BANK.length}</div><div class="kpi-l">attempted</div></div>
      <div class="card kpi"><div class="kpi-n">${pct(cor, att)}%</div><div class="kpi-l">accuracy</div></div>
      <div class="card kpi"><div class="kpi-n">${wrong}</div><div class="kpi-l">abhi galat (retry karo)</div></div>
    </section>
    <section class="card"><h2>Questions chuno</h2>
      <div class="form-grid">
        <label>Subject<select data-qf="sid">${subjOpts}</select></label>
        ${f.sid ? `<label>Topic<select data-qf="key">${topicOpts}</select></label>` : ""}
        ${f.key ? `<label>Subtopic<select data-qf="sj">${subOpts}</select></label>` : ""}
        <label>Type<select data-qf="ty"><option value="">MCQ + MSQ + NAT</option>${["MCQ", "MSQ", "NAT"].map((t) => `<option ${f.ty === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <label>Kaunse<select data-qf="st"><option value="new" ${f.st === "new" ? "selected" : ""}>Naye (attempt nahi kiye)</option><option value="wrong" ${f.st === "wrong" ? "selected" : ""}>Galat wale (retry)</option><option value="all" ${f.st === "all" ? "selected" : ""}>Sab</option><option value="bm" ${f.st === "bm" ? "selected" : ""}>Bookmarked</option></select></label>
        <label>Year from<select data-qf="y1">${yOpt(f.y1)}</select></label><label>Year to<select data-qf="y2">${yOpt(f.y2)}</select></label>
        <label>Order<select data-qf="order"><option value="year" ${f.order === "year" ? "selected" : ""}>Year-wise</option><option value="shuffle" ${f.order === "shuffle" ? "selected" : ""}>Shuffle</option></select></label>
      </div>
      <div class="pills"><button class="btn" data-act="q-start" ${n ? "" : "disabled"}>▶ Start (${n} questions)</button>
        <button class="btn ghost" data-act="q-today">📅 Aaj ke plan ke PYQs</button><button class="btn ghost" data-act="q-wrongall">❌ Saare galat retry (${wrong})</button></div>
    </section>`;
}
function viewQuizSession() {
  const Q = ui.quiz;
  if (Q.idx >= Q.list.length) {
    const d = Q.done, cor = d.filter((x) => x.ok).length;
    const wrongKeys = [...new Set(d.filter((x) => !x.ok).map((x) => { const q = QBYID[x.id]; return `${q.sid}:${q.ti}`; }))];
    return `${pageHead("✍️ Quiz khatam")}
      <section class="grid kpis"><div class="card kpi"><div class="kpi-n">${cor}/${d.length}</div><div class="kpi-l">sahi</div></div><div class="card kpi"><div class="kpi-n">${pct(cor, d.length)}%</div><div class="kpi-l">accuracy</div></div></section>
      ${wrongKeys.length ? `<section class="card"><h2>Ye topics Revision queue me add hue</h2><ul class="rules">${wrongKeys.map((k) => `<li>${esc(topicName(k))}</li>`).join("")}</ul></section>` : ""}
      <div class="pills"><button class="btn" data-act="q-exit">← Quiz home</button>${d.some((x) => !x.ok) ? '<button class="btn ghost" data-act="q-retrysess">Galat wale dobara</button>' : ""}</div>`;
  }
  const q = QBYID[Q.list[Q.idx]];
  if (!q) { Q.idx++; return viewQuizSession(); }
  const key = `${q.sid}:${q.ti}`, sub = TOPIC[key].subs[q.sj], res = Q.res, prev = state.quiz[q.id];
  const img = safeImg(q.img);
  const opts = q.opts && q.opts.length ? q.opts : [];
  let input;
  if (q.ty === "NAT") input = `<label>Answer (number)<input id="natIn" inputmode="decimal" autocomplete="off" value="${esc(Q.given)}" ${res ? "disabled" : ""}></label>`;
  else input = `<div class="opts">${LETTERS.map((l, i) => {
    const chosen = q.ty === "MSQ" ? Q.given.includes(l) : Q.given === l;
    const key = res && !q.mta ? (allAnswers(q).find((x) => x !== null && prev && matchOne(q, prev.g, x)) ?? q.ans) : null;
    const correct = res && key !== null && normGiven(q, key).includes(l);
    return `<label class="opt ${res && correct ? "opt-ok" : ""} ${res && chosen && !correct ? "opt-bad" : ""}"><input type="${q.ty === "MSQ" ? "checkbox" : "radio"}" name="qopt" data-qopt="${l}" ${chosen ? "checked" : ""} ${res ? "disabled" : ""}><b>${l}.</b> <span>${esc(opts[i] || "")}</span></label>`;
  }).join("")}</div>${q.ty === "MSQ" ? '<p class="tiny">MSQ: ek ya zyada options sahi ho sakte hain. Negative marking nahi.</p>' : ""}`;
  const diag = res && !res.ok ? res.diag : null;
  return `${pageHead(`✍️ Q ${Q.idx + 1} / ${Q.list.length}`)}
    <section class="card qcard">
      <div class="q-meta"><span class="chip">GATE ${esc(q.y)}${q.set ? " · Set " + esc(q.set) : ""}</span><span class="chip">${esc(qLabel(q))}</span><span class="chip">${+q.m} mark</span><span class="chip">${esc(q.ty)}</span>
        ${res ? `<span class="chip ok">${esc(TOPIC[key].n)}${sub ? " › " + esc(sub.n) : ""}</span>` : ""}
        ${prev && !res ? `<span class="chip ${prev.ok ? "ok" : "bad"}">pehle: ${prev.ok ? "sahi" : "galat"}</span>` : ""}
        <span class="q-timer" id="qTimer">0:00</span>
        <button class="btn ghost sm" data-act="q-bm">${state.bm[q.id] ? "★ Bookmarked" : "☆ Bookmark"}</button></div>
      ${img ? `<img class="qimg" src="${esc(img)}" alt="GATE ${esc(q.y)} question ${esc(q.n)}">` : ""}
      ${q.q && !img ? `<div class="qtext">${esc(q.q)}</div>` : ""}
      ${input}
      ${!res ? `<label class="tk"><input type="checkbox" id="qGuess" ${Q.guess ? "checked" : ""}> Guess kiya hai (sure nahi)</label>
        <div class="pills"><button class="btn" data-act="q-submit">Submit</button><button class="btn ghost" data-act="q-skip">Skip →</button><button class="btn ghost" data-act="q-exit">✕ Exit</button></div>` : ""}
      ${res ? `<div class="q-res ${res.ok ? "ok-card" : "bad-card"}">
        <h2>${res.ok ? "✅ Sahi!" : "❌ Galat"}</h2>
        <p>Sahi answer: <b>${esc(ansText(q))}</b>${!res.ok ? ` · Tumhara: <b>${esc(state.quiz[q.id].g || "—")}</b>` : ""}</p>
        ${q.concept ? `<p><b>Concept:</b> ${esc(q.concept)}</p>` : ""}
        ${diag ? `<p><b>Possible galti:</b></p><ul class="rules">${diag.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
          <p><b>Ye revise karo:</b> <a href="#syllabus" data-gotopic="${esc(key)}">${esc(TOPIC[key].s.name)} › ${esc(TOPIC[key].n)}${sub ? " › " + esc(sub.n) : ""}</a></p>
          <p class="tiny">✓ Error Log me save ho gaya · ✓ Topic Revision queue me add ho gaya. Galti ka asli reason choose karo:</p>
          <div class="pills">${Object.entries(ERR_LABEL).map(([k, v]) => `<button class="pill ${(state.errors.find((e) => e.id === "q-" + q.id) || {}).type === k ? "on" : ""}" data-qreason="${k}">${esc(v)}</button>`).join("")}</div>` : ""}
        <div class="pills"><button class="btn" data-act="q-next">Next →</button><button class="btn ghost" data-act="q-claude">🤖 Claude se samjho (prompt copy)</button><button class="btn ghost" data-act="q-exit">✕ Exit</button></div>
      </div>` : ""}
    </section>`;
}

// ======================= PYQ MAP =======================
function viewPyqMap() {
  if (!HAS_BANK) {
    const rows = SUBJECTS.map((s) => `<tr><td><b>${esc(s.name)}</b> <span class="muted">~${esc(s.weight)} marks</span></td><td>${s.topics.map((tp) => `<span class="heat h${{ H: 4, M: 2, L: 1 }[tp.f]}" title="PYQ frequency: ${esc(FREQ_LABEL[tp.f])}">${esc(tp.n)}</span>`).join("")}</td></tr>`).join("");
    return `${pageHead("🗺 PYQ Map", "Kaunsa topic GATE me kitna aata hai. PYQ bank upload hone pe yahan asli year-wise count aayega.")}
      <section class="card"><p class="muted">Abhi frequency syllabus map se hai (High = dark). <span class="heat h4">High</span> <span class="heat h2">Medium</span> <span class="heat h1">Low</span></p>
      <div class="table-wrap"><table class="tbl">${rows}</table></div></section>`;
  }
  const ys = BANK.map((q) => q.y), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const buckets = [];
  for (let a = y0; a <= y1; a += 5) buckets.push([a, Math.min(y1, a + 4)]);
  let max = 1;
  const data = ALL_TOPICS.map((t) => {
    const qs = QBYTOPIC[t.key] || [];
    const b = buckets.map(([a, z]) => qs.filter((q) => q.y >= a && q.y <= z).length);
    max = Math.max(max, ...b);
    return { t, qs, b };
  });
  const body = SUBJECTS.map((s) => {
    const rows = data.filter((x) => x.t.sid === s.id);
    const tot = sum(rows.map((x) => x.qs.length)), marks = sum(rows.flatMap((x) => x.qs.map((q) => q.m)));
    return `<tr class="subj-row"><td colspan="${buckets.length + 4}"><b>${esc(s.name)}</b> — ${tot} Qs · ${marks} marks (${y0}–${y1})</td></tr>` + rows.map((x) => {
      const st = quizStats(x.qs);
      return `<tr><td>${esc(x.t.n)}</td>${x.b.map((c) => `<td class="num"><span class="heat h${c ? Math.min(4, 1 + Math.floor((c / max) * 4)) : 0}">${c}</span></td>`).join("")}
        <td class="num"><b>${x.qs.length}</b></td><td class="num">${sum(x.qs.map((q) => q.m))}</td><td class="num">${st.att ? pct(st.cor, st.att) + "%" : "—"}</td></tr>`;
    }).join("");
  }).join("");
  return `${pageHead("🗺 PYQ Map", `GATE CSE ${y0}–${y1}: har topic se kitne questions aaye (PYQ bank se, asli count).`)}
    <section class="card"><div class="table-wrap"><table class="tbl heat-tbl"><thead><tr><th>Topic</th>${buckets.map(([a, z]) => `<th>${a}–${String(z).slice(2)}</th>`).join("")}<th>Total</th><th>Marks</th><th>Meri acc.</th></tr></thead><tbody>${body}</tbody></table></div></section>`;
}

// ======================= SCHEDULE =======================
function viewSchedule() {
  const td = today(), rp = rollingPlan(td), ps = progressSummary();
  const nameList = (pieces) => {
    const m = new Map();
    pieces.forEach((p) => { const e = m.get(p.key) || { subs: [], q: 0 }; if (p.kind === "sub") e.subs.push(p.j); else e.q += p.n; m.set(p.key, e); });
    return [...m.entries()].map(([k, e]) => {
      const t = TOPIC[k];
      const subs = e.subs.map((j) => t.subs[j] ? `${esc(t.subs[j].n)} <span class="depth d${t.subs[j].d}">${esc(DEPTH_LABEL[t.subs[j].d][0])}</span>` : "").join(", ");
      return `<b>${esc(t.n)}</b>${subs ? `: ${subs}` : ""}${e.q ? ` <span class="chip">${e.q} PYQs</span>` : ""}`;
    }).join(" · ") || '<span class="muted">—</span>';
  };
  // Gantt: first/last day per subject
  const span = {}; // sid → track → {a, z}
  ["A", "B", "G"].forEach((tr) => rp.days.forEach((d) => (rp.tracks[tr][d] || []).forEach((p) => {
    const sid = TOPIC[p.key].sid, S = (span[sid] ||= {}), e = S[tr] || { a: d, z: d };
    if (d < e.a) e.a = d; if (d > e.z) e.z = d; S[tr] = e;
  })));
  const D0 = rp.days[0] || td, D1 = rp.days[rp.days.length - 1] || td, tot = Math.max(1, diffDays(D1, D0) + 1);
  const gantt = SUBJECTS.filter((s) => span[s.id]).map((s) => {
    const bars = Object.entries(span[s.id]).map(([tr, e]) => {
      const left = (diffDays(e.a, D0) / tot) * 100, w = ((diffDays(e.z, e.a) + 1) / tot) * 100;
      return `<div class="g-bar tr${esc(tr)}" style="left:${left}%;width:${Math.max(1.5, w)}%" title="${esc({ A: "Naya", B: "Revision", G: "GA" }[tr])}: ${esc(fmt(e.a))} → ${esc(fmt(e.z))}"></div>`;
    }).join("");
    const all = Object.values(span[s.id]), a = all.map((e) => e.a).sort()[0], z = all.map((e) => e.z).sort().pop();
    return `<div class="g-row"><span>${esc(s.name)}</span><div class="g-track">${bars}</div><small>${esc(fmt(a))} → ${esc(fmt(z))}</small></div>`;
  }).join("");
  let weeks = "", curWeek = "";
  for (let d = rp.days[0] || td; d < bufferFrom(); d = addDays(d, 1)) {
    const mon = addDays(d, -((parse(d).getDay() + 6) % 7));
    if (mon !== curWeek) { curWeek = mon; weeks += `<h3 class="wk">Week of ${esc(fmt(mon))}</h3>`; }
    if (isSunday(d)) { weeks += `<div class="day-row sun" data-goto="${esc(d)}"><div class="dr-date">${esc(fmt(d))}</div><div class="dr-body"><b>Sunday:</b> weekly test + backlog + weekly revision</div></div>`; continue; }
    weeks += `<div class="day-row ${d === td ? "today" : ""}" data-goto="${esc(d)}"><div class="dr-date">${esc(fmt(d))}</div><div class="dr-body">
      <div>📘 ${nameList(rp.tracks.A[d] || [])}</div><div>🔁 ${nameList(rp.tracks.B[d] || [])}</div><div class="tiny">🧩 ${nameList(rp.tracks.G[d] || [])}</div></div></div>`;
  }
  return `${pageHead("🗓 Schedule", "Plan apne aap bana hai aur roz update hota hai: jo kaam bacha hai wo baaki dino me barabar baant diya jata hai.")}
    <section class="card"><div class="phases">
      <div class="phase"><b>Study (Track A + B + GA)</b><span>${esc(fmt(PLAN_START))} → ${esc(fmt(addDays(bufferFrom(), -1)))}</span><p>Naye topics padhna + padhe hue revise + saare PYQs (2000–2023). Sunday = test + backlog.</p></div>
      <div class="phase"><b>Buffer week</b><span>${esc(fmt(bufferFrom()))} → ${esc(fmt(deadline()))}</span><p>Grand revision + 2 full mocks. 🎯 ${esc(fmt(deadline()))}: sab revised + PYQs solved.</p></div>
      <div class="phase"><b>Mock phase</b><span>${esc(fmt(MOCK_PHASE_FROM))} → exam</span><p>Alternate din full mock + analysis (Mocks page pe PDF upload).</p></div></div></section>
    <section class="grid kpis">
      <div class="card kpi"><div class="kpi-n">${r1d(rp.remH.A)} h</div><div class="kpi-l">Track A baaki · ~${r1d(rp.perDay.A)} h/din</div></div>
      <div class="card kpi"><div class="kpi-n">${r1d(rp.remH.B)} h</div><div class="kpi-l">Track B baaki · ~${r1d(rp.perDay.B)} h/din</div></div>
      <div class="card kpi"><div class="kpi-n">${r1d(rp.remH.G)} h</div><div class="kpi-l">GA baaki · ~${r1d(rp.perDay.G)} h/din</div></div>
      <div class="card kpi"><div class="kpi-n">${rp.days.length}</div><div class="kpi-l">study din baaki · total ~${r1d(ps.needPerDay)} h/din</div></div>
    </section>
    <section class="card"><h2>📊 Subject timeline</h2><div class="gantt">${gantt || '<p class="muted">Sab khatam 🎉</p>'}</div>
      <p class="tiny"><span class="g-key trA"></span> Track A (naya) <span class="g-key trB"></span> Track B (revision) <span class="g-key trG"></span> GA</p></section>
    <section class="card"><h2>Din-ba-din (click → us din ka poora plan: exact subtopics, depth aur questions)</h2><p class="tiny">Depth: <span class="depth d1">B</span> BASIC · <span class="depth d2">S</span> STANDARD · <span class="depth d3">D</span> DEEP</p><div class="days">${weeks}</div></section>
    <section class="card"><h2>🏁 Buffer week</h2><ol class="rules">${BUFFER_PLAN.map((b, i) => `<li><b>${esc(fmt(addDays(bufferFrom(), i)))}:</b> ${esc(b.filter(Boolean).join(" · "))}</li>`).join("")}</ol></section>
    <section class="card"><h2>🗓 Sunday plan</h2><ul class="rules">${SUNDAY_PLAN.map(([t, l]) => `<li><b>${esc(t)}</b> — ${esc(l)}</li>`).join("")}</ul></section>`;
}

// ======================= POMODORO =======================
const POMO_MODES = { focus: ["Focus", 25], short: ["Short break", 5], long: ["Long break", 15] };
const P = { mode: "focus", running: false, end: 0, left: null, key: "", count: 0 };
const pLeft = () => (P.running ? Math.max(0, Math.ceil((P.end - Date.now()) / 1000)) : P.left ?? POMO_MODES[P.mode][1] * 60);
const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
function viewPomodoro() {
  const td = today(), tp = phaseOf(td) === "study" ? todayPlan() : { A: [], B: [], G: [] };
  const planKeys = [...new Set([...tp.A, ...tp.B, ...tp.G].map((p) => p.key))];
  const opt = (k) => `<option value="${esc(k)}" ${P.key === k ? "selected" : ""}>${esc(topicName(k))}</option>`;
  const hc = hoursChart();
  const bySubj = {};
  Object.values(state.pomo).forEach((p) => Object.entries(p.subj || {}).forEach(([s, m]) => { bySubj[s] = (bySubj[s] || 0) + m; }));
  const rows = Object.entries(bySubj).sort((a, b) => b[1] - a[1]).map(([s, m]) => ({ label: SUBJ[s].name, value: m / 60 }));
  return `${pageHead("🍅 Pomodoro", "25 min focus + 5 min break; har 4 🍅 ke baad 15 min. Focus time apne aap Day log me hours ban jata hai.")}
    <section class="card pomo">
      <div class="pills">${Object.entries(POMO_MODES).map(([k, v]) => `<button class="pill ${P.mode === k ? "on" : ""}" data-pmode="${k}">${esc(v[0])}</button>`).join("")}</div>
      <div class="pomo-time" id="pomoTime">${mmss(pLeft())}</div>
      <label>Kya padh rahe ho<select id="pomoTopic"><option value="">— topic chuno —</option>${planKeys.length ? `<optgroup label="Aaj ka plan">${planKeys.map(opt).join("")}</optgroup>` : ""}${SUBJECTS.map((s) => `<optgroup label="${esc(s.name)}">${s.topics.map((_, i) => opt(`${s.id}:${i}`)).join("")}</optgroup>`).join("")}</select></label>
      <div class="pills"><button class="btn" data-act="p-start">${P.running ? "⏸ Pause" : "▶ Start"}</button><button class="btn ghost" data-act="p-reset">↺ Reset</button></div>
      <p class="muted">Aaj: <b>${Math.round(pomoMins(td) / 25)}</b> 🍅 · ${pomoMins(td)} min</p>
    </section>
    <section class="grid two"><div class="card"><h2>⏱ Last 14 days <span class="count">${hc.tot} h</span></h2>${hc.html}</div>
      <div class="card"><h2>Subject-wise hours (Pomodoro)</h2>${hbars(rows, Math.max(1, ...rows.map((r) => r.value)), " h")}</div></section>
    <section class="card"><h2>Focus rules</h2><ul class="rules"><li>Ek pomodoro me sirf ek kaam: phone door, WhatsApp band.</li><li>Break me utho, paani piyo, door dekho — reels nahi.</li><li>10 min se zyada doubt atke to likh lo, block ke end me Claude se poochho.</li></ul></section>`;
}

// ======================= REVISION =======================
function viewRevision() {
  const td = today();
  const entries = Object.entries(state.rev).sort((a, b) => (a[1].next < b[1].next ? -1 : 1));
  const rows = entries.map(([k, r]) => {
    const due = r.next <= td, st = getT(k), ready = r.stage >= 4 || (st.conf >= 4 && r.reps >= 2);
    return `<div class="rev-row"><div><b>${esc(topicName(k))}</b> ${due ? '<span class="chip bad">due</span>' : `<span class="chip">next ${esc(fmt(r.next))}</span>`} ${ready ? '<span class="chip ok">mastered lagta hai</span>' : ""}
      <div class="tiny">Kyun: ${esc(r.reasons.join(" · "))} · added ${esc(fmt(r.added))} · ${r.reps}× revised · stage ${r.stage}/5</div></div>
      <span class="btn-row"><button class="btn sm bad" data-rev="${esc(k)}|-1">Still hard</button><button class="btn sm warn" data-rev="${esc(k)}|1">OK</button><button class="btn sm good" data-rev="${esc(k)}|2">Easy</button>
      ${QBYTOPIC[k] ? `<button class="btn sm" data-qtopicwrong="${esc(k)}">▶ Galat PYQs</button>` : ""}<button class="btn ghost sm" data-revrm="${esc(k)}">✓ Ab theek hai</button></span></div>`;
  }).join("");
  const sp = spacedDue(td);
  const opts = SUBJECTS.map((s) => `<optgroup label="${esc(s.name)}">${s.topics.map((tp, i) => `<option value="${esc(s.id)}:${i}">${esc(tp.n)}</option>`).join("")}</optgroup>`).join("");
  return `${pageHead("🔁 Revision", "Tough topics apne aap queue me aate hain: PYQ galat, PYQ accuracy &lt;60%, confidence ★1–2, 🔥 mark, ya mock analysis ke weak topics. Phir 1 → 3 → 7 → 14 → 30 din baad wapas.")}
    <section class="card"><h2>🔥 Tough-topic queue <span class="count">${dueRev().length} due / ${entries.length}</span></h2>
      ${rows || '<p class="muted">Khaali. Jo topics tough lagenge wo yahan apne aap aayenge.</p>'}
      <div class="pills"><select id="revAdd" aria-label="Topic">${opts}</select><button class="btn ghost" data-act="rev-add">+ Manually add</button></div>
      <p class="tiny"><b>Tough topic kaise revise karein (2 🍅):</b> short notes + must-know points → us topic ke galat PYQs retry → 3 naye PYQs → rate karo. Still hard = kal phir, OK = 1 step aage, Easy = 2 step.</p></section>
    <section class="card"><h2>📅 Spaced revision (complete topics) <span class="count">${sp.length}</span></h2>
      <p class="muted">Topic complete hone ke 1, 7 aur 21 din baad (R1, R2, R3).</p>
      ${sp.length ? sp.map((x) => `<label class="rev-row"><span>${esc(x.stage.toUpperCase())} · ${esc(topicName(x.key))}${x.late > 0 ? ` <em class="late">${x.late}d late</em>` : ""}</span><input type="checkbox" data-spaced="${esc(x.key)}|${esc(x.stage)}"></label>`).join("") : '<p class="muted">Aaj kuch due nahi.</p>'}</section>`;
}

// ======================= SHORT NOTES =======================
function notesMarkdown(sid) {
  const s = SUBJ[sid];
  return `# ${s.name} — Short Notes\n\n` + s.topics.map((tp, i) => {
    const note = state.notes[`${sid}:${i}`] || "";
    return `## ${tp.n}\n\n${note ? note + "\n\n" : ""}**Must-know:**\n${tp.subs.map((x) => `- **${x.n}** (${DEPTH_LABEL[x.d]}): ${x.pts.join("; ")}`).join("\n")}\n`;
  }).join("\n");
}
function viewNotes() {
  const sid = SUBJ[ui.notesSubj] ? ui.notesSubj : "os", s = SUBJ[sid];
  return `${pageHead("🗒 Short Notes", "Har topic ke 1-page notes (Claude prompt ke step 8 se). Buffer week + last 7 din me yahi padhoge.")}
    <section class="card"><div class="pills">${SUBJECTS.map((x) => `<button class="pill ${x.id === sid ? "on" : ""}" data-nsubj="${esc(x.id)}">${esc(x.name.split(" ")[0])}</button>`).join("")}</div>
      <div class="pills"><button class="btn ghost" data-act="notes-md">⬇ ${esc(s.name)} .md download</button><button class="btn ghost" data-act="print">🖨 Print</button></div></section>
    ${s.topics.map((tp, i) => `<section class="card note-card"><h2>${esc(tp.n)}</h2>
      <textarea rows="5" data-note="${esc(sid)}:${i}" placeholder="Formulas, tricks, traps…">${esc(state.notes[`${sid}:${i}`] || "")}</textarea>
      <details><summary class="tiny">Must-know points</summary><ul class="pts">${tp.subs.map((x) => `<li><b>${esc(x.n)}</b> ${depthChip(x.d)}: ${esc(x.pts.join("; "))}</li>`).join("")}</ul></details></section>`).join("")}`;
}

// ======================= ERROR LOG =======================
function viewErrors() {
  const f = ui.errFilter;
  const list = state.errors.filter((e) => f === "all" || (f === "pending" && !e.revised) || (f === "quiz" && e.qid) || e.subject === f).sort((a, b) => (a.date < b.date ? 1 : -1));
  const byType = Object.entries(ERR_LABEL).map(([k, v]) => `${esc(v)}: <b>${state.errors.filter((e) => e.type === k).length}</b>`).join(" · ");
  const opts = SUBJECTS.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
  const items = list.map((e) => `<div class="err ${e.revised ? "revised" : ""}">
    <div class="err-h"><span class="chip">${esc(SUBJ[e.subject]?.name || e.subject)}</span><span class="chip warn">${esc(ERR_LABEL[e.type] || e.type)}</span>
      <span class="muted">${esc(fmt(e.date))}</span>
      ${e.qid && QBYID[e.qid] ? `<button class="btn sm" data-qretry="${esc(e.qid)}">↻ Dobara solve</button>` : ""}
      ${e.tkey ? `<a href="#syllabus" data-gotopic="${esc(e.tkey)}" class="tiny">topic →</a>` : ""}
      <label class="rv"><input type="checkbox" data-errrev="${esc(e.id)}" ${e.revised ? "checked" : ""}> revised</label>
      <button class="btn ghost sm" data-delerr="${esc(e.id)}" aria-label="Delete">✕</button></div>
    <div><b>Q:</b> ${esc(e.q)}</div><div><b>Galti:</b> ${esc(e.mistake)}</div><div><b>Sahi concept:</b> ${esc(e.fix)}</div></div>`).join("");
  const fb = (k, l) => `<button class="pill ${f === k ? "on" : ""}" data-ef="${esc(k)}">${esc(l)}</button>`;
  return `${pageHead("❌ Error Log", "Quiz me galat PYQ apne aap yahan aata hai. Retry me sahi hua to apne aap 'revised'. Phase 2–3 me yahi list tumhara revision hai.")}
    <section class="card"><p class="muted">${byType}</p>
    <form id="errForm" class="form-grid">
      <label>Subject<select name="subject">${opts}</select></label>
      <label>Mistake type<select name="type">${Object.entries(ERR_LABEL).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select></label>
      <label class="full">Question (source + short)<input name="q" placeholder="e.g. Made Easy test 4 Q12 — LRU page faults" required></label>
      <label class="full">Maine kya galti ki<input name="mistake" required></label>
      <label class="full">Sahi concept / trick<input name="fix"></label>
      <button class="btn" type="submit">+ Add error</button></form></section>
    <section class="card"><div class="pills">${fb("all", "All")}${fb("pending", "Not revised")}${fb("quiz", "PYQ Quiz se")}${SUBJECTS.map((s) => fb(s.id, s.name.split(" ")[0])).join("")}</div>
    <div class="errs">${items || '<p class="muted">Koi entry nahi.</p>'}</div></section>`;
}

// ======================= CLAUDE =======================
function viewClaude() {
  return `${pageHead("🤖 Study with Claude")}
    <section class="card"><ol class="rules">
      <li><b>Naya topic / revision:</b> Aaj ya Syllabus page pe <b>🤖</b> dabao — prompt me har subtopic ki depth, compulsory points, PYQ pattern, skip list aur mode (NEW / REVISION) hota hai. Notes ke saath Claude me paste karo.</li>
      <li><b>PYQ galat hua:</b> Quiz me "🤖 Claude se samjho" — question + tumhara answer + sahi answer ke saath prompt.</li>
      <li><b>Mock analysis:</b> Mocks page pe PDF upload (Auto ya claude.ai wala tareeka).</li>
      <li>Short notes (step 8) → Short Notes page me save karo.</li></ol></section>
    ${CLAUDE_PROMPTS.map((p, i) => `<section class="card"><div class="card-h"><h2>${esc(p.title)}</h2><button class="btn ghost" data-copy="${i}">Copy</button></div><pre class="prompt">${esc(p.text)}</pre></section>`).join("")}`;
}

// ======================= SETTINGS =======================
function viewSettings() {
  const S = state.settings;
  return `${pageHead("⚙️ Settings & Backup")}
    <section class="card"><form id="setForm" class="form-grid">
      <label>Naam<input name="name" value="${esc(S.name)}"></label>
      <label>GATE exam date<input type="date" name="examDate" value="${esc(S.examDate)}"></label>
      <label>Revision deadline (sab revise + PYQs)<input type="date" name="deadline" value="${esc(S.deadline)}"></label>
      <label>Daily hours target<input type="number" name="hoursTarget" value="${esc(S.hoursTarget)}"></label>
      <label>Mock marks target<input type="number" name="mockTarget" value="${esc(S.mockTarget)}"></label>
      <button class="btn" type="submit">Save</button></form>
      <p class="muted">GATE 2027: 6–21 Feb (default 6 Feb). Apna slot aane pe exam date update karo.</p>
      <div class="pills"><button class="btn ghost" data-act="status-reset">Topic status default pe wapas (28 Sep wala)</button></div></section>
    <section class="card"><h2>🔑 Claude API key (sirf Mocks → Auto analysis ke liye)</h2>
      <p class="muted">console.anthropic.com → API Keys (API billing alag hai, claude.ai subscription/credit se nahi). Key backup file me nahi jaati aur sirf api.anthropic.com ko bheji jaati hai.</p>
      <p class="muted"><b>Safety:</b> key pe monthly spend limit lagao; kaam ke baad delete/rotate. Default me key sirf is tab tak; "Remember" pe is browser me.</p>
      <div class="form-grid"><label>API key<input type="password" id="apiKey" value="${esc(getKey())}" placeholder="sk-ant-…" autocomplete="off" spellcheck="false"></label>
      <label class="tk"><input type="checkbox" id="apiRemember" ${keyRemembered() ? "checked" : ""}> Remember on this browser</label>
      <button class="btn" data-act="save-key">Save key</button><button class="btn ghost" data-act="clear-key">Remove key</button></div></section>
    <section class="card"><h2>💾 Backup</h2>
      <p class="muted">Data sirf isi browser me save hota hai. <b>Har Sunday Export karo.</b></p>
      <div class="pills"><button class="btn" data-act="export">⬇ Export backup (.json)</button>
      <label class="btn ghost">⬆ Import backup<input type="file" id="importFile" accept="application/json" hidden></label>
      <button class="btn danger" data-act="reset">Reset all data</button></div>
      ${saveFailed ? '<p class="warn-text">⚠️ Browser storage me save nahi ho raha — turant Export karo.</p>' : ""}</section>`;
}

const VIEWS = { dashboard: viewDashboard, today: viewToday, syllabus: viewSyllabus, quiz: viewQuiz, pyqmap: viewPyqMap, schedule: viewSchedule, pomodoro: viewPomodoro,
  revision: viewRevision, mocks: () => pageHead("📝 Mocks & Analysis") + viewMocks(), notes: viewNotes, errors: viewErrors, claude: viewClaude, settings: viewSettings };
