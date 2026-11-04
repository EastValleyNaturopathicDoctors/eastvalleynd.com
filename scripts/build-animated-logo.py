#!/usr/bin/env python3
"""
Builds public/assets/EVND-animated.svg, the header logo, from the clinic's
logo (public/assets/EVND-logo.svg, Nov 2026, set in Roboto SemiBold) and
Roboto SemiBold itself (node_modules/@fontsource/roboto) for the rest of the
name.

The motion is the one the header has had since D127, on the same 11 s clock:
EVND holds, its leaf swaying; then each big letter shrinks into the first
letter of its word (E-AST V-ALLEY, N-ATUROPATHIC D-OCTORS), the rest of each
word slides out from behind it, a rule draws between the lines, and the leaf
settles at the end of EAST VALLEY. Then it folds back. N and D go from green
to the logo's grey as they shrink (the clinic asked, Oct 2026, for ND green
in EVND only), so the spelled-out name reads in one colour.

The supplied file is the white-on-dark version; on the header's white the
letters take the colours of evnd-logo.png (the logo the footer and favicon
use): grey E V, green N D, a light-green leaf. No script and no web font:
everything is paths, and under reduced motion it holds on EVND.

  pip install fonttools
  python3 scripts/build-animated-logo.py
"""
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / 'public/assets/EVND-logo.svg'
FONT = ROOT / 'node_modules/@fontsource/roboto/files/roboto-latin-600-normal.woff'
OUT = ROOT / 'public/assets/EVND-animated.svg'

W, H = 2984.0, 1204.0          # the logo's own box (its viewBox)
GREY, GREEN, LEAF = '#676767', '#56B400', '#AAD97F'
# Unfolded (the clinic, Nov 2026): the leaf in the logo file's full green,
# and the rule between the lines a hairline, barely there.
LEAF_OPEN = '#6BBE3F'
RULE_COLOUR = '#DCDCDC'


def r(v, n=3):
    s = f'{v:.{n}f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


# --- The logo: a leaf and four letters, each under nested transforms.
# Flatten each path to one matrix in the logo's box.
def matmul(m, n):
    a, b, c, d, e, f = m
    A, B, C, D, E, F = n
    return (a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D, a * E + c * F + e, b * E + d * F + f)


def parse_tf(t):
    m = (1, 0, 0, 1, 0, 0)
    for kind, args in re.findall(r'(matrix|translate|scale)\(([^)]*)\)', t or ''):
        v = [float(x) for x in re.split(r'[ ,]+', args.strip())]
        if kind == 'matrix':
            n = tuple(v)
        elif kind == 'translate':
            n = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        else:
            n = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        m = matmul(m, n)
    return m


paths = []


def walk(el, m):
    m = matmul(m, parse_tf(el.get('transform')))
    if el.tag.endswith('path'):
        paths.append({'d': el.get('d'), 'm': m})
    for kid in el:
        walk(kid, m)


walk(ET.parse(LOGO).getroot(), (1, 0, 0, 1, 0, 0))
assert len(paths) == 5, f'expected leaf + E V N D in {LOGO}, found {len(paths)} paths'
logo = dict(zip(['leaf', 'E', 'V', 'N', 'D'], paths))

# Bounding boxes, measured in a browser (getBoundingClientRect at the logo's
# own size) and fixed here: they only change if the logo file does.
BOX = {  # x, y, w, h in the logo's box
    'leaf': (910.1, 0.0, 748.8, 1176.1),
    'E': (0.4, 361.7, 556.8, 842.1),
    'V': (663.8, 361.7, 756.7, 842.1),
    'N': (1531.1, 361.7, 677.4, 842.1),
    'D': (2347.4, 361.7, 636.1, 842.1),
}
CAP = 842.1                     # the logo letters' cap height
BASE = 361.7 + CAP              # their baseline

# --- Roboto SemiBold, the logo's own face.
font = TTFont(FONT)
gs, cmap = font.getGlyphSet(), font.getBestCmap()
FCAP = font['OS/2'].sCapHeight
hmtx = font['hmtx']


def glyph(ch):
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs, lambda v: r(v, 1))
    gs[name].draw(pen)
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    adv, lsb = hmtx[name]
    xmin, _, xmax, _ = bp.bounds or (0, 0, 0, 0)
    return {'d': pen.getCommands(), 'adv': adv, 'lsb': lsb, 'rsb': adv - xmax, 'xmin': xmin, 'xmax': xmax}


