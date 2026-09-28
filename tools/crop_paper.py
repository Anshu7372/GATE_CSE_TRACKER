"""Crop every question of an official GATE paper PDF into an image + extract its text.
Usage: python3 tools/crop_paper.py <paper.pdf> <year> <outdir>   (needs: pip install pymupdf pillow)
Writes <outdir>/img/<year>-<n>.webp and <outdir>/meta.json."""
import pymupdf, re, json, io, sys, os
from PIL import Image, ImageOps
pdf, year, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir + '/img', exist_ok=True)
d = pymupdf.open(pdf)
NOISE = re.compile(r'^(CS|GA|CS\d?)$|Page \d+ of \d+|^GATE \d{4}|Organizing Institute|^Computer Science and Information Technology \(CS\)$|[Cc]arry (ONE|TWO) marks?|^Q\.\s?\d+\s*[–-]\s*Q\.\s?\d+|^General Aptitude|^\(GA\)$')
def page_lines(p):
    out = []
    for b in p.get_text('dict')['blocks']:
        if b.get('type') == 1:
            x0, y0, x1, y1 = b['bbox']; H = p.rect.height
            banner = (x1 - x0) > 250 and (y1 - y0) < 90 and (y0 > H * 0.8 or y1 < H * 0.15)
            if not banner: out.append(('<img>', b['bbox']))
            continue
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            if t and not NOISE.search(t): out.append((t, l['bbox']))
    return out
LINES = [page_lines(p) for p in d]
marks = {}
for pi, ls in enumerate(LINES):
    for t, bb in ls:
        m = re.fullmatch(r'Q\.\s?(\d{1,3})', t)
        if m and bb[0] < 115:
            n = int(m.group(1))
            if n not in marks: marks[n] = (pi, bb[1])
order = sorted(marks)
Z = 2.0
def render(pi, y0, y1):
    p = d[pi]
    if y1 - y0 < 6: return None, ''
    clip = pymupdf.Rect(40, y0, p.rect.width - 30, y1)
    pix = p.get_pixmap(matrix=pymupdf.Matrix(Z, Z), clip=clip)
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
    bb = ImageOps.invert(im.convert('L')).point(lambda v: 255 if v > 25 else 0).getbbox()
    if not bb: return None, ''
    im = im.crop((max(0, bb[0] - 12), max(0, bb[1] - 10), min(im.width, bb[2] + 12), min(im.height, bb[3] + 10)))
    return im, p.get_text(clip=clip)
def content_bottom(pi, y0, y1):
    ys = [bb[3] for t, bb in LINES[pi] if bb[1] >= y0 - 1 and bb[3] <= y1 + 1]
    return max(ys) if ys else None
def content_top(pi):
    ys = [bb[1] for t, bb in LINES[pi]]
    return min(ys) if ys else None
meta = {}
for i, n in enumerate(order):
    pi, y = marks[n]
    if i + 1 < len(order): npi, ny = marks[order[i + 1]]
    else:  # last question: stop before an answer-key / end page
        stop = next((k for k in range(pi + 1, len(d)) if re.search(r'Key\s*/\s*Range|END OF (THE )?QUESTION PAPER', d[k].get_text(), re.I)), None)
        npi, ny = (stop, 0) if stop is not None else (len(d) - 1, 10_000)
    segs = []
    if npi == pi:
        b = content_bottom(pi, y, ny - 2); segs.append((pi, y - 6, (b or y) + 14))
    else:
        b = content_bottom(pi, y, 10_000); segs.append((pi, y - 6, (b or y) + 14))
        for k in range(pi + 1, npi + 1):
            lim = ny - 2 if k == npi else 10_000
            top = content_top(k)
            if top is None or top >= lim: continue
            b = content_bottom(k, top, lim)
            if b: segs.append((k, top - 8, b + 14))
    parts, texts = [], []
    for s in segs:
        im, tx = render(*s)
        if im: parts.append(im); texts.append(tx)
    W = max(p.width for p in parts); H = sum(p.height for p in parts) + 10 * (len(parts) - 1)
    out = Image.new('RGB', (W, H), 'white'); yy = 0
    for p in parts: out.paste(p, (0, yy)); yy += p.height + 10
    out.save(f'{outdir}/img/{year}-{n}.webp', 'WEBP', quality=72, method=6)
    txt = '\n'.join(texts)
    txt = '\n'.join(l for l in (x.strip() for x in txt.split('\n')) if l and not NOISE.search(l))
    txt = re.sub(r'[ \t]+', ' ', txt)
    meta[n] = dict(pages=[s[0] + 1 for s in segs], text=txt, size=out.size)
json.dump(meta, open(f'{outdir}/meta.json', 'w'), ensure_ascii=False)
tot = sum(os.path.getsize(f'{outdir}/img/{year}-{n}.webp') for n in order)
print('questions', len(order), order[:3], order[-3:], 'size KB', round(tot / 1024))
print('tallest', sorted(((m['size'][1], n) for n, m in meta.items()), reverse=True)[:6])
