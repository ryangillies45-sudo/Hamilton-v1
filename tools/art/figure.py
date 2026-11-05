"""Full-body Lewis Hamilton (about 96 art px tall) for championship celebrations,
plus the gold championship trophy.

Original pixel art from shape rules. Season looks (hair, beard, suit) come from
hamilton.LOOKS. Poses: stand, fist (one arm up), arms_up (V celebration),
trophy (both hands overhead; the trophy sprite is drawn on top by the engine
at the hand anchor written to src/data/generated/figure.json).
"""
from __future__ import annotations

import math

import numpy as np

from hamilton import LOOKS, SK, HAIR, BEARD
from pix import Sprite, write_meta

W, H = 64, 100
CX = 32
OUT = "#1a0f0b"

SUITS = {
    # base ramp (light->dark), accent, secondary, gloves/boots
    "mclaren": dict(ramp=["#ffffff", "#e3e6ea", "#c3c7ce", "#9a9fa8"], acc="#e3231b", sec="#2a2e35", ext="#2a2e35"),
    "mercedes": dict(ramp=["#4a505c", "#30353e", "#22262d", "#16191d"], acc="#00a19b", sec="#6b7280", ext="#121417"),
    "ferrari25": dict(ramp=["#ff5148", "#e8262c", "#c8141c", "#8f0c12"], acc="#ffffff", sec="#ffd200", ext="#1a1a1a"),
    "ferrari26": dict(ramp=["#ff5148", "#e8262c", "#c8141c", "#8f0c12"], acc="#ffffff", sec="#ffd200", ext="#1a1a1a"),
}


def limb(s: Sprite, x0, y0, x1, y1, w0, w1, ramp, light_side=-1):
    """Thick tapered limb from (x0,y0) to (x1,y1), shaded light on one side."""
    L = math.hypot(x1 - x0, y1 - y0)
    if L == 0:
        return
    nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    steps = int(L * 2) + 1
    for i in range(steps + 1):
        t = i / steps
        cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        w = w0 + (w1 - w0) * t
        for k in np.linspace(-w / 2, w / 2, int(w * 2) + 1):
            px, py = cx + nx * k, cy + ny * k
            side = k / max(0.5, w / 2) * (1 if nx >= 0 else -1) * light_side
            c = ramp[0] if side > 0.55 else ramp[1] if side > -0.1 else ramp[2] if side > -0.7 else ramp[3]
            s.px(round(px), round(py), c)


def head(s: Sprite, look, ox, oy):
    """Small head: about 15 px wide, 19 px tall incl. hair. (ox, oy) = top-centre."""
    hair, beard = look["hair"], look["beard"]
    HC = HAIR if hair != "blond" else ["#6e5230", "#a7834c", "#d4b273", "#ecd49b"]
    for y in range(0, 19):
        hw = [3.5, 5.5, 6.5, 7.0, 7.3, 7.5, 7.5, 7.5, 7.5, 7.4, 7.3, 7.0, 6.6, 6.0, 5.4, 4.6, 3.8, 2.8, 1.6][y]
        for x in range(-8, 9):
            d = x + 0.5
            if abs(d) > hw:
                continue
            X, Y = ox + x, oy + y
            # skin with top-left light
            c = SK[3] if d < 2 else SK[2]
            if d > hw - 1.6:
                c = SK[1]
            if d < -hw + 1.6 and y > 6:
                c = SK[3]
            if y < 8 and d < 0:
                c = SK[4]
            # hair region
            hl = 5 if hair == "braids" else 4.5
            if hair == "twists":
                hl = 5
            if y < hl or (abs(d) > hw - 1.4 and y < 9):
                c = HC[0]
                if hair == "braids" and int((d + 8) * 0.75) % 2 == 0 and y < hl:
                    c = SK[1] if y > 1 else HC[2]  # parting lines
                if hair in ("short", "blond") and (x + y) % 2 == 0:
                    c = HC[1]
                if hair == "blond" and y < 3:
                    c = HC[2] if (x + y) % 2 else HC[3]
                if hair == "twists" and (x + 2 * y) % 3 == 0:
                    c = HC[2]
            s.px(X, Y, c)
    # hair volume above the skull
    if hair in ("twists", "blond"):
        for x in range(-6, 7):
            for y in range(-2, 0):
                if abs(x) < 6 - (y + 2) * 0 and (x + y) % 2 == 0 or abs(x) < 4:
                    s.px(ox + x, oy + y, (HC[2] if hair == "blond" else HC[0]) if (x + y) % 2 else HC[1])
    # ears + studs
    for side in (-1, 1):
        ex = ox + (8 if side > 0 else -9)
        for y in range(8, 12):
            s.px(ex, oy + y, SK[2] if side < 0 else SK[1])
        s.px(ex, oy + 12, "#ffffff")
    # brows, eyes, nose, mouth
    for x in (-5, -4, -3, 2, 3, 4):
        s.px(ox + x, oy + 8, HAIR[0])
    for x in (-4, 3):
        s.px(ox + x, oy + 10, "#120a08")
        s.px(ox + x - (1 if x < 0 else -1), oy + 10, "#e9dfd4")
    s.px(ox + 1, oy + 12, SK[1])
    s.px(ox - 1, oy + 13, SK[1]); s.px(ox + 1, oy + 13, SK[0])
    # beard
    if beard in ("short", "full"):
        top = 13 if beard == "full" else 14
        for y in range(top, 19):
            for x in range(-8, 9):
                d = x + 0.5
                hw = [7.4, 7.3, 7.0, 6.6, 6.0, 5.4, 4.6, 3.8, 2.8, 1.6][min(9, y - 9)] if y >= 9 else 7.5
                edge = abs(d) > 4 - (y - top) * 0.2 or y > 15
                if abs(d) <= hw and edge and s.get(ox + x, oy + y)[3]:
                    s.px(ox + x, oy + y, BEARD[0] if (x + y) % 3 else BEARD[1])
        for x in range(-4, 5):  # moustache
            s.px(ox + x, oy + 14, BEARD[0])
        if beard == "full":
            for x in range(-3, 4):
                s.px(ox + x, oy + 19, BEARD[0])
    elif beard == "stubble":
        for y in range(14, 19):
            for x in range(-7, 8):
                if (x + y) % 2 == 0 and s.get(ox + x, oy + y)[3]:
                    s.px(ox + x, oy + y, SK[1])
    # mouth (open smile when celebrating)
    for x in range(-2, 3):
        s.px(ox + x, oy + 15, "#3a160f")
    s.px(ox - 1, oy + 16, "#f2ece6"); s.px(ox, oy + 16, "#f2ece6"); s.px(ox + 1, oy + 16, "#3a160f")


