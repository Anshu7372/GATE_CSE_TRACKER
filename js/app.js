// GATE CSE 2027 Tracker — router, events, timers.
"use strict";

// Clickjacking guard: GitHub Pages can't send frame-ancestors / X-Frame-Options.
const FRAMED = window.top !== window.self;

function toast(msg) {
  const t = $("#toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}
function copyText(txt) {
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove(); toast(ok ? "Copied ✓ — ab Claude me paste karo" : "Copy nahi hua");
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(() => toast("Copied ✓ — ab Claude me paste karo"), fallback);
  else fallback();
}
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- router ----------
let pendingScroll = null;
function go(view) { if (location.hash !== "#" + view) location.hash = view; else render(); }
function readHash() { const v = location.hash.replace(/^#/, ""); ui.view = VIEWS[v] ? v : "dashboard"; }
function render() {
  if (FRAMED) return;
  const main = $("#main");
  main.innerHTML = VIEWS[ui.view]();
  document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.v === ui.view));
  const rb = $("#revBadge"), eb = $("#errBadge");
  if (rb) { const n = dueRev().length + spacedDue(today()).length; rb.textContent = n || ""; }
  if (eb) { const n = state.errors.filter((e) => !e.revised).length; eb.textContent = n || ""; }
  const h = $("#hello"); if (h) h.textContent = state.settings.name ? `${state.settings.name} · AIR 1 🎯` : "Target: AIR 1 🎯";
  if (pendingScroll) { const el = document.getElementById(pendingScroll); pendingScroll = null; if (el) el.scrollIntoView({ block: "center" }); }
  else if (ui.view === "schedule") { const cur = $(".day-row.today"); if (cur) cur.scrollIntoView({ block: "center" }); }
  tick();
}
function openTopic(key) {
  if (!TOPIC[key]) return;
  ui.open.add(TOPIC[key].sid); ui.openT.add(key); ui.syllFilter = "all";
  pendingScroll = "t-" + key.replace(":", "-");
  go("syllabus");
}

// ---------- quiz ----------
function startQuiz(ids) {
  ids = ids.filter((id) => QBYID[id]);
  if (!ids.length) { toast("Koi question nahi mila"); return; }
  Object.assign(ui.quiz, { list: ids, idx: 0, t0: Date.now(), res: null, given: "", guess: false, done: [] });
  go("quiz");
}
function nextQ() { Object.assign(ui.quiz, { idx: ui.quiz.idx + 1, t0: Date.now(), res: null, given: "", guess: false }); render(); window.scrollTo(0, 0); }
const curQ = () => (ui.quiz.list ? QBYID[ui.quiz.list[ui.quiz.idx]] : null);
function topicQuestions(key, n, wrongOnly) {
  const qs = QBYTOPIC[key] || [];
  const fresh = qs.filter((q) => !state.quiz[q.id]), wrong = qs.filter((q) => state.quiz[q.id] && !state.quiz[q.id].ok);
  const list = wrongOnly ? wrong : [...fresh, ...wrong];
  return (n ? list.slice(0, n) : list).map((q) => q.id);
}

// ---------- pomodoro ----------
let audioCtx = null;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination); g.gain.value = 0.15; o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.2); });
  } catch (e) { /* no audio */ }
}
function pomoComplete() {
  const d = today();
  if (P.mode === "focus") {
    const mins = POMO_MODES.focus[1], p = state.pomo[d] || { mins: 0, subj: {} };
    p.mins += mins;
    if (P.key && TOPIC[P.key]) { const s = TOPIC[P.key].sid; p.subj[s] = (p.subj[s] || 0) + mins; }
    state.pomo[d] = p; save();
    P.count++;
    P.mode = P.count % 4 === 0 ? "long" : "short";
    toast("🍅 Pomodoro complete! Break lo.");
  } else { P.mode = "focus"; toast("Break khatam — focus shuru karo."); }
  P.running = false; P.left = null;
  beep();
  if (ui.view === "pomodoro" || ui.view === "dashboard" || ui.view === "today") render();
}
function tick() {
  const left = pLeft();
  if (P.running && left <= 0) { pomoComplete(); return; }
  const pt = $("#pomoTime"); if (pt) pt.textContent = mmss(left);
  const mini = $("#miniTimer");
  if (mini) { mini.hidden = !P.running; if (P.running) mini.textContent = `${POMO_MODES[P.mode][0]} ${mmss(left)}`; }
  const qt = $("#qTimer");
  if (qt && ui.quiz.list && !ui.quiz.res) qt.textContent = mmss(Math.floor((Date.now() - ui.quiz.t0) / 1000));
  document.title = P.running ? `${mmss(left)} · GATE CSE Tracker` : "GATE CSE 2027 Tracker";
}

