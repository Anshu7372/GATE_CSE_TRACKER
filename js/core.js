// GATE CSE 2027 Tracker — core: helpers, state, sanitizer, auto-planner, revision queue, PYQ quiz engine.
// Classic script: top-level declarations are shared with views.js and app.js.
"use strict";

const STORE_KEY = "gateCseTracker.v1";
const DEFAULT_SETTINGS = { name: "", examDate: "2027-02-06", deadline: "2026-12-31", hoursTarget: 10, mockTarget: 75 };

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000); // a - b
const today = () => ymd(new Date());
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = (s) => { const d = parse(s); return `${DOW[d.getDay()]}, ${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`; };
const isSunday = (s) => parse(s).getDay() === 0;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const r1d = (x) => Math.round(x * 10) / 10;

const SUBJ = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));
const ALL_TOPICS = [];
SUBJECTS.forEach((s) => s.topics.forEach((tp, i) => ALL_TOPICS.push({ key: `${s.id}:${i}`, sid: s.id, i, n: tp.n, f: tp.f, subs: tp.subs, s })));
const TOPIC = Object.fromEntries(ALL_TOPICS.map((t) => [t.key, t]));

// ---------- PYQ bank (js/pyq-bank.js, optional) ----------
const BANK = (typeof PYQ_BANK !== "undefined" && PYQ_BANK && Array.isArray(PYQ_BANK.q)) ? PYQ_BANK.q.filter((q) => q && TOPIC[`${q.sid}:${q.ti}`]) : [];
const QBYID = Object.fromEntries(BANK.map((q) => [q.id, q]));
const QBYTOPIC = {};
BANK.forEach((q) => { (QBYTOPIC[`${q.sid}:${q.ti}`] ||= []).push(q); });
const HAS_BANK = BANK.length > 0;

