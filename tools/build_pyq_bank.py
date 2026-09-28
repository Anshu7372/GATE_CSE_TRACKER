#!/usr/bin/env python3
"""Build the PYQ bank (js/pyq-bank.js) from per-year data in pyq/data/.

Per year (e.g. 2023) the inputs are:
  pyq/data/<year>-map.tsv   n <TAB> sid:topic:subtopic <TAB> concept   (hand-classified)
  pyq/data/<year>.json      questions (key + text), created by `add-year`
  pyq/img/<year>-<n>.webp   cropped question images

Usage:
  python3 tools/build_pyq_bank.py add-year 2023 key.json meta.json   # key/meta from the PDF extraction step
  python3 tools/build_pyq_bank.py build                              # regenerate js/pyq-bank.js
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "pyq" / "data"


def parse_key(ty, key):
    """Official key → (ans, alt, mta). Handles 'MTA', 'A, C, D or C, D', '2 to 2 OR 4 to 4'."""
    key = key.strip()
    if key.upper() == "MTA":
        return None, [], True
    options = [k.strip() for k in re.split(r"\s+or\s+", key, flags=re.I) if k.strip()]

    def one(k):
        if ty == "NAT":
            m = re.fullmatch(r"(-?[\d.]+)\s*to\s*(-?[\d.]+)", k)
            if not m:
                raise ValueError(f"bad NAT key {k!r}")
            return [float(m.group(1)), float(m.group(2))]
        letters = "".join(sorted(set(re.findall(r"[A-D]", k.upper()))))
        if not letters:
            raise ValueError(f"bad key {k!r}")
        return letters

    vals = [one(k) for k in options]
    return vals[0], vals[1:], False


def add_year(year, key_path, meta_path):
    key = {r["n"]: r for r in json.load(open(key_path))}
    meta = {int(n): m for n, m in json.load(open(meta_path)).items()}
    mapping = {}
    for line in (DATA / f"{year}-map.tsv").read_text().splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        n, loc, concept = line.split("\t")
        sid, ti, sj = loc.split(":")
        mapping[int(n)] = (sid, int(ti), int(sj), concept.strip())
    missing = sorted(set(key) - set(mapping))
    if missing:
        raise SystemExit(f"unclassified questions: {missing}")
    out = []
    for n in sorted(key):
        k = key[n]
        sid, ti, sj, concept = mapping[n]
        ans, alt, mta = parse_key(k["ty"], k["key"])
        img = ROOT / "pyq" / "img" / f"{year}-{n}.webp"
        if not img.exists():
            raise SystemExit(f"missing image {img}")
        text = re.sub(r"^Q\.?\s?\d+\s*", "", meta[n]["text"]).strip()
        text = re.sub(r"\s*Q\.\s?\d+\s*$", "", text).strip()
        yr, _, st = str(year).partition("-")
        q = {"id": f"{year}-{n}", "y": int(yr), "n": n, "m": k["m"], "ty": k["ty"], "sid": sid, "ti": ti, "sj": sj,
             "img": f"pyq/img/{year}-{n}.webp", "q": text[:1500], "ans": ans, "concept": concept}
        if st:
            q["set"] = int(st)
        if k.get("lbl") and k.get("ln", n) != n:
            q["lbl"] = k["lbl"]  # paper numbers GA and CS separately
        if alt:
            q["alt"] = alt
        if mta:
            q["mta"] = True
        out.append(q)
    (DATA / f"{year}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"{year}: {len(out)} questions")


def build():
    subjects = set(re.findall(r'id: "([a-z]+)"', (ROOT / "js" / "syllabus.js").read_text()))
    qs, papers = [], {}
    for f in sorted(DATA.glob("[0-9][0-9][0-9][0-9]*.json")):
        year_qs = json.loads(f.read_text())
        for q in year_qs:
            assert q["sid"] in subjects, q["id"]
        qs += year_qs
        papers[f.stem] = {"questions": len(year_qs)}
    body = ",\n".join("  " + json.dumps(q, ensure_ascii=False, separators=(",", ":")) for q in qs)
    header = (ROOT / "js" / "pyq-bank.js").read_text().split("const PYQ_BANK")[0]
    js = f"{header}const PYQ_BANK = {{\n papers: {json.dumps(papers)},\n q: [\n{body}\n ],\n}};\n"
    (ROOT / "js" / "pyq-bank.js").write_text(js)
    print(f"js/pyq-bank.js: {len(qs)} questions from {', '.join(papers)}")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "build":
        build()
    elif len(sys.argv) == 5 and sys.argv[1] == "add-year":
        add_year(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print(__doc__)
        sys.exit(1)
