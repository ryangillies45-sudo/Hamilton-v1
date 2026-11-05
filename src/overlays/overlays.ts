// HUD overlays: season caption card, title counter, big year, IMAGINED tag.
import {Assets} from '../engine/assets';
import {C, FB, bayer} from '../engine/fb';
import {drawText, measure} from '../engine/font';
import {season, Team} from '../data/seasons';

export const TEAM_COL: Record<Team, {main: string; accent: string; label: string}> = {
	mclaren: {main: '#c9ccd2', accent: '#e3231b', label: 'MCLAREN'},
	mercedes: {main: '#c6cad0', accent: '#00a19b', label: 'MERCEDES'},
	ferrari: {main: '#dc1b24', accent: '#ffd200', label: 'FERRARI'},
};

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/**
 * Lower-left season card: portrait + year + caption (type-on).
 * `start`/`end` are global frames; the card slides in over 5 frames.
 */
export const captionCard = (
	fb: FB, A: Assets, f: number,
	o: {year: number; start: number; end: number; text?: string; portrait?: number; label?: string},
) => {
	if (f < o.start || f >= o.end) return;
	const s = season(o.year);
	const tc = TEAM_COL[s.team];
	const t = f - o.start, left = o.end - f;
	const slide = Math.round((1 - ease(t / 5)) * -260 + (left < 5 ? -(1 - left / 5) * 260 : 0));
	const x = 8 + slide, y = 204;
	const text = o.text ?? s.caption;
	const year = o.label ?? String(o.year);
	const tw = Math.max(measure(text) + 10, measure(year, {size: 2}) + 70);
	const w = 62 + tw;
	// panel
	fb.rect(x, y, w, 60, C('#0b0d12'));
	fb.rect(x, y, w, 2, C(tc.accent));
	fb.rect(x, y + 58, w, 2, C('#1d212b'));
	// portrait in a team-coloured frame
	const p = A[`hamilton/card_${o.portrait ?? o.year}`];
	fb.rect(x + 3, y + 4, 56, 54, C(tc.accent));
	fb.rect(x + 4, y + 5, 54, 52, C(s.team === 'ferrari' ? '#5e0e18' : s.team === 'mercedes' ? '#0f2a2c' : '#2b2f3a'));
	// crop the 52x62 card to the frame (head and shoulders)
	for (let yy = 0; yy < 52; yy++)
		for (let xx = 0; xx < 52; xx++) {
			const v = p.px[(yy + 2) * p.w + xx];
			if (v >>> 24) fb.pset(x + 5 + xx, y + 5 + yy, v);
		}
	// text
	const chars = Math.floor(t * 4);
	drawText(fb, x + 66, y + 8, year, C('#ffffff'), {size: 2, chars: Math.max(4, chars), shadow: C('#000000')});
	drawText(fb, x + 66 + measure(year, {size: 2}) + 8, y + 15, tc.label, C(tc.accent), {chars: Math.max(0, chars - 4)});
	drawText(fb, x + 66, y + 30, text, C('#e9ecf2'), {chars: Math.max(0, chars - 6)});
	drawText(fb, x + 66, y + 44, s.car.toUpperCase(), C('#7e8696'), {chars: Math.max(0, chars - 10)});
};

const STAR = ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '##.....##'];

/** Title counter: 7 stars top-right. `titles` filled; the newest pops at `popAt`. */
export const titleCounter = (fb: FB, f: number, titles: number, popAt = -100) => {
	const x0 = fb.w - 8 - 7 * 12, y0 = 8;
	fb.rect(x0 - 5, y0 - 4, 7 * 12 + 8, 25, C('#0b0d12'));
	drawText(fb, x0, y0 + 12, 'WORLD TITLES', C('#8c93a3'));
	for (let i = 0; i < 7; i++) {
		const filled = i < titles;
		const isNew = filled && i === titles - 1 && f - popAt < 10 && f >= popAt;
		const k = isNew ? Math.max(0, 1 - (f - popAt) / 10) : 0;
		const cx = x0 + i * 12;
		const cy = y0 - Math.round(k * 4);
		for (let yy = 0; yy < 9; yy++)
			for (let xx = 0; xx < 9; xx++) {
				if (STAR[yy][xx] !== '#') continue;
				let c = filled ? (yy < 4 && xx < 5 ? '#fff1a8' : '#ffd23f') : '#2b303c';
				if (filled && yy > 6) c = '#e0a91e';
				if (isNew && k > 0.5) c = '#ffffff';
				fb.pset(cx + xx, cy + yy, C(c));
			}
		if (isNew) {
			const r = (1 - k) * 12;
			for (let a = 0; a < 16; a++) {
				const ang = (a / 16) * Math.PI * 2;
				if (bayer(a, 0) < k + 0.2) fb.pset(cx + 4 + Math.cos(ang) * r, cy + 4 + Math.sin(ang) * r, C('#fff6c2'));
			}
		}
	}
};

/** Big year top-left; slams down on `hit`. */
export const bigYear = (fb: FB, f: number, text: string, hit: number, color = '#ffffff', x = 10, y = 10) => {
	if (f < hit) return;
	const d = f - hit;
	const drop = d < 4 ? (4 - d) * 3 : 0;
	drawText(fb, x, y - drop, text, C(color), {size: 4, shadow: C('#0b0d12')});
};

/** IMAGINED tag: fixed corner, visible on every imagined frame. */
export const imaginedTag = (fb: FB, f: number, start: number) => {
	const t = f - start;
	const label = 'IMAGINED';
	const w = measure(label, {size: 2}) + 12;
	const cover = Math.min(1, t / 6 + 0.2);
	const x = 8, y = 8;
	for (let yy = 0; yy < 22; yy++)
		for (let xx = 0; xx < w; xx++) if (bayer(xx, yy) < cover) fb.pset(x + xx, y + yy, C('#ffd400'));
	if (cover > 0.6) {
		drawText(fb, x + 6, y + 4, label, C('#111111'), {size: 2});
		drawText(fb, x, y + 26, 'A WHAT-IF SCENARIO', C('#ffd400'), {shadow: C('#000000')});
	}
};