// ---------- sanitizer (stored / imported / generated data is untrusted) ----------
const CAT_KEYS = ["not_studied", "concept_gap", "partial_understanding", "couldnt_approach", "silly", "calculation", "misread", "time_pressure", "guess_wrong", "correct_solid", "correct_lucky"];
const VERDICT_KEYS = ["not_studied", "concept_weak", "needs_practice", "strong"];
const ERR_TYPES = ["concept", "silly", "calc", "time", "read", "guess", "notstudied"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const str = (x, max = 500) => (typeof x === "string" || typeof x === "number" ? String(x).slice(0, max) : "");
const bool = (x) => x === true;
const numStr = (x) => { const n = parseFloat(x); return Number.isFinite(n) ? String(Math.round(n * 100) / 100) : ""; };
const clampInt = (x, lo, hi, dflt) => { const n = parseInt(x, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt; };
const dateOr = (x, dflt) => (typeof x === "string" && DATE_RE.test(x) && !isNaN(new Date(x).getTime()) ? x : dflt);
const safeId = (x) => str(x, 60).replace(/[^\w-]/g, "") || Math.random().toString(36).slice(2, 10);
const arr = (x, max) => (Array.isArray(x) ? x.slice(0, max) : []);
const TOPIC_KEY_RE = /^([a-z]+):(\d+)$/;
const validTopicKey = (k) => typeof k === "string" && !!TOPIC[k];

function blankState() {
  return { settings: { ...DEFAULT_SETTINGS }, topics: {}, subs: {}, tstatus: {}, pyq: {}, days: {}, mocks: [], errors: [], analyses: [], rev: {}, quiz: {}, bm: {}, pomo: {}, notes: {}, frozen: null };
}

function cleanTopicState(v) {
  const o = {};
  if (!isObj(v)) return o;
  ["learned", "revDone", "r1", "r2", "r3", "pyq"].forEach((k) => { if (k in v) o[k] = bool(v[k]); });
  o.conf = clampInt(v.conf, 0, 5, 0);
  ["learnedOn", "revDoneOn", "r1On", "r2On", "r3On", "pyqOn"].forEach((k) => { const d = dateOr(v[k], null); if (d) o[k] = d; });
  return o;
}

function cleanAnalysisResult(r) {
  if (!isObj(r)) throw new Error("JSON object nahi hai");
  const questions = arr(r.questions, 200).filter(isObj).map((q) => {
    const status = ["correct", "wrong", "unattempted"].includes(q.status) ? q.status : "unattempted";
    const type = ["MCQ", "MSQ", "NAT"].includes(String(q.type).toUpperCase()) ? String(q.type).toUpperCase() : "MCQ";
    return {
      q: str(q.q, 10), section: q.section === "GA" ? "GA" : "CS", marks: +q.marks === 2 ? 2 : 1, type,
      subject_id: SUBJ[q.subject_id] ? q.subject_id : "", topic: str(q.topic, 200), subtopic: str(q.subtopic, 200),
      my_answer: str(q.my_answer, 60), correct_answer: str(q.correct_answer, 60),
      key_source: q.key_source === "solved_by_claude" ? "solved_by_claude" : "official", status,
      category: CAT_KEYS.includes(q.category) ? q.category : status === "correct" ? "correct_solid" : "concept_gap",
      why: str(q.why, 1000), fix: str(q.fix, 500),
    };
  });
  if (!questions.length) throw new Error("questions list khaali hai");
  const topics = arr(r.topics, 200).filter(isObj).map((t) => ({
    subject_id: SUBJ[t.subject_id] ? t.subject_id : "", topic: str(t.topic, 200),
    verdict: VERDICT_KEYS.includes(t.verdict) ? t.verdict : "needs_practice", reason: str(t.reason, 1000), action: str(t.action, 500),
  }));
  const o = isObj(r.overall) ? r.overall : {};
  const overall = {};
  ["verdict", "silly_pattern", "time_management", "attempt_strategy", "new_question_readiness"].forEach((k) => { overall[k] = str(o[k], 2000); });
  overall.action_plan = arr(o.action_plan, 30).filter(isObj).map((p, i) => ({ priority: clampInt(p.priority, 1, 99, i + 1), task: str(p.task, 500), time: str(p.time, 60) }));
  return { test_name: str(r.test_name, 100), questions, topics, overall };
}

function sanitizeState(raw) {
  const b = blankState();
  if (!isObj(raw)) return b;
  const st = isObj(raw.settings) ? raw.settings : {};
  b.settings = {
    name: str(st.name, 60),
    examDate: dateOr(st.examDate, DEFAULT_SETTINGS.examDate),
    deadline: dateOr(st.deadline, DEFAULT_SETTINGS.deadline),
    hoursTarget: clampInt(st.hoursTarget, 1, 18, DEFAULT_SETTINGS.hoursTarget),
    mockTarget: clampInt(st.mockTarget, 0, 100, DEFAULT_SETTINGS.mockTarget),
  };
  if (isObj(raw.topics)) Object.keys(raw.topics).forEach((k) => { if (validTopicKey(k)) b.topics[k] = cleanTopicState(raw.topics[k]); });
  if (isObj(raw.subs)) Object.keys(raw.subs).forEach((k) => {
    const m = /^([a-z]+:\d+):(\d+)$/.exec(k);
    if (m && TOPIC[m[1]] && +m[2] < TOPIC[m[1]].subs.length && raw.subs[k] === true) b.subs[k] = true;
  });
  if (isObj(raw.tstatus)) Object.keys(raw.tstatus).forEach((k) => { if (validTopicKey(k) && ["new", "revise"].includes(raw.tstatus[k])) b.tstatus[k] = raw.tstatus[k]; });
  if (isObj(raw.pyq)) Object.keys(raw.pyq).forEach((k) => { if (SUBJ[k] && isObj(raw.pyq[k])) b.pyq[k] = { a: numStr(raw.pyq[k].a), c: numStr(raw.pyq[k].c) }; });
  if (isObj(raw.days)) Object.keys(raw.days).slice(0, 2000).forEach((k) => {
    const d = raw.days[k];
    if (!dateOr(k, null) || !isObj(d)) return;
    const tasks = {};
    if (isObj(d.tasks)) Object.keys(d.tasks).forEach((t) => { if (/^[\w:-]{1,40}$/.test(t)) tasks[t] = bool(d.tasks[t]); });
    b.days[k] = { tasks, hours: numStr(d.hours), note: str(d.note, 2000) };
  });
  b.mocks = arr(raw.mocks, 500).filter(isObj).map((m) => ({
    id: safeId(m.id), date: dateOr(m.date, today()), name: str(m.name, 100), marks: numStr(m.marks),
    rank: str(m.rank, 40), att: numStr(m.att), acc: numStr(m.acc), weak: str(m.weak, 500),
  }));
  b.errors = arr(raw.errors, 5000).filter(isObj).map((e) => ({
    id: safeId(e.id), date: dateOr(e.date, today()), revised: bool(e.revised),
    subject: SUBJ[e.subject] ? e.subject : "ga", type: ERR_TYPES.includes(e.type) ? e.type : "concept",
    q: str(e.q, 500), mistake: str(e.mistake, 1000), fix: str(e.fix, 1000),
    qid: typeof e.qid === "string" && /^[\w-]{1,40}$/.test(e.qid) ? e.qid : "", tkey: validTopicKey(e.tkey) ? e.tkey : "",
  }));
  b.analyses = arr(raw.analyses, 100).filter(isObj).map((a) => {
    try {
      return { id: safeId(a.id), date: dateOr(a.date, today()), name: str(a.name, 100), result: cleanAnalysisResult(a.result),
        mockAdded: bool(a.mockAdded), errorsAdded: bool(a.errorsAdded), confApplied: bool(a.confApplied) };
    } catch (e) { return null; }
  }).filter(Boolean);
  if (isObj(raw.rev)) Object.keys(raw.rev).forEach((k) => {
    const r = raw.rev[k];
    if (!validTopicKey(k) || !isObj(r)) return;
    b.rev[k] = { added: dateOr(r.added, today()), next: dateOr(r.next, today()), stage: clampInt(r.stage, 0, 5, 0), reps: clampInt(r.reps, 0, 999, 0),
      reasons: arr(r.reasons, 20).map((x) => str(x, 120)).filter(Boolean) };
  });
  if (isObj(raw.quiz)) Object.keys(raw.quiz).slice(0, 10000).forEach((k) => {
    const a = raw.quiz[k];
    if (!/^[\w-]{1,40}$/.test(k) || !isObj(a)) return;
    b.quiz[k] = { g: str(a.g, 40), ok: bool(a.ok), at: dateOr(a.at, today()), n: clampInt(a.n, 1, 999, 1), t: clampInt(a.t, 0, 36000, 0), guess: bool(a.guess) };
  });
  if (isObj(raw.bm)) Object.keys(raw.bm).slice(0, 5000).forEach((k) => { if (/^[\w-]{1,40}$/.test(k) && raw.bm[k] === true) b.bm[k] = true; });
  if (isObj(raw.pomo)) Object.keys(raw.pomo).slice(0, 2000).forEach((k) => {
    const p = raw.pomo[k];
    if (!dateOr(k, null) || !isObj(p)) return;
    const subj = {};
    if (isObj(p.subj)) Object.keys(p.subj).forEach((s) => { if (SUBJ[s]) subj[s] = clampInt(p.subj[s], 0, 1440, 0); });
    b.pomo[k] = { mins: clampInt(p.mins, 0, 1440, 0), subj };
  });
  if (isObj(raw.notes)) Object.keys(raw.notes).forEach((k) => { if (validTopicKey(k)) b.notes[k] = str(raw.notes[k], 20000); });
  if (isObj(raw.frozen) && dateOr(raw.frozen.date, null)) {
    const clean = (list) => arr(list, 60).filter((x) => isObj(x) && validTopicKey(x.key)).map((x) => ({
      key: x.key, kind: x.kind === "pyq" ? "pyq" : "sub", j: clampInt(x.j, 0, 99, 0), n: clampInt(x.n, 0, 999, 0), h: Math.max(0, Math.min(24, +x.h || 0)),
    }));
    b.frozen = { date: raw.frozen.date, A: clean(raw.frozen.A), B: clean(raw.frozen.B), G: clean(raw.frozen.G) };
  }
  return b;
}

// ---------- storage ----------
function loadState() {
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? sanitizeState(JSON.parse(raw)) : blankState(); } catch (e) { return blankState(); }
}
let state = loadState();
let saveFailed = false;
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); saveFailed = false; } catch (e) { saveFailed = true; }
}

