// UGC NET PYQ section — separate bank (js/ugc-bank.js), syllabus (js/ugc-syllabus.js) and progress (state.ugc),
// so GATE stats, plan and revision queue are not touched. Explanations reuse explainBlock() from views.js.
"use strict";

const UGC_Q = (typeof UGC_BANK !== "undefined" && Array.isArray(UGC_BANK.q) ? UGC_BANK.q : []).filter((q) => UGC_UNIT[q.u]);
const UGC_BYID = Object.fromEntries(UGC_Q.map((q) => [q.id, q]));
const UGC_SESSIONS = [...new Set(UGC_Q.map((q) => q.s))];
const UGC_KS = {
  nta: "",
  pw: '<span class="chip warn" title="Answer key Physics Wallah ki hai (NTA official final key nahi). Solution me har answer verify kiya gaya hai.">🔑 PW key</span>',
  solved: '<span class="chip warn" title="Official key nahi mili — answer khud solve kiya gaya hai">🔑 self-solved</span>',
};
const ugcUi = { f: { p: "", u: "", t: "", s: "", st: "new", order: "paper" }, list: null, idx: 0, res: null, given: "", done: [] };

const ugcTag = (q) => { const u = UGC_UNIT[q.u]; return `Paper ${u.paper} › ${u.name} › ${u.topics[q.t] || ""}`; };
const ugcAtt = (q) => (state.ugc && state.ugc.quiz[q.id]) || null;