def figure(look, pose="stand", frame=0):
    s = Sprite(W, H)
    st = SUITS[look["suit"]]
    R, acc, sec, ext = st["ramp"], st["acc"], st["sec"], st["ext"]
    top = 4
    hip_y = top + 19 + 3 + 30
    sh_y = top + 19 + 4
    # legs
    for side in (-1, 1):
        hx = CX + side * 5
        fx = CX + side * 8
        limb(s, hx, hip_y, fx, H - 6, 9, 8, R)
        s.rect(fx - 4 + (0 if side < 0 else 0), H - 6, fx + 4, H - 3, ext)  # boots
        if look["suit"] == "ferrari26":
            s.line(fx + side * 3, hip_y + 2, fx + side * 3, H - 7, acc)
        if look["suit"] == "mclaren":
            s.line(fx + side * 3, hip_y + 2, fx + side * 3, H - 7, acc)
        if look["suit"] == "mercedes":
            s.line(fx + side * 3, hip_y + 2, fx + side * 3, H - 7, acc)
    # torso (tapered)
    for y in range(sh_y, hip_y + 2):
        t = (y - sh_y) / (hip_y - sh_y)
        hw = 14 - 4 * t
        for x in range(int(CX - hw), int(CX + hw) + 1):
            d = x - CX
            c = R[1] if d < -4 else R[2] if d < 7 else R[3]
            if d < -9 and y < sh_y + 8:
                c = R[0]
            s.px(x, y, c)
    # belt line

    for x in range(CX - 10, CX + 11):
        s.px(x, hip_y - 1, R[3])
    # suit details
    suit = look["suit"]
    if suit == "ferrari26":
        for y in range(sh_y + 8, hip_y):
            for x in (CX - 11, CX - 10, CX + 9, CX + 10):
                s.px(x, y, "#f2f2f4" if x < CX else "#c9ccd4")
    if suit == "ferrari25":
        for x in range(CX - 13, CX + 14):
            s.px(x, sh_y + 10, "#ffffff")
            s.px(x, sh_y + 11, "#d9dae0")
    if suit == "mclaren":
        for y in range(sh_y + 2, hip_y):
            s.px(CX - 12 + (y - sh_y) // 8, y, acc)
            s.px(CX + 11 - (y - sh_y) // 8, y, acc)
    if suit == "mercedes":
        for y in range(sh_y + 2, hip_y):
            s.px(CX - 12 + (y - sh_y) // 8, y, acc)
            s.px(CX + 11 - (y - sh_y) // 8, y, acc)
    # chest logos
    logo_y = sh_y + 6
    if suit.startswith("ferrari"):
        s.rect(CX - 8, logo_y, CX - 5, logo_y + 3, "#0096d6")
        s.px(CX - 7, logo_y + 1, "#ffffff"); s.px(CX - 6, logo_y + 2, "#ffffff")
        s.rect(CX + 4, logo_y, CX + 6, logo_y + 3, "#ffd200"); s.px(CX + 5, logo_y + 4, "#ffd200"); s.px(CX + 5, logo_y + 1, "#111111")
    elif suit == "mercedes":
        s.rect(CX - 9, logo_y, CX - 4, logo_y + 2, "#00a19b")
        s.rect(CX + 4, logo_y, CX + 6, logo_y + 2, "#d9dde3")
    else:
        s.rect(CX - 8, logo_y, CX - 5, logo_y + 3, "#e3231b"); s.px(CX - 7, logo_y + 1, "#ffffff"); s.px(CX - 6, logo_y + 2, "#ffffff")
    # collar
    col = acc if suit != "mercedes" else "#00a19b"
    if suit == "ferrari25":
        col = R[2]
    for x in range(CX - 5, CX + 6):
        s.px(x, sh_y, col)
        s.px(x, sh_y + 1, col if abs(x - CX) > 2 else R[2])
    # neck
    for y in range(top + 18, sh_y):
        for x in range(CX - 3, CX + 4):
            s.px(x, y, SK[2] if x < CX + 2 else SK[1])
    # arms
    hand = {}
    for side in (-1, 1):
        sx, sy = CX + side * 13, sh_y + 2
        if pose == "stand":
            ex, ey, hx, hy = sx + side * 3, sy + 14, sx + side * 4, sy + 28
        elif pose == "fist":
            if side < 0:
                ex, ey, hx, hy = sx - 4, sy - 12, sx - 3, sy - 24
            else:
                ex, ey, hx, hy = sx + 3, sy + 14, sx + 4, sy + 28
        elif pose == "arms_up":
            ex, ey, hx, hy = sx + side * 7, sy - 10, sx + side * 10, sy - 22
        else:  # trophy: hands meet above the head
            ex, ey, hx, hy = sx + side * 6, sy - 12, CX + side * 4, sy - 26
        limb(s, sx, sy, ex, ey, 7, 6, R)
        limb(s, ex, ey, hx, hy, 6, 5, R)
        s.rect(hx - 2, hy - 2, hx + 2, hy + 2, ext)  # glove
        hand[side] = (hx, hy)
    # head on top of everything
    head(s, look, CX, top)
    s.outline(OUT)
    if pose == "trophy":
        return s, ((hand[-1][0] + hand[1][0]) // 2, min(hand[-1][1], hand[1][1]) - 2)
    return s, None


def trophy(scale=1, shine=-1):
    """Gold two-handled championship cup. shine = sweep position 0..3 or -1."""
    w, h = 26 * scale, 34 * scale
    s = Sprite(w + 2 + 16 * scale, h + 2)
    G = ["#fff6c2", "#ffe066", "#ffc928", "#e0a21a", "#a8700f", "#6e4709"]
    cx = (s.w - 2) / 2
    prof = []
    for y in range(h):
        t = y / h
        if t < 0.06:
            r = 0.46
        elif t < 0.50:
            r = 0.46 - 0.30 * ((t - 0.06) / 0.44) ** 1.6
        elif t < 0.66:
            r = 0.10
        elif t < 0.72:
            r = 0.18
        elif t < 0.86:
            r = 0.24
        else:
            r = 0.36
        prof.append(r * w)
    for y in range(h):
        r = prof[y]
        for x in range(int(cx - r), int(cx + r) + 1):
            u = (x - cx) / max(1, r)
            c = G[1] if u < -0.45 else G[2] if u < 0.1 else G[3] if u < 0.6 else G[4]
            if u < -0.2 and u > -0.45:
                c = G[0]
            if y / h < 0.06:
                c = G[0] if u < 0 else G[2]
            s.px(x + 1, y + 1, c)
    # rim lip + inner shadow
    for x in range(int(cx - prof[0]), int(cx + prof[0]) + 1):
        s.px(x + 1, 1, G[4])
    # handles: thick C-shaped loops on both sides of the bowl
    yy, xx = np.mgrid[0:s.h, 0:s.w]
    for side in (-1, 1):
        hx = cx + 1 + side * (prof[int(h * 0.10)] - 1)
        hy = 1 + h * 0.24
        rx, ry = 5.0 * scale, 7.0 * scale
        d = ((xx - hx) / rx) ** 2 + ((yy - hy) / ry) ** 2
        ring = (d <= 1.0) & (d >= (1 - 1.9 / (min(rx, ry)))) & ((xx - hx) * side > 0)
        s.fill(ring, G[2] if side < 0 else G[3])
    # number plate on the base
    s.rect(int(cx - 0.18 * w) + 1, int(h * 0.88), int(cx + 0.18 * w) + 1, int(h * 0.94), G[5])
    if shine >= 0:
        sx = int((shine / 3.0) * (w + 10)) - 6 + 8 * scale
        for y in range(h):
            for k in range(2 * scale):
                x = sx + k + y // 2
                if 0 <= x < s.w and s.a[y + 1, x][3]:
                    s.px(x, y + 1, "#ffffff")
    s.outline(OUT)
    return s


def build_all():
    meta = {"trophyAnchor": {}}
    for yr, lk in LOOKS.items():
        for pose in ("stand", "fist", "arms_up", "trophy"):
            spr, anchor = figure(lk, pose)
            spr.save(f"figure/{yr}_{pose}.png")
            if anchor:
                meta["trophyAnchor"][str(yr)] = anchor
    for i in range(-1, 4):
        trophy(1, i).save(f"trophy/small_{i + 1}.png")
        trophy(2, i).save(f"trophy/big_{i + 1}.png")
    write_meta("figure", meta)


if __name__ == "__main__":
    build_all()