// ---------- topic state ----------
function tStatus(key) {
  if (state.tstatus[key]) return state.tstatus[key];
  if (TOPIC_STATUS_OVERRIDES[key]) return TOPIC_STATUS_OVERRIDES[key];
  const t = TOPIC[key];
  return (SUBJECT_STATUS[t.sid] || t.s.status) === "revise" ? "revise" : "new";
}
function subjStatus(sid) {
  const st = SUBJ[sid].topics.map((_, i) => tStatus(`${sid}:${i}`));
  return st.every((x) => x === "revise") ? "revise" : st.every((x) => x === "new") ? "new" : "partial";
}
const getT = (key) => state.topics[key] || { learned: tStatus(key) === "revise", conf: 0 };
function setT(key, patch) { state.topics[key] = { ...getT(key), ...patch }; save(); }
const subDone = (key, j) => !!state.subs[`${key}:${j}`];
function allSubsDone(key) { return TOPIC[key].subs.every((_, j) => subDone(key, j)); }
// Concept part of this cycle: NEW → studied (learned), REVISE → revision pass done (revDone).
function conceptDone(key) {
  const t = getT(key);
  return tStatus(key) === "new" ? !!t.learned && (!!t.learnedOn || allSubsDone(key)) : !!t.revDone;
}
// Called after a subtopic tick: when every subtopic is done, the topic completes automatically.
function syncTopicCompletion(key) {
  const t = getT(key), full = allSubsDone(key);
  if (tStatus(key) === "new") {
    if (full && !(t.learned && t.learnedOn)) setT(key, { learned: true, learnedOn: today() });
  } else if (full && !t.revDone) setT(key, { revDone: true, revDoneOn: today() });
}

