// Software framebuffer: every pixel of the film is written here as an exact
// palette colour, then copied to a 480x270 canvas. No smoothing, no alpha
// blending of edges; fades and wipes use ordered dithering.
import {H, W} from '../config/video';


export type Sprite = {w: number; h: number; px: Uint32Array};

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x: number, y: number) => (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

export const rgb = (hex: string): number => {
	const h = hex.replace('#', '');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
};
const cache = new Map<string, number>();
export const C = (hex: string): number => {
	let v = cache.get(hex);
	if (v === undefined) {
		v = rgb(hex);
		cache.set(hex, v);
	}
	return v;
};

export const mix = (a: number, b: number, t: number): number => {
	const ar = a & 255, ag = (a >>> 8) & 255, ab = (a >>> 16) & 255;
	const br = b & 255, bg = (b >>> 8) & 255, bb = (b >>> 16) & 255;
	const r = Math.round(ar + (br - ar) * t);
	const g = Math.round(ag + (bg - ag) * t);
	const bl = Math.round(ab + (bb - ab) * t);
	return ((255 << 24) | (bl << 16) | (g << 8) | r) >>> 0;
};

export class FB {
	w = W;
	h = H;
	px = new Uint32Array(W * H);

	clear(c: number) {
		this.px.fill(c);
	}
	pset(x: number, y: number, c: number) {
		x |= 0;
		y |= 0;
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
		this.px[y * this.w + x] = c;
	}
	get(x: number, y: number) {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
		return this.px[y * this.w + x];
	}
	rect(x: number, y: number, w: number, h: number, c: number) {
		const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
		const x1 = Math.min(this.w, Math.round(x + w)), y1 = Math.min(this.h, Math.round(y + h));
		for (let yy = y0; yy < y1; yy++) this.px.fill(c, yy * this.w + x0, yy * this.w + x1);
	}
	/** Rect filled with colour c where bayer < t (ordered-dither coverage). */
	ditherRect(x: number, y: number, w: number, h: number, c: number, t: number) {
		if (t <= 0) return;
		const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
		const x1 = Math.min(this.w, Math.round(x + w)), y1 = Math.min(this.h, Math.round(y + h));
		for (let yy = y0; yy < y1; yy++)
			for (let xx = x0; xx < x1; xx++) if (bayer(xx, yy) < t) this.px[yy * this.w + xx] = c;
	}
	hline(x0: number, x1: number, y: number, c: number) {
		if (x1 < x0) [x0, x1] = [x1, x0];
		this.rect(x0, y, x1 - x0 + 1, 1, c);
	}
	vline(x: number, y0: number, y1: number, c: number) {
		if (y1 < y0) [y0, y1] = [y1, y0];
		this.rect(x, y0, 1, y1 - y0 + 1, c);
	}
	line(x0: number, y0: number, x1: number, y1: number, c: number) {
		x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
		const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
		let err = dx + dy;
		for (;;) {
			this.pset(x0, y0, c);
			if (x0 === x1 && y0 === y1) break;
			const e2 = 2 * err;
			if (e2 >= dy) { err += dy; x0 += sx; }
			if (e2 <= dx) { err += dx; y0 += sy; }
		}
	}
	circle(cx: number, cy: number, r: number, c: number) {
		for (let y = -Math.ceil(r); y <= Math.ceil(r); y++)
			for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
				if (x * x + y * y <= r * r + r * 0.6) this.pset(cx + x, cy + y, c);
	}
	/** Vertical gradient through `stops` between y0..y1 with Bayer-dithered transitions. */
	gradient(y0: number, y1: number, stops: number[]) {
		const n = stops.length - 1;
		for (let y = Math.max(0, y0); y < Math.min(this.h, y1); y++) {
			const t = ((y - y0) / Math.max(1, y1 - y0)) * n;
			const i = Math.min(n - 1, Math.floor(t));
			const fr = t - i;
			const row = y * this.w;
			for (let x = 0; x < this.w; x++) this.px[row + x] = bayer(x, y) < fr ? stops[i + 1] : stops[i];
		}
	}
	blit(s: Sprite, x: number, y: number, o: {flip?: boolean; color?: number; clipY?: number; rim?: number} = {}) {
		x = Math.round(x);
		y = Math.round(y);
		const clipY = o.clipY ?? this.h;
		for (let sy = 0; sy < s.h; sy++) {
			const dy = y + sy;
			if (dy < 0 || dy >= this.h || dy >= clipY) continue;
			for (let sx = 0; sx < s.w; sx++) {
				const v = s.px[sy * s.w + (o.flip ? s.w - 1 - sx : sx)];
				if (v >>> 24 === 0) continue;
				const dx = x + sx;
				if (dx < 0 || dx >= this.w) continue;
				this.px[dy * this.w + dx] = o.color ?? v;
			}
		}
		if (o.rim !== undefined) this.rim(s, x, y, o.rim, o.flip);
	}
	/** Blit only where pred(x, y) is true (used for dithered livery flips). */
	blitIf(s: Sprite, x: number, y: number, pred: (x: number, y: number) => boolean) {
		x = Math.round(x);
		y = Math.round(y);
		for (let sy = 0; sy < s.h; sy++)
			for (let sx = 0; sx < s.w; sx++) {
				const v = s.px[sy * s.w + sx];
				if (v >>> 24 === 0 || !pred(x + sx, y + sy)) continue;
				this.pset(x + sx, y + sy, v);
			}
	}
	/** 1px outline outside a sprite (rim light for dark liveries at night). */
	rim(s: Sprite, x: number, y: number, c: number, flip = false) {
		const op = (sx: number, sy: number) =>
			sx >= 0 && sy >= 0 && sx < s.w && sy < s.h && s.px[sy * s.w + (flip ? s.w - 1 - sx : sx)] >>> 24 !== 0;
		for (let sy = -1; sy <= s.h; sy++)
			for (let sx = -1; sx <= s.w; sx++) {
				if (op(sx, sy)) continue;
				if (op(sx, sy + 1) || op(sx + 1, sy)) this.pset(x + sx, y + sy, c);
			}
	}
	/** Replace pixels with c where bayer < t: dithered fade/flash. */
	ditherAll(c: number, t: number) {
		if (t <= 0) return;
		if (t >= 1) return this.clear(c);
		for (let y = 0; y < this.h; y++)
			for (let x = 0; x < this.w; x++) if (bayer(x, y) < t) this.px[y * this.w + x] = c;
	}
	copyFrom(o: FB) {
		this.px.set(o.px);
	}
}

/** Mulberry32 seeded RNG – the film is fully deterministic. */
export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Smooth 1-D value noise in [0,1], deterministic. */
export const noise1 = (x: number, seed = 1) => {
	const hash = (n: number) => {
		const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
		return s - Math.floor(s);
	};
	const i = Math.floor(x), f = x - i;
	const u = f * f * (3 - 2 * f);
	return hash(i) * (1 - u) + hash(i + 1) * u;
};
