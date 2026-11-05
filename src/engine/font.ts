// Original 5x7 bitmap font. Larger sizes are derived with a fill-only Scale2x
// (EPX) pass, which smooths diagonals while keeping a single art-pixel size.
import {FB} from './fb';

const G: Record<string, string> = {
	A: '.###.#...##...#######...##...##...#', B: '####.#...##...#####.#...##...#####.',
	C: '.###.#...##....#....#....#...#.###.', D: '####.#...##...##...##...##...#####.',
	E: '######....#....####.#....#....#####', F: '######....#....####.#....#....#....',
	G: '.###.#...##....#.####...##...#.####', H: '#...##...##...#######...##...##...#',
	I: '.###...#....#....#....#....#...###.', J: '..###...#....#....#....##..#..##...',
	K: '#...##..#.#.#..##...#.#..#..#.#...#', L: '#....#....#....#....#....#....#####',
	M: '#...###.###.#.##.#.##...##...##...#', N: '#...##...###..##.#.##..###...##...#',
	O: '.###.#...##...##...##...##...#.###.', P: '####.#...##...#####.#....#....#....',
	Q: '.###.#...##...##...##.#.##..#..##.#', R: '####.#...##...#####.#.#..#..#.#...#',
	S: '.#####....#.....###.....#....#####.', T: '#####..#....#....#....#....#....#..',
	U: '#...##...##...##...##...##...#.###.', V: '#...##...##...##...##...#.#.#...#..',
	W: '#...##...##...##.#.##.#.##.#.#.#.#.', X: '#...##...#.#.#...#...#.#.#...##...#',
	Y: '#...##...#.#.#...#....#....#....#..', Z: '#####....#...#...#...#...#....#####',
	'0': '.###.#...##..###.#.###..##...#.###.', '1': '..#...##....#....#....#....#...###.',
	'2': '.###.#...#....#...#...#...#...#####', '3': '####.....#....#.###.....#....#####.',
	'4': '...#...##..#.#.#..#.#####...#....#.', '5': '######....####.....#....##...#.###.',
	'6': '..##..#...#....####.#...##...#.###.', '7': '#####....#...#...#...#....#....#...',
	'8': '.###.#...##...#.###.#...##...#.###.', '9': '.###.#...##...#.####....#...#..##..',
	' ': '...................................',
	'-': '...............#####...............',
	'.': '..............................##...',
	',': '.....................##....#...#...',
	':': '......##...##.........##...##......',
	'!': '..#....#....#....#....#.........#..',
	'?': '.###.#...#....#...#...#.........#..',
	'/': '....#....#...#...#...#...#....#....',
	"'": '..#....#...........................',
	'&': '.##..#..#.#.#...#...#.#.##..#..##.#',
	'*': '..#..#.#.#.###.#.#.#..#............',
	'+': '.......#....#..#####..#....#.......',
	'#': '.#.#..#.#.#####.#.#.#####.#.#..#.#.',
	'·': '...............##...##.............',
	'…': '..............................#.#.#',
	'(': '...#...#...#....#....#.....#.....#.',
	')': '.#.....#.....#....#....#...#...#...',
};
// narrow glyphs advance less
const ADV: Record<string, number> = {' ': 3, '·': 4, '.': 3, ',': 3, ':': 3, '!': 3, "'": 3, I: 4, '1': 5};
const TRIM: Record<string, number> = {' ': 0, '·': 1, '.': 2, ',': 1, ':': 1, '!': 2, "'": 2, I: 1};

type Bitmap = {w: number; h: number; b: Uint8Array};

const base = (ch: string): Bitmap => {
	const s = G[ch] ?? G['?'];
	const b = new Uint8Array(35);
	for (let i = 0; i < 35; i++) b[i] = s[i] === '#' ? 1 : 0;
	return {w: 5, h: 7, b};
};

const scale2x = (src: Bitmap): Bitmap => {
	const {w, h, b} = src;
	const o = new Uint8Array(w * h * 4);
	const P = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : b[y * w + x]);
	for (let y = 0; y < h; y++)
		for (let x = 0; x < w; x++) {
			const p = P(x, y), A = P(x, y - 1), B = P(x + 1, y), Cc = P(x - 1, y), D = P(x, y + 1);
			// EPX that only fills (never erodes): diagonals get smoother while
			// square corners stay square, so D/O and B/8 remain distinct.
			const e0 = p || (Cc === A && Cc !== D && A !== B ? A : 0);
			const e1 = p || (A === B && A !== Cc && B !== D ? B : 0);
			const e2 = p || (D === Cc && D !== B && Cc !== A ? Cc : 0);
			const e3 = p || (B === D && B !== A && D !== Cc ? D : 0);
			const W2 = w * 2;
			o[y * 2 * W2 + x * 2] = e0;
			o[y * 2 * W2 + x * 2 + 1] = e1;
			o[(y * 2 + 1) * W2 + x * 2] = e2;
			o[(y * 2 + 1) * W2 + x * 2 + 1] = e3;
		}
	return {w: w * 2, h: h * 2, b: o};
};

const cache = new Map<string, Bitmap>();
const glyph = (ch: string, size: number): Bitmap => {
	const k = ch + size;
	let g = cache.get(k);
	if (!g) {
		g = base(ch);
		for (let s = 1; s < size; s *= 2) g = scale2x(g);
		cache.set(k, g);
	}
	return g;
};

export type TextOpts = {size?: 1 | 2 | 4 | 8; shadow?: number; outline?: number; chars?: number; spacing?: number};

const adv = (ch: string, size: number, spacing: number) => ((ADV[ch] ?? 5) + spacing) * size;

export const measure = (text: string, o: TextOpts = {}) => {
	const size = o.size ?? 1, sp = o.spacing ?? 1;
	let w = 0;
	for (const ch of text) w += adv(ch, size, sp);
	return w - sp * size;
};

export const textHeight = (o: TextOpts = {}) => 7 * (o.size ?? 1);

/** Draw text; `chars` limits how many glyphs are shown (type-on). */
export const drawText = (fb: FB, x: number, y: number, text: string, color: number, o: TextOpts = {}) => {
	const size = o.size ?? 1, sp = o.spacing ?? 1;
	const limit = o.chars ?? Infinity;
	const pass = (dx: number, dy: number, c: number) => {
		let cx = Math.round(x);
		let n = 0;
		for (const ch of text) {
			if (n++ >= limit) break;
			const g = glyph(ch, size);
			const off = (TRIM[ch] ?? 0) * size;
			for (let gy = 0; gy < g.h; gy++)
				for (let gx = 0; gx < g.w; gx++) if (g.b[gy * g.w + gx]) fb.pset(cx + gx - off + dx, Math.round(y) + gy + dy, c);
			cx += adv(ch, size, sp);
		}
	};
	if (o.outline !== undefined) {
		const t = Math.max(1, size >> 1);
		for (let dy = -t; dy <= t; dy++) for (let dx = -t; dx <= t; dx++) if (dx || dy) pass(dx, dy, o.outline);
	}
	if (o.shadow !== undefined) pass(Math.max(1, size >> 1), Math.max(1, size >> 1), o.shadow);
	pass(0, 0, color);
};
