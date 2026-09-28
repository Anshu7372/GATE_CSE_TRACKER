"""Crop every question of a GATE paper PDF (text or scanned) into images, numbered 1..N in paper order.
Usage: python3 tools/crop_paper.py <paper.pdf> <year-tag> <outdir> [--scanned TOP BOTTOM] [--skip-pages a,b] [--markers markers.json]
  --scanned: image-only PDF; TOP/BOTTOM (pt) exclude header/footer.  --markers: [[page, y], ...] question starts for scans.
Needs: pip install pymupdf pillow"""
import pymupdf, re, json, io, sys, os
from PIL import Image, ImageOps
args = sys.argv[1:]
pdf, tag, outdir = args[:3]
scanned = '--scanned' in args
if scanned:
    k = args.index('--scanned'); TOPM, BOTM = float(args[k + 1]), float(args[k + 2])
skip = set()
if '--skip-pages' in args:
    skip = {int(x) for x in args[args.index('--skip-pages') + 1].split(',')}
os.makedirs(outdir + '/img', exist_ok=True)
d = pymupdf.open(pdf)
NOISE = re.compile(r'^(CS|GA|CS-?\d?)$|Page \d+ of \d+|^GATE \d{4}|Organizing Institute|Organising Institute|^Computer Science and Information Technology|[Cc]arry (ONE|TWO|one|two) marks?|^Q\.?\s?\d+\s*[–-]\s*Q\.?\s?\d+|^General Aptitude|^\(GA\)$|Copyright|^\d+/\d+$|^GA\s*-\s*General Aptitude|^CS\s*[-:]|Graduate Aptitude Test|^Home$|Information Brochure|GATE International|Pre Examination|Important Dates|^FAQs$|^Contact Us$|^IIT \w+$|^Correct\s*:|^Wrong\s*:', re.I)
MARK = [re.compile(r'^Q\.?\s?(\d{1,2})\.?(?:\s|$)(?!.*(carry|–))'), re.compile(r'^Q\.?\s?No\.?\s?(\d{1,2})$'), re.compile(r'^Question Number\s*:\s*(\d{1,2})?')]
END = re.compile(r'END OF (THE )?QUESTION PAPER', re.I)
def is_key_page(p):
    t = p.get_text()
    return bool(re.search(r'Key\s*/\s*Range|Answer Key|Q\.?\s?No\.?\s*\n?\s*(Session\s*\n?\s*)?(Question\s*\n?\s*)?Type', t))
KEYP = {i for i, p in enumerate(d) if is_key_page(p)} | skip
def page_lines(pi):
    p = d[pi]; out = []
    for b in p.get_text('dict')['blocks']:
        if b.get('type') == 1:
            x0, y0, x1, y1 = b['bbox']; H = p.rect.height
            banner = (x1 - x0) > 250 and (y1 - y0) < 90 and (y0 > H * 0.8 or y1 < H * 0.15)
            if not banner: out.append(('<img>', b['bbox']))
            continue
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            if t: out.append((t, l['bbox']))
    return out
Z = 2.0
def ink_rows(pi, x0=None, x1=None, thr=110):
    p = d[pi]; pix = p.get_pixmap(matrix=pymupdf.Matrix(Z, Z), colorspace=pymupdf.csGRAY)
    im = Image.frombytes('L', (pix.width, pix.height), pix.samples)
    if x0 is not None: im = im.crop((int(x0 * Z), 0, int(x1 * Z), im.height))
    px = im.load(); W, H = im.size
    return [any(px[x, y] < thr for x in range(0, W, 2)) for y in range(H)]
# ---- markers in document order ----
markers = []  # (page, y, local_number)
ends = {}     # page -> y of END OF QUESTION PAPER
MANUAL = None
if '--markers' in args:
    MANUAL = json.load(open(args[args.index('--markers') + 1]))
    ends = {int(k): v for k, v in MANUAL.get('ends', {}).items()}
LINES = {}
for pi in range(len(d)):
    if pi in KEYP: continue
    if MANUAL is not None:
        lab = ink_rows(pi, 60, 112)
        for mp, my in MANUAL['markers']:
            if mp != pi: continue
            markers.append((pi, my, None))
        continue
    if scanned:
        lab = ink_rows(pi, 76, 112); left = ink_rows(pi, 40, 74)
        y, H = int(TOPM * Z), int(BOTM * Z)
        while y < H:
            if lab[y] and not any(left[max(0, y - 4):y + 12]):
                y0 = y
                while y < H and lab[y]: y += 1
                if y - y0 > 10: markers.append((pi, y0 / Z, None))
                y += 20
            else: y += 1
        continue
    LINES[pi] = page_lines(pi)
    for t, bb in LINES[pi]:
        if END.search(t): ends[pi] = min(ends.get(pi, 1e9), bb[1])
        if bb[0] > 135: continue
        for rx in MARK:
            m = rx.match(t)
            if m: markers.append((pi, bb[1], int(m.group(1)) if m.group(1) else None)); break
markers.sort(key=lambda m: (m[0], m[1]))
# drop duplicate markers on the same line
clean = []
for m in markers:
    if clean and clean[-1][0] == m[0] and abs(clean[-1][1] - m[1]) < 4: continue
    clean.append(m)
markers = clean
print('markers', len(markers), 'local numbers', [m[2] for m in markers])
_INK = {}
def page_ink(pi):
    if pi not in _INK: _INK[pi] = ink_rows(pi)
    return _INK[pi]
