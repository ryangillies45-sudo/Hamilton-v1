// Vertical venues (generic circuits, not replicas). Layout: sky 0-272,
// scenery band 236-290, track 290-352 (tyres touch GROUND), run-off below.
import {C, FB, bayer, noise1, rng} from '../engine/fb';
import {clouds, fence, floodlights, grandstand, hills, ridge, sky, sun, track, trees} from '../engine/env';
import {rain} from '../engine/fx';

export const HORIZON = 272;
export const GROUND = 334;
export const TRACK_TOP = 290;
export const TRACK_BOT = 352;

export type VKey = 'grid' | 'sunny' | 'day2' | 'wet' | 'night' | 'desert' | 'sunset' | 'dusk' | 'barcelona' | 'pit';

const runoff = (fb: FB, off: number, cols: [string, string], y0 = TRACK_BOT) => {
	const a = C(cols[0]), b = C(cols[1]);
	for (let y = y0; y < fb.h; y++)
		for (let x = 0; x < fb.w; x++) fb.px[y * fb.w + x] = (((x - Math.floor(off * 1.25) + y) >> 4) & 1) ? a : b;
};

const stars = (fb: FB, f: number, y1: number, seed = 5) => {
	const r = rng(seed);
	for (let i = 0; i < 90; i++) {
		const x = Math.floor(r() * fb.w), y = Math.floor(r() * y1), tw = (f + i * 7) % 40 < 3;
		fb.pset(x, y, C(tw ? '#ffffff' : i % 3 ? '#8a94b8' : '#c9d2f0'));
	}
};

const skyline = (fb: FB, off: number, base: number, f: number) => {
	const r = rng(91);
	const body = C('#151a30'), win = C('#ffd27a'), win2 = C('#6a7398');
	for (let i = 0; i < 26; i++) {
		const w = 14 + Math.floor(r() * 22), h = 20 + Math.floor(r() * 70), bx = r() * 720;
		const x0 = Math.floor((((bx + off * 0.15) % 720) + 720) % 720) - 60;
		fb.rect(x0, base - h, w, h, body);
		for (let yy = base - h + 4; yy < base - 4; yy += 5)
			for (let xx = x0 + 3; xx < x0 + w - 3; xx += 4) if (((xx * 7 + yy * 3 + i) % 5) < 2) fb.pset(xx, yy, (xx + yy + (f >> 4)) % 7 ? win2 : win);
	}
};

