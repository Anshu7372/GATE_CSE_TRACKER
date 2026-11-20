#!/usr/bin/env python3
"""Build the UGC NET "Expected Papers" (predicted practice sets) from pyq/ugc/expected/<set>.md.

Writes:
  js/ugc-expected.js                 all sets (questions with option text, answer, unit/topic)
  js/explain/ugc-exp-<set>.js        hint / concept / tips / solution / refs per question (lazy-loaded)

Source format — one file per set (e.g. pyq/ugc/expected/2026-12-s1.md):

    # title: Expected Paper 1 — UGC NET Dec 2026
    @@P 1                                 passage block, referenced by questions with "pas: 1"
    Passage text …
    @@ 12
    u: p2u4 3                             unit id + topic index (js/ugc-syllabus.js)
    f: single | stmts | match | arrange | passage
    pas: 1                                (passage questions only)
    q:
    Question stem (any number of lines; statement lists, List-I / List-II go here)
    o:
    A. option text
    B. option text
    C. option text
    D. option text
    ans: B
    == hint / == concept / == tips / == sol / == refs   (same markdown-lite as pyq/explain/*.md)

Usage:  python3 tools/build_ugc_expected.py
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "pyq" / "ugc" / "expected"
SECTIONS = ("hint", "concept", "tips", "sol", "refs")
FORMATS = ("single", "stmts", "match", "arrange", "passage")


def units():
    src = (ROOT / "js" / "ugc-syllabus.js").read_text()
    return {m.group(1): len(re.findall(r'"[^"]*"', m.group(2)))
            for m in re.finditer(r'id: "(p\du\d+)".*?topics: \[(.*?)\] \}', src)}


def parse(path):
    title, passages, qs = "", {}, {}
    cur = sec = None
    for ln, line in enumerate(path.read_text().split("\n"), 1):
        where = f"{path.name}:{ln}"
        m = re.match(r"^# title:\s*(.+)$", line)
        if m:
            title = m.group(1).strip()
            continue
        m = re.match(r"^@@P\s*(\d+)\s*$", line)
        if m:
            cur, sec = {"_pas": m.group(1)}, "text"
            passages[m.group(1)] = cur
            cur["text"] = []
            continue
        m = re.match(r"^@@\s*(\d{1,3})\s*$", line)
        if m:
            n = int(m.group(1))
            if n in qs:
                raise SystemExit(f"{where}: duplicate question {n}")
            cur, sec = {"n": n, "q": [], "o": []}, None
            qs[n] = cur
            continue
        if cur is None:
            continue
        if "_pas" not in cur and sec in (None, "q", "o"):
            m = re.match(r"^(u|f|pas|ans):\s*(.*)$", line)
            if m and sec != "q":
                cur[m.group(1)] = m.group(2).strip()
                sec = None
                continue
            if line.strip() in ("q:", "o:"):
                sec = line.strip()[0]
                continue
        m = re.match(r"^==\s*(\w+)\s*$", line)
        if m and "_pas" not in cur:
            sec = m.group(1)
            if sec not in SECTIONS:
                raise SystemExit(f"{where}: unknown section {sec!r}")
            cur[sec] = []
            continue
        if sec:
            cur[sec].append(line)
    return title, passages, qs


def build_set(path, U):
    sid = path.stem                                   # e.g. 2026-12-s1
    title, passages, qs = parse(path)
    xp = f"ugc-exp-{sid}"
    out, expl, problems = [], {}, []
    if not title:
        problems.append("missing '# title:'")
    if sorted(qs) != list(range(1, len(qs) + 1)):
        problems.append(f"question numbers not 1..{len(qs)}")
    for n in sorted(qs):
        x = qs[n]
        p = f"Q{n}"
        try:
            u, t = x.get("u", "").split()
            t = int(t)
        except ValueError:
            problems.append(f"{p}: bad 'u:' line")
            continue
        if u not in U or not 0 <= t < U[u]:
            problems.append(f"{p}: unknown unit/topic {u} {t}")
        if x.get("f") not in FORMATS:
            problems.append(f"{p}: bad format {x.get('f')!r}")
        opts = {}
        for line in x["o"]:
            if not line.strip():
                continue
            m = re.match(r"^([ABCD])\.\s+(.+)$", line.strip())
            if not m or m.group(1) in opts:
                problems.append(f"{p}: bad option line {line!r}")
                continue
            opts[m.group(1)] = m.group(2).strip()
        if sorted(opts) != list("ABCD"):
            problems.append(f"{p}: need options A-D, got {sorted(opts)}")
        if len(set(opts.values())) != len(opts):
            problems.append(f"{p}: duplicate option text")
        ans = x.get("ans", "")
        if ans not in ("A", "B", "C", "D"):
            problems.append(f"{p}: bad answer {ans!r}")
        stem = "\n".join(x["q"]).strip()
        if not stem:
            problems.append(f"{p}: empty question")
        pas = ""
        if x.get("f") == "passage":
            if x.get("pas") not in passages:
                problems.append(f"{p}: passage {x.get('pas')!r} not defined")
            else:
                pas = "\n".join(passages[x["pas"]]["text"]).strip()
        for s in SECTIONS:
            if not "\n".join(x.get(s, [])).strip():
                problems.append(f"{p}: empty '{s}'")
        sol = "\n".join(x.get("sol", []))
        m = re.search(r"\*\*Answer:\s*\(([ABCD])\)", sol)
        if not m:
            problems.append(f"{p}: solution must end with **Answer: (X) …**")
        elif m.group(1) != ans:
            problems.append(f"{p}: solution says {m.group(1)} but ans is {ans}")
        qid = f"ugc-exp-{sid}-{n}"
        q = {"id": qid, "xp": xp, "set": sid, "n": n, "u": u, "t": t, "f": x.get("f"), "q": stem,
             "o": [opts.get(k, "") for k in "ABCD"], "ans": ans}
        if pas:
            q["pas"] = pas
        out.append(q)
        expl[qid] = {"syl": {"s": "in", "why": ""}, **{s: "\n".join(x.get(s, [])).strip() for s in SECTIONS}}
    if problems:
        raise SystemExit(f"{path.name}: " + "\n  ".join([""] + problems))
    dist = Counter(q["ans"] for q in out)
    (ROOT / "js" / "explain" / f"{xp}.js").write_text(
        f"/* Generated by tools/build_ugc_expected.py from pyq/ugc/expected/{path.name} — edit the .md, not this file. */\n"
        f"Object.assign((window.PYQ_EXPLAIN = window.PYQ_EXPLAIN || {{}}), "
        f"{json.dumps(expl, ensure_ascii=False, separators=(',', ':'))});\n")
    print(f"{sid}: {len(out)} questions, answers {dict(sorted(dist.items()))}, units {dict(sorted(Counter(q['u'] for q in out).items(), key=lambda kv: int(kv[0][3:])))}")
    return {"id": sid, "title": title, "questions": len(out)}, out


def main():
    U = units()
    sets, qs = [], []
    for path in sorted(SRC.glob("*.md")):
        meta, out = build_set(path, U)
        sets.append(meta)
        qs += out
    body = ",\n".join("  " + json.dumps(q, ensure_ascii=False, separators=(",", ":")) for q in qs)
    (ROOT / "js" / "ugc-expected.js").write_text(
        "/* UGC NET expected (predicted) practice papers — generated by tools/build_ugc_expected.py\n"
        "   from pyq/ugc/expected/*.md (edit those, not this file). These are NOT official or leaked papers:\n"
        "   they are written from an analysis of past UGC NET CS papers. q: {id, xp, set, n, u, t, f (format),\n"
        "   q (stem), o (option texts A-D), ans, pas (passage text, passage questions only)} */\n"
        f"const UGC_EXPECTED = {{\n sets: {json.dumps(sets, ensure_ascii=False)},\n q: [\n{body}\n ],\n}};\n")
    print(f"js/ugc-expected.js: {len(qs)} questions in {len(sets)} sets")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(__doc__)
        sys.exit(1)
    main()
