"""Parse an official GATE answer key (text) into rows {n (1..65 in paper order), ty, sec, key, m, lbl}.
Usage: parse_key2.py <pdf> <out.json> [--pages a,b,c]"""
import pymupdf, json, re, sys
d = pymupdf.open(sys.argv[1]); out = sys.argv[2]
pages = range(len(d))
if '--pages' in sys.argv: pages = [int(x) for x in sys.argv[sys.argv.index('--pages') + 1].split(',')]
toks = []
for i in pages: toks += [t.replace('\xa0', ' ').strip() for t in d[i].get_text().split('\n') if t.strip()]
merged = []
for t in toks:
    if merged and re.search(r'(\bto|\bOR|,)$', merged[-1], re.I): merged[-1] += ' ' + t
    else: merged.append(t)
toks = merged
SEC = r'(GA|CS(?:-?\d)?)'
rows, i = [], 0
while i < len(toks) - 4:
    t = toks[i:i + 6]
    m6 = len(t) == 6 and re.fullmatch(r'\d{1,2}', t[0]) and re.fullmatch(r'\d', t[1]) and t[2] in ('MCQ', 'MSQ', 'NAT') and re.fullmatch(SEC, t[3]) and re.fullmatch(r'\d', t[5])
    m5 = re.fullmatch(r'\d{1,2}', t[0]) and t[1] in ('MCQ', 'MSQ', 'NAT') and re.fullmatch(SEC, t[2]) and re.fullmatch(r'\d', t[4])
    if m6: rows.append(dict(ln=int(t[0]), ty=t[2], sec=t[3][:2], key=t[4], m=int(t[5]))); i += 6
    elif m5: rows.append(dict(ln=int(t[0]), ty=t[1], sec=t[2][:2], key=t[3], m=int(t[4]))); i += 5
    else: i += 1
ga = [r for r in rows if r['sec'] == 'GA']; cs = [r for r in rows if r['sec'] == 'CS']
if max(r['ln'] for r in rows) == 65:      # continuous numbering already (e.g. 2017: CS 1-55, GA 56-65)
    for r in rows: r['n'] = r['ln']
else:                                     # GA 1-10 then CS 1-55 in the paper
    for r in ga: r['n'] = r['ln']
    for r in cs: r['n'] = r['ln'] + 10
for r in rows: r['lbl'] = f"{r['sec']} Q.{r['ln']}"
rows.sort(key=lambda r: r['n'])
print(len(rows), 'GA', len(ga), 'CS', len(cs), 'missing', sorted(set(range(1, 66)) - {r['n'] for r in rows}))
print('special', [(r['n'], r['key']) for r in rows if not re.fullmatch(r'[A-D](\s*[;,]\s*[A-D])*|-?[\d.]+ to -?[\d.]+', r['key'])])
json.dump(rows, open(out, 'w'))
