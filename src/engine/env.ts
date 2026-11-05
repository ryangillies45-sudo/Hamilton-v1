// Environment painters: generic venues (not replicas of real circuits).
// `off` is the world scroll in px; each layer multiplies it for parallax.
import {C, FB, bayer, noise1, rng} from './fb';

export const SKIES: Record<string, string[]> = {
	day: ['#3f8fe0', '#5aa7ef', '#86c3f7', '#b9ddfb', '#e3f2fd'],
	wetDusk: ['#1b1a33', '#2c2850', '#4a3561', '#7a4566', '#b25e5e'],
	night: ['#03050c', '#070c1c', '#0d1530', '#162043', '#22305a'],
	sunset: ['#231a46', '#4b2a63', '#9c3f6a', '#e0665e', '#ffae5c'],
	desert: ['#2d2357', '#5b3a72', '#b9566c', '#ff8a5c', '#ffd08a'],
	dawn: ['#18264c', '#33406f', '#6b5a8c', '#c9708a', '#ff9e6e', '#ffd49a'],
	overcast: ['#3a4152', '#4c5466', '#626b7e', '#7d8697', '#9aa2b0'],
	garage: ['#0b0b0e', '#141419', '#1c1d24', '#25262f'],
	studio: ['#140305', '#2a060b', '#460a12', '#5e0e18'],
	dusk: ['#141a33', '#26294f', '#4a3a66', '#7b4d6e', '#a35f6c'],
};

export const sky = (fb: FB, preset: string, y0 = 0, y1 = 150) => fb.gradient(y0, y1, SKIES[preset].map(C));

export const sun = (fb: FB, cx: number, cy: number, r: number, core: string, glow: string) => {
	const g = C(glow), c = C(core);
	for (let y = -r * 2; y <= r * 2; y++)
		for (let x = -r * 2; x <= r * 2; x++) {
			const d = Math.sqrt(x * x + y * y);
			if (d <= r) fb.pset(cx + x, cy + y, c);
			else if (d <= r * 2 && bayer(cx + x, cy + y) < (1 - (d - r) / r) * 0.6) fb.pset(cx + x, cy + y, g);
		}
};

export const clouds = (fb: FB, off: number, y: number, o: {seed?: number; count?: number; light?: string; shade?: string; span?: number} = {}) => {
	const r = rng(o.seed ?? 21);
	const L = C(o.light ?? '#ffffff'), S = C(o.shade ?? '#cfe3f5');
	const span = o.span ?? 700;
	for (let i = 0; i < (o.count ?? 6); i++) {
		const bx = r() * span, by = y + r() * 30, w = 22 + r() * 40;
		const x0 = (((bx + off) % span) + span) % span - 80;
		const puffs = 4 + Math.floor(r() * 4);
		const pr = rng(i * 97 + 3);
		for (let p = 0; p < puffs; p++) {
			const px = x0 + pr() * w, py = by + pr() * 6, rad = 5 + pr() * 7;
			for (let yy = -rad; yy <= rad; yy++)
				for (let xx = -rad; xx <= rad; xx++)
					if (xx * xx + yy * yy <= rad * rad) {
						const X = Math.round(px + xx), Y = Math.round(py + yy);
						if (Y > by + 6) continue;
						fb.pset(X, Y, yy > rad * 0.3 ? S : L);
					}
		}
	}
};

export const ridge = (fb: FB, off: number, baseY: number, amp: number, color: string, o: {seed?: number; freq?: number; top?: string; snow?: string} = {}) => {
	const c = C(color), t = o.top ? C(o.top) : c;
	const snow = o.snow ? C(o.snow) : 0;
	const freq = o.freq ?? 0.012;
	for (let x = 0; x < fb.w; x++) {
		const n = noise1((x - off) * freq, o.seed ?? 1) * 0.7 + noise1((x - off) * freq * 3.1, (o.seed ?? 1) + 9) * 0.3;
		const top = Math.round(baseY - n * amp);
		for (let y = top; y < baseY + 2; y++) fb.pset(x, y, y < top + 2 ? t : c);
		if (snow && n > 0.62) for (let y = top; y < top + Math.round((n - 0.62) * amp * 0.6); y++) if (bayer(x, y) < 0.8) fb.pset(x, y, snow);
	}
};

