"""Tiny indexed-pixel drawing library used by every art generator.

Everything is drawn at final art resolution (1 px = 1 art pixel). No
anti-aliasing anywhere: shapes are rasterised with hard edges so the
sprites stay clean when the film is scaled 4x with nearest-neighbour.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "sprites"


def hexc(h: str) -> tuple[int, int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


CLEAR = (0, 0, 0, 0)


class Sprite:
    def __init__(self, w: int, h: int):
        self.w, self.h = w, h
        self.a = np.zeros((h, w, 4), dtype=np.uint8)

    # ---- basic ops -------------------------------------------------
    def inb(self, x, y):
        return 0 <= x < self.w and 0 <= y < self.h

    def px(self, x, y, c):
        x, y = int(x), int(y)
        if self.inb(x, y):
            self.a[y, x] = hexc(c) if isinstance(c, str) else c

    def get(self, x, y):
        if self.inb(x, y):
            return tuple(self.a[y, x])
        return CLEAR

    def opaque(self, x, y):
        return self.inb(x, y) and self.a[y, x, 3] > 0

    def rect(self, x0, y0, x1, y1, c):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                self.px(x, y, c)

    def line(self, x0, y0, x1, y1, c):
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.px(x0, y0, c)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x0 += sx
            if e2 <= dx:
                err += dx
                y0 += sy

    def mask_poly(self, pts) -> np.ndarray:
        img = Image.new("1", (self.w, self.h), 0)
        ImageDraw.Draw(img).polygon([(round(x), round(y)) for x, y in pts], fill=1, outline=1)
        return np.array(img, dtype=bool)

    def mask_ellipse(self, cx, cy, rx, ry) -> np.ndarray:
        yy, xx = np.mgrid[0 : self.h, 0 : self.w]
        return ((xx - cx) / max(rx, 0.01)) ** 2 + ((yy - cy) / max(ry, 0.01)) ** 2 <= 1.0

    def fill(self, mask: np.ndarray, c):
        self.a[mask] = hexc(c) if isinstance(c, str) else c

    def poly(self, pts, c):
        self.fill(self.mask_poly(pts), c)

    def ellipse(self, cx, cy, rx, ry, c):
        self.fill(self.mask_ellipse(cx, cy, rx, ry), c)

    def alpha_mask(self) -> np.ndarray:
        return self.a[:, :, 3] > 0

    def blit(self, other: "Sprite", ox, oy):
        for y in range(other.h):
            for x in range(other.w):
                if other.a[y, x, 3]:
                    self.px(ox + x, oy + y, tuple(other.a[y, x]))

    def recolor(self, mapping: dict[str, str]):
        for src, dst in mapping.items():
            s = np.array(hexc(src), dtype=np.uint8)
            m = np.all(self.a == s, axis=2)
            self.a[m] = hexc(dst)

    def outline(self, c, only_bottom=False):
        """1px outline around opaque pixels (outside)."""
        m = self.alpha_mask()
        grow = np.zeros_like(m)
        grow[1:, :] |= m[:-1, :]
        if not only_bottom:
            grow[:-1, :] |= m[1:, :]
            grow[:, 1:] |= m[:, :-1]
            grow[:, :-1] |= m[:, 1:]
        edge = grow & ~m
        self.a[edge] = hexc(c)

    def flip_x(self) -> "Sprite":
        s = Sprite(self.w, self.h)
        s.a = self.a[:, ::-1].copy()
        return s

    def save(self, rel: str):
        p = OUT / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(self.a, "RGBA").save(p)
        return p

    def preview(self, path, scale=4, bg="#2b2f3a"):
        img = Image.new("RGBA", (self.w, self.h), hexc(bg))
        img.alpha_composite(Image.fromarray(self.a, "RGBA"))
        img = img.resize((self.w * scale, self.h * scale), Image.NEAREST)
        img.save(path)


def from_ascii(rows: list[str], key: dict[str, str]) -> Sprite:
    h = len(rows)
    w = max(len(r) for r in rows)
    s = Sprite(w, h)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in key and key[ch] is not None:
                s.px(x, y, key[ch])
    return s


# ---- 3x5 micro font for sponsor wordmarks and car numbers --------------
MICRO = {
    "A": ["010", "101", "111", "101", "101"], "B": ["110", "101", "110", "101", "110"],
    "C": ["011", "100", "100", "100", "011"], "D": ["110", "101", "101", "101", "110"],
    "E": ["111", "100", "110", "100", "111"], "F": ["111", "100", "110", "100", "100"],
    "G": ["011", "100", "101", "101", "011"], "H": ["101", "101", "111", "101", "101"],
    "I": ["111", "010", "010", "010", "111"], "J": ["001", "001", "001", "101", "010"],
    "K": ["101", "101", "110", "101", "101"], "L": ["100", "100", "100", "100", "111"],
    "M": ["101", "111", "111", "101", "101"], "N": ["110", "101", "101", "101", "101"],
    "O": ["010", "101", "101", "101", "010"], "P": ["110", "101", "110", "100", "100"],
    "Q": ["010", "101", "101", "110", "011"], "R": ["110", "101", "110", "101", "101"],
    "S": ["011", "100", "010", "001", "110"], "T": ["111", "010", "010", "010", "010"],
    "U": ["101", "101", "101", "101", "111"], "V": ["101", "101", "101", "101", "010"],
    "W": ["101", "101", "111", "111", "101"], "X": ["101", "101", "010", "101", "101"],
    "Y": ["101", "101", "010", "010", "010"], "Z": ["111", "001", "010", "100", "111"],
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"],
    "2": ["110", "001", "010", "100", "111"], "3": ["110", "001", "010", "001", "110"],
    "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "110", "001", "110"],
    "6": ["011", "100", "111", "101", "111"], "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "110"],
    " ": ["000", "000", "000", "000", "000"], "-": ["000", "000", "111", "000", "000"],
}
# lower-case wordmarks (vodafone, hp) use a 3x4 x-height set
MICRO_LC = {
    "a": ["000", "011", "101", "101", "011"], "d": ["001", "011", "101", "101", "011"],
    "e": ["000", "010", "111", "100", "011"], "f": ["011", "010", "111", "010", "010"],
    "h": ["100", "100", "110", "101", "101"], "n": ["000", "110", "101", "101", "101"],
    "o": ["000", "010", "101", "101", "010"], "p": ["000", "110", "101", "110", "100"],
    "v": ["000", "101", "101", "101", "010"], "l": ["010", "010", "010", "010", "011"],
    "s": ["000", "011", "110", "011", "110"], "i": ["010", "000", "010", "010", "010"],
    "t": ["010", "111", "010", "010", "001"], "r": ["000", "101", "110", "100", "100"],
}


def micro_width(text: str) -> int:
    return max(0, len(text) * 4 - 1)


def micro_text(s: Sprite, x: int, y: int, text: str, c, clip: np.ndarray | None = None):
    cx = x
    for ch in text:
        g = MICRO_LC.get(ch) or MICRO.get(ch.upper())
        if g:
            for gy, row in enumerate(g):
                for gx, bit in enumerate(row):
                    if bit == "1":
                        X, Y = cx + gx, y + gy
                        if clip is None or (0 <= X < s.w and 0 <= Y < s.h and clip[Y, X]):
                            s.px(X, Y, c)
        cx += 4


def write_meta(name: str, data):
    p = ROOT / "src" / "data" / "generated" / f"{name}.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=1))


def bayer4(x, y):
    m = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    return m[y % 4][x % 4] / 16.0


def micro_text2(s: "Sprite", x: int, y: int, text: str, c, scale: int = 2, clip=None):
    """Micro font drawn at an integer scale (bigger sponsor wordmarks)."""
    cx = x
    for ch in text:
        g = MICRO_LC.get(ch) or MICRO.get(ch.upper())
        if g:
            for gy, row in enumerate(g):
                for gx, bit in enumerate(row):
                    if bit == "1":
                        for dy in range(scale):
                            for dx in range(scale):
                                X, Y = cx + gx * scale + dx, y + gy * scale + dy
                                if clip is None or (0 <= X < s.w and 0 <= Y < s.h and clip[Y, X]):
                                    s.px(X, Y, c)
        cx += 4 * scale
