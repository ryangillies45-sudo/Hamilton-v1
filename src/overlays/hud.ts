// Vertical HUD: season header, title counter, stats panel, season tables,
// championship banner, IMAGINED tag. Layout keeps all text inside SAFE.
import {Assets} from '../engine/assets';
import {C, FB, bayer} from '../engine/fb';
import {drawText, measure} from '../engine/font';
import {icon} from '../engine/icons';
import {SAFE} from '../config/video';
import {Season, STANDING_2026, TEAM_NAME, Team} from '../data/seasons';

export const GOLD = '#ffd23f';
export const GOLD_DK = '#7a4b00';
export const INK = '#0b0d12';
export const TEAM: Record<Team, {accent: string; panel: string; label: string}> = {
	mclaren: {accent: '#e3231b', panel: '#1a1d24', label: '#c9ccd2'},
	mercedes: {accent: '#00a19b', panel: '#0f1b1d', label: '#7fe0d8'},
	ferrari: {accent: '#dc1b24', panel: '#1f0b0e', label: '#ffb0a8'},
};

export const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const smooth = (t: number) => {
	t = Math.min(1, Math.max(0, t));
	return t * t * (3 - 2 * t);
};

const OUTLINE = C('#05060a');
export const text = (fb: FB, x: number, y: number, s: string, color: string, size: 1 | 2 | 4 | 8 | 16 = 2, chars?: number) =>
	drawText(fb, x, y, s, C(color), {size, outline: OUTLINE, shadow: OUTLINE, chars});
export const center = (fb: FB, y: number, s: string, color: string, size: 1 | 2 | 4 | 8 | 16 = 2, chars?: number) =>
	text(fb, Math.round((fb.w - measure(s, {size})) / 2), y, s, color, size, chars);

/** Season header: big year, team + car, portrait card. Wipes in from the left at `start`. */
export const header = (fb: FB, A: Assets, f: number, o: {start: number; label: string; team: Team; car: string; portrait?: number; yearColor?: string}) => {
	const t = f - o.start;
	if (t < 0) return;
	const chars = t < 9 ? Math.max(1, Math.floor(ease(t / 9) * 12)) : undefined;
	text(fb, SAFE.left + 4, 56, o.label, o.yearColor ?? '#ffffff', 8, chars);
	text(fb, SAFE.left + 4, 120, `${TEAM_NAME[o.team]} ${o.car}`, TEAM[o.team].label, 2, t < 12 ? Math.floor(t * 3) : undefined);
	if (o.portrait) {
		const p = A[`hamilton/card_${o.portrait}`];
		const x = 270, y = 54 + Math.round((1 - ease(t / 8)) * -80);
		fb.rect(x - 2, y - 2, 56, 58, C(TEAM[o.team].accent));
		fb.rect(x - 1, y - 1, 54, 56, C(INK));
		for (let yy = 0; yy < 54; yy++)
			for (let xx = 0; xx < 52; xx++) {
				const v = p.px[(yy + 1) * p.w + xx];
				if (v >>> 24 && y + yy >= 0) fb.pset(x + xx, y + yy, v);
			}
	}
};

/** World-title stars. `popAt` = frame the newest star was earned. */
export const titleStars = (fb: FB, f: number, titles: number, popAt = -999, y = 140) => {
	text(fb, SAFE.left + 4, y + 1, 'TITLES', '#9aa3b2', 2);
	const x0 = SAFE.left + 84;
	for (let i = 0; i < 7; i++) {
		const won = i < titles;
		const isNew = won && i === titles - 1 && f >= popAt && f - popAt < 14;
		const k = isNew ? 1 - (f - popAt) / 14 : 0;
		const x = x0 + i * 15, yy = y + 1 - Math.round(k * 6);
		if (!won) {
			icon(fb, 'star', x, yy, '#2b303c', '#2b303c');
			continue;
		}
		icon(fb, 'star', x - 1, yy + 1, '#3a2600', '#3a2600');
		icon(fb, 'star', x, yy, k > 0.6 ? '#ffffff' : GOLD, '#fff6c2');
		if (isNew)
			for (let a = 0; a < 16; a++) {
				const ang = (a / 16) * Math.PI * 2, r = (1 - k) * 16;
				fb.pset(x + 6 + Math.cos(ang) * r, yy + 6 + Math.sin(ang) * r, C('#fff6c2'));
			}
	}
};

/** Short factual note lines under the header. */
export const note = (fb: FB, f: number, start: number, lines: string[], y = 162) => {
	const t = f - start;
	if (t < 0) return;
	lines.forEach((l, i) => text(fb, SAFE.left + 4, y + i * 18, l, i === 0 ? '#ffffff' : '#d7dbe3', 2, Math.max(0, Math.floor((t - i * 6) * 3))));
};

