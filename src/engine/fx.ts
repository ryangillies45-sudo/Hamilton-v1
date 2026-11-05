// Procedural, seeded effects. Every effect is a pure function of the frame.
import {C, FB, bayer, rng} from './fb';

export const speedLines = (fb: FB, f: number, o: {seed?: number; count?: number; speed?: number; y0?: number; y1?: number; color?: string; len?: number}) => {
	const r = rng(o.seed ?? 7);
	const n = o.count ?? 24, sp = o.speed ?? 14, y0 = o.y0 ?? 0, y1 = o.y1 ?? fb.h;
	const c = C(o.color ?? '#ffffff');
	for (let i = 0; i < n; i++) {
		const y = Math.floor(y0 + r() * (y1 - y0));
		const len = Math.floor((o.len ?? 30) * (0.4 + r()));
		const phase = r() * 900;
		const x = Math.floor((phase + f * sp * (0.7 + r() * 0.6)) % (fb.w + len * 2)) - len;
		fb.hline(x, x + len, y, c);
	}
};

export const rain = (fb: FB, f: number, o: {seed?: number; count?: number; color?: string; slant?: number; speed?: number}) => {
	const r = rng(o.seed ?? 3);
	const c = C(o.color ?? '#9fb6d9');
	const sl = o.slant ?? 3, sp = o.speed ?? 12;
	for (let i = 0; i < (o.count ?? 140); i++) {
		const x0 = r() * (fb.w + 60), y0 = r() * fb.h, len = 4 + Math.floor(r() * 5);
		const y = (y0 + f * sp) % (fb.h + 20) - 10;
		const x = (x0 + f * sp * (sl / 6)) % (fb.w + 60) - 30;
		for (let k = 0; k < len; k++) fb.pset(x + (k * sl) / 6, y + k, c);
	}
};

/** Spray plume behind rear wheels in the wet (moving right as the car goes left). */
export const spray = (fb: FB, f: number, x: number, y: number, seed = 5) => {
	const r = rng(seed + f * 31);
	const cols = [C('#d9e4f2'), C('#aebcd2'), C('#7f8ea8')];
	for (let i = 0; i < 70; i++) {
		const d = r();
		const px = x + d * 70 + r() * 6;
		const py = y - r() * (6 + d * 18);
		if (bayer(Math.round(px), Math.round(py)) < 0.9 - d * 0.7) fb.pset(px, py, cols[Math.min(2, Math.floor(d * 3))]);
	}
};

export const CONFETTI_COLS = ['#ffd23f', '#ffffff', '#00a19b', '#ff4d4d', '#4fd8cc', '#c0c6d0'];

/** Burst of confetti from (ox, oy) starting at frame `start`; falls with flutter. */
export const confetti = (fb: FB, f: number, start: number, o: {seed?: number; count?: number; ox?: number; oy?: number; cols?: string[]; life?: number}) => {
	const t = f - start;
	if (t < 0 || t > (o.life ?? 70)) return;
	const r = rng(o.seed ?? 11);
	const cols = (o.cols ?? CONFETTI_COLS).map(C);
	const ox = o.ox ?? fb.w / 2, oy = o.oy ?? fb.h / 2;
	for (let i = 0; i < (o.count ?? 160); i++) {
		const a = r() * Math.PI * 2, v = 2 + r() * 6;
		const vx = Math.cos(a) * v, vy = Math.sin(a) * v - 3;
		const drag = Math.pow(0.9, t);
		const sx = (vx * (1 - drag)) / 0.1, sy = (vy * (1 - drag)) / 0.1 + t * t * 0.02 + t * 0.5;
		const flutter = Math.sin(t * 0.4 + i) * 2;
		const x = ox + sx + flutter, y = oy + sy;
		const c = cols[i % cols.length];
		fb.pset(x, y, c);
		if ((t + i) % 3 !== 0) fb.pset(x + 1, y, c);
	}
};

/** Sparks from the plank. */
export const sparks = (fb: FB, f: number, x: number, y: number, seed = 9) => {
	const r = rng(seed + f * 17);
	const cols = [C('#fff6c2'), C('#ffd23f'), C('#ff9a2e')];
	for (let i = 0; i < 14; i++) {
		const d = r();
		const len = 2 + Math.floor(d * 6);
		const px = x + d * 40, py = y - r() * 4;
		for (let k = 0; k < len; k++) fb.pset(px + k, py - k * 0.25, cols[Math.min(2, k >> 1)]);
	}
};

/** Dithered flash towards a colour. t in [0,1]. */
export const flash = (fb: FB, t: number, color = '#ffffff') => fb.ditherAll(C(color), t);

/** Ordered-dither wipe revealing `b` over `a` from left (t=0) to right (t=1). */
export const ditherWipe = (fb: FB, a: FB, b: FB, t: number, dir: 1 | -1 = 1) => {
	const w = fb.w;
	for (let y = 0; y < fb.h; y++)
		for (let x = 0; x < w; x++) {
			const pos = dir === 1 ? x / w : 1 - x / w;
			const edge = t * 1.25 - pos;
			const useB = edge > 0.25 || (edge > 0 && bayer(x, y) < edge * 4);
			fb.px[y * w + x] = useB ? b.px[y * w + x] : a.px[y * w + x];
		}
};

/** Ordered-dither crossfade between two framebuffers. */
export const ditherMix = (fb: FB, a: FB, b: FB, t: number) => {
	for (let y = 0; y < fb.h; y++)
		for (let x = 0; x < fb.w; x++) fb.px[y * fb.w + x] = bayer(x, y) < t ? b.px[y * fb.w + x] : a.px[y * fb.w + x];
};

/** Shake offset for a hit: returns integer [dx, dy]. */
export const shake = (f: number, hit: number, amp = 3, len = 8): [number, number] => {
	const d = f - hit;
	if (d < 0 || d >= len) return [0, 0];
	const k = amp * (1 - d / len);
	const r = rng(hit * 13 + d);
	return [Math.round((r() * 2 - 1) * k), Math.round((r() * 2 - 1) * k)];
};

/** Apply a whole-frame shift (camera shake), filling exposed edges by clamping. */
export const applyShake = (fb: FB, dx: number, dy: number) => {
	if (!dx && !dy) return;
	const src = fb.px.slice();
	for (let y = 0; y < fb.h; y++) {
		const sy = Math.min(fb.h - 1, Math.max(0, y - dy));
		for (let x = 0; x < fb.w; x++) {
			const sx = Math.min(fb.w - 1, Math.max(0, x - dx));
			fb.px[y * fb.w + x] = src[sy * fb.w + sx];
		}
	}
};

/** Expanding pixel ring (title pop, impacts). */
export const ring = (fb: FB, cx: number, cy: number, t: number, maxR: number, color: string) => {
	if (t <= 0 || t >= 1) return;
	const r = maxR * t;
	const c = C(color);
	const n = Math.max(12, Math.floor(r * 6));
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2;
		if (bayer(i, Math.floor(t * 8)) < 1 - t) fb.pset(cx + Math.cos(a) * r, cy + Math.sin(a) * r, c);
	}
};