/** Rolling green hills with dithered terraces (dawn finale and Barcelona). */
export const hills = (fb: FB, off: number, baseY: number, amp: number, cols: string[], o: {seed?: number; freq?: number; terraces?: boolean} = {}) => {
	const cs = cols.map(C);
	const freq = o.freq ?? 0.018;
	for (let x = 0; x < fb.w; x++) {
		const n = noise1((x - off) * freq, o.seed ?? 4);
		const top = Math.round(baseY - n * amp);
		for (let y = top; y < fb.h; y++) {
			const d = y - top;
			let c = d < 1 ? cs[0] : d < 4 ? cs[1] : cs[2];
			if (d >= 4 && d < 7 && bayer(x, y) < 0.5) c = cs[1];
			if (o.terraces && d > 5 && (y + Math.floor((x - off) / 9)) % 7 === 0) c = cs[3] ?? cs[2];
			fb.pset(x, y, c);
		}
	}
};

export const trees = (fb: FB, off: number, y: number, o: {seed?: number; dark?: string; mid?: string; light?: string} = {}) => {
	const r = rng(o.seed ?? 33);
	const D = C(o.dark ?? '#1d4a2c'), M = C(o.mid ?? '#2d6b3c'), Lc = C(o.light ?? '#4d9150');
	for (let i = 0; i < 40; i++) {
		const bx = r() * 960, s = 6 + r() * 9;
		const x = (((bx + off) % 960) + 960) % 960 - 40;
		for (let yy = -s; yy <= s; yy++)
			for (let xx = -s; xx <= s; xx++)
				if (xx * xx + yy * yy * 1.4 <= s * s) fb.pset(x + xx, y + yy, yy < -s * 0.3 && xx < 0 ? Lc : yy > s * 0.3 ? D : M);
	}
};

/** Grandstands with flickering crowd and generic boards (no real brands). */
export const grandstand = (fb: FB, off: number, y: number, f: number, o: {roof?: string; frame?: string; boards?: string[]; dark?: boolean} = {}) => {
	const roof = C(o.roof ?? '#d8dde5'), frame = C(o.frame ?? '#6d7685'), steel = C('#4a5260');
	const crowd = (o.dark ? ['#2b2f3d', '#3c3048', '#2e3a44', '#4b4b55'] : ['#e94b4b', '#ffd23f', '#ffffff', '#3a6fd8', '#2b2b2b', '#e98a3a', '#7ad0ff']).map(C);
	const boards = (o.boards ?? ['#1f2a44', '#c8102e', '#ffffff', '#00a19b']).map(C);
	const span = 180;
	for (let x = 0; x < fb.w; x++) {
		const wx = (((x - off) % span) + span) % span;
		const inStand = wx < 150;
		if (!inStand) continue;
		// roof
		fb.pset(x, y, roof);
		fb.pset(x, y + 1, roof);
		fb.pset(x, y + 2, steel);
		if (wx % 30 === 0) for (let k = 3; k < 34; k++) fb.pset(x, y + k, frame);
		// crowd rows
		for (let k = 4; k < 30; k++) {
			const seat = ((x - off) >> 1) * 31 + k * 17;
			const flick = (seat + Math.floor(f / 3) * ((seat % 7) === 0 ? 1 : 0)) % crowd.length;
			fb.pset(x, y + k, k % 3 === 0 ? steel : crowd[Math.abs(flick) % crowd.length]);
		}
		// boards
		const bi = Math.floor((((x - off) % 600) + 600) % 600 / 75);
		const bc = boards[bi % boards.length];
		for (let k = 30; k < 36; k++) fb.pset(x, y + k, k === 32 && wx % 6 < 4 ? C('#ffffff') : bc);
	}
};