const panelBox = (fb: FB, y0: number, y1: number, accent: string, gold = false) => {
	const x0 = SAFE.left, x1 = SAFE.right - 4;
	fb.rect(x0, y0, x1 - x0, y1 - y0, C('#0b0d12'));
	fb.rect(x0, y0, x1 - x0, 3, C(gold ? GOLD : accent));
	fb.rect(x0, y1 - 1, x1 - x0, 1, C('#262b36'));
	fb.rect(x0, y0 + 3, 1, y1 - y0 - 3, C('#262b36'));
	fb.rect(x1 - 1, y0 + 3, 1, y1 - y0 - 3, C('#262b36'));
	if (gold) {
		fb.rect(x0, y0 + 3, x1 - x0, 1, C('#b8860b'));
		for (let x = x0; x < x1; x++) if (bayer(x, y0 + 4) < 0.3) fb.pset(x, y0 + 4, C('#5a3c00'));
	}
};

const roll = (from: number, to: number, t: number) => Math.round(from + (to - from) * smooth(t));

/** The season statistics panel. Numbers roll from `prev` to `cur` over 14 frames after `changeAt`. */
export const statsPanel = (fb: FB, f: number, cur: Season, prev: Season | null, changeAt: number, enterAt = -999, champAt = -999) => {
	const te = f - enterAt;
	const slide = te < 10 ? Math.round((1 - ease(te / 10)) * 200) : 0;
	const y0 = 344 + slide, y1 = 496 + slide;
	const champ = cur.position === 1;
	panelBox(fb, y0, y1, TEAM[cur.team].accent, champ);
	const t = (f - changeAt) / 14;
	const p = prev ?? cur;
	const x = SAFE.left + 10;
	text(fb, x, y0 + 10, 'CHAMPIONSHIP', '#8a93a3', 2);
	if (champ && f < champAt) {
		text(fb, x, y0 + 28, '- - -', '#3a404c', 4);
	} else if (champ) {
		icon(fb, 'trophy', x, y0 + 34, GOLD, '#fff6c2');
		text(fb, x + 20, y0 + 28, 'CHAMPION', GOLD, 4);
		text(fb, SAFE.right - 14 - measure(`TITLE ${cur.title}`, {size: 2}), y0 + 10, `TITLE ${cur.title}`, GOLD, 2);
	} else {
		const pos = roll(p.position, cur.position, t);
		text(fb, x, y0 + 28, `P${pos}`, '#ffffff', 4);
	}
	fb.rect(x, y0 + 66, SAFE.right - SAFE.left - 24, 1, C('#262b36'));
	const cols: [string, string, number, number][] = [
		['trophy', 'WINS', p.wins, cur.wins],
		['podium', 'PODIUMS', p.podiums, cur.podiums],
		['pole', 'POLES', p.poles, cur.poles],
	];
	cols.forEach(([ic, label, a, b], i) => {
		const cx = x + i * 98;
		text(fb, cx, y0 + 75, label, '#8a93a3', 2);
		icon(fb, ic, cx, y0 + 106, champ ? GOLD : TEAM[cur.team].label, '#ffffff');
		text(fb, cx + 17, y0 + 98, String(roll(a, b, t)), '#ffffff', 4);
	});
};

/** Multi-season table (2009-2012, 2021-2023). Row `active` is highlighted. */
export const seasonTable = (fb: FB, f: number, rows: Season[], active: number, enterAt: number) => {
	const te = f - enterAt;
	const slide = te < 10 ? Math.round((1 - ease(te / 10)) * 200) : 0;
	const y0 = 344 + slide;
	const rowH = 30;
	const y1 = y0 + 26 + rows.length * rowH + 6;
	panelBox(fb, y0, y1, TEAM[rows[0].team].accent);
	const x = SAFE.left + 10;
	const colX = [x, x + 106, x + 164, x + 198, x + 256];
	text(fb, colX[0], y0 + 9, 'YEAR', '#8a93a3', 2);
	text(fb, colX[1], y0 + 9, 'POS', '#8a93a3', 2);
	icon(fb, 'trophy', colX[2] + 4, y0 + 10, '#c9ccd2');
	icon(fb, 'podium', colX[3] + 16, y0 + 10, '#c9ccd2');
	icon(fb, 'pole', colX[4] + 4, y0 + 10, '#c9ccd2');
	rows.forEach((r, i) => {
		const ry = y0 + 26 + i * rowH;
		const shown = te >= 4 + i * 4;
		if (!shown) return;
		const on = i === active;
		if (on) fb.rect(SAFE.left + 3, ry - 1, SAFE.right - SAFE.left - 10, rowH - 2, C(TEAM[r.team].panel === '#1a1d24' ? '#272b35' : '#163033'));
		if (on) fb.rect(SAFE.left + 3, ry - 1, 3, rowH - 2, C(TEAM[r.team].accent));
		const col = on ? '#ffffff' : '#8a93a3';
		text(fb, colX[0], ry + 2, String(r.year), col, 4);
		text(fb, colX[1], ry + 2, `P${r.position}`, col, 4);
		text(fb, colX[2], ry + 2, String(r.wins), col, 4);
		text(fb, colX[3], ry + 2, String(r.podiums), col, 4);
		text(fb, colX[4], ry + 2, String(r.poles), col, 4);
	});
};