export const venue = (fb: FB, v: VKey, off: number, f: number) => {
	switch (v) {
		case 'grid':
			sky(fb, 'overcast', 0, HORIZON);
			clouds(fb, 0, 60, {seed: 2, count: 7, light: '#9aa2b4', shade: '#7d8597', span: 500});
			clouds(fb, 0, 150, {seed: 9, count: 6, light: '#8a92a4', shade: '#6f7789', span: 500});
			ridge(fb, 0, 262, 26, '#4e5868', {seed: 3});
			grandstand(fb, off * 0.5, 236, f, {roof: '#b9c0cc'});
			fence(fb, off * 0.9, 272, 290);
			track(fb, off, TRACK_TOP, TRACK_BOT, {});
			runoff(fb, off, ['#3a7a3a', '#357036']);
			break;
		case 'sunny':
		case 'day2':
			sky(fb, 'day', 0, HORIZON);
			sun(fb, v === 'sunny' ? 290 : 70, 92, 14, '#fff7d6', '#ffe9a8');
			clouds(fb, off * 0.03, 70, {seed: v === 'sunny' ? 21 : 44, count: 6, span: 520});
			clouds(fb, off * 0.06, 170, {seed: v === 'sunny' ? 12 : 33, count: 7, span: 560});
			ridge(fb, off * 0.08, 262, 30, '#7ea6c4', {seed: 3, top: '#9cbcd6'});
			trees(fb, off * 0.3, 258, {seed: 8});
			grandstand(fb, off * 0.5, 236, f);
			fence(fb, off * 0.9, 272, 290);
			track(fb, off, TRACK_TOP, TRACK_BOT, {});
			runoff(fb, off, ['#3f8a3a', '#47963f']);
			break;
		case 'wet':
			sky(fb, 'wetDusk', 0, HORIZON);
			clouds(fb, off * 0.05, 40, {seed: 5, count: 10, light: '#5b4a6e', shade: '#3b3352', span: 520});
			clouds(fb, off * 0.08, 150, {seed: 6, count: 9, light: '#4a3e5e', shade: '#2f2944', span: 520});
			ridge(fb, off * 0.08, 262, 22, '#2a2440', {seed: 6});
			grandstand(fb, off * 0.5, 236, f, {dark: true, roof: '#8a8fa6', boards: ['#26304a', '#3a2d48']});
			fence(fb, off * 0.9, 272, 290, {color: '#6d7590'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {wet: true, asphalt: ['#2c2f3a', '#363a46', '#262934']});
			runoff(fb, off, ['#23402c', '#284a32']);
			break;
		case 'night':
			sky(fb, 'night', 0, HORIZON);
			stars(fb, f, 220);
			skyline(fb, off, 262, f);
			floodlights(fb, off, 170);
			grandstand(fb, off * 0.5, 236, f, {dark: true, roof: '#5a6280', boards: ['#1b2440', '#00a19b', '#2b2f4a']});
			fence(fb, off * 0.9, 272, 290, {color: '#566079'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {night: true, asphalt: ['#262932', '#2e323c', '#20232a']});
			runoff(fb, off, ['#14261a', '#18301f']);
			break;
		case 'desert':
			sky(fb, 'desert', 0, HORIZON);
			sun(fb, 250, 214, 22, '#ffe6a8', '#ffb86b');
			clouds(fb, off * 0.03, 90, {seed: 61, count: 4, light: '#ffc8a0', shade: '#e89a86', span: 520});
			ridge(fb, off * 0.06, 262, 18, '#b0705a', {seed: 31, top: '#d08a66', freq: 0.008});
			grandstand(fb, off * 0.5, 236, f, {roof: '#f0e6d8', boards: ['#3b2a4a', '#00a19b', '#ffffff']});
			fence(fb, off * 0.9, 272, 290, {color: '#a8a0a8'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {});
			runoff(fb, off, ['#c9a26a', '#d2ad76']);
			break;
		case 'sunset':
			sky(fb, 'sunset', 0, HORIZON);
			sun(fb, 110, 222, 22, '#ffe1a0', '#ff9a5c');
			clouds(fb, off * 0.03, 80, {seed: 71, count: 5, light: '#ff9e8a', shade: '#c0607a', span: 520});
			ridge(fb, off * 0.06, 262, 20, '#3a2448', {seed: 19});
			trees(fb, off * 0.3, 258, {seed: 4, dark: '#1f1830', mid: '#2c2240', light: '#3d2d52'});
			grandstand(fb, off * 0.5, 236, f, {dark: true, roof: '#c7a0a6', boards: ['#2a1e3a', '#00a19b']});
			fence(fb, off * 0.9, 272, 290, {color: '#8a7890'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#3a3440', '#443e4a', '#322c38']});
			runoff(fb, off, ['#2e3a2a', '#34412f']);
			break;
		case 'dusk':
			sky(fb, 'dusk', 0, HORIZON);
			stars(fb, f, 110, 8);
			skyline(fb, off, 266, f);
			grandstand(fb, off * 0.5, 236, f, {dark: true, roof: '#7a7a96', boards: ['#1b2033', '#00a19b']});
			fence(fb, off * 0.9, 272, 290, {color: '#5f6680'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#2c2e38', '#353844', '#25272f']});
			runoff(fb, off, ['#1f2e24', '#233428']);
			break;
		case 'barcelona':
			sky(fb, 'day', 0, HORIZON);
			clouds(fb, off * 0.03, 60, {seed: 66, count: 5, span: 520});
			ridge(fb, off * 0.04, 250, 70, '#8a93a8', {seed: 41, top: '#a9b1c2', freq: 0.016});
			hills(fb, off * 0.12, 262, 16, ['#a7b56a', '#8c9a52', '#6f7d43'], {seed: 9});
			grandstand(fb, off * 0.5, 236, f, {boards: ['#c8102e', '#ffd200', '#ffffff', '#1f2a44']});
			fence(fb, off * 0.9, 272, 290);
			track(fb, off, TRACK_TOP, TRACK_BOT, {});
			runoff(fb, off, ['#5c8a3a', '#65943f']);
			break;
		case 'pit': {
			sky(fb, 'day', 0, 160);
			clouds(fb, off * 0.03, 70, {seed: 13, count: 5, span: 520});
			// garage block with teal-lit interiors
			fb.rect(0, 150, fb.w, 140, C('#c9ced6'));
			fb.rect(0, 150, fb.w, 6, C('#9aa3b2'));
			for (let x = 0; x < fb.w; x++) {
				const wx = (((x - off * 0.7) % 120) + 120) % 120;
				if (wx >= 12 && wx < 108) for (let y = 176; y < 290; y++) fb.pset(x, y, C(y < 180 ? '#3a3f48' : y < 270 ? '#0f2a2c' : '#123336'));
				if (wx >= 12 && wx < 108 && wx % 24 === 0) fb.rect(x, 186, 3, 2, C('#e8fbff'));
				fb.pset(x, 166, C('#00a19b'));
				fb.pset(x, 167, C('#00a19b'));
			}
			track(fb, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#4a4d55', '#53565e', '#42454c'], kerb: false});
			for (let x = 0; x < fb.w; x++) if (((((x - Math.floor(off)) % 14) + 14) % 14) < 8) fb.pset(x, TRACK_BOT - 6, C('#f2f2f2'));
			runoff(fb, off, ['#b8bec8', '#b0b6c0']);
			break;
		}
	}
	if (v === 'wet') rain(fb, f, {count: 260, color: '#8e9cc0'});
};

/** Gold rays radiating from (cx, cy), slowly rotating. */
export const rays = (fb: FB, cx: number, cy: number, f: number, o: {r?: number; n?: number; color?: string; strength?: number; y0?: number; y1?: number} = {}) => {
	const R = o.r ?? 220, n = o.n ?? 14, c = C(o.color ?? '#ffcf4a'), st = o.strength ?? 0.4;
	const y0 = Math.max(0, o.y0 ?? cy - R), y1 = Math.min(fb.h, o.y1 ?? cy + R);
	for (let y = y0; y < y1; y++)
		for (let x = 0; x < fb.w; x++) {
			const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
			if (d > R || d < 6) continue;
			const a = (Math.atan2(dy, dx) / (Math.PI * 2)) * n + f * 0.01;
			if (a - Math.floor(a) < 0.42 && bayer(x, y) < st * (1 - d / R)) fb.px[y * fb.w + x] = c;
		}
};

/** Firework burst in the sky. */
export const firework = (fb: FB, f: number, start: number, x: number, y: number, seed: number, cols: string[]) => {
	const t = f - start;
	if (t < 0 || t > 34) return;
	const r = rng(seed);
	const cs = cols.map(C);
	for (let i = 0; i < 44; i++) {
		const a = (i / 44) * Math.PI * 2 + r() * 0.1, v = 1.6 + r() * 1.1;
		const px = x + Math.cos(a) * v * t * (1 - t / 80), py = y + Math.sin(a) * v * t * (1 - t / 80) + t * t * 0.02;
		if (t > 24 && (i + t) % 3 === 0) continue;
		fb.pset(px, py, cs[i % cs.length]);
		if (t < 18) fb.pset(px - Math.cos(a), py - Math.sin(a), cs[(i + 1) % cs.length]);
	}
};

/** Continuous confetti rain over the whole frame. */
export const confettiRain = (fb: FB, f: number, start: number, o: {count?: number; cols?: string[]; seed?: number} = {}) => {
	const t = f - start;
	if (t < 0) return;
	const r = rng(o.seed ?? 3);
	const cols = (o.cols ?? ['#ffd23f', '#ffffff', '#ffe066', '#e0a21a']).map(C);
	const n = o.count ?? 120;
	for (let i = 0; i < n; i++) {
		const x0 = r() * fb.w, v = 1.4 + r() * 2.2, ph = r() * 6.28, delay = r() * 20;
		const tt = t - delay;
		if (tt < 0) continue;
		const y = -10 + ((tt * v + r() * 40) % (fb.h + 20));
		if (tt * v > fb.h + 60 && i % 2) continue;
		const x = x0 + Math.sin(tt * 0.15 + ph) * 6;
		const c = cols[i % cols.length];
		fb.pset(x, y, c);
		if (((tt >> 2) + i) % 2) fb.pset(x + 1, y, c);
		else fb.pset(x, y + 1, c);
	}
};

export const mist = (fb: FB, y0: number, y1: number, color: string, strength: number) => {
	const c = C(color);
	for (let y = Math.max(0, y0); y < Math.min(fb.h, y1); y++) {
		const k = 1 - Math.abs((y - (y0 + y1) / 2) / ((y1 - y0) / 2));
		for (let x = 0; x < fb.w; x++) if (bayer(x, y) < k * strength * (0.7 + 0.3 * noise1(x * 0.05, y))) fb.px[y * fb.w + x] = c;
	}
};