// ---------- events ----------
document.addEventListener("click", (ev) => {
  const b = ev.target.closest("button, a[data-gotopic], a[data-opensubj], [data-goto]");
  if (!b) return;
  const D = b.dataset;
  if (D.gotopic) { ev.preventDefault(); openTopic(D.gotopic); return; }
  if (D.opensubj) { ev.preventDefault(); ui.open.add(D.opensubj); pendingScroll = "s-" + D.opensubj; go("syllabus"); return; }
  if (D.goto) { ui.date = D.goto; go("today"); return; }
  if (D.toggle) { ui.open.has(D.toggle) ? ui.open.delete(D.toggle) : ui.open.add(D.toggle); render(); return; }
  if (D.ttoggle) { ui.openT.has(D.ttoggle) ? ui.openT.delete(D.ttoggle) : ui.openT.add(D.ttoggle); render(); return; }
  if (D.sf) { ui.syllFilter = D.sf; if (D.sf === "weak") SUBJECTS.forEach((s) => ui.open.add(s.id)); render(); return; }
  if (D.ef) { ui.errFilter = D.ef; render(); return; }
  if (D.nsubj) { ui.notesSubj = D.nsubj; render(); return; }
  if (D.prompt) { if (TOPIC[D.prompt]) copyText(buildPrompt(D.prompt)); return; }
  if (D.copy) { const p = CLAUDE_PROMPTS[+D.copy]; if (p) copyText(p.text); return; }
  if (D.tstat) {
    const k = D.tstat; if (!TOPIC[k]) return;
    state.tstatus[k] = tStatus(k) === "new" ? "revise" : "new";
    invalidatePlan(); todayPlan(true); save();
    toast(`${TOPIC[k].n}: ${state.tstatus[k] === "new" ? "NEW (Track A)" : "REVISE (Track B)"} — plan update ho gaya`); render(); return;
  }
  if (D.tough) { const k = D.tough; if (!TOPIC[k]) return; if (state.rev[k]) delete state.rev[k]; else addRev(k, "🔥 khud mark kiya"); save(); render(); return; }
  if (D.rev) { const [k, n] = D.rev.split("|"); if (!state.rev[k]) return; revStep(k, +n); save(); toast("Next revision: " + fmt(state.rev[k].next)); render(); return; }
  if (D.revrm) { delete state.rev[D.revrm]; save(); toast("Queue se hata diya ✓"); render(); return; }
  if (D.qstart) { const [k, n] = D.qstart.split("|"); startQuiz(topicQuestions(k, +n)); return; }
  if (D.qtopic) { startQuiz(topicQuestions(D.qtopic, 0)); return; }
  if (D.qtopicwrong) { startQuiz(topicQuestions(D.qtopicwrong, 0, true)); return; }
  if (D.qsub) { const [k, j] = D.qsub.split("|"); startQuiz((QBYTOPIC[k] || []).filter((q) => q.sj === +j).map((q) => q.id)); return; }
  if (D.qretry) { startQuiz([D.qretry]); return; }
  if (D.qreason) { const q = curQ(); if (q) { setErrType(q.id, D.qreason); render(); } return; }
  if (D.pmode) { if (!P.running) { P.mode = D.pmode; P.left = null; render(); } return; }
  if (D.delerr) { if (confirm("Ye entry delete karein?")) { state.errors = state.errors.filter((e) => e.id !== D.delerr); save(); render(); } return; }
  if (D.delmock) { if (confirm("Ye mock delete karein?")) { state.mocks = state.mocks.filter((m) => m.id !== D.delmock); save(); render(); } return; }
  if (D.aqf) { anQFilter = D.aqf; render(); return; }
  const act = D.act;
  if (!act) return;
  if (act.startsWith("an-")) { analysisAction(act); return; }
  switch (act) {
    case "day-prev": ui.date = addDays(ui.date, -1); render(); break;
    case "day-next": ui.date = addDays(ui.date, 1); render(); break;
    case "day-today": ui.date = today(); render(); break;
    case "replan": invalidatePlan(); todayPlan(true); toast("Aaj ka plan dobara bana ✓"); render(); break;
    case "expand": SUBJECTS.forEach((s) => ui.open.add(s.id)); render(); break;
    case "collapse": ui.open.clear(); ui.openT.clear(); render(); break;
    // quiz
    case "q-start": startQuiz(quizList(ui.quiz.f)); break;
    case "q-today": {
      const tp = todayPlan();
      startQuiz([...tp.A, ...tp.B, ...tp.G].filter((p) => p.kind === "pyq").flatMap((p) => topicQuestions(p.key, p.n)));
      break;
    }
    case "q-wrongall": startQuiz(BANK.filter((q) => state.quiz[q.id] && !state.quiz[q.id].ok).map((q) => q.id)); break;
    case "q-week": {
      const from = addDays(today(), -7);
      const keys = new Set();
      BANK.forEach((q) => { const a = state.quiz[q.id]; if (a && a.at >= from) keys.add(`${q.sid}:${q.ti}`); });
      ALL_TOPICS.forEach((t) => { const s = getT(t.key); if ((s.learnedOn && s.learnedOn >= from) || (s.revDoneOn && s.revDoneOn >= from)) keys.add(t.key); });
      const ids = BANK.filter((q) => keys.has(`${q.sid}:${q.ti}`) && !(state.quiz[q.id] && state.quiz[q.id].ok)).map((q) => q.id);
      for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
      startQuiz(ids.slice(0, 40));
      break;
    }
    case "q-submit": {
      const q = curQ(); if (!q) break;
      const g = q.ty === "NAT" ? ($("#natIn") ? $("#natIn").value.trim() : "") : ui.quiz.given;
      if (!g || (q.ty === "NAT" && !Number.isFinite(parseFloat(g)))) { toast(q.ty === "NAT" ? "Number likho (ya Skip karo)" : "Option choose karo (ya Skip karo)"); break; }
      const secs = (Date.now() - ui.quiz.t0) / 1000;
      ui.quiz.given = g;
      ui.quiz.res = recordAttempt(q, g, secs, !!($("#qGuess") && $("#qGuess").checked));
      ui.quiz.done.push({ id: q.id, ok: ui.quiz.res.ok });
      render(); break;
    }
    case "q-skip": case "q-next": nextQ(); break;
    case "q-exit": ui.quiz.list = null; render(); break;
    case "q-retrysess": startQuiz(ui.quiz.done.filter((x) => !x.ok).map((x) => x.id)); break;
    case "q-bm": { const q = curQ(); if (q) { if (state.bm[q.id]) delete state.bm[q.id]; else state.bm[q.id] = true; save(); render(); } break; }
    case "q-claude": { const q = curQ(); if (q) copyText(quizExplainPrompt(q)); break; }
    // pomodoro
    case "p-start":
      if (P.running) { P.left = pLeft(); P.running = false; }
      else { P.end = Date.now() + pLeft() * 1000; P.running = true; try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* ignore */ } }
      render(); break;
    case "p-reset": P.running = false; P.left = null; render(); break;
    // revision
    case "rev-add": { const k = $("#revAdd").value; if (TOPIC[k]) { addRev(k, "Manually add kiya"); save(); toast("Queue me add ✓"); render(); } break; }
    // notes
    case "notes-md": download(`${ui.notesSubj}-short-notes.md`, notesMarkdown(ui.notesSubj), "text/markdown"); break;
    case "print": window.print(); break;
    // settings
    case "status-reset":
      if (confirm("Saare topics ka NEW/REVISE status default (28 Sep wala) pe wapas? Progress nahi mitega.")) { state.tstatus = {}; invalidatePlan(); todayPlan(true); save(); render(); }
      break;
    case "save-key": {
      const v = ($("#apiKey").value || "").trim();
      if (v && !/^sk-ant-[\w-]{10,}$/.test(v)) { toast("Ye Claude API key jaisi nahi lagti (sk-ant-… honi chahiye)"); break; }
      toast(setKey(v, $("#apiRemember").checked) ? (v ? "Key saved ✓" : "Key removed") : "Key save nahi hui");
      render(); break;
    }
    case "clear-key": setKey("", false); toast("Key removed"); render(); break;
    case "export": download(`gate-tracker-backup-${today()}.json`, JSON.stringify(state, null, 2), "application/json"); break;
    case "reset":
      if (confirm("Saara data delete ho jayega. Pakka? (Pehle export kar lo)")) { state = blankState(); invalidatePlan(); save(); render(); toast("Reset ho gaya"); }
      break;
  }
});

