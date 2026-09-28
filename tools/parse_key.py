"""Parse an official GATE answer-key PDF into JSON rows {n, ty, sec, key, m}.
Usage: python3 tools/parse_key.py <key.pdf> <out.json>   (needs: pip install pymupdf)"""
import pymupdf, json, re, sys
d = pymupdf.open(sys.argv[1]); out = sys.argv[2]
toks = []
for p in d: toks += [t.strip() for t in p.get_text().split('\n') if t.strip()]
# normalise "1 MCQ" → ["1","MCQ"]
flat = []
for t in toks:
    m = re.fullmatch(r'(\d)\s+(MCQ|MSQ|NAT)', t)
    flat += [m.group(1), m.group(2)] if m else [t]
rows, i = [], 0
while i < len(flat) - 5:
    if re.fullmatch(r'\d{1,2}', flat[i]) and re.fullmatch(r'\d', flat[i+1]) and flat[i+2] in ('MCQ','MSQ','NAT') and flat[i+3] in ('GA','CS'):
        rows.append(dict(n=int(flat[i]), ty=flat[i+2], sec=flat[i+3], key=flat[i+4], m=int(flat[i+5]))); i += 6
    else: i += 1
ns = [r['n'] for r in rows]
print(len(rows), 'missing', sorted(set(range(1, 66)) - set(ns)))
print([ (r['n'], r['key']) for r in rows if not re.fullmatch(r'[A-D](,\s?[A-D])*|-?[\d.]+ to -?[\d.]+', r['key'])])
json.dump(rows, open(out, 'w'))
