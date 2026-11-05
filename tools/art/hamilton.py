"""Lewis Hamilton – 2026 hero bust (priority asset).

Original pixel art drawn from shape rules, not traced from any photograph.
2026 look: braids pulled back tight from the hairline, full dark beard and
moustache with a few grey flecks, diamond ear studs, 2026 Scuderia Ferrari HP
race suit (red, white collar and side panels, white seam lines, blue HP logo,
Ferrari shield). Light comes from the top-left.
"""
from __future__ import annotations

import math

import numpy as np

from pix import Sprite, hexc, micro_text

W, H = 104, 124
CX = 52

SK = ["#3e2117", "#6b3d27", "#8e5636", "#ad6f48", "#c98d64", "#e0ab83"]  # s0..s5
HAIR = ["#0f0b09", "#1d1612", "#2f251e", "#4a3b31"]
BEARD = ["#120d0b", "#211813", "#33281f"]
GREY = "#8c847d"
LIP = ["#4a2419", "#6f3a2b", "#8a4e3b", "#a5644e"]
EYE_W, IRIS, PUPIL = "#ede3d8", "#4a2a1b", "#120a08"
RED = ["#ff6a5e", "#ee2f33", "#cf1820", "#9a0f15", "#66080d"]
WHT = ["#ffffff", "#eceef2", "#c9ccd4", "#9da1ab"]
HP_BLUE = "#0096d6"
OUTLINE = "#1a0f0b"


# Season looks: provisional from Reference 1 (F1 "20 Years of Hamilton" grid);
# to be confirmed against dated photos.
LOOKS = {}
for _y in range(2007, 2027):
    if _y <= 2009:
        hair, beard = "short", "none"
    elif _y <= 2011:
        hair, beard = "short", "stubble"
    elif _y <= 2014:
        hair, beard = "short", "short"
    elif _y == 2015:
        hair, beard = "blond", "short"
    elif _y == 2016:
        hair, beard = "short", "short"
    elif _y <= 2019:
        hair, beard = "twists", "short"
    else:
        hair, beard = "braids", "full"
    suit = "mclaren" if _y <= 2012 else "mercedes" if _y <= 2024 else "ferrari25" if _y == 2025 else "ferrari26"
    LOOKS[_y] = dict(hair=hair, beard=beard, suit=suit, grey=_y >= 2024)


def head_hw(y: float) -> float:
    """Half-width of skull+face silhouette at row y (crown y=8, chin y=70)."""
    if y < 8:
        return 0
    if y <= 34:
        return 22.5 * math.sqrt(max(0.0, 1 - ((y - 34) / 26.5) ** 2))
    if y <= 46:
        return 22.5 - (y - 34) * 0.04
    if y <= 60:
        t = (y - 46) / 14
        return 22.0 - 8.0 * t ** 1.25
    if y <= 69:
        return 14.0 - (y - 60) * 0.85
    return 0


def hairline(dx: float) -> float:
    a = abs(dx)
    y = 21.5 + 0.010 * a * a
    if 10 <= a <= 18:  # receding temples
        y += 3.2 * math.sin((a - 10) / 8 * math.pi)
    if a > 18:
        y = 27 + (a - 18) * 2.2  # hair runs down the sides to the sideburns
    return y