// ---------- PYQ stats ----------
function quizStats(list) {
  let att = 0, cor = 0, wrong = 0;
  list.forEach((q) => { const a = state.quiz[q.id]; if (a) { att++; if (a.ok) cor++; else wrong++; } });
  return { total: list.length, att, cor, wrong };
}
// Per topic: bank-based if the topic has bank questions, else estimated count + manual flag.
function topicPyq(key) {
  const list = QBYTOPIC[key];
  if (list && list.length) { const s = quizStats(list); return { ...s, est: false, remaining: s.total - s.att }; }
  const total = EST_PYQ[TOPIC[key].f] || 10, done = !!getT(key).pyq;
  return { total, att: done ? total : 0, cor: 0, wrong: 0, est: true, remaining: done ? 0 : total };
}

// ---------- auto planner ----------
function deadline() { return state.settings.deadline; }
function bufferFrom() { return addDays(deadline(), -(BUFFER_PLAN.length - 1)); }
function studyDays(from, toExcl) {
  const out = [];
  for (let d = from; d < toExcl; d = addDays(d, 1)) if (!isSunday(d)) out.push(d);
  return out;
}
function trackOf(key) { const t = TOPIC[key]; return t.sid === "ga" ? "G" : tStatus(key) === "new" ? "A" : "B"; }
function orderedTopics(track) {
  if (track === "G") return ALL_TOPICS.filter((t) => t.sid === "ga").map((t) => t.key);
  const order = [...TRACK_ORDER[track], ...SUBJECTS.map((s) => s.id).filter((id) => !TRACK_ORDER[track].includes(id))];
  const out = [];
  order.forEach((sid) => { if (sid === "ga") return; SUBJ[sid].topics.forEach((_, i) => { const k = `${sid}:${i}`; if (trackOf(k) === track) out.push(k); }); });
  return out;
}
// Work items of a topic. full=true → ignore progress (baseline).
function workItems(key, full) {
  const t = TOPIC[key], isNew = tStatus(key) === "new", hrs = isNew ? STUDY_HOURS : REVISE_HOURS;
  const items = [];
  if (full || !conceptDone(key)) t.subs.forEach((x, j) => { if (full || !subDone(key, j)) items.push({ key, kind: "sub", j, h: hrs[x.d] }); });
  const p = topicPyq(key), n = full ? p.total : p.remaining;
  if (n > 0) items.push({ key, kind: "pyq", n, h: (n * MIN_PER_PYQ) / 60 });
  return items;
}
function trackItems(track, full) { return orderedTopics(track).flatMap((k) => workItems(k, full)); }