def layout(words, s, track_em):
    """Lay one line at logo scale s: the first letter of each word is the
    logo's, the rest Roboto at the same cap height. Returns the pieces (x
    from the line's left edge) and the line's ink width."""
    k = CAP * s / FCAP                 # font units -> box units
    t = track_em * CAP * s             # tracking, in box units
    x, out, ink_right = 0.0, [], 0.0
    for wi, word in enumerate(words):
        if wi:
            x += glyph(' ')['adv'] * k + t
        first, rest = word[0], word[1:]
        bx, _, bw, _ = BOX[first]
        out.append({'kind': 'big', 'ch': first, 'x': x, 'w': bw * s, 'word': wi})
        x += bw * s + glyph(first)['rsb'] * k + t
        letters = []
        for ch in rest:
            g = glyph(ch)
            letters.append({'kind': 'small', 'ch': ch, 'x': x, 'k': k, 'g': g, 'word': wi})
            ink_right = x + g['xmax'] * k
            x += g['adv'] * k + t
        out.extend(letters)
    return out, ink_right


# The spelled-out name gets more width than the mark: the leaf makes the mark
# tall and narrow (2.4:1), and at header height NATUROPATHIC DOCTORS would be
# about 6px tall inside it. The box is the old header logo's shape (1020 x 246,
# 4.15:1), so the header keeps its footprint; EVND sits at its left, and the
# name spreads across the whole of it.
LINE1, LINE2 = ['EAST', 'VALLEY'], ['NATUROPATHIC', 'DOCTORS']
TR1, TR2 = 0.07, 0.16          # tracking, in each line's cap height
LEAF_H = 1.3                   # leaf height, in line-1 cap heights
LEAF_GAP = 0.3                 # gap before it, in line-1 cap heights
PAD = 40                       # room above for the leaf's sway
BOX_H = H + PAD
BOX_W = round(BOX_H * 1020 / 246)
_, w2u = layout(LINE2, 1.0, TR2)
_, w1u = layout(LINE1, 1.0, TR1)
sL_per_s1 = LEAF_H * CAP / BOX['leaf'][3]
leaf_lift_u = (BASE - (BOX['leaf'][1] + BOX['leaf'][3]))   # the stem's height off the baseline, in the logo


def fit(width):
    """Line 2 fills `width`; line 1 leaves room at its end for the leaf.
    Returns the scales and the block's height (leaf to line-2 baseline)."""
    s2 = width / w2u
    s1 = width / (w1u + LEAF_GAP * CAP + BOX['leaf'][2] * sL_per_s1)
    sL = sL_per_s1 * s1
    cap1, cap2 = CAP * s1, CAP * s2
    gap, rule_t = 0.62 * cap2, BOX_H / 46   # the rule: about 1px at header size
    b1 = -(cap2 + gap + rule_t + gap)                  # line 2 baseline at 0
    leaf_top = b1 - leaf_lift_u * sL - BOX['leaf'][3] * sL
    top = min(b1 - cap1, leaf_top)
    return s1, s2, sL, -top


# As wide as the box, unless that makes the block too tall for it.
width = BOX_W
s1, s2, sL, block = fit(width)
if block > 0.9 * H:
    width *= 0.9 * H / block
    s1, s2, sL, block = fit(width)
line1, _ = layout(LINE1, s1, TR1)
line2, _ = layout(LINE2, s2, TR2)
cap1, cap2 = CAP * s1, CAP * s2
gap, rule_t = 0.62 * cap2, BOX_H / 46   # the rule: about 1px at header size
# Centred in the box, top to bottom.
b2 = (H + block) / 2
rule_y = b2 - cap2 - gap - rule_t
b1 = rule_y - gap
leaf_top = b1 - leaf_lift_u * sL - BOX['leaf'][3] * sL
W_NAME = width

# --- The clock (11 s, the header's since D127). Percentages.
DUR = 11
BIG_IN, BIG_STEP, BIG_LEN = 36.364, 0.545, 7.727      # E, V, N, D in turn
BIG_BACK = 91.182                                      # E last back, D first
WORD_IN, WORD_STEP, LET_STEP, LET_LEN = 42.932, 0.545, 0.318, 4.545
LET_OUT, LET_OUT_STEP, LET_OUT_LEN = 85.455, 0.109, 3.182
RULE = (42.545, 48.909, 85.455, 89.091)
E_IN, E_OUT, E_BIG = 'cubic-bezier(.2,.75,.25,1)', 'cubic-bezier(.55,0,.8,.3)', 'cubic-bezier(.65,0,.35,1)'


