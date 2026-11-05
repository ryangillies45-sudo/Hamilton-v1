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

from pix import Sprite, hexc, micro_text, micro_width, write_meta

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
VODA_RED, VODA_DK = "#e3231b", "#a5161a"
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

    # ---- McLaren 2007-2012: chrome silver + Vodafone red
    def livery_mclaren(self):
        s, y = self.s, self.year
        ramp_fill(s, self.all, SILVER_CHROME, "chrome")
        self.pod_shading(SILVER_CHROME, "#5a5e66")
        # red nose tip
        for x in range(int(self.X(0.0)), int(self.X(0.075))):
            t, b = column_top(self.body, x)
            if t is not None:
                for yy in range(t, b + 1):
                    s.px(x, yy, VODA_RED if yy > t else "#ff5a4a")
        # red stripe along the airbox top and engine cover spine
        for x in range(int(self.X(0.47)), int(self.X(0.74 if y < 2010 else 0.86))):
            t, b = column_top(self.all, x)
            if t is not None:
                s.px(x, t, "#ff5a4a")
                s.px(x, t + 1, VODA_RED)
                if x < self.X(0.62):
                    s.px(x, t + 2, VODA_DK)
                    if self.k > 1.2:
                        s.px(x, t + 3, VODA_DK)
        # sidepod swoosh (red band sweeping up the engine cover) + speech mark
        pod = self.podm
        cx, cy = int(self.X(0.455)), int(self.Y(10))
        for x in range(int(self.X(0.43)), int(self.X(0.75))):
            f = (x - self.X(0.43)) / (self.X(0.75) - self.X(0.43))
            yc = self.Y(9 + f * 6)
            thick = self.q(3 if f < 0.6 else 2 if f < 0.85 else 1)
            for kk in range(thick):
                if self.all[int(yc) + kk, x]:
                    s.px(x, int(yc) + kk, VODA_RED if kk else "#ff4d3d")
        # speech-mark disc
        disc = s.mask_ellipse(cx, cy, 4.6 * self.k, 4.6 * self.k) & self.all
        s.fill(disc, VODA_RED)
        inner = s.mask_ellipse(cx, cy, 3.2 * self.k, 3.2 * self.k) & self.all
        s.fill(inner, "#ffffff")
        s.px(cx, cy - 1, VODA_RED); s.px(cx + 1, cy - 1, VODA_RED); s.px(cx + 1, cy, VODA_RED); s.px(cx, cy + 1, VODA_RED)
        # vodafone wordmark on the engine cover
        tx = int(self.X(0.49))
        t, b = column_top(self.body, tx + 8)
        if t is not None:
            micro_text(s, tx, t + self.q(4), "vodafone", "#d81e1e", clip=self.body & ~self.podm)
        # Santander / Mobil 1 hints on the nose side (approx)
        self.nose_number("#1b1d22")
        self.rear_endplate = VODA_RED if y < 2009 else "#c9ccd2"
        self.endplate_cap = VODA_RED if y >= 2009 else None
        self.front_endplate = VODA_RED if y < 2009 else "#c9ccd2"
        self.wing_text = ("vodafone", "#ffffff")

    # ---- Mercedes 2013-2024
    def livery_mercedes(self):
        s, y = self.s, self.year
        black = y in (2020, 2021, 2023)
        if y == 2023:
            ramp_fill(s, self.all, CARBON_RAW, "metal")
            # raw-carbon weave: subtle checker on the lower body
            for yy in range(s.h):
                for x in range(s.w):
                    if self.all[yy, x] and (x + yy) % 2 == 0 and yy > self.Y(14):
                        s.px(x, yy, "#22262d")
            self.pod_shading(CARBON_RAW, "#0e1013")
            ramp = CARBON_RAW
        elif black:
            ramp_fill(s, self.all, CARBON, "metal")
            self.pod_shading(CARBON, "#0e1013")
            ramp = CARBON
        else:
            ramp_fill(s, self.all, SILVER, "metal")
            self.pod_shading(SILVER, "#5d6168")
            ramp = SILVER

        # W15 / W13: black lower body under a diagonal split
        if y in (2022, 2024):
            for yy in range(s.h):
                for x in range(s.w):
                    if self.all[yy, x]:
                        f = (x - self.pad) / self.L
                        split = self.Y(7 + 7 * max(0, min(1, (f - 0.25) / 0.6))) if y == 2024 else self.Y(5)
                        if yy >= split:
                            s.px(x, yy, CARBON[2] if yy < split + 2 else CARBON[3])
            # teal pinstripe on the split
            for x in range(int(self.X(0.25)), int(self.X(0.9))):
                f = (x - self.pad) / self.L
                split = self.Y(7 + 7 * max(0, min(1, (f - 0.25) / 0.6))) if y == 2024 else self.Y(5)
                if self.all[int(split) - 1, x]:
                    s.px(x, int(split) - 1, TEAL)

        # Mercedes star pattern (2020-2023: star fade on the engine cover)
        if y >= 2020:
            dot = "#4b5261" if black else "#b8bdc5"
            for yy in range(s.h):
                for x in range(int(self.X(0.6)), int(self.X(0.92))):
                    if self.all[yy, x] and (x * 3 + yy * 5) % 11 == 0 and yy < self.Y(10):
                        s.px(x, yy, dot)

        # teal accents: line along the chassis + airbox + fin
        line_h = 12 if y < 2017 else 11
        for x in range(int(self.X(0.06)), int(self.X(0.38))):
            t, b = column_top(self.body, x)
            if t is not None:
                yy = max(t + 2, int(self.Y(line_h - 2 * (x - self.X(0.06)) / self.L)))
                if self.body[yy, x]:
                    s.px(x, yy, TEAL)
        for x in range(int(self.X(0.47)), int(self.X(0.80))):
            t, b = column_top(self.all, x)
            if t is not None:
                s.px(x, t + 1, TEAL if y < 2020 or y == 2022 else TEAL_DK)
                if y >= 2017 and x > self.X(0.55):
                    s.px(x, t + 2, TEAL_LT if y < 2020 else TEAL)
        # sidepod teal sweep (pre-2020 silver cars)
        if y < 2020 or y == 2022:
            for x in range(int(self.X(0.41)), int(self.X(0.70))):
                t, b = column_top(self.podm, x)
                if t is not None and b - t > 3:
                    s.px(x, b - 1, TEAL)
                    if x < self.X(0.58):
                        s.px(x, b - 2, TEAL_DK)

        # PETRONAS wordmark on the engine cover
        tx = int(self.X(0.50))
        t, b = column_top(self.body, tx + 10)
        if t is not None:
            col = "#ffffff" if (black or y == 2024) else TEAL_DK
            micro_text(s, tx, t + self.q(4), "PETRONAS", col, clip=self.body & ~self.podm)
        # INEOS on the sidepod (2020+)
        if y >= 2020:
            px = int(self.X(0.45))
            t, b = column_top(self.podm, px + 6)
            if t is not None:
                micro_text(s, px, t + self.q(3), "INEOS", "#ffffff" if black or y >= 2022 else "#1b1d22", clip=self.podm)
        # Mercedes star on the nose top (white disc)
        nx = int(self.X(0.11))
        t, b = column_top(self.body, nx)
        if t is not None:
            s.px(nx, t, "#ffffff"); s.px(nx + 1, t, "#ffffff"); s.px(nx, t + 1, "#d6dbe2")
        self.nose_number("#ffffff" if black or y >= 2022 else "#1b1d22")
        self.rear_endplate = ramp[2] if not black else CARBON[1]
        self.front_endplate = TEAL if y < 2020 else (CARBON[1] if black else SILVER[2])
        self.wing_text = ("PETRONAS", TEAL if not black else "#ffffff")

    # ---- Ferrari 2025-2026
    def livery_ferrari(self):
        s, y = self.s, self.year
        if y == 2025:
            ramp_fill(s, self.all, RED_MATTE, "matte")
            self.pod_shading(RED_MATTE, "#4a070d")
            # angled white band with thin red/white pinstripes (SF-25)
            for yy in range(s.h):
                for x in range(s.w):
                    if not self.all[yy, x]:
                        continue
                    h = (self.gy - yy) / self.k
                    d = (x - self.X(0.60)) / self.k + (h - 14) * 1.3
                    if 0 <= d < 5:
                        s.px(x, yy, "#f3f3f3" if h > 10 else "#d9dae0")
                    elif 6 <= d < 7:
                        s.px(x, yy, "#ffffff")
            for x in range(s.w):  # black lower edge
                t, b = column_top(self.all, x)
                if t is not None and b - t > 4:
                    s.px(x, b, CARBON[3]); s.px(x, b - 1, CARBON[2])
            self.rear_endplate, self.front_endplate = RED_MATTE[2], RED_MATTE[1]
            hp_x = int(self.X(0.69))
        else:
            ramp_fill(s, self.all, RED_GLOSS, "gloss")
            self.pod_shading(RED_GLOSS, "#5a080d")
            # white engine cover (312T homage) – upper body behind the airbox
            for yy in range(s.h):
                for x in range(s.w):
                    if not self.body[yy, x] or self.podm[yy, x]:
                        continue
                    f = (x - self.pad) / self.L
                    h = (self.gy - yy) / self.k
                    if f > 0.47 and h > 11 + (f - 0.47) * 4 and f < 0.9:
                        t, b = column_top(self.body, x)
                        tt = (yy - t) / max(1, (b - t))
                        s.px(x, yy, WHITE[0] if tt < 0.12 else WHITE[1] if tt < 0.45 else WHITE[2] if tt < 0.8 else WHITE[3])
            # black on the chassis sides (below the cockpit, ahead of the pods)
            for yy in range(s.h):
                for x in range(s.w):
                    if self.body[yy, x] and not self.podm[yy, x]:
                        f = (x - self.pad) / self.L
                        h = (self.gy - yy) / self.k
                        if 0.2 < f < 0.4 and h < 12:
                            s.px(x, yy, CARBON[2] if h > 7 else CARBON[3])
            # gloss specular glints along the top edge
            for x in range(int(self.X(0.06)), int(self.X(0.46)), 3):
                t, b = column_top(self.body, x)
                if t is not None:
                    s.px(x, t, "#ffd8cf")
            self.rear_endplate, self.front_endplate = RED_GLOSS[2], CARBON[2]
            hp_x = int(self.X(0.62))
        # HP logo (blue disc, white hp) on the engine cover
        t, b = column_top(self.body, hp_x)
        if t is not None:
            cy = t + self.q(6)
            disc = s.mask_ellipse(hp_x, cy, 4.5 * self.k, 4.5 * self.k)
            s.fill(disc, HP_BLUE)
            micro_text(s, hp_x - 3, cy - 2, "hp", "#ffffff")
        # Shell pecten on the nose (approx)
        sx = int(self.X(0.15))
        t, b = column_top(self.body, sx)
        if t is not None:
            s.rect(sx, t + 2, sx + 2, t + 3, SHELL_Y)
            s.px(sx + 1, t + 4, SHELL_Y)
            s.px(sx - 1, t + 3, SHELL_R); s.px(sx + 3, t + 3, SHELL_R)
        self.nose_number("#ffffff", outline=None)
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
        self.wing_text = ("hp", "#ffffff")

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
                s.px(x, t, "#ffffff" if ep in (VODA_RED, TEAL) else WING_HI)
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
                    for kk in range(self.q(4)):
                        s.px(x, t + kk, cap if kk else "#ff5a4a")
                    s.px(x, (t + b) // 2, cap)
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
        col = CARBON[2]
        hi = "#6b7280"
        s.line(self.X(0.358), self.Y(19), self.X(0.385), self.Y(27), col)
        s.line(self.X(0.385), self.Y(28), self.X(0.455), self.Y(28), col)
        s.line(self.X(0.385), self.Y(29), self.X(0.452), self.Y(29), hi)
        s.line(self.X(0.455), self.Y(28), self.X(0.468), self.Y(24), col)


# ---------------------------------------------------------------- wheels
def wheel(r, tyre, rim_col, frame):
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
    mark = {"bs07": "#e6e6e6", "bs09": "#e6e6e6", "pz": "#ffd21a", "pz18": "#ffd21a", "pz26": "#ffd21a"}[tyre]
    band = (dist > wall_in + (0.6 if big else 1.0)) & (dist <= wall_out - 0.4)
    for base in (rot, rot + 180):
        seg = ((ang - base) % 360) < 70
        s.fill(band & seg, mark)
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


HERO_K = 1.9  # hero close-ups of the two priority cars: more pixels, same pixel size


def build_all(preview_dir=None):
    meta = {}
    jobs = [(str(y), y, sp, 1.0) for y, sp in SPECS.items()]
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
        rim_col = RIM[spec["team"]]
        if year == 2025:
            rim_col = "#b51c27"  # SF-25 red rims (Ferrari launch notes)
        if year == 2026:
            rim_col = "#a8121a"
        for f in range(4):
            wheel(car.r, spec["tyre"], rim_col, f).save(f"wheels/{key}_{f}.png")
        meta[key] = entry
    write_meta("cars", meta)
    return meta


if __name__ == "__main__":
    build_all()