// Spread items sequentially over days with equal load per day. Items can split across days.
function distribute(items, days) {
  const plan = {};
  days.forEach((d) => { plan[d] = []; });
  if (!days.length || !items.length) return plan;
  const total = sum(items.map((x) => x.h));
  const cap = total / days.length;
  let di = 0, room = cap;
  items.forEach((it) => {
    let left = it.h;
    while (left > 1e-6 && di < days.length) {
      const take = Math.min(left, room);
      const piece = { ...it, h: take };
      if (it.kind === "pyq") piece.n = Math.max(1, Math.round((it.n * take) / it.h));
      plan[days[di]].push(piece);
      left -= take; room -= take;
      if (room <= 1e-6) { di++; room = cap; }
    }
  });
  return plan;
}
function mergePieces(list) { // same key+kind+j on a day → one entry
  const m = new Map();
  list.forEach((x) => { const id = `${x.key}|${x.kind}|${x.j || 0}`; const e = m.get(id); if (e) { e.h += x.h; if (x.n) e.n += x.n; } else m.set(id, { ...x }); });
  return [...m.values()];
}

// Rolling plan from `from` (default today) to the buffer week, using remaining work.
function rollingPlan(from) {
  const start = from > PLAN_START ? from : PLAN_START;
  const days = studyDays(start, bufferFrom());
  const res = { days, tracks: {}, remH: {}, perDay: {} };
  ["A", "B", "G"].forEach((tr) => {
    const items = trackItems(tr, false);
    res.remH[tr] = sum(items.map((x) => x.h));
    res.perDay[tr] = days.length ? res.remH[tr] / days.length : res.remH[tr];
    res.tracks[tr] = distribute(items, days);
  });
  return res;
}
// Baseline (fixed from PLAN_START, full work) → expected progress by a date.
let _baseline = null;
function baseline() {
  if (_baseline) return _baseline;
  const days = studyDays(PLAN_START, bufferFrom());
  const totalH = sum(["A", "B", "G"].map((tr) => sum(trackItems(tr, true).map((x) => x.h))));
  _baseline = { days, totalH };
  return _baseline;
}
function invalidatePlan() { _baseline = null; }
function progressSummary() {
  const B = baseline(), t = today();
  const done = B.days.filter((d) => d < t).length;
  const expected = B.days.length ? (B.totalH * done) / B.days.length : 0;
  const rem = sum(["A", "B", "G"].map((tr) => sum(trackItems(tr, false).map((x) => x.h))));
  const actual = B.totalH - rem;
  const daysLeft = studyDays(t > PLAN_START ? t : PLAN_START, bufferFrom()).length;
  return { totalH: B.totalH, expected, actual, behind: expected - actual, remH: rem, daysLeft, needPerDay: daysLeft ? rem / daysLeft : rem };
}

// Today's plan is frozen once per day so it doesn't reshuffle while you tick things off.
function todayPlan(force) {
  const t = today();
  if (!force && state.frozen && state.frozen.date === t) return state.frozen;
  const rp = rollingPlan(t);
  const d = rp.days[0] === t ? t : null;
  const pick = (tr) => (d ? mergePieces(rp.tracks[tr][d] || []) : []);
  state.frozen = { date: t, A: pick("A"), B: pick("B"), G: pick("G") };
  save();
  return state.frozen;
}
function pieceDone(p) {
  if (p.kind === "sub") return subDone(p.key, p.j) || conceptDone(p.key);
  const s = topicPyq(p.key);
  return s.remaining === 0;
}
// Which phase is a date in?
function phaseOf(d) {
  if (d >= MOCK_PHASE_FROM) return "mock";
  if (d > deadline()) return "gap";
  if (d >= bufferFrom()) return "buffer";
  if (d < PLAN_START) return "pre";
  return isSunday(d) ? "sunday" : "study";
}

// ---------- spaced revision (R1/R2/R3 after a topic completes) ----------
const SPACED = [1, 7, 21];
function spacedDue(d) {
  const out = [];
  ALL_TOPICS.forEach((tp) => {
    const t = getT(tp.key), base = t.learnedOn || t.revDoneOn;
    if (!base || state.rev[tp.key]) return;
    const stage = t.r1 ? (t.r2 ? (t.r3 ? 3 : 2) : 1) : 0;
    if (stage >= 3) return;
    const since = stage === 0 ? base : stage === 1 ? t.r1On || base : t.r2On || base;
    const late = diffDays(d, since) - SPACED[stage];
    if (late >= 0) out.push({ key: tp.key, stage: "r" + (stage + 1), late });
  });
  return out.sort((a, b) => b.late - a.late);
}