document.addEventListener("change", (ev) => {
  const t = ev.target, D = t.dataset;
  if (t.id === "dayPick" && t.value) { ui.date = t.value; render(); return; }
  if (D.task) { const d = state.days[ui.date] || { tasks: {}, hours: "", note: "" }; d.tasks = { ...d.tasks, [D.task]: t.checked }; state.days[ui.date] = d; save(); render(); return; }
  if (D.subck) {
    const m = /^([a-z]+:\d+):(\d+)$/.exec(D.subck); if (!m || !TOPIC[m[1]] || +m[2] >= TOPIC[m[1]].subs.length) return;
    if (t.checked) state.subs[D.subck] = true; else delete state.subs[D.subck];
    save(); syncTopicCompletion(m[1]);
    if (t.checked && allSubsDone(m[1])) toast(`🎉 ${TOPIC[m[1]].n} complete! R1/R2/R3 revision apne aap schedule.`);
    render(); return;
  }
  if (D.pyqflag) { if (TOPIC[D.pyqflag]) setT(D.pyqflag, { pyq: t.checked, ...(t.checked ? { pyqOn: today() } : {}) }); render(); return; }
  if (D.tk) {
    const key = t.closest("[data-topic]").dataset.topic; if (!TOPIC[key]) return;
    const k = D.tk; if (!["learned", "revDone", "r1", "r2", "r3", "pyq"].includes(k)) return;
    const cur = { ...getT(key), [k]: t.checked };
    if (t.checked) cur[k + "On"] = today(); else delete cur[k + "On"];
    state.topics[key] = cur; save(); render(); return;
  }
  if (t.matches("[data-conf]")) {
    const key = t.closest("[data-topic]").dataset.topic; if (!TOPIC[key]) return;
    const v = Math.max(0, Math.min(5, +t.value || 0));
    setT(key, { conf: v });
    if (v > 0 && v <= 2) { addRev(key, `Confidence ${"★".repeat(v)}`); save(); toast("Low confidence → Revision queue me add ✓"); }
    render(); return;
  }
  if (D.spaced) { const [k, st] = D.spaced.split("|"); if (TOPIC[k] && ["r1", "r2", "r3"].includes(st)) setT(k, { [st]: true, [st + "On"]: today() }); render(); return; }
  if (D.qf) {
    const f = ui.quiz.f; if (!(D.qf in f)) return;
    f[D.qf] = t.value;
    if (D.qf === "sid") { f.key = ""; f.sj = ""; }
    if (D.qf === "key") f.sj = "";
    render(); return;
  }
  if (D.qopt) {
    const q = curQ(); if (!q) return;
    ui.quiz.given = q.ty === "MSQ" ? [...document.querySelectorAll("[data-qopt]")].filter((x) => x.checked).map((x) => x.dataset.qopt).join("") : D.qopt;
    return;
  }
  if (t.id === "qGuess") { ui.quiz.guess = t.checked; return; }
  if (t.id === "pomoTopic") { P.key = TOPIC[t.value] ? t.value : ""; return; }
  if (D.errrev) { const e = state.errors.find((x) => x.id === D.errrev); if (e) { e.revised = t.checked; save(); render(); } return; }
  if (D.anfile) { anFiles[D.anfile] = t.files[0] || null; render(); return; }
  if (t.id === "anPick") { anSel = t.value; anQFilter = "all"; render(); return; }
  if (t.id === "importFile" && t.files[0]) {
    if (t.files[0].size > 10 * 1024 * 1024) { toast("File bahut badi hai (10 MB max)"); t.value = ""; return; }
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        if (!isObj(s) || !isObj(s.topics)) throw new Error("bad");
        state = sanitizeState(s); invalidatePlan(); save(); render(); toast("Backup import ho gaya ✓");
      } catch (e) { toast("Galat file — ye tracker ka backup nahi hai"); }
    };
    r.readAsText(t.files[0]);
  }
});