def build(blink=False, glint=0, look=None):
    look = look or LOOKS[2026]
    hair_style, beard_style, suit = look['hair'], look['beard'], look['suit']
    HAIRC = HAIR if hair_style != 'blond' else ['#6e5230', '#a7834c', '#d4b273', '#ecd49b']
    s = Sprite(W, H)
    yy, xx = np.mgrid[0:H, 0:W]
    dx = xx - CX + 0.5

    # ---------------- masks
    hw = np.vectorize(head_hw)(yy.astype(float))
    head = (np.abs(dx) <= hw) & (yy >= 8) & (yy <= 69)
    # ears
    ear = np.zeros_like(head)
    for y in range(36, 50):
        we = 3.2 * math.sqrt(max(0, 1 - ((y - 42.5) / 7.0) ** 2))
        h = head_hw(y)
        for side in (-1, 1):
            for x in range(W):
                d = (x - CX + 0.5) * side
                if h - 1 <= d <= h + we:
                    ear[y, x] = True
    # neck
    neck = (np.abs(dx) <= 14.5) & (yy >= 58) & (yy <= 88)
    # suit torso
    torso = np.zeros_like(head)
    for y in range(78, H):
        if y < 84:
            w = 17 + (y - 78) * 0.5
        elif y < 98:
            t = (y - 84) / 14
            w = 20 + 27 * math.sin(t * math.pi / 2)
        else:
            w = 47.5
        torso[y, :] = np.abs(dx[y]) <= w
    collar = torso & (yy <= 88) & (np.abs(dx) <= 18.5)

    hl = np.vectorize(hairline)(dx)
    if hair_style in ('short', 'blond'):
        hl = np.vectorize(lambda d: 20.5 + 0.008 * d * d + (1.5 if 11 <= abs(d) <= 17 else 0) if abs(d) <= 18 else 25 + (abs(d) - 18) * 2.6)(dx)
    hair = head & (yy < hl)
    hair |= head & (np.abs(dx) >= hw - 2.4) & (yy < (40 if hair_style == 'braids' else 37))
    if hair_style == 'twists':  # volume above the skull
        top = np.vectorize(lambda d: 4.5 + 0.02 * d * d + (1.2 if int(abs(d)) % 4 < 2 else 0))(dx)
        hair |= (yy >= top) & (yy < 16) & (np.abs(dx) <= np.vectorize(lambda y: head_hw(y + 4) + 1)(yy.astype(float)))
    if hair_style == 'blond':
        hair |= (yy >= 6) & (yy < 12) & (np.abs(dx) <= np.vectorize(lambda y: head_hw(y + 2) + 0.5)(yy.astype(float)))

    # beard region: below the cheek line from sideburn to mouth corner
    def cheek_line(d):
        a = abs(d)
        # from (a=21, y=44) to (a=10, y=51): cheeks stay clear
        if a >= 21:
            return 44
        if a <= 10:
            return 51
        return 51 - (a - 10) / 11 * 7

    cl = np.vectorize(cheek_line)(dx)
    face_or_chin = head | (
        (yy > 58) & (yy <= 71) & (np.abs(dx) <= np.vectorize(lambda y: max(0, 15.0 - (y - 58) * 1.0))(yy.astype(float)))
    )
    if beard_style == 'short':
        cl = cl + 2.5
    beard = face_or_chin & (yy >= cl) & (yy >= 39)
    beard |= (np.abs(dx) >= hw - 1.2) & head & (yy >= 37) & (yy < 50)
    if beard_style in ('none', 'stubble'):
        beard &= head
    if beard_style == 'none':
        beard[:] = False

    # ---------------- paint: suit first (behind neck/head)
    SUITS = {
        "ferrari26": dict(body=RED, side=WHT, collar=WHT, seam=WHT[1], logo="hp", shield=True),
        "ferrari25": dict(body=RED, side=None, collar=RED, seam=None, logo="hp", shield=True, stripe=WHT),
        "mercedes": dict(body=["#4a505c", "#2f343d", "#1f2329", "#16191d", "#0f1114"], side=None,
                         collar=["#3fd1c4", "#00a19b", "#00807a", "#005f5a"], seam="#00a19b", logo="petronas", star=True),
        "mclaren": dict(body=["#ffffff", "#e9ebef", "#cfd3da", "#a7acb6", "#868b96"], side=["#3a3e46", "#2a2e35", "#1e2126", "#16181c"],
                        collar=["#ff5a4a", "#e3231b", "#b8181a", "#8a1214"], seam="#e3231b", logo="vodafone"),
    }
    st = SUITS[suit]
    B = st["body"]
    for y in range(H):
        for x in range(W):
            if not torso[y, x]:
                continue
            d = x - CX + 0.5
            shade = 2
            if d < -30 and y < 104:
                shade = 1
            if d > 26:
                shade = 3
            if d > 40:
                shade = 4
            if y < 92 and d < -20:
                shade = 1
            if y > 116:
                shade = min(4, shade + 1)
            s.px(x, y, B[shade])
    if st.get("side"):
        SD = st["side"]
        for y in range(96, H):
            for x in range(W):
                d = x - CX + 0.5
                if torso[y, x] and abs(d) >= 39:
                    s.px(x, y, SD[1] if d < 0 else SD[2] if abs(d) < 44 else SD[3])
    if st.get("stripe"):  # SF-25 suit: horizontal chest stripe
        for y in (104, 105, 106):
            for x in range(W):
                if torso[y, x]:
                    s.px(x, y, st["stripe"][1] if y != 106 else st["stripe"][2])
    if st.get("seam"):
        for side in (-1, 1):
            s.line(CX + side * 18, 86, CX + side * 30, 100, st["seam"])
            s.line(CX + side * 30, 100, CX + side * 38, 102, st["seam"])
            s.line(CX + side * 30, 101, CX + side * 38, 103, B[3])
    for x in range(CX - 44, CX - 22):  # shoulder highlight
        y = int(98 - 14 * math.sin((x - (CX - 47)) / 25 * math.pi / 2))
        if 0 <= y < H and torso[y, x]:
            s.px(x, y, B[0])
            s.px(x, y + 1, B[1])
    C = st["collar"]
    for y in range(78, 90):
        for x in range(W):
            if collar[y, x]:
                d = x - CX + 0.5
                c = C[0] if d < -6 else C[1] if d < 8 else C[2]
                if y >= 88:
                    c = C[3]
                s.px(x, y, c)
    s.line(CX, 80, CX, 89, C[3])  # front closure seam
    logo = st["logo"]
    if logo == "hp":
        disc = s.mask_ellipse(CX - 17, 100, 5.5, 5.5)
        s.fill(disc, HP_BLUE)
        s.fill(s.mask_ellipse(CX - 18, 99, 2.2, 2.2) & disc, "#33b3ee")
        micro_text(s, CX - 21, 98, "hp", "#ffffff")
    elif logo == "petronas":
        s.rect(CX - 27, 97, CX - 6, 103, "#00a19b")
        micro_text(s, CX - 26, 98, "PETRO", "#ffffff")
    elif logo == "vodafone":
        disc = s.mask_ellipse(CX - 17, 100, 5.5, 5.5)
        s.fill(disc, "#e3231b")
        s.fill(s.mask_ellipse(CX - 17, 100, 3.3, 3.3), "#ffffff")
        s.px(CX - 17, 99, "#e3231b"); s.px(CX - 16, 99, "#e3231b"); s.px(CX - 16, 100, "#e3231b"); s.px(CX - 17, 101, "#e3231b")
    if st.get("shield"):
        sx, sy = CX + 13, 93
        for y in range(sy, sy + 11):
            for x in range(sx, sx + 9):
                inside = y < sy + 8 or abs(x - (sx + 4)) <= (sy + 11 - y) * 1.3
                if inside:
                    s.px(x, y, "#ffd200")
        s.rect(sx, sy, sx + 2, sy, "#1f9a3d"); s.rect(sx + 3, sy, sx + 5, sy, "#ffffff"); s.rect(sx + 6, sy, sx + 8, sy, "#dc1b24")
        for (hx, hy) in [(4, 3), (5, 3), (3, 4), (4, 4), (4, 5), (5, 5), (3, 6), (5, 6), (6, 7), (3, 7)]:
            s.px(sx + hx, sy + hy, "#111111")
    if st.get("star"):
        s.fill(s.mask_ellipse(CX + 17, 99, 4.5, 4.5), "#d9dde3")
        s.fill(s.mask_ellipse(CX + 17, 99, 3.2, 3.2), "#1f2329")
        for p in [(0, -2), (0, -1), (0, 0), (-1, 1), (-2, 2), (1, 1), (2, 2)]:
            s.px(CX + 17 + p[0], 99 + p[1], "#d9dde3")
    s.rect(CX - 24, 111, CX - 11, 112, "#ffffff" if suit != "mclaren" else "#2a2e35")

    # ---------------- neck
    for y in range(60, 90):
        for x in range(W):
            if neck[y, x] and not collar[y, x]:
                d = x - CX + 0.5
                c = SK[2]
                if d > 6:
                    c = SK[1]
                if d < -8:
                    c = SK[3]
                if y < 76:
                    c = SK[1] if d > -6 else SK[2]
                if y < 72:
                    c = SK[0] if d > -4 else SK[1]
                s.px(x, y, c)
    s.px(CX - 1, 79, SK[3]); s.px(CX - 1, 80, SK[3])

    # ---------------- head base skin with shading
    for y in range(8, 74):
        for x in range(W):
            if not (head[y, x] or ear[y, x]):
                continue
            d = x - CX + 0.5
            h = head_hw(y)
            c = SK[3]
            # right side (viewer's right) in shadow
            if d > h - 6:
                c = SK[2]
            if d > h - 2.5:
                c = SK[1]
            # forehead / left cheek light
            if -15 < d < -2 and y < 33:
                c = SK[4]
            if -19 < d < -11 and 41 < y < 48:
                c = SK[4]
            if d < -h + 2.5:
                c = SK[3]
            s.px(x, y, c)
    # ears: inner shadow, rim
    for side in (-1, 1):
        ex = CX + side * 24 - (1 if side > 0 else 0)
        for y in range(38, 48):
            s.px(ex, y, SK[1])
        s.px(ex + side, 39, SK[4] if side < 0 else SK[2])
        s.px(ex + side, 40, SK[3] if side < 0 else SK[2])
        # diamond stud on the lobe
        lx = CX + side * 25 - (1 if side > 0 else 0)
        s.px(lx, 47, "#ffffff")
        s.px(lx + side, 47, "#bfe9ff")
        s.px(lx, 48, "#9fd4f5")
    # brow ridge shadow & temple shadow
    for d in range(-16, 17):
        x = CX + d
        s.px(x, 36, SK[2] if d < 0 else SK[1])
    # ---------------- hair: tight braids running back from the hairline
    N = 9
    for y in range(3, 42):
        for x in range(W):
            if not hair[y, x]:
                continue
            d = x - CX + 0.5
            h = max(head_hw(y), 1)
            u = max(-1, min(1, d / h))
            v = (math.asin(u) / (math.pi / 2) + 1) * N / 2
            k = math.floor(v)
            fr = v - k
            edge = hl[y, x] - y
            if hair_style != 'braids':
                c = HAIRC[0]
                if hair_style == 'twists':
                    c = HAIRC[2] if (x // 2 + y) % 3 == 0 and d < 6 else HAIRC[0] if (x + y) % 2 else HAIRC[1]
                elif (x + y) % 2 == 0:
                    c = HAIRC[1]
                if y < 14 and d < -2 and (x + y) % 2 == 0:
                    c = HAIRC[3] if hair_style == 'blond' else HAIRC[2]
                if hair_style == 'blond' and y > hl[y, x] - 2.5:
                    c = HAIR[0]  # dark roots / sides
                s.px(x, y, c)
                continue
            if fr < 0.17:
                c = SK[1] if d < 2 else SK[0]  # parting line: scalp between braids
                if y < 13:
                    c = HAIR[2]
            else:
                c = HAIR[0]
                zig = ((y + k) % 2 == 0 and 0.28 < fr < 0.56) or ((y + k) % 2 == 1 and 0.56 <= fr < 0.86)
                if zig:
                    c = HAIR[2] if d < 4 else HAIR[1]
                    if y < 22 and d < -2:
                        c = HAIR[3]
            if edge < 1.2 and abs(d) < 18:
                c = HAIR[1]  # soft hairline
            s.px(x, y, c)
    # crown highlight sweep (top-left)
    for x in (range(CX - 12, CX + 2) if hair_style == 'braids' else []):
        y = int(10 + abs(x - CX + 5) * 0.25)
        if hair[y, x]:
            s.px(x, y, HAIR[3])

    # ---------------- brows
    for side in (-1, 1):
        for a in range(4, 16):
            x = CX + side * a - (1 if side > 0 else 0)
            top = 33 if 6 <= a <= 13 else 34
            bot = 35 if a <= 9 else 34
            for y in range(top, bot + 1):
                s.px(x, y, HAIR[0] if y > top or a < 12 else HAIR[1])
    # ---------------- eyes
    for side in (-1, 1):
        def X(a):
            return CX + side * a - (1 if side > 0 else 0)
        if blink:
            for a in range(6, 14):
                s.px(X(a), 39, SK[1])
                s.px(X(a), 40, HAIR[0])
            continue
        for a in range(6, 14):  # upper lid
            y = 38 if 7 <= a <= 12 else 39
            s.px(X(a), y, HAIR[0])
        for a in range(7, 13):  # sclera
            s.px(X(a), 39, EYE_W if a not in (7, 12) else "#c9b7a6")
            s.px(X(a), 40, "#d8c9bb" if a not in (7, 12) else SK[1])
        # iris (looking slightly to viewer's left)
        ia = 10 if side < 0 else 9
        for a in (ia - 1, ia):
            s.px(X(a), 39, IRIS)
            s.px(X(a), 40, IRIS)
        s.px(X(ia), 39 + (0 if side < 0 else 0), PUPIL)
        s.px(X(ia - 1) if side < 0 else X(ia), 39, PUPIL)
        s.px(X(ia - 1) if side < 0 else X(ia - 1), 39, "#ffffff" if side < 0 else IRIS)
        for a in range(7, 13):  # lower lid
            s.px(X(a), 41, SK[2] if side < 0 else SK[1])
        s.px(X(13), 40, SK[1])
    # ---------------- nose
    for y in range(39, 49):
        s.px(CX - 2, y, SK[4] if y < 46 else SK[3])
        s.px(CX + 2, y, SK[2])
        s.px(CX + 3, y, SK[2] if y > 44 else SK[3])
    s.px(CX - 1, 47, SK[5]); s.px(CX - 1, 48, SK[4]); s.px(CX, 48, SK[4])
    for d in (-4, 4):
        s.px(CX + d, 48, SK[2]); s.px(CX + d, 49, SK[1])
    s.px(CX - 3, 50, SK[0]); s.px(CX - 2, 50, SK[1]); s.px(CX + 2, 50, SK[0]); s.px(CX + 3, 50, SK[0])
    for d in range(-3, 5):
        s.px(CX + d, 51, SK[1])
    for d in (-5, 5):
        s.px(CX + d, 50, SK[1])

    # ---------------- beard (with dithered cheek edge + grey flecks)
    rng = np.random.RandomState(44)
    for y in range(37, 73):
        for x in range(W):
            if not beard[y, x]:
                continue
            d = x - CX + 0.5
            edge = y - cl[y, x]
            if 0 <= edge < 1.5 and (x + y) % 2 == 0 and abs(d) < 21:
                continue  # soft edge: let skin through
            if beard_style == 'stubble':
                if (x + y) % 2:
                    continue
                c = SK[0] if d > -4 else SK[1]
                s.px(x, y, c)
                continue
            c = BEARD[0]
            if d < -4 and (x + y) % 2 == 0:
                c = BEARD[1]
            if d < -9 and y < 62 and (x + y) % 2 == 0:
                c = BEARD[2]
            if rng.rand() < 0.012 and y > 58 and look.get('grey'):
                c = GREY
            s.px(x, y, c)
    # moustache
    for d in (range(-8, 9) if beard_style in ('full', 'short') else []):
        s.px(CX + d, 52, BEARD[0] if abs(d) > 1 else BEARD[1])
        s.px(CX + d, 53, BEARD[0])
    if beard_style in ('full', 'short'):
        s.px(CX - 9, 53, BEARD[0]); s.px(CX + 8, 53, BEARD[0])
    # lips
    for d in range(-6, 7):
        s.px(CX + d, 54, LIP[1] if d < 2 else LIP[0])
        s.px(CX + d, 55, "#2a120c")
    for d in range(-5, 6):
        s.px(CX + d, 56, LIP[2] if d < 1 else LIP[1])
    s.px(CX - 2, 56, LIP[3]); s.px(CX - 1, 56, LIP[3])
    for d in range(-4, 5):
        s.px(CX + d, 57, (BEARD[1] if d % 2 else SK[1]) if beard_style in ('full', 'short') else SK[2])

    # ---------------- outline around the silhouette
    s.outline(OUTLINE)

    # ---------------- glints (earring sparkle frames)
    if glint:
        lx = CX - 25
        for p in [(0, -2), (0, 2), (-2, 0), (2, 0), (0, -3), (0, 3)][: 2 + 2 * glint]:
            s.px(lx + p[0], 47 + p[1], "#ffffff")
    return s


def dawn_variant(base: Sprite) -> Sprite:
    """Warm dawn grade with a gold rim light on the lit (left) edge."""
    s = Sprite(base.w, base.h)
    s.a = base.a.copy()
    warm = np.array([255, 170, 90], dtype=np.float32)
    m = s.a[:, :, 3] > 0
    rgb = s.a[:, :, :3].astype(np.float32)
    rgb[m] = rgb[m] * 0.84 + warm * 0.16
    s.a[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    for y in range(s.h):
        for x in range(1, s.w):
            if m[y, x] and not m[y, x - 1]:
                s.px(x, y, "#ffcf6b")
                if x + 1 < s.w and m[y, x + 1] and y > 20:
                    s.px(x + 1, y, "#f5a34a")
    return s


def downsample(src: Sprite, k: int) -> Sprite:
    """Mode-filter downscale: each k*k block becomes its most common colour."""
    w, h = src.w // k, src.h // k
    out = Sprite(w, h)
    for y in range(h):
        for x in range(w):
            blk = src.a[y * k:(y + 1) * k, x * k:(x + 1) * k].reshape(-1, 4)
            op = blk[blk[:, 3] > 0]
            if len(op) * 2 < len(blk):
                continue
            vals, counts = np.unique(op, axis=0, return_counts=True)
            out.a[y, x] = vals[counts.argmax()]
    return out


def build_all():
    for yr, lk in LOOKS.items():
        b = build(look=lk)
        b.save(f"hamilton/portrait_{yr}.png")
        downsample(b, 2).save(f"hamilton/card_{yr}.png")
    base = build()
    base.save("hamilton/hero_2026.png")
    build(blink=True).save("hamilton/hero_2026_blink.png")
    build(glint=1).save("hamilton/hero_2026_glint1.png")
    build(glint=2).save("hamilton/hero_2026_glint2.png")
    dawn_variant(base).save("hamilton/hero_2026_dawn.png")
    dawn_variant(build(blink=True)).save("hamilton/hero_2026_dawn_blink.png")
    dawn_variant(build(glint=2)).save("hamilton/hero_2026_dawn_glint.png")


if __name__ == "__main__":
    build_all()
    import sys
    if len(sys.argv) > 1:
        build().preview(sys.argv[1], scale=5, bg="#5a0d12")