// ---------- tough-topic revision queue (auto-filled) ----------
const REV_INTERVALS = [1, 3, 7, 14, 30];
function addRev(key, reason, dueToday = true) {
  if (!validTopicKey(key)) return;
  const r = state.rev[key];
  if (r) { if (!r.reasons.includes(reason)) r.reasons = [...r.reasons, reason].slice(-20); if (dueToday) r.next = today(); }
  else state.rev[key] = { added: today(), next: dueToday ? today() : addDays(today(), 1), stage: 0, reps: 0, reasons: [reason] };
}
function revStep(key, k) {
  const r = state.rev[key]; if (!r) return;
  r.reps++; r.stage = k < 0 ? 0 : Math.min(5, r.stage + k);
  r.next = addDays(today(), REV_INTERVALS[Math.min(REV_INTERVALS.length - 1, r.stage)]);
}
const dueRev = () => Object.entries(state.rev).filter(([, r]) => r.next <= today()).map(([k]) => k);

// ---------- PYQ quiz engine ----------
const LETTERS = ["A", "B", "C", "D"];
function normGiven(q, g) {
  if (q.ty === "MSQ") return LETTERS.filter((l) => String(g).toUpperCase().includes(l)).join("");
  if (q.ty === "NAT") return String(g).trim();
  return String(g).trim().toUpperCase().slice(0, 1);
}
function natRange(q) { const a = Array.isArray(q.ans) ? q.ans : [q.ans, q.ans]; return [+a[0], +(a[1] ?? a[0])]; }
function isCorrect(q, g) {
  if (q.ty === "NAT") { const v = parseFloat(g); const [lo, hi] = natRange(q); return Number.isFinite(v) && v >= Math.min(lo, hi) - 1e-9 && v <= Math.max(lo, hi) + 1e-9; }
  if (q.ty === "MSQ") return normGiven(q, g) === normGiven(q, q.ans);
  return normGiven(q, g) === String(q.ans).toUpperCase();
}
function ansText(q) {
  if (q.ty === "NAT") { const [lo, hi] = natRange(q); return lo === hi ? String(lo) : `${lo} to ${hi}`; }
  if (q.ty === "MSQ") return normGiven(q, q.ans).split("").join(", ");
  return String(q.ans).toUpperCase();
}
const expectedSecs = (q) => (q.m === 2 ? 180 : 90);

// Likely reason for a wrong answer (heuristic; you confirm it with one click).
function diagnose(q, g, secs, guess) {
  const key = `${q.sid}:${q.ti}`, sub = TOPIC[key].subs[q.sj];
  const lines = [];
  let specific = null; // type suggested by the answer itself
  if (q.ty === "MSQ") {
    const G = new Set(normGiven(q, g)), A = new Set(normGiven(q, q.ans));
    const missed = [...A].filter((x) => !G.has(x)), extra = [...G].filter((x) => !A.has(x));
    if (!extra.length && missed.length) lines.push(`Tumne sahi option(s) ${missed.join(", ")} miss kiye. MSQ me har option ko alag se true/false check karo.`);
    else if (extra.length && !missed.length) lines.push(`Extra galat option(s) ${extra.join(", ")} tick kiye. Jis option pe 100% sure nahi, uska counter-example socho.`);
    else lines.push("Options ka concept mix ho gaya — har option ko definition se verify karo.");
  }
  if (q.ty === "NAT") {
    const v = parseFloat(g), [lo, hi] = natRange(q), c = (lo + hi) / 2;
    if (Number.isFinite(v) && c) {
      const ratio = v / c;
      if (Math.abs(Math.abs(v - c) - 1) < 1e-9) { specific = "calc"; lines.push("Answer 1 se off hai — off-by-one (boundary, ≤ vs <, 0 vs 1 indexing) check karo."); }
      else if ([10, 100, 1000, 0.1, 0.01, 0.001, 2, 0.5, 8, 0.125, 1024, 1 / 1024].some((f) => Math.abs(ratio - f) < 1e-6)) { specific = "calc"; lines.push("Answer sahi ka multiple/fraction hai — unit (bits/bytes, ms/s, K/M) ya koi factor galat laga."); }
      else if (Math.abs(ratio - 1) < 0.05) { specific = "calc"; lines.push("Answer bahut close hai — rounding/approximation dekho (answer range me hona chahiye)."); }
    }
  }
  if (secs > 0 && secs < expectedSecs(q) * 0.25) { specific = specific || "read"; lines.push("Bahut jaldi answer diya — question dhyan se padho (NOT, 'minimum', 'at most' jaise words)."); }
  if (secs > expectedSecs(q) * 2.5) lines.push(`Is question pe ${Math.round(secs / 60)} min lage (expected ~${expectedSecs(q) / 60} min) — exam me time pressure banega; approach fast karo.`);
  if (q.trap) lines.push("Common trap: " + q.trap);
  let type = specific || "concept";
  if (guess) { type = "guess"; lines.unshift("Tumne guess mark kiya tha — is concept pe confidence nahi hai."); }
  if (tStatus(key) === "new" && !conceptDone(key)) {
    type = "notstudied";
    lines.unshift(`Ye topic (${TOPIC[key].n}) abhi tumhare plan me padhna baaki hai — pehle concept padho, phir ye question dobara karo.`);
  }
  if (!specific && type === "concept") lines.unshift(`Concept gap lag raha hai: "${sub ? sub.n : TOPIC[key].n}" ka concept dobara dekho.`);
  return { type, lines };
}

