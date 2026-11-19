"""Crop every question of a two-column compiled paper (e.g. the PW UGC NET papers: "Q12" labels in the left
margin of each column, header at the top, app links at the bottom, a large watermark logo in the middle)
into one image per question, in reading order: page by page, left column then right column.
A question that runs past the bottom of a column continues at the top of the next column / page;
its pieces are stacked into one image. The watermark image is removed before rendering.

Usage: python3 tools/crop_two_column.py <paper.pdf> <tag> <outdir> --pages a-b [--last N]
  --pages: 1-based page range that holds the questions (answer key / solutions pages excluded)
Writes <outdir>/img/<tag>-<n>.webp and <outdir>/meta.json (same format as crop_paper.py).
Needs: pip install pymupdf pillow"""
import io
import json
import os
import re
import sys

import pymupdf
from PIL import Image

pdf, tag, outdir = sys.argv[1:4]
a, b = (int(x) for x in sys.argv[sys.argv.index('--pages') + 1].split('-'))
PAGES = range(a - 1, b)
os.makedirs(outdir + '/img', exist_ok=True)
d = pymupdf.open(pdf)
Z = 2.0
TOP, BOT = 47, 766            # below the "UGC NET" header, above the app-links footer
MARK = re.compile(r'^Q(\d{1,3})\.?$')
PASSAGE = re.compile(r'^Directions\s*\(?\s*(\d{1,3})\s*[-–]\s*(\d{1,3})\s*\)?')  # shared passage for a range of questions


def divider(p):
    """x of the vertical rule between the columns (falls back to the page centre)."""
    for dr in p.get_drawings():
        r = dr['rect']
        if r.height > 300 and r.width < 6:
            return (r.x0 + r.x1) / 2
    return p.rect.width / 2


XREF_PAGES = {}  # image xref -> number of question pages it appears on
for _pi in PAGES:
    for _img in d[_pi].get_images(full=True):
        XREF_PAGES[_img[0]] = XREF_PAGES.get(_img[0], 0) + 1


def strip_watermark(p):
    """Remove the big centred logo: a large image repeated on most pages (a question's own figure is not)."""
    for img in p.get_images(full=True):
        if XREF_PAGES.get(img[0], 0) < max(3, len(PAGES) // 2):
            continue
        for r in p.get_image_rects(img[0]):
            if r.width > 200 and r.height > 200:
                p.delete_image(img[0])
                break


cols = {}      # page -> [(x0, x1), (x0, x1)]
lines = {}     # (page, col) -> [(text, bbox)]
markers = []   # (page, col, y, number)
for pi in PAGES:
    p = d[pi]
    strip_watermark(p)
    mid = divider(p)
    cols[pi] = [(18, mid - 2), (mid + 2, p.rect.width - 18)]
    for ci in (0, 1):
        lines[(pi, ci)] = []
    for blk in p.get_text('dict')['blocks']:
        for l in blk.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            x0, y0, x1, y1 = l['bbox']
            if not t or y1 < TOP or y0 > BOT:
                continue
            ci = 0 if x0 < mid else 1
            lines[(pi, ci)].append((t, l['bbox']))
            m = MARK.match(t)
            if m and x0 < cols[pi][ci][0] + 25:
                markers.append((pi, ci, y0, int(m.group(1))))
            m = PASSAGE.match(t)
            if m:
                markers.append((pi, ci, y0, ('P', int(m.group(1)), int(m.group(2)))))
markers.sort(key=lambda m: (m[0], m[1], m[2]))
nums = [m[3] for m in markers if not isinstance(m[3], tuple)]
print('markers', len(markers), 'first/last', nums[:3], nums[-3:])
gaps = [n for i, n in enumerate(nums) if n != i + 1]
if gaps:
    print('WARNING: numbering not 1..N at', gaps[:10])

order = [(pi, ci) for pi in PAGES for ci in (0, 1)]


def render(pi, ci, y0, y1):
    x0, x1 = cols[pi][ci]
    pix = d[pi].get_pixmap(matrix=pymupdf.Matrix(Z, Z), clip=pymupdf.Rect(x0, y0, x1, y1))
    im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
    gray = im.convert('L').point(lambda v: 255 if v < 200 else 0)
    bb = gray.getbbox()
    if not bb:
        return None
    return im.crop((max(0, bb[0] - 8), max(0, bb[1] - 6), min(im.width, bb[2] + 8), min(im.height, bb[3] + 6)))


meta, pieces, passages = {}, {}, []
for i, (pi, ci, y, n) in enumerate(markers):
    nxt = markers[i + 1] if i + 1 < len(markers) else None
    segs, k = [], order.index((pi, ci))
    start = y - 3
    while True:
        p2, c2 = order[k]
        if nxt and (p2, c2) == (nxt[0], nxt[1]):
            segs.append((p2, c2, start, nxt[2] - 3))
            break
        segs.append((p2, c2, start, BOT))
        k += 1
        if k >= len(order):
            break
        start = TOP
    parts, texts = [], []
    for p2, c2, y0, y1 in segs:
        if y1 - y0 < 4:
            continue
        im = render(p2, c2, y0, y1)
        if im:
            parts.append(im)
        texts += [t for t, bb in lines[(p2, c2)] if y0 - 1 <= bb[1] < y1]
    if isinstance(n, tuple):
        passages.append((n[1], n[2], parts, texts))
        continue
    pieces[n] = (parts, texts, segs)
for n, (parts, texts, segs) in pieces.items():
    for lo, hi, pparts, ptexts in passages:
        if lo <= n <= hi:                       # put the shared passage above the question
            parts, texts = pparts + parts, ptexts + texts
    W = max(p.width for p in parts)
    H = sum(p.height for p in parts) + 8 * (len(parts) - 1)
    out = Image.new('RGB', (W, H), 'white')
    yy = 0
    for part in parts:
        out.paste(part, (0, yy))
        yy += part.height + 8
    out.save(f'{outdir}/img/{tag}-{n}.webp', 'WEBP', quality=72, method=6)
    meta[n] = dict(pages=sorted({s[0] + 1 for s in segs}), text=re.sub(r'[ \t]+', ' ', '\n'.join(texts)), size=out.size, local=n)
json.dump(meta, open(f'{outdir}/meta.json', 'w'), ensure_ascii=False)
tot = sum(os.path.getsize(f'{outdir}/img/{tag}-{n}.webp') for n in meta)
print('questions', len(meta), 'KB', round(tot / 1024), 'tallest', sorted(((m['size'][1], n) for n, m in meta.items()), reverse=True)[:5])