def pct(v):
    return f'{v:.3f}%'


css, body = [], []

# The spelled-out letters (Roboto), behind nothing, sliding out from their
# word's first letter.
for li, (line, base, colour) in enumerate([(line1, b1, GREY), (line2, b2, GREY)]):
    for wi in sorted({p['word'] for p in line}):
        word = [p for p in line if p['word'] == wi]
        first = word[0]
        small = word[1:]
        for i, p in enumerate(small):
            n = f't{li * 2 + wi}_{i}'
            start = WORD_IN + WORD_STEP * (li * 2 + wi) + LET_STEP * i
            out = LET_OUT + LET_OUT_STEP * (len(small) - 1 - i)
            dx = -(p['x'] - (first['x'] + first['w'])) * 0.5 - 0.15 * CAP * (s1 if li == 0 else s2)
            css.append(
                f'@keyframes {n}{{0%,{pct(start)}{{opacity:0;transform:translate({r(dx)}px,0);animation-timing-function:{E_IN}}}'
                f'{pct(start + LET_LEN)},{pct(out)}{{opacity:1;transform:none;animation-timing-function:{E_OUT}}}'
                f'{pct(out + LET_OUT_LEN)},100%{{opacity:0;transform:translate({r(dx)}px,0)}}}}')
            k = p['k']
            body.append(f'<g class="a t" style="animation-name:{n}"><path fill="{colour}" '
                        f'transform="matrix({r(k, 5)},0,0,{r(-k, 5)},{r(p["x"], 2)},{r(base, 2)})" d="{p["g"]["d"]}"/></g>')

# The rule, drawn from the left.
css.append(f'@keyframes rule{{0%,{pct(RULE[0])}{{transform:scaleX(0);animation-timing-function:{E_IN}}}'
           f'{pct(RULE[1])},{pct(RULE[2])}{{transform:none;animation-timing-function:{E_OUT}}}{pct(RULE[3])},100%{{transform:scaleX(0)}}}}')
body.append(f'<g class="a r" style="animation-name:rule"><rect x="0" y="{r(rule_y, 2)}" width="{r(W_NAME, 1)}" height="{r(rule_t, 2)}" fill="{RULE_COLOUR}"/></g>')


def mat(m):
    return 'matrix(' + ','.join(r(v, 5) for v in m) + ')'


def big_move(name, x1, y1, s):
    """translate+scale taking the logo letter (origin 0 0) to x1,y1 at s."""
    x0, y0 = BOX[name][0], BOX[name][1]
    return x1 - s * x0, y1 - s * y0


targets = {p['ch']: (p['x'], b1 - cap1, s1) for p in line1 if p['kind'] == 'big'}
targets.update({p['ch']: (p['x'], b2 - cap2, s2) for p in line2 if p['kind'] == 'big'})

# The leaf: behind the letters, as in the logo. It moves with V and settles at
# the end of line 1, its stem on the same lift off the baseline. The sway turns
# it about its stem.
lx = W_NAME - BOX['leaf'][2] * sL
ltx, lty = lx - sL * BOX['leaf'][0], leaf_top - sL * BOX['leaf'][1]
v_in = BIG_IN + BIG_STEP * 1
v_back = BIG_BACK - BIG_STEP * 1
css.append(f'@keyframes iL{{0%,{pct(v_in)}{{transform:none;animation-timing-function:{E_BIG}}}'
           f'{pct(v_in + BIG_LEN)},{pct(v_back)}{{transform:translate({r(ltx)}px,{r(lty)}px) scale({r(sL, 4)});animation-timing-function:{E_BIG}}}'
           f'{pct(v_back + BIG_LEN)},100%{{transform:none}}}}')
stem = (BOX['leaf'][0] + BOX['leaf'][2], BOX['leaf'][1] + BOX['leaf'][3])
css.append(f'@keyframes fL{{0%,{pct(v_in)}{{fill:{LEAF};animation-timing-function:{E_BIG}}}'
           f'{pct(v_in + BIG_LEN)},{pct(v_back)}{{fill:{LEAF_OPEN};animation-timing-function:{E_BIG}}}'
           f'{pct(v_back + BIG_LEN)},100%{{fill:{LEAF}}}}}')