const ERR_LABEL = { concept: "Concept galat", silly: "Silly", calc: "Calculation", time: "Time", read: "Misread", guess: "Guess", notstudied: "Padha nahi" };

function recordAttempt(q, g, secs, guess) {
  const prev = state.quiz[q.id];
  const ok = isCorrect(q, g);
  state.quiz[q.id] = { g: normGiven(q, g), ok, at: today(), n: (prev ? prev.n : 0) + 1, t: Math.round(secs), guess: !!guess };
  const key = `${q.sid}:${q.ti}`, sub = TOPIC[key].subs[q.sj];
  let diag = null;
  if (!ok) {
    diag = diagnose(q, g, secs, guess);
    const eid = "q-" + q.id;
    const entry = sanitizeState({ errors: [{
      id: eid, date: today(), revised: false, subject: q.sid, type: diag.type, qid: q.id, tkey: key,
      q: `PYQ ${q.y}${q.set ? " set " + q.set : ""} Q${q.n} — ${TOPIC[key].n}${sub ? " › " + sub.n : ""}`,
      mistake: `Mera answer: ${normGiven(q, g) || "—"} · Sahi: ${ansText(q)}. ${diag.lines[0]}`,
      fix: q.concept ? "Concept: " + q.concept : `Revise: ${TOPIC[key].n}${sub ? " › " + sub.n : ""}`,
    }] }).errors[0];
    const i = state.errors.findIndex((e) => e.id === eid);
    if (i >= 0) state.errors[i] = entry; else state.errors.push(entry);
    addRev(key, `PYQ galat: ${q.y} Q${q.n}`);
  } else {
    if (guess) addRev(key, `Guess se sahi: ${q.y} Q${q.n}`, false);
    const e = state.errors.find((x) => x.id === "q-" + q.id);
    if (e) e.revised = true; // solved on retry
  }
  // accuracy check (5+ attempts, < 60%) → revision queue
  const s = quizStats(QBYTOPIC[key] || []);
  if (s.att >= 5 && s.cor / s.att < 0.6) addRev(key, `PYQ accuracy ${pct(s.cor, s.att)}%`);
  save();
  return { ok, diag };
}
function setErrType(qid, type) {
  const e = state.errors.find((x) => x.id === "q-" + qid);
  if (e && ERR_TYPES.includes(type)) { e.type = type; save(); }
}

// ---------- hours ----------
const pomoMins = (d) => (state.pomo[d] ? state.pomo[d].mins : 0);
function hoursOn(d) { const m = +((state.days[d] || {}).hours) || 0; return Math.max(m, pomoMins(d) / 60); }
function streak() {
  let d = today(), n = 0;
  const active = (x) => hoursOn(x) > 0 || Object.values((state.days[x] || {}).tasks || {}).some(Boolean) || Object.values(state.quiz).some((a) => a.at === x);
  if (!active(d)) d = addDays(d, -1);
  while (active(d)) { n++; d = addDays(d, -1); }
  return n;
}