/** 2026 panel: P3* with the footnote directly underneath, then points/wins/podiums/poles. */
export const panel2026 = (fb: FB, f: number, enterAt: number) => {
	const te = f - enterAt;
	const slide = te < 10 ? Math.round((1 - ease(te / 10)) * 240) : 0;
	const y0 = 300 + slide, y1 = 496 + slide;
	panelBox(fb, y0, y1, TEAM.ferrari.accent);
	const x = SAFE.left + 10;
	const S = STANDING_2026;
	text(fb, x, y0 + 10, "DRIVERS' CHAMPIONSHIP", '#8a93a3', 2);
	const pos = S.position.replace('*', '');
	text(fb, x, y0 + 30, pos, '#ffffff', 8);
	text(fb, x + measure(pos, {size: 8}) + 4, y0 + 30, '*', '#ffd200', 4);
	text(fb, x, y0 + 90, S.footnote, '#ffd200', 2, Math.max(0, Math.floor((te - 4) * 3)));
	fb.rect(x, y0 + 112, SAFE.right - SAFE.left - 24, 1, C('#262b36'));
	const stats: [string, number][] = [['POINTS', S.points], [S.wins === 1 ? 'WIN' : 'WINS', S.wins], ['PODIUMS', S.podiums], [S.poles === 1 ? 'POLE' : 'POLES', S.poles]];
	stats.forEach(([label, v], i) => {
		const cx = x + (i % 2) * 156, cy = y0 + 122 + Math.floor(i / 2) * 34;
		const t = Math.min(1, Math.max(0, (te - 6 - i * 3) / 12));
		const num = String(Math.round(v * smooth(t)));
		text(fb, cx, cy, num, '#ffffff', 4);
		text(fb, cx + measure(String(v), {size: 4}) + 8, cy + 13, label, '#c9ccd4', 2);
	});
};

/** WORLD CHAMPION banner with title number. */
export const championBanner = (fb: FB, f: number, hit: number, title: number, big = false) => {
	const d = f - hit;
	if (d < 0) return;
	const drop = (k: number) => (d - k < 5 ? Math.max(0, 5 - (d - k)) * 6 : 0);
	const x = SAFE.left + 4;
	const y = big ? 166 : 166;
	if (d >= 0) text(fb, x, y - drop(0), 'WORLD', GOLD, 4);
	if (d >= 3) text(fb, x, y + 30 - drop(3), 'CHAMPION', GOLD, 4);
	if (d >= 8) {
		const label = big ? 'SEVEN-TIME CHAMPION' : `TITLE NUMBER ${title}`;
		text(fb, x, y + 62, label, '#ffffff', 2, Math.floor((d - 8) * 3));
	}
	// gold sweep underline
	if (d >= 3) {
		const w = Math.min(190, (d - 3) * 24);
		fb.rect(x, y + 58, w, 2, C(GOLD));
		fb.rect(x, y + 60, w, 1, C(GOLD_DK));
	}
};

/** IMAGINED tag: fixed corner, on every imagined frame. */
export const imaginedTag = (fb: FB, f: number, start: number) => {
	const t = f - start;
	const label = 'IMAGINED';
	const w = measure(label, {size: 2}) + 12;
	const cover = Math.min(1, t / 6 + 0.25);
	const x = SAFE.left + 4, y = 54;
	for (let yy = 0; yy < 22; yy++)
		for (let xx = 0; xx < w; xx++) if (bayer(xx, yy) < cover) fb.pset(x + xx, y + yy, C('#ffd400'));
	if (cover > 0.6) {
		drawText(fb, x + 6, y + 4, label, C('#111111'), {size: 2});
		text(fb, x, y + 28, 'A WHAT-IF SCENARIO', '#ffd400', 2);
	}
};
