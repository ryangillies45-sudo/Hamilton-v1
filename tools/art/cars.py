"""Side-view car generator for all 20 Hamilton season cars.

One parametric rig, era-specific shapes and per-season liveries. Nose points
LEFT, as in the MP4-22 master reference. Cars are drawn at "feature" scale
(about 150-180 art px long). Wheels are separate sprites with 4 spin frames so
Remotion can animate them; the body sprite has no wheels.

Livery notes come from docs/production-plan.md section 10. Items marked
"approx" in comments are simplified at pixel scale.
"""
from __future__ import annotations

import numpy as np

from pix import Sprite, hexc, micro_text, micro_text2, micro_width, write_meta

# ---------------------------------------------------------------- palettes
SILVER_CHROME = ["#f6f7f9", "#cfd3d9", "#a3a8b0", "#6c717a", "#c3c7ce", "#50545c"]
SILVER = ["#eceef1", "#c6cad0", "#9da2aa", "#747982", "#4f535a"]
CARBON = ["#5b6271", "#3b414c", "#2a2e36", "#1d2026", "#141619"]
CARBON_RAW = ["#4a505c", "#30353e", "#23272e", "#191c21", "#111316"]
RED_MATTE = ["#d23540", "#b51c27", "#97121c", "#740c14", "#520810"]
RED_GLOSS = ["#ff7a6c", "#f2343b", "#dc1b24", "#a8121a", "#6e0a10"]
WHITE = ["#ffffff", "#eceef2", "#cfd2da", "#a9adb7", "#868a95"]
RIVAL = ["#8a9bb5", "#5f7190", "#465673", "#323e55", "#232c3d"]

TEAL, TEAL_LT, TEAL_DK = "#00a19b", "#4fd8cc", "#007570"
VODA_RED, VODA_DK, VODA_HI = "#e3231b", "#a5161a", "#ff5a4a"
GRAPHITE = ["#8a8f98", "#6c717a", "#555a63", "#41454d"]
HP_BLUE = "#0096d6"
SHELL_Y, SHELL_R = "#ffd500", "#dd1d21"
FLOOR = "#17191d"
CARBON_LINE = "#25282f"
WING_HI = "#4a4f59"

# helmet colour schemes (base, accent, visor) – yellow is Hamilton's signature
HELMETS = {
    "mclaren": ("#ffd400", "#2fa84f", "#1a1c22"),
    "mercedes": ("#ffd400", "#f4f4f4", "#1a1c22"),
    "mercedes_late": ("#f4f4f4", "#8b3fd1", "#1a1c22"),
    "ferrari": ("#ffd400", "#dc1b24", "#1a1c22"),
}

# ---------------------------------------------------------------- season specs
# era keys: e07 (2007-08), e09 (2009-11), e12 (2012-13), e14 (2014-16),
# e17 (2017), e18 (2018-21), e22 (2022-25), e26 (2026)
SPECS = {
    2007: dict(team="mclaren", car="McLaren MP4-22", L=150, era="e07", nose="high", fin=False, num="2", tyre="bs07", helmet="mclaren"),
    2008: dict(team="mclaren", car="McLaren MP4-23", L=150, era="e07", nose="high", fin=True, num="22", tyre="bs07", helmet="mclaren"),
    2009: dict(team="mclaren", car="McLaren MP4-24", L=152, era="e09", nose="high", fin=False, num="1", tyre="bs09", helmet="mclaren"),
    2010: dict(team="mclaren", car="McLaren MP4-25", L=158, era="e09", nose="high", fin=True, num="2", tyre="bs09", helmet="mclaren"),
    2011: dict(team="mclaren", car="McLaren MP4-26", L=158, era="e09", nose="high", fin=False, num="3", tyre="pz", helmet="mclaren"),
    2012: dict(team="mclaren", car="McLaren MP4-27", L=158, era="e12", nose="smooth", fin=False, num="4", tyre="pz", helmet="mclaren"),
    2013: dict(team="mercedes", car="Mercedes F1 W04", L=160, era="e12", nose="step", fin=False, num="10", tyre="pz", helmet="mercedes"),
    2014: dict(team="mercedes", car="Mercedes F1 W05 Hybrid", L=162, era="e14", nose="low14", fin=False, num="44", tyre="pz", helmet="mercedes"),
    2015: dict(team="mercedes", car="Mercedes F1 W06 Hybrid", L=162, era="e14", nose="low15", fin=False, num="44", tyre="pz", helmet="mercedes"),
    2016: dict(team="mercedes", car="Mercedes F1 W07 Hybrid", L=164, era="e14", nose="low15", fin=False, num="44", tyre="pz", helmet="mercedes"),
    2017: dict(team="mercedes", car="Mercedes-AMG F1 W08 EQ Power+", L=172, era="e17", nose="mid", fin=True, num="44", tyre="pz", helmet="mercedes"),
    2018: dict(team="mercedes", car="Mercedes-AMG F1 W09 EQ Power+", L=172, era="e18", nose="mid", fin=False, num="44", tyre="pz", helmet="mercedes"),
    2019: dict(team="mercedes", car="Mercedes-AMG F1 W10 EQ Power+", L=174, era="e18", nose="mid", fin=False, num="44", tyre="pz", helmet="mercedes"),
    2020: dict(team="mercedes", car="Mercedes-AMG F1 W11 EQ Performance", L=176, era="e18", nose="mid", fin=False, num="44", tyre="pz", helmet="mercedes_late"),
    2021: dict(team="mercedes", car="Mercedes-AMG F1 W12 E Performance", L=176, era="e18", nose="mid", fin=False, num="44", tyre="pz", helmet="mercedes_late"),
    2022: dict(team="mercedes", car="Mercedes-AMG F1 W13 E Performance", L=178, era="e22", nose="ge", fin=False, num="44", tyre="pz18", helmet="mercedes_late", pods="zero"),
    2023: dict(team="mercedes", car="Mercedes-AMG F1 W14 E Performance", L=178, era="e22", nose="ge", fin=False, num="44", tyre="pz18", helmet="mercedes_late", pods="zero"),
    2024: dict(team="mercedes", car="Mercedes-AMG F1 W15 E Performance", L=178, era="e22", nose="ge", fin=False, num="44", tyre="pz18", helmet="mercedes_late", pods="downwash"),
    2025: dict(team="ferrari", car="Ferrari SF-25", L=178, era="e22", nose="ge", fin=False, num="44", tyre="pz18", helmet="ferrari", pods="downwash"),
    2026: dict(team="ferrari", car="Ferrari SF-26", L=168, era="e26", nose="g26", fin=False, num="44", tyre="pz26", helmet="ferrari", pods="downwash"),
    "rival": dict(team="rival", car="generic rival", L=156, era="e09", nose="high", fin=False, num="", tyre="bs09", helmet="rival"),
}