export const fence = (fb: FB, off: number, y0: number, y1: number, o: {color?: string} = {}) => {
	const c = C(o.color ?? '#9aa3b2');
	for (let x = 0; x < fb.w; x++) {
		const wx = (((x - off) % 24) + 24) % 24;
		if (wx === 0) fb.vline(x, y0, y1, c);
		if (bayer(x, y0) < 0.25) for (let y = y0; y < y1; y += 3) fb.pset(x, y, c);
	}
	fb.hline(0, fb.w, y0, c);
};

/** Track band: asphalt, white line, red/white kerbs. */
export const track = (fb: FB, off: number, y0: number, y1: number, o: {wet?: boolean; asphalt?: string[]; kerb?: boolean; grass?: string; night?: boolean} = {}) => {
	const as = (o.asphalt ?? ['#3c3f46', '#45484f', '#34373d']).map(C);
	const line = C(o.night ? '#b9bec8' : '#f2f2f2');
	for (let y = y0; y < y1; y++)
		for (let x = 0; x < fb.w; x++) {
			const n = ((x - Math.floor(off)) * 7 + y * 13) % 17;
			fb.pset(x, y, n === 0 ? as[1] : n === 5 ? as[2] : as[0]);
		}
	if (o.wet) {
		// streaky reflections
		const r = rng(77);
		const ref = C('#7e8aa8');
		for (let i = 0; i < 40; i++) {
			const x = (((r() * 600 + off) % 600) + 600) % 600 - 60;
			const y = y0 + 4 + Math.floor(r() * (y1 - y0 - 8));
			fb.hline(x, x + 8 + r() * 20, y, ref);
		}
	}
	fb.hline(0, fb.w, y0 + 1, line);
	if (o.kerb !== false) {
		const R = C('#d8232a'), Wt = C('#f4f4f4');
		for (let x = 0; x < fb.w; x++) {
			const wx = ((((x - Math.floor(off)) % 16) + 16) % 16) < 8;
			for (let y = y1 - 4; y < y1; y++) fb.pset(x, y, wx ? R : Wt);
		}
	}
	if (o.grass) fb.rect(0, y1, fb.w, fb.h - y1, C(o.grass));
};

/** Start/finish gantry & chequered line across the track. */
export const chequered = (fb: FB, x: number, y0: number, y1: number) => {
	for (let y = y0; y < y1; y++)
		for (let k = 0; k < 6; k++) fb.pset(x + k, y, ((Math.floor(y / 3) + Math.floor(k / 3)) % 2) === 0 ? C('#111111') : C('#f4f4f4'));
};

/** Night floodlight poles with glow. */
export const floodlights = (fb: FB, off: number, y: number) => {
	const pole = C('#2a2f3c'), lamp = C('#fff6d8'), glow = C('#6a7398');
	for (let x = 0; x < fb.w; x++) {
		const wx = (((x - off * 0.6) % 90) + 90) % 90;
		if (wx === 0) {
			fb.vline(x, y, y + 60, pole);
			fb.rect(x - 4, y - 2, 9, 3, lamp);
			for (let yy = -10; yy < 14; yy++)
				for (let xx = -16; xx < 17; xx++)
					if (bayer(x + xx, y + yy) < 0.18 * (1 - Math.abs(xx) / 17) * (1 - Math.abs(yy) / 14) * 3) fb.pset(x + xx, y + yy, glow);
		}
	}
};

/** Pit lane: garage fronts with team-coloured interiors. */
export const pitGarages = (fb: FB, off: number, y: number, h: number, interior: string, accent: string) => {
	const wall = C('#c9ced6'), dark = C('#7a808b'), inn = C(interior), acc = C(accent), lamp = C('#fff4cc');
	fb.rect(0, y, fb.w, h, wall);
	for (let x = 0; x < fb.w; x++) {
		const wx = (((x - off) % 110) + 110) % 110;
		if (wx >= 10 && wx < 100) {
			for (let yy = y + 8; yy < y + h; yy++) fb.pset(x, yy, yy < y + 10 ? dark : inn);
			if (wx % 18 === 0) fb.rect(x, y + 11, 3, 2, lamp);
		}
		fb.pset(x, y + 3, acc);
		fb.pset(x, y + 4, acc);
	}
	fb.hline(0, fb.w, y + h, C('#5a606b'));
};