function ugcList(f) {
  let list = UGC_Q.filter((q) => (!f.p || q.p === +f.p) && (!f.u || q.u === f.u) && (f.t === "" || q.t === +f.t) && (!f.s || q.s === f.s));
  if (f.st === "new") list = list.filter((q) => !ugcAtt(q));
  else if (f.st === "wrong") list = list.filter((q) => ugcAtt(q) && !ugcAtt(q).ok);
  else if (f.st === "bm") list = list.filter((q) => state.ugc.bm[q.id]);
  if (f.order === "shuffle") list = list.map((q) => [Math.random(), q]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  return list.map((q) => q.id);
}

function viewUgc() { return ugcUi.list ? viewUgcSession() : viewUgcHome(); }

function viewUgcHome() {
  const f = ugcUi.f;
  const att = UGC_Q.filter(ugcAtt), cor = att.filter((q) => ugcAtt(q).ok).length, wrong = att.length - cor;
  const units = UGC_UNITS.filter((u) => !f.p || u.paper === +f.p);
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? "selected" : ""}>${esc(label)}</option>`;
  const unitOpts = opt("", "Sab units", f.u) + units.map((u) => opt(u.id, `P${u.paper} · ${u.name}`, f.u)).join("");
  const topicOpts = f.u ? opt("", "Sab topics", f.t) + UGC_UNIT[f.u].topics.map((t, i) => opt(i, t, f.t)).join("") : "";
  const n = ugcList(f).length;
  const rows = units.map((u) => {
    const qs = UGC_Q.filter((q) => q.u === u.id), a = qs.filter(ugcAtt), c = a.filter((q) => ugcAtt(q).ok).length;
    return `<tr><td><b>${esc(u.name)}</b> <span class="muted">Paper ${u.paper}</span></td><td>${qs.length}</td><td>${a.length}</td><td>${a.length ? pct(c, a.length) + "%" : "—"}</td>
      <td>${qs.length ? `<button class="btn ghost sm" data-ugcunit="${esc(u.id)}">▶ Practice</button>` : '<span class="muted tiny">abhi PYQ nahi</span>'}</td></tr>`;
  }).join("");
  return `${pageHead("🎓 UGC NET PYQ", `${UGC_Q.length} UGC NET (Computer Science &amp; Applications) PYQs, unit/topic-wise — har question pe hint, concept aur detailed solution. GATE ke stats se bilkul alag.`)}
    <section class="grid kpis">
      <div class="card kpi"><div class="kpi-n">${att.length}/${UGC_Q.length}</div><div class="kpi-l">attempted</div></div>
      <div class="card kpi"><div class="kpi-n">${pct(cor, att.length)}%</div><div class="kpi-l">accuracy</div></div>
      <div class="card kpi"><div class="kpi-n">${wrong}</div><div class="kpi-l">abhi galat (retry karo)</div></div>
    </section>
    <section class="card"><h2>Questions chuno</h2>
      <div class="form-grid">
        <label>Paper<select data-ugcf="p">${opt("", "Paper 1 + Paper 2", f.p)}${opt("1", "Paper 1 (Teaching & Research Aptitude)", f.p)}${opt("2", "Paper 2 (Computer Science)", f.p)}</select></label>
        <label>Unit<select data-ugcf="u">${unitOpts}</select></label>
        ${f.u ? `<label>Topic<select data-ugcf="t">${topicOpts}</select></label>` : ""}
        <label>Session<select data-ugcf="s">${opt("", "Sab sessions", f.s)}${UGC_SESSIONS.map((s) => opt(s, s, f.s)).join("")}</select></label>
        <label>Kaunse<select data-ugcf="st">${opt("new", "Naye (attempt nahi kiye)", f.st)}${opt("wrong", "Galat wale (retry)", f.st)}${opt("all", "Sab", f.st)}${opt("bm", "Bookmarked", f.st)}</select></label>
        <label>Order<select data-ugcf="order">${opt("paper", "Paper order", f.order)}${opt("shuffle", "Shuffle", f.order)}</select></label>
      </div>
      <div class="pills"><button class="btn" data-ugc="start" ${n ? "" : "disabled"}>▶ Start (${n} questions)</button>
        <button class="btn ghost" data-ugc="wrongall">❌ Saare galat retry (${wrong})</button></div>
    </section>
    <section class="card"><h2>Unit-wise</h2>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Unit</th><th>PYQs</th><th>Attempted</th><th>Accuracy</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="tiny muted">Abhi bank me: ${Object.entries(UGC_BANK.papers).map(([k, v]) => `${esc(v.session)} Paper ${esc(k.slice(-1))} (${+v.questions})`).join(", ")}. Answer key ka source har question pe dikhta hai (🔑 PW key = Physics Wallah, official NTA key nahi).</p>
    </section>`;
}

function viewUgcSession() {
  const U = ugcUi;
  if (U.idx >= U.list.length) {
    const d = U.done, cor = d.filter((x) => x.ok).length;
    return `${pageHead("🎓 UGC NET — khatam")}
      <section class="grid kpis"><div class="card kpi"><div class="kpi-n">${cor}/${d.length}</div><div class="kpi-l">sahi</div></div><div class="card kpi"><div class="kpi-n">${pct(cor, d.length)}%</div><div class="kpi-l">accuracy</div></div></section>
      <div class="pills"><button class="btn" data-ugc="exit">← UGC NET home</button>${d.some((x) => !x.ok) ? '<button class="btn ghost" data-ugc="retrysess">Galat wale dobara</button>' : ""}</div>`;
  }
  const q = UGC_BYID[U.list[U.idx]];
  if (!q) { U.idx++; return viewUgcSession(); }
  const res = U.res, prev = ugcAtt(q), img = safeImg(q.img);
  const opts = ["A", "B", "C", "D"].map((l) => {
    const chosen = U.given === l, correct = res && l === q.ans;
    return `<label class="opt ${correct ? "opt-ok" : ""} ${res && chosen && !correct ? "opt-bad" : ""}"><input type="radio" name="ugcopt" data-ugcopt="${l}" ${chosen ? "checked" : ""} ${res ? "disabled" : ""}><b>${l}.</b> <span></span></label>`;
  }).join("");
  return `${pageHead(`🎓 Q ${U.idx + 1} / ${U.list.length}`)}
    <section class="card qcard">
      <div class="q-meta"><span class="chip">UGC NET ${esc(q.s)} · Paper ${+q.p}</span><span class="chip">Q${+q.n}</span><span class="chip">MCQ</span>${UGC_KS[q.ks] || ""}
        <span class="chip ok">🏷 ${esc(ugcTag(q))}</span>
        ${prev && !res ? `<span class="chip ${prev.ok ? "ok" : "bad"}">pehle: ${prev.ok ? "sahi" : "galat"}</span>` : ""}
        <button class="btn ghost sm" data-ugc="bm">${state.ugc.bm[q.id] ? "★ Bookmarked" : "☆ Bookmark"}</button></div>
      ${img ? `<img class="qimg" src="${esc(img)}" alt="UGC NET ${esc(q.s)} question ${+q.n}">` : `<div class="qtext">${esc(q.q)}</div>`}
      <div class="opts">${opts}</div>
      ${!res ? `<div class="pills"><button class="btn" data-ugc="submit">Submit</button><button class="btn ghost" data-ugc="skip">Skip →</button><button class="btn ghost" data-ugc="exit">✕ Exit</button></div>` : `
      <div class="q-res ${res.ok ? "ok-card" : "bad-card"}">
        <h2>${res.ok ? "✅ Sahi!" : "❌ Galat"}</h2>
        <p>Sahi answer: <b>${esc(q.ans)}</b>${!res.ok ? ` · Tumhara: <b>${esc(U.given || "—")}</b>` : ""}</p>
        <p class="tiny">Concept samajhne ke liye neeche 📘 Concept aur ✅ Solution kholo.</p>
        <div class="pills"><button class="btn" data-ugc="next">Next →</button><button class="btn ghost" data-ugc="exit">✕ Exit</button></div>
      </div>`}
      ${explainBlock(q)}
    </section>`;
}

function ugcStart(ids) {
  ids = ids.filter((id) => UGC_BYID[id]);
  if (!ids.length) { toast("Koi question nahi mila"); return; }
  Object.assign(ugcUi, { list: ids, idx: 0, res: null, given: "", done: [] });
  ui.quiz.xp = {};
  go("ugc"); render(); window.scrollTo(0, 0);
}
function ugcNext() { Object.assign(ugcUi, { idx: ugcUi.idx + 1, res: null, given: "" }); ui.quiz.xp = {}; render(); window.scrollTo(0, 0); }

document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-ugc], [data-ugcunit]");
  if (!b) return;
  const D = b.dataset;
  if (D.ugcunit) { if (UGC_UNIT[D.ugcunit]) { ugcUi.f = { ...ugcUi.f, u: D.ugcunit, t: "", st: "all" }; ugcStart(ugcList(ugcUi.f)); } return; }
  const q = ugcUi.list ? UGC_BYID[ugcUi.list[ugcUi.idx]] : null;
  switch (D.ugc) {
    case "start": ugcStart(ugcList(ugcUi.f)); break;
    case "wrongall": ugcStart(UGC_Q.filter((x) => ugcAtt(x) && !ugcAtt(x).ok).map((x) => x.id)); break;
    case "retrysess": ugcStart(ugcUi.done.filter((x) => !x.ok).map((x) => x.id)); break;
    case "exit": ugcUi.list = null; render(); break;
    case "skip": case "next": ugcNext(); break;
    case "bm": if (q) { if (state.ugc.bm[q.id]) delete state.ugc.bm[q.id]; else state.ugc.bm[q.id] = true; save(); render(); } break;
    case "submit": {
      if (!q) break;
      if (!ugcUi.given) { toast("Pehle ek option chuno"); break; }
      const ok = ugcUi.given === q.ans, old = state.ugc.quiz[q.id];
      state.ugc.quiz[q.id] = { g: ugcUi.given, ok, at: today(), n: old ? Math.min(999, old.n + 1) : 1 };
      ugcUi.res = { ok }; ugcUi.done.push({ id: q.id, ok }); save(); render(); break;
    }
  }
});
document.addEventListener("change", (ev) => {
  const t = ev.target, D = t.dataset;
  if (D.ugcopt) { ugcUi.given = D.ugcopt; return; }
  if (D.ugcf) {
    const f = ugcUi.f; if (!(D.ugcf in f)) return;
    f[D.ugcf] = t.value;
    if (D.ugcf === "p") { f.u = ""; f.t = ""; }
    if (D.ugcf === "u") f.t = "";
    render();
  }
});