HELMETS["rival"] = ("#e8e8e8", "#3d6fd1", "#1a1c22")


def wheel_r(spec):
    return 11 if spec["tyre"].startswith("pz18") or spec["tyre"] == "pz26" else 10


# ---------------------------------------------------------------- profiles
def profile(spec):
    """Return (top contour, bottom contour, sidepod poly, axle fractions, rear-wing)."""
    era, nose = spec["era"], spec["nose"]
    # top contour: nose tip -> cockpit -> airbox -> gearbox (x fraction, height px)
    if nose == "high":
        front = [(0.035, 10), (0.07, 13), (0.13, 15), (0.21, 17), (0.30, 19), (0.355, 20)]
        under = [(0.25, 5), (0.18, 7), (0.08, 8), (0.035, 8)]
    elif nose == "smooth":  # MP4-27: lower, no step
        front = [(0.03, 8), (0.08, 11), (0.16, 14), (0.26, 17), (0.355, 20)]
        under = [(0.25, 4), (0.16, 6), (0.07, 6), (0.03, 6)]
    elif nose == "step":  # 2013 stepped nose
        front = [(0.03, 8), (0.08, 11), (0.17, 13), (0.205, 13), (0.215, 17), (0.30, 19), (0.355, 20)]
        under = [(0.25, 4), (0.16, 6), (0.07, 6), (0.03, 6)]
    elif nose == "low14":
        front = [(0.02, 5), (0.06, 8), (0.12, 11), (0.19, 15), (0.29, 18), (0.355, 19)]
        under = [(0.25, 4), (0.17, 5), (0.08, 4), (0.02, 3)]
    elif nose == "low15":
        front = [(0.035, 6), (0.08, 9), (0.14, 12), (0.21, 15), (0.29, 18), (0.355, 19)]
        under = [(0.25, 4), (0.17, 5), (0.08, 4), (0.035, 4)]
    elif nose == "mid":
        front = [(0.025, 6), (0.07, 9), (0.13, 12), (0.20, 15), (0.29, 18), (0.355, 19)]
        under = [(0.25, 4), (0.17, 5), (0.08, 4), (0.025, 4)]
    elif nose == "ge":
        front = [(0.03, 5), (0.08, 8), (0.14, 12), (0.21, 15), (0.29, 18), (0.355, 19)]
        under = [(0.26, 4), (0.17, 5), (0.08, 4), (0.03, 3)]
    else:  # g26: shorter, blunter
        front = [(0.04, 6), (0.09, 9), (0.15, 12), (0.22, 15), (0.30, 18), (0.355, 19)]
        under = [(0.26, 4), (0.17, 5), (0.09, 4), (0.04, 4)]

    rim = front[-1][1]
    if era in ("e07",):
        rear = [(0.455, rim), (0.465, 23), (0.48, 28), (0.53, 29), (0.57, 27), (0.66, 23), (0.76, 19), (0.85, 14), (0.91, 12)]
    elif era in ("e09", "e12"):
        rear = [(0.455, rim), (0.465, 23), (0.48, 28), (0.53, 29), (0.58, 27), (0.68, 22), (0.80, 16), (0.88, 12), (0.92, 11)]
    elif era == "e14":
        rear = [(0.455, rim), (0.465, 22), (0.48, 27), (0.53, 28), (0.58, 26), (0.68, 21), (0.80, 15), (0.88, 11), (0.92, 10)]
    elif era in ("e17", "e18"):
        rear = [(0.455, rim), (0.465, 22), (0.48, 27), (0.53, 28), (0.58, 26), (0.68, 21), (0.80, 15), (0.88, 11), (0.925, 10)]
    else:  # e22 / e26 – taller, flatter engine cover
        rear = [(0.455, rim), (0.465, 23), (0.48, 28), (0.53, 29), (0.59, 27), (0.70, 22), (0.81, 16), (0.89, 12), (0.925, 11)]

    floor_end = 0.925
    bottom = [(floor_end, 4), (0.89, 3), (0.28, 3)] + under
    top = front + [(0.355, rim)] + rear

    # sidepods (lower volume beside the chassis)
    pods = spec.get("pods", "classic")
    if era == "e07":
        pod = [(0.385, 5), (0.385, 13), (0.40, 15), (0.50, 15), (0.62, 13), (0.71, 9), (0.75, 5)]
    elif pods == "zero":
        pod = [(0.40, 4), (0.40, 9), (0.43, 10), (0.56, 10), (0.66, 8), (0.72, 4)]
    elif pods == "downwash":
        pod = [(0.39, 4), (0.39, 13), (0.41, 15), (0.50, 15), (0.58, 12), (0.68, 8), (0.76, 4)]
    elif era in ("e17", "e18"):
        pod = [(0.385, 4), (0.385, 13), (0.40, 15), (0.52, 14), (0.64, 11), (0.73, 6), (0.77, 4)]
    else:
        pod = [(0.385, 5), (0.385, 13), (0.40, 15), (0.52, 14), (0.63, 11), (0.72, 7), (0.76, 5)]

    if era in ("e17", "e18"):
        axles = (0.175, 0.835)
    elif era == "e22":
        axles = (0.18, 0.83)
    elif era == "e26":
        axles = (0.185, 0.815)
    else:
        axles = (0.19, 0.80)
    return top, bottom, pod, axles


# ---------------------------------------------------------------- shading
def ramp_fill(s: Sprite, mask, ramp, style="metal"):
    hi, lt, md, dk, sh = ramp[0], ramp[1], ramp[2], ramp[3], ramp[-1]
    for x in range(s.w):
        ys = np.where(mask[:, x])[0]
        if len(ys) == 0:
            continue
        y0, y1 = ys.min(), ys.max()
        span = max(1, y1 - y0)
        for y in ys:
            t = (y - y0) / span
            if style == "chrome":
                c = hi if t < 0.13 else lt if t < 0.36 else ramp[2] if t < 0.5 else dk if t < 0.6 else ramp[4] if t < 0.86 else sh
            elif style == "matte":
                c = lt if t < 0.16 else md if t < 0.72 else dk if t < 0.92 else sh
            elif style == "gloss":
                c = hi if t < 0.1 else lt if t < 0.32 else md if t < 0.78 else dk if t < 0.93 else sh
            else:
                c = hi if t < 0.12 else lt if t < 0.42 else md if t < 0.76 else dk if t < 0.93 else sh
            s.px(x, y, c)


def top_edge_highlight(s: Sprite, mask, color, x0=0, x1=None):
    x1 = s.w if x1 is None else x1
    for x in range(max(0, x0), min(s.w, x1)):
        ys = np.where(mask[:, x])[0]
        if len(ys):
            s.px(x, ys.min(), color)