leaf_svg = (f'<g class="a" style="animation-name:iL"><g class="sway">'
            f'<path class="nd" style="animation-name:fL" fill="{LEAF}" transform="{mat(logo["leaf"]["m"])}" d="{logo["leaf"]["d"]}"/></g></g>')
body.insert(0, leaf_svg)   # first, so it sits behind everything

for i, ch in enumerate('EVND'):
    x1, y1, s = targets[ch]
    tx, ty = big_move(ch, x1, y1, s)
    t_in = BIG_IN + BIG_STEP * i
    t_back = BIG_BACK - BIG_STEP * i
    css.append(f'@keyframes i{ch}{{0%,{pct(t_in)}{{transform:none;animation-timing-function:{E_BIG}}}'
               f'{pct(t_in + BIG_LEN)},{pct(t_back)}{{transform:translate({r(tx)}px,{r(ty)}px) scale({r(s, 4)});animation-timing-function:{E_BIG}}}'
               f'{pct(t_back + BIG_LEN)},100%{{transform:none}}}}')
    if ch in 'ND':
        css.append(f'@keyframes f{ch}{{0%,{pct(t_in)}{{fill:{GREEN};animation-timing-function:{E_BIG}}}'
                   f'{pct(t_in + BIG_LEN)},{pct(t_back)}{{fill:{GREY};animation-timing-function:{E_BIG}}}'
                   f'{pct(t_back + BIG_LEN)},100%{{fill:{GREEN}}}}}')
        path = f'<path class="nd" style="animation-name:f{ch}" fill="{GREEN}" transform="{mat(logo[ch]["m"])}" d="{logo[ch]["d"]}"/>'
    else:
        path = f'<path fill="{GREY}" transform="{mat(logo[ch]["m"])}" d="{logo[ch]["d"]}"/>'
    body.append(f'<g class="a" style="animation-name:i{ch}">{path}</g>')

css.append('@keyframes breeze{0%{transform:rotate(0)}14%{transform:rotate(-3.2deg)}26%{transform:rotate(-1deg)}'
           '38%{transform:rotate(-2.4deg)}55%{transform:rotate(.6deg)}70%{transform:rotate(-1.6deg)}84%{transform:rotate(.3deg)}100%{transform:rotate(0)}}')

style = (f'.a{{transform-box:view-box;transform-origin:0 0;animation:{DUR}s infinite both}}.t{{opacity:0}}.r{{transform:scaleX(0)}}'
         f'.sway{{transform-box:view-box;transform-origin:{r(stem[0], 1)}px {r(stem[1], 1)}px;animation:breeze 6.8s ease-in-out infinite}}'
         f'.nd{{animation:{DUR}s infinite both}}'
         '@media (prefers-reduced-motion:reduce){.a,.sway,.nd{animation:none!important}}' + ''.join(css))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-PAD} {BOX_W} {r(BOX_H)}" width="{r(BOX_W / 4)}" height="{r(BOX_H / 4)}" '
       f'role="img" aria-label="EVND — East Valley Naturopathic Doctors"><style>{style}</style>{"".join(body)}</svg>\n')
OUT.write_text(svg)
print(f'{OUT.relative_to(ROOT)}: {len(svg):,} bytes; viewBox {BOX_W} x {r(BOX_H)} (ratio {BOX_W / BOX_H:.4f}); '
      f'name {W_NAME:.0f} wide; line 1 scale {s1:.3f}, line 2 {s2:.3f}, leaf {sL:.3f}; '
      f'line 2 cap at 44px tall: {cap2 / BOX_H * 44:.1f}px')

# --- The favicon: the logo's leaf alone, in the logo file's own green,
# centred in a square with a little room. public/favicon.svg is what current
# browsers use; favicon.ico and apple-touch-icon.png are rendered from it
# (a browser screenshot, see the commit that added them) for the rest.
LEAF_FILL = '#6BBE3F'
lx0, ly0, lw0, lh0 = BOX['leaf']
side = max(lw0, lh0) * 1.1
vx, vy = lx0 + lw0 / 2 - side / 2, ly0 + lh0 / 2 - side / 2
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{r(vx, 1)} {r(vy, 1)} {r(side, 1)} {r(side, 1)}">'
       f'<path fill="{LEAF_FILL}" transform="{mat(logo["leaf"]["m"])}" d="{logo["leaf"]["d"]}"/></svg>\n')
(ROOT / 'public/favicon.svg').write_text(fav)
print(f'public/favicon.svg: {len(fav):,} bytes')