let noteTimer = null;
document.addEventListener("input", (ev) => {
  const t = ev.target, D = t.dataset;
  if (D.day === "hours" || D.day === "note") { const d = state.days[ui.date] || { tasks: {}, hours: "", note: "" }; d[D.day] = t.value.slice(0, 2000); state.days[ui.date] = d; save(); }
  if (D.an && D.an in anDraft) anDraft[D.an] = t.value;
  if (t.id === "natIn") ui.quiz.given = t.value;
  if (D.note && TOPIC[D.note]) { state.notes[D.note] = t.value.slice(0, 20000); clearTimeout(noteTimer); noteTimer = setTimeout(save, 400); }
});

document.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const f = ev.target, data = Object.fromEntries(new FormData(f).entries());
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  if (f.id === "mockForm") { state.mocks.push(sanitizeState({ mocks: [{ ...data, id }] }).mocks[0]); save(); toast("Mock added ✓"); }
  if (f.id === "errForm") { state.errors.push(sanitizeState({ errors: [{ ...data, id, date: today(), revised: false }] }).errors[0]); save(); toast("Error logged ✓"); }
  if (f.id === "setForm") {
    state.settings = sanitizeState({ settings: { ...state.settings, ...data } }).settings;
    invalidatePlan(); todayPlan(true); save(); toast("Settings saved ✓");
  }
  render();
});

window.addEventListener("hashchange", () => { readHash(); render(); window.scrollTo(0, 0); });

// ---------- boot ----------
if (FRAMED) {
  document.body.textContent = "Ye tracker kisi dusri site ke andar nahi chal sakta. Seedha open karo: " + location.href;
} else {
  readHash();
  render();
  setInterval(tick, 1000);
  // Date changed while the tab was open → refresh plan once.
  let lastDay = today();
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); ui.date = lastDay; invalidatePlan(); render(); } }, 60000);
}