def zones(pi):
    """(header_end, footer_start) in pt: scanned → fixed margins; text → from header/footer noise lines."""
    if scanned: return TOPM, BOTM
    H = d[pi].rect.height; he, fs = 0, H
    for t, bb in LINES.get(pi, []):
        if t == '<img>': continue
        noisy = NOISE.search(t) or END.search(t)
        if noisy and bb[3] < H * 0.2: he = max(he, bb[3] + 6)
        elif noisy and bb[1] > H * 0.8: fs = min(fs, bb[1] - 6)
    if pi in ends: fs = min(fs, ends[pi] - 2)
    first = [m[1] for m in markers if m[0] == pi]
    if first: he = min(he, min(first) - 8); fs = max(fs, max(first) + 20)
    return he, fs
def ink_between(pi, y0, y1):
    he, fs = zones(pi); r = page_ink(pi)
    lo, hi = int(max(y0, he) * Z), int(min(y1, fs) * Z)
    ys = [y for y in range(max(0, lo), min(len(r), hi)) if r[y]]
    return (ys[0] / Z, ys[-1] / Z) if ys else None
def content(pi):
    return ink_between(pi, 0, 1e9)
def bottom_between(pi, y0, y1):
    c = ink_between(pi, y0, y1)
    return c[1] if c else None
def render(pi, y0, y1):
    p = d[pi]
    he, fs = zones(pi); y0, y1 = max(y0, he - 2), min(y1, fs)
    if y1 - y0 < 6: return None, ''
    clip = pymupdf.Rect(4, y0, p.rect.width - 4, y1)
    pix = p.get_pixmap(matrix=pymupdf.Matrix(Z, Z), clip=clip)
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
    bb = ImageOps.invert(im.convert('L')).point(lambda v: 255 if v > 60 else 0).getbbox()
    if not bb: return None, ''
    im = im.crop((max(0, bb[0] - 12), max(0, bb[1] - 10), min(im.width, bb[2] + 12), min(im.height, bb[3] + 10)))
    return im, ('' if scanned else p.get_text(clip=clip))
def start_y(pi, y):
    # extend upward to include a block (e.g. the question image) that straddles the label line
    st = y - 6
    for t, bb in LINES.get(pi, []):
        if bb[1] < y - 1 and bb[3] > y + 4 and y - bb[1] < 80 and not NOISE.search(t): st = min(st, bb[1] - 4)
    return st
meta = {}
for i, (pi, y, local) in enumerate(markers):
    n = i + 1
    y0 = start_y(pi, y)
    if i + 1 < len(markers): npi, ny = markers[i + 1][0], markers[i + 1][1]
    else: npi, ny = len(d), 0
    lim_same = ends.get(pi, 1e9)
    segs = []
    if npi == pi:
        stop = min(start_y(npi, ny) + 4, lim_same)
        for t, bb in LINES.get(pi, []):
            if bb[1] > y + 4 and bb[1] < stop and t != '<img>' and re.search(r'carry (one|two) marks?|^CS\s*[:-]', t, re.I): stop = min(stop, bb[1] - 2)
        b = bottom_between(pi, y, stop); segs.append((pi, y0, (b or y) + 12))
    else:
        stop1 = lim_same
        for t, bb in LINES.get(pi, []):
            if bb[1] > y + 4 and t != '<img>' and re.search(r'carry (one|two) marks?|^CS\s*[:-]', t, re.I): stop1 = min(stop1, bb[1] - 2)
        b = bottom_between(pi, y, stop1); segs.append((pi, y0, (b or y) + 12))
        for k in range(pi + 1, min(npi + 1, len(d))):
            if k in KEYP: break
            c = content(k)
            if not c: continue
            top = c[0]; lim = ny - 2 if k == npi else 1e9
            for t, bb in LINES.get(k, []):
                if bb[1] >= top - 1 and bb[1] < lim and t != '<img>' and re.search(r'carry (one|two) marks?|^CS\s*[:-]', t, re.I): lim = min(lim, bb[1] - 2)
            if top >= lim: continue
            b = bottom_between(k, top, min(lim, ends.get(k, 1e9)))
            if b: segs.append((k, top - 8, b + 12))
            if k in ends: break
    parts, texts = [], []
    for s in segs:
        im, tx = render(*s)
        if im: parts.append(im); texts.append(tx)
    if not parts:
        print('EMPTY', n, segs, [zones(sg[0]) for sg in segs]); parts = [Image.new('RGB', (10, 10), 'white')]
    W = max(p.width for p in parts); H = sum(p.height for p in parts) + 10 * (len(parts) - 1)
    out = Image.new('RGB', (W, H), 'white'); yy = 0
    for p in parts: out.paste(p, (0, yy)); yy += p.height + 10
    out.save(f'{outdir}/img/{tag}-{n}.webp', 'WEBP', quality=72, method=6)
    txt = '\n'.join(texts)
    txt = '\n'.join(l for l in (x.strip() for x in txt.split('\n')) if l and not NOISE.search(l))
    meta[n] = dict(pages=[s[0] + 1 for s in segs], text=re.sub(r'[ \t]+', ' ', txt), size=out.size, local=local)
json.dump(meta, open(f'{outdir}/meta.json', 'w'), ensure_ascii=False)
tot = sum(os.path.getsize(f'{outdir}/img/{tag}-{n}.webp') for n in meta)
print('questions', len(meta), 'KB', round(tot / 1024), 'tallest', sorted(((m['size'][1], n) for n, m in meta.items()), reverse=True)[:5], 'key pages', sorted(KEYP))
