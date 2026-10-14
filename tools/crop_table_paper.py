"""Crop every question of a table-layout GATE paper (GATE 2026 onwards: each question is a bordered table
with a large empty answer box and a watermark image) into images, numbered 1..N in paper order.
Crops stop at the table row under the last real content, so the empty answer box, watermark-only
space, page header (logo + paper name) and footer are left out.
Usage: python3 tools/crop_table_paper.py <paper.pdf> <year-tag> <outdir>
Writes <outdir>/img/<tag>-<n>.webp and <outdir>/meta.json (same format as crop_paper.py).
Needs: pip install pymupdf pillow"""
import pymupdf, re, json, io, sys, os
from PIL import Image
pdf, tag, outdir = sys.argv[1:4]
os.makedirs(outdir + '/img', exist_ok=True)
d = pymupdf.open(pdf)
Z = 2.0
NOISE = re.compile(r'Organi[sz]ing Institute|Page \d+ of \d+|^Computer Science (&|and) Information Technology|'
                   r'[Cc]arry (ONE|TWO) [Mm]arks?|^General Aptitude|^Q\.\s?\d+\s*[–-]\s*Q\.\s?\d+|END OF (THE )?QUESTION PAPER', re.I)
MARK = re.compile(r'^Q\.\s?(\d{1,2})(?:\s|$)(?!.*([Cc]arry|–))')  # label may share a line with the question text


def page_items(pi):
    """Real content of a page: [(kind, text, bbox)], without header/footer, watermark, logo and blank lines."""
    p = d[pi]; W, H = p.rect.width, p.rect.height; out = []
    for b in p.get_text('dict')['blocks']:
        x0, y0, x1, y1 = b['bbox']
        if b['type'] == 1:
            if y1 < 85 or y0 > H - 50: continue                      # logo / footer
            if (x1 - x0) > 300 and (y1 - y0) > 350: continue        # watermark
            out.append(('img', '', b['bbox'])); continue
        for l in b['lines']:
            t = ''.join(s['text'] for s in l['spans']).strip()
            if not t or NOISE.search(t): continue
            if l['bbox'][3] < 85 or l['bbox'][1] > H - 45: continue
            out.append(('txt', t, l['bbox']))
    # vector figures (anything that is not a straight table border)
    for dr in p.get_drawings():
        r = dr['rect']
        if r.width > 2 and r.height > 2 and r.y0 > 85 and r.y1 < H - 45 and not (r.width > 400 and r.height > 300):
            pale = min(dr['fill'] or (0,)) >= 0.7 or (dr.get('fill_opacity') or 1) < 0.9  # watermark letters
            if dr.get('fill') is not None and r.width < 400 and not pale:
                out.append(('fig', '', tuple(r)))
    return out


def hlines(pi):
    ys = set()
    for dr in d[pi].get_drawings():
        for it in dr['items']:
            if it[0] == 'l' and abs(it[1].y - it[2].y) < 1 and abs(it[1].x - it[2].x) > 100: ys.add(round(it[1].y, 1))
            elif it[0] == 're' and it[1].height < 2 and it[1].width > 100: ys.add(round(it[1].y0, 1))
    return sorted(ys)


def para_top(pi, lb):
    """No table borders (e.g. GATE 2024): the label is centred beside the question's first lines,
    so walk up from the text line next to the label while the lines are packed together."""
    body = sorted((it[2] for it in ITEMS[pi] if it[0] == 'txt' and it[2][0] >= 110), key=lambda b: b[1])
    cur = [b for b in body if b[1] <= lb[3] and b[3] >= lb[1]]
    if not cur: return lb[1]
    top = min(b[1] for b in cur)
    while True:
        prev = [b for b in body if top - 6 <= b[3] <= top + 1 and b[1] < top - 1]
        if not prev: return min(top, lb[1])
        top = min(b[1] for b in prev)


ITEMS = {pi: page_items(pi) for pi in range(len(d))}
HL = {pi: hlines(pi) for pi in range(len(d))}
markers = []
for pi in range(len(d)):
    for k, t, bb in ITEMS[pi]:
        m = MARK.match(t) if k == 'txt' and bb[0] < 100 else None
        if m:  # anchor at the top border of the label's row (the label may be vertically centred in a tall cell)
            above = [h for h in HL[pi] if bb[1] - 150 <= h <= bb[1] + 1]
            markers.append((pi, max(above) if above else para_top(pi, bb), int(m.group(1))))
markers.sort()
print('markers', len(markers), [m[2] for m in markers])


def line_above(pi, y, lim=25):
    c = [h for h in HL[pi] if y - lim <= h <= y]
    return max(c) if c else y - 6


def line_below(pi, y, lim=45):
    c = [h for h in HL[pi] if y <= h <= y + lim]
    return min(c) if c else y + 8


def render(pi, y0, y1, x0=60, x1=None):
    p = d[pi]
    clip = pymupdf.Rect(min(60, x0), y0 - 1, max(p.rect.width - 60, x1 or 0), y1 + 1)
    pix = p.get_pixmap(matrix=pymupdf.Matrix(Z, Z), clip=clip)
    return Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')


meta = {}
for i, (pi, y, local) in enumerate(markers):
    n = i + 1
    npi, ny = (markers[i + 1][0], markers[i + 1][1]) if i + 1 < len(markers) else (len(d) - 1, 1e9)
    segs, texts = [], []
    for k in range(pi, npi + 1):
        lo = line_above(k, y) - 1 if k == pi else 0  # first text line can sit a little above the Q.n label
        hi = line_above(k, ny) - 1 if k == npi else 1e9  # stop at the next question's table border
        its = [it for it in ITEMS[k] if it[2][1] >= lo and it[2][1] < hi]
        if not its: continue
        top = line_above(k, min(it[2][1] for it in its))
        bot = line_below(k, max(it[2][3] for it in its))
        segs.append((k, top, bot, min(it[2][0] for it in its) - 4, min(d[k].rect.width - 4, max(it[2][2] for it in its) + 4)))  # figures may stick out of the table
        texts += [t for kk, t, _ in its if kk == 'txt']
    parts = [render(*s) for s in segs]
    W = max(p.width for p in parts); H = sum(p.height for p in parts) + 6 * (len(parts) - 1)
    out = Image.new('RGB', (W, H), 'white'); yy = 0
    for p in parts: out.paste(p, (0, yy)); yy += p.height + 6
    out.save(f'{outdir}/img/{tag}-{n}.webp', 'WEBP', quality=72, method=6)
    meta[n] = dict(pages=[s[0] + 1 for s in segs], text=re.sub(r'[ \t]+', ' ', '\n'.join(texts)), size=out.size, local=local)
json.dump(meta, open(f'{outdir}/meta.json', 'w'), ensure_ascii=False)
tot = sum(os.path.getsize(f'{outdir}/img/{tag}-{n}.webp') for n in meta)
print('questions', len(meta), 'KB', round(tot / 1024), 'tallest', sorted(((m['size'][1], n) for n, m in meta.items()), reverse=True)[:5])