def column_top(mask, x):
    ys = np.where(mask[:, x])[0]
    return (ys.min(), ys.max()) if len(ys) else (None, None)


# ---------------------------------------------------------------- builder
class Car:
    def __init__(self, year, spec, wing_open=False, k=1.0):
        self.k = k
        self.year, self.spec = year, spec
        self.L = spec["L"]
        self.r = round(wheel_r(spec) * k)
        self.pad = 3
        self.W = self.L + 2 * self.pad
        self.H = round(46 * k)
        self.gy = self.H - 2  # ground row (tyre bottom)
        self.s = Sprite(self.W, self.H)
        self.wing_open = wing_open
        self.top, self.bottom, self.pod, self.axles = profile(spec)

    def X(self, f):
        return self.pad + f * self.L

    def q(self, n):
        return int(round(n * self.k))

    def Y(self, h):
        return self.gy - h * self.k

    def P(self, pts):
        return [(self.X(f), self.Y(h)) for f, h in pts]

    def build(self):
        s, sp = self.s, self.spec
        body_pts = self.P(self.top + self.bottom)
        self.body = s.mask_poly(body_pts)
        self.podm = s.mask_poly(self.P(self.pod))
        self.finm = np.zeros_like(self.body)
        if sp["fin"]:
            top_h = 26 if sp["era"] != "e17" else 25
            self.finm = s.mask_poly(self.P([(0.52, 29), (0.905, top_h), (0.905, 12), (0.80, 16), (0.58, 27)])) & ~self.body
        self.all = self.body | self.podm | self.finm

        self.draw_floor()
        self.draw_suspension()
        self.paint_livery()
        self.draw_details()
        self.draw_front_wing()
        self.draw_rear_wing()
        self.draw_helmet()
        if sp["era"] in ("e18", "e22", "e26"):
            self.draw_halo()
        return s

    # ---- structure
    def draw_floor(self):
        s = self.s
        x0, x1 = int(self.X(0.26)), int(self.X(0.93))
        for x in range(x0, x1 + 1):
            for yy in range(int(self.Y(3.5)), int(self.Y(1.5)) + 1):
                s.px(x, yy, FLOOR if yy >= self.Y(2.4) else CARBON_LINE)
            if self.spec["era"] in ("e22", "e26"):
                for yy in range(int(self.Y(4.5)), int(self.Y(3.5)) + 1):
                    s.px(x, yy, CARBON_LINE)
        # diffuser kick-up
        for i in range(self.q(5)):
            s.px(int(self.X(0.93)) + i, self.Y(3 + i / self.k), FLOOR)
            s.px(int(self.X(0.93)) + i, self.Y(2 + i / self.k), CARBON_LINE)
        if self.spec["era"] in ("e22", "e26"):  # floor edge wing
            s.line(self.X(0.30), self.Y(5), self.X(0.36), self.Y(5), WING_HI)

    def draw_suspension(self):
        s = self.s
        fa, ra = self.axles
        r = self.r
        fx, rx = self.X(fa), self.X(ra)
        s.line(fx, self.Y(r), fx + 0.085 * self.L, self.Y(13), CARBON_LINE)
        s.line(fx, self.Y(r), fx + 0.085 * self.L, self.Y(6), CARBON_LINE)
        s.line(fx + 2, self.Y(r - 1), fx + 0.07 * self.L, self.Y(16), "#3a3e47")
        s.line(rx, self.Y(r), rx - 0.07 * self.L, self.Y(12), CARBON_LINE)
        s.line(rx, self.Y(r), rx - 0.07 * self.L, self.Y(6), CARBON_LINE)

    # ---- livery dispatch
    def paint_livery(self):
        team, y = self.spec["team"], self.year
        if team == "mclaren":
            self.livery_mclaren()
        elif team == "mercedes":
            self.livery_mercedes()
        elif team == "ferrari":
            self.livery_ferrari()
        else:
            ramp_fill(self.s, self.all, RIVAL, "metal")
            self.pod_shading(RIVAL)
            for x in range(int(self.X(0.05)), int(self.X(0.9))):
                t, b = column_top(self.all, x)
                if t is not None:
                    self.s.px(x, t + self.q(3), "#e9edf2")

    def pod_shading(self, ramp, crease=None):
        """Make the sidepod read as a separate volume: light top edge, shadow above."""
        s = self.s
        crease = crease or ramp[3]
        for x in range(s.w):
            t, b = column_top(self.podm, x)
            if t is None:
                continue
            if self.body[t - 1, x] if t > 0 else False:
                s.px(x, t - 1, crease)
            s.px(x, t, ramp[0])
            s.px(x, t + 1, ramp[1])
        # inlet slot
        xi = int(self.X(self.pod[0][0]))
        t, b = column_top(self.podm, xi + 1)
        if t is not None:
            for yy in range(t + 1, min(b, t + 7)):
                s.px(xi, yy, FLOOR)
                s.px(xi + 1, yy, CARBON_LINE)

    def nose_number(self, color, outline=None):
        num = self.spec["num"]
        if not num:
            return
        x = int(self.X(0.085))
        t, b = column_top(self.body, x + 2)
        if t is None:
            return
        y = t + 1
        if self.spec["nose"] in ("high",):
            y = t + 1
        if outline:
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                micro_text(self.s, x + dx, y + dy, num, outline, clip=self.all)
        micro_text(self.s, x, y, num, color, clip=self.all)

    # ---- shared livery helpers -------------------------------------------
    def fh(self, x, y):
        return (x - self.pad) / self.L, (self.gy - y) / self.k

    def zone(self, pred, ramp, base=None, style="metal"):
        """Repaint pixels of `base` (default: whole car) where pred(f, h) holds,
        keeping the column shading position so volumes still read."""
        s = self.s
        base = self.all if base is None else base
        for x in range(s.w):
            ys = np.where(self.all[:, x])[0]
            if len(ys) == 0:
                continue
            y0, y1 = ys.min(), ys.max()
            span = max(1, y1 - y0)
            for y in ys:
                if not base[y, x]:
                    continue
                f, h = self.fh(x, y)
                if not pred(f, h):
                    continue
                t = (y - y0) / span
                if isinstance(ramp, str):
                    c = ramp
                elif style == "flat":
                    c = ramp[1]
                else:
                    c = ramp[0] if t < 0.1 else ramp[1] if t < 0.42 else ramp[2] if t < 0.78 else ramp[3]
                s.px(x, y, c)

    def band(self, f0, f1, h0a, h0b, thick_a, thick_b, color, edge=None, base=None):
        """A swept band from f0 to f1 whose centre height goes h0a->h0b and
        thickness thick_a->thick_b (in unscaled px)."""
        base = self.all if base is None else base
        for x in range(int(self.X(f0)), int(self.X(f1)) + 1):
            t = (x - self.X(f0)) / max(1, self.X(f1) - self.X(f0))
            hc = h0a + (h0b - h0a) * t
            th = thick_a + (thick_b - thick_a) * t
            ya, yb = int(round(self.Y(hc + th / 2))), int(round(self.Y(hc - th / 2)))
            for y in range(ya, yb + 1):
                if 0 <= y < self.s.h and base[y, x]:
                    self.s.px(x, y, edge if (edge and y == ya) else color)

    def text_at(self, f, h, text, color, scale=1, base=None):
        x, y = int(self.X(f)), int(self.Y(h))
        if scale == 1:
            micro_text(self.s, x, y, text, color, clip=self.all if base is None else base)
        else:
            micro_text2(self.s, x, y, text, color, scale, clip=self.all if base is None else base)

    def disc(self, f, h, r, fill, ring=None):
        cx, cy = self.X(f), self.Y(h)
        m = self.s.mask_ellipse(cx, cy, r * self.k, r * self.k)
        self.s.fill(m & self.all, ring or fill)
        if ring:
            self.s.fill(self.s.mask_ellipse(cx, cy, (r - 1.2) * self.k, (r - 1.2) * self.k) & self.all, fill)
        return int(cx), int(cy)

    def star(self, f, h, light="#ffffff", dark=None):
        cx, cy = self.disc(f, h, 2.2, dark or "#1b1d22", ring=light)
        for dx, dy in ((0, -1), (0, 0), (-1, 1), (1, 1)):
            self.s.px(cx + dx, cy + dy, light)

    def shell(self, f, h):
        cx, cy = int(self.X(f)), int(self.Y(h))
        r = max(2, self.q(2.4))
        m = self.s.mask_ellipse(cx, cy, r, r) & (np.mgrid[0:self.s.h, 0:self.s.w][0] <= cy + 1)
        self.s.fill(m, SHELL_Y)
        self.s.rect(cx - r, cy + 1, cx + r, cy + 1, SHELL_R)
        for k in range(-r + 1, r, 2):
            self.s.px(cx + k, cy - 1, SHELL_R)

    def hp(self, f, h, r=4.6):
        cx, cy = self.disc(f, h, r, HP_BLUE)
        self.s.fill(self.s.mask_ellipse(cx - self.q(1), cy - self.q(1), r * 0.45 * self.k, r * 0.45 * self.k) & self.all, "#3fb6ef")
        if self.k >= 1.5:
            micro_text2(self.s, cx - 6, cy - 4, "hp", "#ffffff", 2) if r * self.k > 7 else micro_text(self.s, cx - 3, cy - 2, "hp", "#ffffff")
        else:
            micro_text(self.s, cx - 3, cy - 2, "hp", "#ffffff")

    def ineos(self, f, h):
        x, y = int(self.X(f)), int(self.Y(h))
        w = micro_width("INEOS") + 3
        self.s.rect(x - 2, y - 1, x - 2 + w, y + 5, "#d0102a")
        micro_text(self.s, x, y, "INEOS", "#ffffff")

    # ---- McLaren 2007-2012: chrome silver + Vodafone red (refs: MP4-24/25/26 photos)
    def livery_mclaren(self):
        s, y = self.s, self.year
        ramp_fill(s, self.all, SILVER_CHROME, "chrome")
        self.pod_shading(SILVER_CHROME, "#5a5e66")
        self.zone(lambda f, h: h < 5.2 and 0.24 < f < 0.92, GRAPHITE)
        # red nose tip
        self.zone(lambda f, h: f < 0.075, [VODA_HI, VODA_RED, VODA_RED, VODA_DK])
        # red cockpit surround / airbox spine
        for x in range(int(self.X(0.33)), int(self.X(0.56 if y < 2010 else 0.86))):
            t, b = column_top(self.all, x)
            if t is not None:
                s.px(x, t, VODA_HI)
                for kk in range(1, self.q(2) + 1):
                    s.px(x, t + kk, VODA_RED)
        if y <= 2010:
            # "speedmark" swoosh sweeping back and up from the speech-mark logo
            for x in range(int(self.X(0.43)), int(self.X(0.84)) + 1):
                t = min(1.0, max(0.0, (x - self.X(0.43)) / (self.X(0.84) - self.X(0.43))))
                hc = 9.5 + 8.0 * t ** 2.2
                th = 5.8 - 4.6 * t
                ya, yb = int(round(self.Y(hc + th / 2))), int(round(self.Y(hc - th / 2)))
                for yy in range(ya, yb + 1):
                    if 0 <= yy < s.h and self.all[yy, x]:
                        s.px(x, yy, VODA_HI if yy == ya else VODA_RED)
            self.disc(0.45, 9.5, 4.8, "#ffffff", ring=VODA_RED)
            cx, cy = int(self.X(0.45)), int(self.Y(9.5))
            for dx, dy in ((0, -1), (1, -1), (1, 0), (0, 1), (-1, 1)):
                s.px(cx + dx, cy + dy, VODA_RED)
            if y >= 2008:
                self.text_at(0.505, 16.5, "aigo", "#3a3f48", base=self.podm | self.body)
            self.text_at(0.60, 19.5 if y < 2009 else 20, "MOBIL 1", "#1d3f8f", base=self.body)
        elif y == 2012:
            # MP4-27: big red speech-mark logo with red wordmark on chrome
            self.disc(0.45, 10.0, 6.2, "#ffffff", ring=VODA_RED)
            cx, cy = int(self.X(0.45)), int(self.Y(10.0))
            for dx, dy in ((0, -2), (1, -2), (2, -1), (2, 0), (1, 1), (0, 2), (-1, 2)):
                s.px(cx + dx, cy + dy, VODA_RED)
            self.text_at(0.50, 11.6, "vodafone", VODA_RED, scale=2 if self.k >= 1.5 else 1)
            self.text_at(0.60, 20.5, "MOBIL 1", "#1d3f8f", base=self.body)
        else:
            # 2011: long red band along the sidepod carrying a big white wordmark
            self.band(0.40, 0.76, 9.0, 10.5, 9.0, 4.0, VODA_RED, edge=VODA_HI)
            self.disc(0.43, 9.0, 4.3, "#ffffff", ring=VODA_RED)
            cx, cy = int(self.X(0.43)), int(self.Y(9.0))
            for dx, dy in ((0, -1), (1, -1), (1, 0), (0, 1)):
                s.px(cx + dx, cy + dy, VODA_RED)
            self.text_at(0.47, 12.6, "vodafone", "#ffffff", scale=2 if self.k >= 1.5 else 1)
            self.text_at(0.60, 20.5, "MOBIL 1", "#1d3f8f", base=self.body)
        self.nose_number("#1b1d22")
        self.rear_endplate = VODA_RED if y <= 2010 else SILVER_CHROME[1]
        self.endplate_cap = VODA_RED if y > 2010 else None
        if y == 2008:
            self.text_at(0.29, 16.0, "SANTANDER", "#d81e1e", base=self.body) if self.k >= 1.5 else None
        self.front_endplate = VODA_RED if y <= 2010 else SILVER_CHROME[1]
        self.front_cap = VODA_RED
        self.wing_text = ("vodafone", "#ffffff")
        self.halo_col = CARBON[2]

    # ---- Mercedes 2013-2024 (refs: W04, W06, W07, W08, W09, W11 photos)
    def livery_mercedes(self):
        s, y = self.s, self.year
        black = y in (2020, 2021, 2023)
        if y == 2023:
            ramp_fill(s, self.all, CARBON_RAW, "metal")
            for yy in range(s.h):
                for x in range(s.w):
                    if self.all[yy, x] and (x + yy) % 2 == 0 and yy > self.Y(13):
                        s.px(x, yy, "#22262d")
            self.pod_shading(CARBON_RAW, "#0e1013")
        elif black:
            ramp_fill(s, self.all, CARBON, "metal")
            self.pod_shading(CARBON, "#0e1013")
        else:
            ramp_fill(s, self.all, SILVER, "metal")
            self.pod_shading(SILVER, "#5d6168")
        BLK = [CARBON[1], CARBON[2], CARBON[3], CARBON[4]]
        # black lower bodywork: the split height rises from nose to sidepod
        if not black:
            if y == 2013 or y == 2014:
                split = lambda f: 5.5
            elif y in (2015, 2016):
                split = lambda f: 6 + 5 * min(1, max(0, (f - 0.05) / 0.33)) if f < 0.4 else 11 - 3 * min(1, (f - 0.4) / 0.5)
            elif y in (2017, 2018, 2019):
                split = lambda f: 5 + 3 * min(1, max(0, (f - 0.1) / 0.3)) if f < 0.42 else 8 - 2 * min(1, (f - 0.42) / 0.45)
            elif y == 2022:
                split = lambda f: 5.0
            else:  # 2024 W15: half silver, half black
                split = lambda f: 7 + 6 * max(0, min(1, (f - 0.2) / 0.55))
            self.zone(lambda f, h: h < split(f) and 0.03 < f < 0.95, BLK)
            for x in range(int(self.X(0.06)), int(self.X(0.9))):
                f = (x - self.pad) / self.L
                yy = int(round(self.Y(split(f))))
                if 0 <= yy < s.h and self.all[yy, x] and self.all[min(s.h - 1, yy + 1), x]:
                    s.px(x, yy, TEAL if y != 2013 else TEAL_DK)
        # star pattern on the black/silver cars from 2020
        if y >= 2020:
            dot = "#4b5261" if black else "#b8bdc5"
            for yy in range(s.h):
                for x in range(int(self.X(0.58)), int(self.X(0.93))):
                    if self.all[yy, x] and (x * 3 + yy * 5) % 11 == 0 and yy < self.Y(10):
                        s.px(x, yy, dot)
        # teal accents
        if y == 2013:
            self.band(0.06, 0.34, 9.5, 12.5, 1.6, 1.6, TEAL)
            self.band(0.42, 0.70, 6.2, 5.8, 1.6, 1.4, TEAL, base=self.podm)
            self.text_at(0.44, 12.6, "PETRONAS", TEAL_DK, base=self.all)
            self.text_at(0.445, 9.0, "PRIMAX", TEAL_DK, scale=2 if self.k >= 1.5 else 1, base=self.all)
        elif y == 2014:
            self.band(0.05, 0.40, 8.0, 13.0, 1.6, 1.6, TEAL)
            self.band(0.42, 0.72, 13.0, 9.0, 1.6, 1.2, TEAL)
            self.text_at(0.50, 19.5, "PETRONAS", TEAL_DK, base=self.body & ~self.podm)
        elif y in (2015, 2016):
            self.band(0.40, 0.60, 12.5, 12.0, 1.4, 1.2, TEAL_LT)
            self.text_at(0.43, 13.8, "PETRONAS", TEAL_DK, base=self.all)
            self.text_at(0.44, 8.6, "PRIMAX", "#ffffff", scale=2 if self.k >= 1.5 else 1)
            self.text_at(0.11, 5.8, "BLACKBERRY" if y == 2015 else "QUALCOMM", "#ffffff") if self.k >= 1.5 else None
        elif y in (2017, 2018, 2019):
            self.band(0.30, 0.86, 13.0, 18.0, 1.5, 1.0, TEAL)
            self.band(0.42, 0.70, 11.5, 9.5, 2.2, 1.5, TEAL_LT, base=self.podm)
            self.text_at(0.44, 9.2, "PETRONAS", TEAL_DK if self.k < 1.5 else "#ffffff", scale=2 if self.k >= 1.5 else 1, base=self.podm | self.body)
        elif y in (2020, 2021):
            self.band(0.06, 0.40, 9.0, 13.0, 1.2, 1.2, TEAL)
            self.band(0.44, 0.88, 14.5, 17.5, 1.0, 1.0, TEAL)
            self.text_at(0.44, 9.4, "PETRONAS", "#ffffff", scale=2 if self.k >= 1.5 else 1, base=self.podm | self.body)
            self.ineos(0.525, 24.0)
        elif y == 2022:
            self.band(0.06, 0.40, 9.0, 13.0, 1.2, 1.2, TEAL)
            self.text_at(0.48, 20.5, "PETRONAS", TEAL_DK, base=self.body & ~self.podm)
            self.ineos(0.525, 24.5)
        elif y == 2023:
            self.band(0.06, 0.40, 9.0, 13.0, 1.2, 1.2, TEAL)
            self.band(0.46, 0.88, 15.0, 18.0, 1.0, 1.0, "#9aa1ab")
            self.text_at(0.48, 20.5, "PETRONAS", "#ffffff", base=self.body & ~self.podm)
            self.ineos(0.525, 24.5)
        else:  # 2024
            self.text_at(0.46, 9.5, "PETRONAS", "#ffffff", scale=2 if self.k >= 1.5 else 1, base=self.podm | self.body)
            self.ineos(0.525, 24.5)
        # Mercedes star on the nose and engine cover
        nx = 0.12 if y < 2014 else 0.10
        t, b = column_top(self.body, int(self.X(nx)))
        if t is not None:
            self.star(nx, (self.gy - t) / self.k - 2.6)
        self.star(0.66, 20.5 if y >= 2014 else 21.5)
        # number on the fin / engine cover (red 44 on the silver cars, white on black)
        if y >= 2014:
            col = "#c8f03c" if y >= 2022 else "#ffffff" if black else "#e8102a"
            self.text_at(0.72, 23.0 if self.spec["fin"] else 19.0, "44", col, scale=2 if self.k >= 1.5 else 1, base=self.all)
        self.nose_number("#ffffff" if black or y >= 2015 else "#1b1d22")
        self.rear_endplate = CARBON[1] if y >= 2014 else SILVER[1]
        self.endplate_cap = TEAL if y < 2014 else None
        self.front_endplate = CARBON[1] if y >= 2015 else TEAL
        self.front_cap = TEAL
        self.wing_text = ("EPSON", "#ffffff") if y >= 2015 else ("PETRONAS", "#ffffff")
        self.halo_col = CARBON[2] if (black or y >= 2022) else SILVER[2]

    # ---- Ferrari 2025-2026 (refs: SF-25 and SF-26 Austrian GP photos)
    def livery_ferrari(self):
        s, y = self.s, self.year
        if y == 2025:
            R = RED_MATTE
            ramp_fill(s, self.all, R, "matte")
            self.pod_shading(R, "#4a070d")
            # white panel on the engine-cover top behind the airbox (carries the HP logo)
            self.zone(lambda f, h: 0.47 < f < 0.72 and h > 17.5 + (f - 0.47) * 8, WHITE)
            # thin white pinstripe sweeping down the sidepod
            self.band(0.44, 0.80, 15.5, 9.0, 1.0, 0.8, "#f4f4f4")
            # black lower front chassis
            self.zone(lambda f, h: 0.16 < f < 0.40 and h < 10, [CARBON[1], CARBON[2], CARBON[3], CARBON[4]])
            self.hp(0.565, 21.8, 4.4)
            self.shell(0.47, 9.0)
            self.text_at(0.55, 9.6, "RAY-BAN", "#ffffff", base=self.podm | self.body)
            self.text_at(0.66, 16.0, "IBM", "#ffffff", base=self.body)
            self.text_at(0.78, 19.0 if self.k < 1.5 else 18.5, "44", "#ffffff", scale=2 if self.k >= 1.5 else 1, base=self.all)
            self.rear_endplate, self.front_endplate = CARBON[1], R[1]
            self.front_cap = CARBON[2]
            self.halo_col = R[2]
        else:
            R = RED_GLOSS
            ramp_fill(s, self.all, R, "gloss")
            self.pod_shading(R, "#5a080d")
            # SF-26: white engine cover and upper rear bodywork (312T homage)
            self.zone(lambda f, h: 0.46 < f < 0.9 and h > 8.5 + max(0, 0.6 - f) * 10, WHITE)
            # red sidepod front and red lower edge
            self.zone(lambda f, h: 0.38 < f < 0.5 and h < 13, R)
            self.zone(lambda f, h: 0.46 < f < 0.9 and h < 6.5, R)
            # black chassis sides ahead of the sidepods
            self.zone(lambda f, h: 0.17 < f < 0.39 and h < 11.5, [CARBON[1], CARBON[2], CARBON[3], CARBON[4]])
            for x in range(int(self.X(0.06)), int(self.X(0.46)), 3):  # gloss glints
                t, b = column_top(self.body, x)
                if t is not None:
                    s.px(x, t, "#ffd8cf")
            self.hp(0.60, 18.5, 5.4)
            self.shell(0.52, 9.5)
            self.text_at(0.70, 10.6, "CEVA", "#dc1b24", base=self.all)
            self.text_at(0.69, 20.5, "44", "#dc1b24", scale=2 if self.k >= 1.5 else 1, base=self.all)
            self.rear_endplate, self.front_endplate = CARBON[1], CARBON[2]
            self.front_cap = R[1]
            self.halo_col = CARBON[2]
        self.nose_number("#ffffff")
        # Ferrari shield on the chassis side ahead of the cockpit
        fx = int(self.X(0.30))
        t, b = column_top(self.body, fx + 1)
        if t is not None:
            sy = t + self.q(3)
            sh = self.q(5)
            sw = max(3, self.q(3))
            for yy in range(sh):
                for xx in range(sw):
                    if yy < sh - 1 or xx == sw // 2:
                        s.px(fx + xx, sy + yy, "#ffd200")
            s.px(fx + sw // 2, sy + sh // 2, "#111111")
            if self.k > 1.2:
                s.px(fx + sw // 2, sy + sh // 2 - 1, "#111111")
                s.rect(fx, sy, fx + sw - 1, sy, "#1f9a3d")
        self.wing_text = ("V-POWER", "#ffffff") if y == 2026 else ("hp", "#ffffff")

    # ---- small details
    def draw_details(self):
        s = self.s
        # cockpit opening (black, per the master reference)
        x0, x1 = int(self.X(0.358)), int(self.X(0.455))
        for x in range(x0, x1 + 1):
            t, b = column_top(self.body, x)
            if t is not None:
                s.px(x, t, "#0b0c0e")
        # airbox notch
        ax = int(self.X(0.475))
        t, b = column_top(self.body, ax + 1)
        if t is not None:
            for kk in range(self.q(3)):
                s.px(ax + 1, t + 1 + kk, "#0b0c0e")
                s.px(ax + 2, t + 1 + kk, "#0b0c0e")
        # mirror
        mx = int(self.X(0.335))
        s.rect(mx, self.Y(23), mx + 3, self.Y(22), CARBON[2])
        s.px(mx, self.Y(23), "#8d939c")
        s.px(mx + 3, self.Y(21), CARBON[3])
        # exhaust + rain light
        ex = int(self.X(0.915))
        s.rect(ex, self.Y(14), ex + 2, self.Y(13), "#2d3038")
        s.px(ex + 2, self.Y(14), "#0b0c0e")
        self.exhaust = (ex + 3, int(self.Y(13.5)))
        lx = int(self.X(0.975))
        self.light = (lx, int(self.Y(9)))
        s.rect(lx, self.Y(10), lx + 1, self.Y(9), "#4a0a0a")
        # MP4-22/23 "bridge" front wing over the nose and sidepod winglets
        if self.spec["era"] == "e07":
            s.line(self.X(0.05), self.Y(16), self.X(0.12), self.Y(17), CARBON[1])
            s.line(self.X(0.05), self.Y(17), self.X(0.12), self.Y(18), WING_HI)
            s.line(self.X(0.085), self.Y(16), self.X(0.085), self.Y(13), CARBON[2])
            s.line(self.X(0.37), self.Y(19), self.X(0.40), self.Y(22), CARBON[1])
            s.line(self.X(0.39), self.Y(19), self.X(0.42), self.Y(21), CARBON[2])
            s.line(self.X(0.64), self.Y(22), self.X(0.67), self.Y(25), CARBON[2])  # chimney winglet
        # 2017 T-wing
        if self.spec["era"] == "e17":
            s.line(self.X(0.84), self.Y(24), self.X(0.88), self.Y(24), CARBON[2])
            s.line(self.X(0.85), self.Y(23), self.X(0.85), self.Y(18), CARBON[3])

    def draw_front_wing(self):
        s, era, L = self.s, self.spec["era"], self.L
        ep = getattr(self, "front_endplate", CARBON[1])
        if era == "e07":
            plate = [(0.0, 1), (0.11, 1), (0.105, 6), (0.06, 8), (0.01, 7)]
            flaps = [(0.0, 2, 0.12, 3), (0.02, 4, 0.12, 6), (0.04, 6, 0.12, 8)]
        elif era in ("e09", "e12", "e14"):
            plate = [(0.0, 1), (0.125, 1), (0.12, 6), (0.005, 6)]
            flaps = [(0.0, 2, 0.13, 3), (0.03, 3, 0.13, 5), (0.06, 4, 0.13, 7)]
        elif era in ("e17", "e18"):
            plate = [(0.0, 1), (0.125, 1), (0.13, 8), (0.07, 8), (0.0, 5)]
            flaps = [(0.0, 2, 0.13, 3), (0.02, 3, 0.13, 5), (0.05, 4, 0.13, 7), (0.08, 6, 0.14, 9)]
        elif era == "e22":
            plate = [(0.0, 1), (0.115, 1), (0.115, 5), (0.06, 6), (0.0, 4)]
            flaps = [(0.0, 2, 0.12, 3), (0.02, 3, 0.13, 6), (0.05, 4, 0.14, 8), (0.08, 5, 0.15, 10)]
        else:  # 2026 active front wing: flap angle changes with mode
            plate = [(0.0, 1), (0.12, 1), (0.12, 6), (0.01, 5)]
            if self.wing_open:
                flaps = [(0.0, 2, 0.13, 3), (0.03, 4, 0.14, 4), (0.06, 5, 0.15, 5)]
            else:
                flaps = [(0.0, 2, 0.13, 3), (0.03, 3, 0.14, 6), (0.06, 4, 0.15, 8)]
        for x0, h0, x1, h1 in flaps:
            s.line(self.X(x0), self.Y(h0), self.X(x1), self.Y(h1), CARBON[2])
            s.line(self.X(x0), self.Y(h0 + 1), self.X(x1), self.Y(h1 + 1), WING_HI)
        pm = s.mask_poly(self.P(plate))
        s.fill(pm, ep)
        # endplate shading: top edge light, bottom dark
        for x in range(s.w):
            t, b = column_top(pm, x)
            if t is not None:
                s.px(x, t, "#ffffff" if ep in (VODA_RED, TEAL) else getattr(self, "front_cap", WING_HI))
                if self.k > 1.4:
                    s.px(x, t + 1, getattr(self, "front_cap", WING_HI))
                s.px(x, b, CARBON[3])

    def draw_rear_wing(self):
        s, era = self.s, self.spec["era"]
        ep = getattr(self, "rear_endplate", CARBON[1])
        if era == "e07":
            plate = [(0.885, 8), (0.99, 8), (0.99, 25), (0.90, 25)]
            elems = [(0.875, 24, 0.995, 24), (0.875, 22, 0.995, 21), (0.90, 12, 0.995, 12)]
        elif era in ("e09", "e12", "e14"):
            plate = [(0.905, 9), (0.995, 9), (0.995, 33), (0.915, 33)]
            elems = [(0.9, 31, 1.0, 32), (0.9, 28, 1.0, 27)]
        elif era == "e17":
            plate = [(0.9, 8), (0.95, 8), (1.0, 27), (0.935, 27)]
            elems = [(0.925, 26, 1.005, 26), (0.92, 23, 1.0, 22)]
        elif era == "e18":
            top = 29 if self.year >= 2019 else 27
            plate = [(0.9, 8), (0.95, 8), (1.0, top), (0.935, top)]
            elems = [(0.925, top - 1, 1.005, top - 1), (0.92, top - 4, 1.0, top - 5)]
        elif era == "e22":
            plate = [(0.905, 10), (0.99, 10), (0.995, 26), (0.975, 30), (0.915, 30)]
            elems = [(0.9, 29, 0.99, 29), (0.9, 26, 0.985, 25), (0.92, 12, 0.99, 12)]
        else:  # e26 active rear wing
            plate = [(0.91, 10), (0.99, 10), (0.995, 27), (0.92, 28)]
            if self.wing_open:
                elems = [(0.905, 27, 0.995, 27), (0.905, 24, 0.995, 24)]
            else:
                elems = [(0.905, 27, 0.995, 28), (0.905, 25, 0.995, 22)]
        pm = s.mask_poly(self.P(plate))
        s.fill(pm, ep)
        cap = getattr(self, "endplate_cap", None)
        for x in range(s.w):
            t, b = column_top(pm, x)
            if t is not None:
                s.px(x, b, CARBON[3])
                if cap:
                    for yy in range(t, t + max(2, (b - t) // 2)):
                        s.px(x, yy, cap if yy > t else "#ff5a4a")
        for x0, h0, x1, h1 in elems:
            s.line(self.X(x0), self.Y(h0), self.X(x1), self.Y(h1), CARBON[3])
            s.line(self.X(x0), self.Y(h0 + 1), self.X(x1), self.Y(h1 + 1), WING_HI)
        # tiny wordmark on the endplate when it fits
        txt, col = getattr(self, "wing_text", ("", "#fff"))
        if cap:
            txt = ""
        if txt and micro_width(txt) <= pm.sum(axis=1).max() - 1:
            ys = np.where(pm.any(axis=1))[0]
            mid = (ys.min() + ys.max()) // 2
            xs = np.where(pm[mid])[0]
            micro_text(s, xs.min() + 1, mid - 2, txt, col, clip=pm)
        elif txt == "HP" or self.spec["team"] == "ferrari":
            ys = np.where(pm.any(axis=1))[0]
            mid = (ys.min() + ys.max()) // 2
            xs = np.where(pm[mid])[0]
            micro_text(s, xs.min() + 2, mid - 2, "hp", "#ffffff", clip=pm)
        self.rw_top = int(self.Y(max(e[1] for e in elems) + 1))

    def draw_helmet(self):
        s = self.s
        base, acc, visor = HELMETS[self.spec["helmet"]]
        cx, cy = self.X(0.41), self.Y(23)
        m = s.mask_ellipse(cx, cy, 4.2 * self.k, 3.6 * self.k)
        # only above the cockpit rim
        rim_y = self.Y(self.top[-10][1] if False else 19)
        m[int(rim_y) + 1 :, :] = False
        s.fill(m, base)
        # accent stripe, visor slit, top highlight
        K = self.k
        for x in range(int(cx - 4 * K), int(cx + 5 * K)):
            for yy in range(self.q(1)):
                s.px(x, int(cy) - 1 - yy, acc)
        for yy in range(self.q(1.5)):
            s.line(cx - 4 * K, cy + yy, cx - 1, cy + yy, visor)
        s.px(cx - 4 * K, cy + self.q(1.5), visor)
        s.px(int(cx) - 1, int(cy) - 3, "#ffffff")
        s.px(int(cx), int(cy) - 3, "#ffffff")

    def draw_halo(self):
        s = self.s
        col = getattr(self, "halo_col", CARBON[2])
        hi = "#9aa1ab" if col != CARBON[2] else "#6b7280"
        th = max(1, self.q(1.2))
        for d in range(th):
            s.line(self.X(0.358) + d, self.Y(19), self.X(0.385) + d, self.Y(27), col)
            s.line(self.X(0.385), self.Y(28) + d, self.X(0.455), self.Y(28) + d, col)
            s.line(self.X(0.455), self.Y(28) + d, self.X(0.468), self.Y(24) + d, col)
        s.line(self.X(0.385), self.Y(28) - 1, self.X(0.452), self.Y(28) - 1, hi)


# ---------------------------------------------------------------- wheels
def wheel(r, tyre, rim_col, frame, mark=None):
    """r = radius. 4 spin frames rotate the sidewall lettering by 22.5deg steps."""
    d = 2 * r + 1
    s = Sprite(d, d)
    c = r
    yy, xx = np.mgrid[0:d, 0:d]
    dist = np.sqrt((xx - c) ** 2 + (yy - c) ** 2)
    ang = np.degrees(np.arctan2(yy - c, xx - c)) % 360
    s.fill(dist <= r + 0.3, "#131317")
    big = tyre in ("pz18", "pz26")
    rim_r = r * (0.72 if big else 0.52)
    wall_in = rim_r
    wall_out = r * (0.86 if big else 0.92)
    s.fill((dist > wall_in) & (dist <= wall_out), "#26262c")
    # lettering arcs (two, opposite) rotate with the frame
    rot = frame * 22.5
    mark = mark or {"bs07": "#e6e6e6", "bs09": "#e6e6e6", "pz": "#ffd21a", "pz18": "#ffd21a", "pz26": "#ffd21a"}[tyre]
    mid = (wall_in + wall_out) / 2
    band = (dist > mid - (0.7 if big else 0.9)) & (dist <= mid + (0.7 if big else 0.9))
    for base in (rot, rot + 180):
        seg = ((ang - base) % 360) < 64
        letters = ((ang - base) % 360) % 9 < 6  # gaps between letters
        s.fill(band & seg & letters, mark)
    if big:  # 18" Pirelli: coloured ring around the rim
        s.fill((dist > rim_r) & (dist <= rim_r + 0.9), mark)
    # rim / wheel cover
    s.fill(dist <= rim_r, rim_col)
    s.fill(dist <= rim_r * 0.35, "#1c1d22")
    if not big:  # visible spokes on 13" wheels
        for k in range(5):
            a = np.radians(rot * 2 + k * 72)
            for t in np.linspace(rim_r * 0.4, rim_r - 0.5, 6):
                s.px(round(c + t * np.cos(a)), round(c + t * np.sin(a)), "#3b3e45")
    else:  # cover highlight
        s.fill((dist <= rim_r) & (dist > rim_r - 1) & (ang > 180) & (ang < 270), "#9aa0a9")
    s.px(c, c, "#8d929a")
    # top-left light on the tyre shoulder; white lower crescent (master ref)
    s.fill((dist > r - 1.2) & (dist <= r + 0.3) & (ang > 190) & (ang < 260), "#3d3e46")
    return s


RIM = {"mclaren": "#7d828b", "mercedes": "#2b2f36", "ferrari": "#2b2f36", "rival": "#6a6f78"}


MAIN_K = 1.75  # every season car in the vertical film (about 260-310 art px long)
HERO_K = 2.1  # hero close-ups of the two priority cars: more pixels, same pixel size
# Tyre sidewall marking per season (compound colours seen in reference photos,
# Bridgestone softer-compound stripe pre-2011) and rim colours.
MARKS = {2007: "#e6e6e6", 2008: "#e6e6e6", 2009: "#3fbf5a", 2010: "#3fbf5a", 2011: "#e8202a", 2012: "#ffd21a",
         2013: "#e6e6e6", 2014: "#ffd21a", 2015: "#f08a1c", 2016: "#e8202a", 2017: "#e8202a", 2018: "#ffd21a",
         2019: "#e6e6e6", 2020: "#ffd21a", 2021: "#e6e6e6", 2022: "#e8202a", 2023: "#ffd21a", 2024: "#e6e6e6",
         2025: "#e8202a", 2026: "#ffd21a"}
RIMS = {"mclaren": "#7d828b", "mercedes": "#2b2f36", "ferrari": "#2b2f36", "rival": "#6a6f78"}


def build_all(preview_dir=None):
    meta = {}
    jobs = [(str(y), y, sp, MAIN_K) for y, sp in SPECS.items()]
    jobs += [("2007_hero", 2007, SPECS[2007], HERO_K), ("2026_hero", 2026, SPECS[2026], HERO_K)]
    for key, year, spec, k in jobs:
        if k != 1.0:
            spec = dict(spec, L=round(spec["L"] * k))
        car = Car(year, spec, k=k)
        body = car.build()
        body.save(f"cars/{key}.png")
        entry = dict(
            key=key, name=spec["car"], team=spec["team"], w=car.W, h=car.H, gy=car.gy, r=car.r,
            wheels=[[round(car.X(car.axles[0])), car.gy - car.r], [round(car.X(car.axles[1])), car.gy - car.r]],
            exhaust=list(car.exhaust), light=list(car.light), number=spec["num"],
        )
        if year == 2026:
            open_car = Car(year, spec, wing_open=True, k=k)
            open_car.build().save(f"cars/{key}_open.png")
            entry["open"] = True
        rim_col = RIMS[spec["team"]]
        if year == 2025:
            rim_col = "#b51c27"  # SF-25 red rims (Ferrari launch notes, reference photo)
        for f in range(4):
            wheel(car.r, spec["tyre"], rim_col, f, MARKS.get(year)).save(f"wheels/{key}_{f}.png")
        meta[key] = entry
    write_meta("cars", meta)
    return meta


if __name__ == "__main__":
    build_all()
