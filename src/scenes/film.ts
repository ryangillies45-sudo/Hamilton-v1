// The 70-second vertical film: segments in beats at 126 BPM (147 beats).
// FACT numbers come only from src/data; IMAGINED content is only drawn in the
// finale, under the IMAGINED tag.
import {BEAT} from '../config/beatmap';
import {FRAMES} from '../config/video';
import {RECORDS} from '../data/records';
import {FINALE_CARD} from '../data/imagined';
import {SEASONS, Season, season} from '../data/seasons';
import {Assets, CARS, TROPHY_ANCHOR} from '../engine/assets';
import {drawCar} from '../engine/car';
import {C, FB, bayer, rng} from '../engine/fb';
import {measure} from '../engine/font';
import {ditherMix, ditherWipe, flash, ring, spray} from '../engine/fx';
import {hills, ridge, sky, sun, track} from '../engine/env';
import {
	GOLD, center, championBanner, ease, header, imaginedTag, note, panel2026, seasonTable, smooth, statsPanel, text, titleStars,
} from '../overlays/hud';
import {GROUND, VKey, confettiRain, firework, mist, rays, venue} from './venues';

export type Ctx = {fb: FB; A: Assets; f: number; s: number; e: number; tmpA: FB; tmpB: FB};
type Kind = 'fact' | 'symbolic' | 'imagined';
type SegDef = {id: string; beats: number; kind: Kind; speed: (t: number, len: number) => number; draw: (c: Ctx) => void};

const b2f = (b: number) => Math.round(b * BEAT);
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

// ------------------------------------------------------------------ motion
const LIGHTS_OUT = b2f(5);
const drive = (v = 9, rampIn = false) => (t: number) => (rampIn ? v * smooth(t / 16) : v);
const stopAt = (hitBeats: number, v = 9, rampIn = false) => (t: number) => {
	const hit = b2f(hitBeats);
	const base = rampIn ? v * smooth(t / 12) : v;
	return t < hit ? base * (1 - smooth(t / hit)) : 0;
};

// ------------------------------------------------------------------ titles
const TITLE_YEARS = SEASONS.filter((s) => s.title).map((s) => s.year);

// ------------------------------------------------------------------ segments
const SEGS: SegDef[] = [];
const seg = (d: SegDef) => SEGS.push(d);

/** Precomputed world scroll so camera motion is continuous across segments. */
let OFF: Float32Array;
let STARTS: number[] = [];

const offAt = (f: number) => OFF[Math.max(0, Math.min(FRAMES - 1, f))];

const titlesAt = (f: number): [number, number] => {
	let n = 0, pop = -999;
	for (const y of TITLE_YEARS) {
		const i = SEGS.findIndex((s) => s.id === `y${y}`);
		const hit = STARTS[i] + b2f(y === 2020 ? 3 : 2);
		if (f >= hit) { n = season(y).title!; pop = hit; }
	}
	return [n, pop];
};

// ------------------------------------------------------------------ car placement
const carW = (key: string) => CARS[key].w;
const centred = (key: string) => Math.round((360 - carW(key)) / 2);
const enterExit = (key: string, t: number, len: number, park: number, o: {enter?: boolean; exit?: boolean} = {}) => {
	let x = park;
	if (o.enter !== false && t < 22) x = Math.round(lerp(362, park, ease(t / 22)));
	const ex = t - (len - 12);
	if (o.exit !== false && ex > 0) x = Math.round(park - Math.pow(ex / 12, 2) * (park + carW(key) + 10));
	return x;
};

const spinFor = (v: number) => (v > 0.5 ? 1 : 0);

const venueCross = (c: Ctx, cur: VKey, prev: VKey | null, frames = 12) => {
	const t = c.f - c.s;
	const off = offAt(c.f);
	if (prev && prev !== cur && t < frames) {
		c.tmpA.clear(0);
		venue(c.tmpA, prev, off, c.f);
		c.tmpB.clear(0);
		venue(c.tmpB, cur, off, c.f);
		ditherMix(c.fb, c.tmpA, c.tmpB, t / frames);
	} else venue(c.fb, cur, off, c.f);
};

// ------------------------------------------------------------------ season scenes
type SeasonCfg = {year: number; venue: VKey; prevVenue: VKey | null; prevYear: number | null; notes?: string[]; enter?: boolean; panelEnter?: boolean; bg?: (c: Ctx) => void; afterBg?: (c: Ctx) => void};

const driveScene = (c: Ctx, o: SeasonCfg) => {
	const {fb, A, f, s, e} = c;
	const t = f - s, len = e - s;
	if (o.bg) o.bg(c);
	else venueCross(c, o.venue, o.prevVenue);
	if (o.afterBg) o.afterBg(c);
	const key = String(o.year);
	const v = OFF[Math.min(FRAMES - 1, f + 1)] - OFF[f];
	const x = enterExit(key, t, len, centred(key), {enter: o.enter});
	const r = drawCar(fb, A, key, x, GROUND, f, {spin: spinFor(v) || (t < 22 ? 1 : 0), bob: (f >> 3) & 1, exhaust: true, light: o.venue === 'wet' && (f >> 2) % 2 === 0, rim: CARS[key].team === 'mercedes' && [2020, 2021, 2023].includes(o.year) && (o.venue === 'night' || o.venue === 'dusk') ? C('#7f8db0') : undefined});
	if (o.venue === 'wet') spray(fb, f, r.x + r.w - 50, GROUND - 2);
	const sea = season(o.year);
	header(fb, A, f, {start: s, label: key, team: sea.team, car: sea.short, portrait: o.year});
	const [n, pop] = titlesAt(f);
	titleStars(fb, f, n, pop);
	if (o.notes) note(fb, f, s + 10, o.notes);
	statsPanel(fb, f, sea, o.prevYear ? season(o.prevYear) : null, s, o.panelEnter ? s : -999);
};

const champScene = (c: Ctx, o: SeasonCfg & {hitBeats: number; big?: boolean}) => {
	const {fb, A, f, s, e} = c;
	const t = f - s, len = e - s;
	const hit = s + b2f(o.hitBeats);
	const after = f - hit;
	venueCross(c, o.venue, o.prevVenue);
	const key = String(o.year);
	const sea = season(o.year);
	if (o.big && after >= 0) {
		// the seventh title: fireworks over the circuit
		const cols = ['#ffd23f', '#ffffff', '#00a19b', '#4fd8cc'];
		for (let k = 0; k < 6; k++) firework(fb, f, hit + k * b2f(1) - 2, 60 + ((k * 97) % 240), 70 + ((k * 53) % 110), 30 + k, cols);
	}
	if (after >= 0) rays(fb, 282, 280, f, {r: 170, n: 16, strength: o.big ? 0.55 : 0.35, y0: 150, y1: 350});
	const v = OFF[Math.min(FRAMES - 1, f + 1)] - OFF[f];
	const park = 4;
	const x = enterExit(key, t, len, park);
	const leaving = t > len - 12;
	drawCar(fb, A, key, x, GROUND, f, {spin: leaving || t < 22 ? 1 : spinFor(v), bob: after >= 0 ? 0 : (f >> 3) & 1, exhaust: true, light: o.venue === 'wet' && (f >> 2) % 2 === 0});
	if (o.venue === 'wet' && v > 1) spray(fb, f, x + carW(key) - 50, GROUND - 2);
	// Hamilton celebrating beside his car with the trophy
	if (after >= 0 && !leaving) {
		const fx = 254, fg = GROUND + 8;
		const pump = after % b2f(1) < 4 ? 2 : 0;
		const fig = A[`figure/${o.year}_trophy`];
		const fy = fg - fig.h - pump + (after < 4 ? (4 - after) * 3 : 0);
		const showFrac = Math.min(1, after / 5);
		fb.blitIf(fig, fx, fy, (px, py) => bayer(px, py) < showFrac);
		const [ax, ay] = TROPHY_ANCHOR[String(o.year)];
		const shineIdx = 1 + (Math.floor(after / 4) % 4);
		const tro = A[`trophy/small_${after % 40 < 16 ? shineIdx : 0}`];
		const rise = after < 10 ? (10 - after) * 3 : 0;
		fb.blitIf(tro, fx + ax - Math.floor(tro.w / 2), fy + ay - tro.h + 3 + rise, (px, py) => bayer(px, py) < showFrac);
		if (after < 12) ring(fb, fx + ax, fy + ay - 16, after / 12, 60, '#fff1a8');
	}
	if (after >= 0) confettiRain(fb, f, hit, {count: o.big ? 260 : 150, seed: o.year, cols: o.big ? ['#ffd23f', '#ffffff', '#00a19b', '#4fd8cc', '#ffe066'] : undefined});
	header(fb, A, f, {start: s, label: key, team: sea.team, car: sea.short, portrait: o.big && after >= 0 ? undefined : o.year});
	if (o.big && after >= 0) {
		const d = after;
		text(fb, 262, 54 - (d < 5 ? (5 - d) * 8 : 0), '7', GOLD, 16);
	}
	const [n, pop] = titlesAt(f);
	titleStars(fb, f, n, pop);
	if (after >= 0) championBanner(fb, f, hit, sea.title!, o.big);
	if (o.big && after >= 12) text(fb, 24, 246, 'EQUALS ALL-TIME RECORD', '#ffffff', 2, Math.floor((after - 12) * 3));
	statsPanel(fb, f, sea, o.prevYear ? season(o.prevYear) : null, s, -999, hit);
	if (after >= 0 && after < 5) flash(fb, (1 - after / 5) * (o.big ? 0.35 : 0.15), '#fff1a8');
};

const tableScene = (c: Ctx, o: {years: number[]; venue: VKey; prevVenue: VKey | null; notes: string[]}) => {
	const {fb, A, f, s, e} = c;
	const t = f - s, len = e - s;
	venueCross(c, o.venue, o.prevVenue);
	const per = len / o.years.length;
	const i = Math.min(o.years.length - 1, Math.floor(t / per));
	const lt = t - i * per;
	const key = String(o.years[i]);
	const x = enterExit(key, lt, per, centred(key));
	drawCar(fb, A, key, x, GROUND, f, {spin: 1, bob: (f >> 3) & 1, exhaust: true});
	const sea = season(o.years[i]);
	header(fb, A, f, {start: s + Math.round(i * per), label: key, team: sea.team, car: sea.short, portrait: o.years[i]});
	const [n, pop] = titlesAt(f);
	titleStars(fb, f, n, pop);
	note(fb, f, s + 8, o.notes);
	seasonTable(fb, f, o.years.map(season), i, s);
};

// ------------------------------------------------------------------ intro + 2007
const GANTRY_Y = 186;
const gantry = (fb: FB, lit: number, yOff = 0) => {
	const x0 = 50, y0 = GANTRY_Y + yOff, w = 260;
	fb.rect(x0 - 8, y0 - 8, w + 16, 5, C('#2a2e38'));
	fb.rect(x0, y0, w, 40, C('#0c0d10'));
	fb.rect(x0, y0, w, 1, C('#3a3f4b'));
	for (let i = 0; i < 5; i++)
		for (let k = 0; k < 2; k++) {
			const cx = x0 + 26 + i * 52, cy = y0 + 11 + k * 18;
			const on = i < lit;
			fb.circle(cx, cy, 7, C(on ? '#ff2b2b' : '#2a0d0d'));
			if (on) {
				fb.rect(cx - 3, cy - 3, 2, 2, C('#ffb0a0'));
				for (let a = 0; a < 20; a++) {
					const ang = (a / 20) * Math.PI * 2;
					if (bayer(a, k) < 0.5) fb.pset(cx + Math.cos(ang) * 10, cy + Math.sin(ang) * 10, C('#6a1010'));
				}
			}
		}
};

seg({
	id: 'intro', beats: 6, kind: 'symbolic',
	speed: (t) => (t < LIGHTS_OUT ? 0 : Math.min(9, (t - LIGHTS_OUT) * 0.55)),
	draw: ({fb, A, f}) => {
		venue(fb, 'grid', offAt(f), f);
		// grid slot markings
		for (const gx of [30, 250]) {
			fb.hline(gx, gx + 26, GROUND + 6, C('#e8e8e8'));
			fb.vline(gx, GROUND - 2, GROUND + 6, C('#e8e8e8'));
		}
		const out = f >= LIGHTS_OUT;
		drawCar(fb, A, '2007', centred('2007'), GROUND, f, {spin: out ? 1 : 0, bob: (f >> 1) & 1, exhaust: true});
		const lit = out ? 0 : [0, 1, 2, 3, 4].filter((i) => f >= b2f(i)).length;
		gantry(fb, lit);
		center(fb, 62, 'LEWIS', '#ffffff', 4, Math.max(0, Math.floor(f * 0.6)));
		center(fb, 94, 'HAMILTON', '#ffffff', 4, Math.max(0, Math.floor((f - 6) * 0.6)));
		center(fb, 134, '20 SEASONS IN F1', '#ffd23f', 2, Math.max(0, Math.floor((f - 14) * 1.5)));
		center(fb, 152, '2007 - 2026', '#c9ccd4', 2, Math.max(0, Math.floor((f - 24) * 1.5)));
		if (out) {
			// titles clear as the lights go out
			const k = (f - LIGHTS_OUT) / 14;
			for (let y = 50; y < 175; y++) for (let x = 0; x < fb.w; x++) if (bayer(x, y) < k) fb.pset(x, y, fb.get(x, 49));
		}
	},
});

seg({
	id: 'y2007', beats: 6, kind: 'fact',
	speed: (t) => Math.min(9, (t + 15) * 0.55),
	draw: (c) => {
		const t = c.f - c.s;
		// lights went out in the intro and the car launched: one continuous shot
		driveScene(c, {year: 2007, venue: 'grid', prevVenue: null, prevYear: null, notes: ['MISSED TITLE BY 1 POINT'], enter: false, panelEnter: true,
			afterBg: (cc) => { if (t < 16) gantry(cc.fb, 0, -t * 4); }});
	},
});

// ------------------------------------------------------------------ 2008-2026
seg({id: 'y2008', beats: 7, kind: 'fact', speed: stopAt(2), draw: (c) => champScene(c, {year: 2008, venue: 'wet', prevVenue: 'grid', prevYear: 2007, hitBeats: 2})});
seg({id: 'y0912', beats: 7, kind: 'fact', speed: drive(10, true), draw: (c) => tableScene(c, {years: [2009, 2010, 2011, 2012], venue: 'sunny', prevVenue: 'wet', notes: ['4 SEASONS · 12 WINS']})});
seg({id: 'y2013', beats: 5, kind: 'fact', speed: drive(4), draw: (c) => {
	const t = c.f - c.s;
	driveScene(c, {year: 2013, venue: 'pit', prevVenue: null, prevYear: 2012, notes: ['JOINS MERCEDES', 'FIRST WIN: HUNGARY'],
		bg: (cc) => {
			const {fb, f, tmpA, tmpB} = cc;
			if (t >= 12) return venue(fb, 'pit', offAt(f), f);
			// team swap: teal wipe from the McLaren circuit to the Mercedes pit lane
			tmpA.clear(0);
			venue(tmpA, 'sunny', offAt(f), f);
			tmpB.clear(0);
			venue(tmpB, 'pit', offAt(f), f);
			ditherWipe(fb, tmpA, tmpB, t / 11);
			const ex = Math.round((t / 11) * 1.25 * fb.w - 0.1 * fb.w);
			for (let y = 0; y < fb.h; y++) for (let k = 0; k < 6; k++) if (bayer(ex + k, y) < 0.6) fb.pset(ex + k, y, C('#00a19b'));
		}});
}});
seg({id: 'y2014', beats: 7, kind: 'fact', speed: stopAt(2, 6, true), draw: (c) => champScene(c, {year: 2014, venue: 'desert', prevVenue: 'pit', prevYear: 2013, hitBeats: 2})});
seg({id: 'y2015', beats: 7, kind: 'fact', speed: stopAt(2, 9, true), draw: (c) => champScene(c, {year: 2015, venue: 'day2', prevVenue: 'desert', prevYear: 2014, hitBeats: 2})});
seg({id: 'y2016', beats: 5, kind: 'fact', speed: drive(9, true), draw: (c) => driveScene(c, {year: 2016, venue: 'night', prevVenue: 'day2', prevYear: 2015, notes: ['RUNNER-UP BY 5 POINTS']})});
seg({id: 'y2017', beats: 7, kind: 'fact', speed: stopAt(2), draw: (c) => champScene(c, {year: 2017, venue: 'sunny', prevVenue: 'night', prevYear: 2016, hitBeats: 2})});
seg({id: 'y2018', beats: 7, kind: 'fact', speed: stopAt(2, 9, true), draw: (c) => champScene(c, {year: 2018, venue: 'dusk', prevVenue: 'sunny', prevYear: 2017, hitBeats: 2})});
seg({id: 'y2019', beats: 7, kind: 'fact', speed: stopAt(2, 9, true), draw: (c) => champScene(c, {year: 2019, venue: 'day2', prevVenue: 'dusk', prevYear: 2018, hitBeats: 2})});
seg({id: 'y2020', beats: 10, kind: 'fact', speed: stopAt(3, 9, true), draw: (c) => champScene(c, {year: 2020, venue: 'night', prevVenue: 'day2', prevYear: 2019, hitBeats: 3, big: true})});
seg({id: 'y2123', beats: 7, kind: 'fact', speed: drive(9, true), draw: (c) => tableScene(c, {years: [2021, 2022, 2023], venue: 'dusk', prevVenue: 'night', notes: ['THE GROUND-EFFECT YEARS']})});
seg({id: 'y2024', beats: 4, kind: 'fact', speed: drive(8), draw: (c) => driveScene(c, {year: 2024, venue: 'sunset', prevVenue: 'dusk', prevYear: 2023, notes: ['LAST MERCEDES SEASON', '84 WINS TOGETHER']})});

seg({
	id: 'y2025', beats: 4, kind: 'fact', speed: () => 0,
	draw: ({fb, A, f, s, e}) => {
		const t = f - s, len = e - s;
		// garage reveal: the red door rises on the downbeat
		fb.gradient(0, 300, ['#0b0b0e', '#15151b', '#1f1f27', '#2a2a33'].map(C));
		for (let x = 0; x < fb.w; x += 40) fb.vline(x, 150, 300, C('#24242c'));
		for (const lx of [90, 270]) {
			for (let y = 160; y < 330; y++) {
				const half = (y - 160) * 0.35;
				for (let x = Math.round(lx - half); x <= lx + half; x++) if (bayer(x, y) < 0.2) fb.pset(x, y, C('#5a2a2e'));
			}
			fb.rect(lx - 6, 156, 13, 4, C('#d8d8d8'));
		}
		fb.rect(0, 300, fb.w, fb.h - 300, C('#3a3d44'));
		for (let x = 0; x < fb.w; x += 24) fb.vline(x, 300, fb.h, C('#33363c'));
		fb.hline(0, fb.w, 300, C('#5a5e66'));
		const go = b2f(2.5);
		const park = centred('2025');
		const x = t < go ? park : Math.round(park - Math.pow((t - go) / (len - go), 2) * (park + carW('2025') + 10));
		drawCar(fb, A, '2025', x, GROUND, f, {spin: t < go ? 0 : 1, bob: t < go ? (f >> 1) & 1 : 0, exhaust: true});
		const lift = Math.min(1, t / 14);
		const doorBottom = Math.round(lerp(345, 140, smooth(lift)));
		for (let y = 140; y < doorBottom; y++) {
			const rib = (doorBottom - y) % 8;
			fb.hline(0, fb.w, y, C(rib === 0 ? '#5a080d' : rib < 3 ? '#9a1018' : '#c4141c'));
		}
		fb.hline(0, fb.w, doorBottom, C('#ff6a5e'));
		// header area sky replaced by dark wall
		const sea = season(2025);
		header(fb, A, f, {start: s, label: '2025', team: 'ferrari', car: sea.short, portrait: 2025, yearColor: '#ff6a5e'});
		const [n, pop] = titlesAt(f);
		titleStars(fb, f, n, pop);
		note(fb, f, s + 10, ['FERRARI DEBUT', 'SPRINT WIN: CHINA'], 162);
		statsPanel(fb, f, sea, season(2024), s);
	},
});

seg({
	id: 'y2026', beats: 9, kind: 'fact', speed: drive(10, true),
	draw: (c) => {
		const {fb, A, f, s, e} = c;
		const t = f - s, len = e - s;
		venueCross(c, 'barcelona', null);
		const panelAt = b2f(4.5);
		const key = '2026_hero';
		const open = t > b2f(1.5) && t < b2f(3.5);
		const x = t < 26 ? Math.round(lerp(362, 4, ease(t / 26))) : t < panelAt ? 4 : Math.round(4 - Math.pow(Math.min(1, (t - panelAt) / 16), 2) * 380);
		const g = t < panelAt ? 318 : 318;
		drawCar(fb, A, key, x, g, f, {spin: 1, bob: (f >> 3) & 1, exhaust: true, open});
		if (open && (f >> 3) % 2 === 0) text(fb, 120, 214, 'ACTIVE AERO', '#ffd23f', 2);
		header(fb, A, f, {start: s, label: '2026', team: 'ferrari', car: 'SF-26', portrait: 2026, yearColor: '#ff6a5e'});
		const [n, pop] = titlesAt(f);
		titleStars(fb, f, n, pop);
		note(fb, f, s + 8, ['FIRST FERRARI WIN', 'BARCELONA · WIN 106']);
		if (t < panelAt) statsPanel(fb, f, season(2026), season(2025), s);
		else panel2026(fb, f, s + panelAt);
	},
});

// ------------------------------------------------------------------ records
const RECORD_INTRO = 2;
seg({
	id: 'records', beats: 28, kind: 'fact', speed: () => 0,
	draw: ({fb, A, f, s, e}) => {
		const t = f - s, len = e - s;
		fb.gradient(0, fb.h, ['#050608', '#0d0b06', '#1a1405', '#0d0b06', '#050608'].map(C));
		rays(fb, 180, 250, f, {r: 360, n: 18, strength: 0.18, color: '#5a4310'});
		// drifting gold dust
		const r = rng(77);
		for (let i = 0; i < 70; i++) {
			const x = (r() * 360 + f * (0.2 + r() * 0.4)) % 360, y = (r() * 640 - f * (0.3 + r() * 0.5) + 6400) % 640;
			fb.pset(x, y, C(i % 3 ? '#8a6a20' : '#ffd23f'));
		}
		const introF = b2f(RECORD_INTRO);
		if (t < introF + 6) {
			const k = Math.min(1, t / 8);
			const hero = A[t % 47 > 43 ? 'hamilton/hero_2026_blink' : 'hamilton/hero_2026'];
			fb.blitIf(hero, 128, 500 - hero.h + Math.round((1 - ease(k)) * 40), (x, y) => bayer(x, y) < k);
			center(fb, 150, 'ALL-TIME', GOLD, 4, Math.floor(t * 1.5));
			center(fb, 184, 'RECORDS', GOLD, 4, Math.floor((t - 4) * 1.5));
			center(fb, 226, 'AS OF MEXICAN GP 2026', '#c9ccd4', 2, Math.floor((t - 8) * 3));
			center(fb, 248, 'LEWIS HAMILTON', '#ffffff', 2, Math.floor((t - 12) * 3));
			if (t >= introF) flash(fb, (t - introF) / 6, '#050608');
			return;
		}
		const per = (len - introF) / RECORDS.length;
		const i = Math.min(RECORDS.length - 1, Math.floor((t - introF) / per));
		const lt = t - introF - i * per;
		const R = RECORDS[i];
		const k = Math.min(1, lt / 8);
		const out = lt > per - 6 ? (lt - (per - 6)) / 6 : 0;
		const lift = Math.round((1 - ease(k)) * 24);
		// tag
		const tag = R.kind === 'joint' ? 'JOINT RECORD' : 'ALL-TIME RECORD';
		const tw = measure(tag, {size: 2}) + 16;
		const tx = Math.round((fb.w - tw) / 2);
		fb.rect(tx, 120 + lift, tw, 22, C(R.kind === 'joint' ? '#c9ccd4' : GOLD));
		center(fb, 124 + lift, tag, R.kind === 'joint' ? '#1a1d24' : '#2a1a00', 2);
		// huge number counting up
		const shown = Math.round(R.value * smooth(lt / 10));
		center(fb, 160 + lift, String(shown), GOLD, 16);
		if (lt > 10 && lt < 22) ring(fb, 180, 216, (lt - 10) / 12, 170, '#fff1a8');
		R.lines.forEach((l, j) => center(fb, 290 + j * 32 + lift, l, '#ffffff', 4, Math.floor((lt - 6 - j * 3) * 2)));
		R.sub.forEach((l, j) => center(fb, 366 + j * 20 + lift, l, j === 0 ? GOLD : '#aab1bf', 2, Math.floor((lt - 12 - j * 4) * 3)));
		// progress dots
		for (let d = 0; d < RECORDS.length; d++) fb.rect(180 - RECORDS.length * 6 + d * 12, 432, 8, 3, C(d === i ? GOLD : d < i ? '#7a6020' : '#2b2f3a'));
		if (out > 0) flash(fb, out, '#050608');
		if (lt < 4) flash(fb, 1 - lt / 4, '#050608');
	},
});

// ------------------------------------------------------------------ finale (imagined)
const IMAG_BEAT = 3;
seg({
	id: 'finale', beats: 14, kind: 'imagined', speed: () => 0,
	draw: ({fb, A, f, s, e}) => {
		const t = f - s, len = e - s;
		const im = b2f(IMAG_BEAT);
		if (t < im) {
			fb.clear(C('#000000'));
			const w = Math.min(300, t * 18);
			fb.rect(Math.round((fb.w - w) / 2), 300, w, 2, C('#ffffff'));
			if (t > 6) center(fb, 270, 'HISTORY ENDS HERE', '#ffffff', 2, Math.floor((t - 6) * 3));
			if (t > 18) center(fb, 314, 'WHAT FOLLOWS IS IMAGINED', '#ffd400', 2, Math.floor((t - 18) * 3));
			return;
		}
		// tilt down from the dawn sky to the hills of the imagined circuit
		const u = t - im;
		const camY = Math.round(260 * smooth(u / b2f(5)));
		const W2 = fb.w;
		const off = u * 0.4;
		// draw the tall world by offsetting every layer by -camY
		fb.clear(C('#18264c'));
		const skyStops = ['#0c1430', '#18264c', '#33406f', '#6b5a8c', '#c9708a', '#ff9e6e', '#ffd49a'].map(C);
		fb.gradient(-camY, 440 - camY, skyStops);
		sun(fb, 196, Math.round(430 - Math.min(40, u * 0.25) - camY), 26, '#fff1c4', '#ffb070');
		// birds
		for (let b = 0; b < 5; b++) {
			const bx = (40 + b * 37 + u * (0.6 + b * 0.05)) % (W2 + 40) - 20, by = 300 + b * 9 - camY + Math.sin(u * 0.1 + b) * 3;
			const wing = (u + b * 3) % 12 < 6 ? 1 : 0;
			fb.pset(bx, by, C('#2a2040')); fb.pset(bx - 1, by - wing, C('#2a2040')); fb.pset(bx + 1, by - wing, C('#2a2040'));
			fb.pset(bx - 2, by - 1 + wing, C('#2a2040')); fb.pset(bx + 2, by - 1 + wing, C('#2a2040'));
		}
		ridge(fb, off * 0.2, 470 - camY, 40, '#5a4a78', {seed: 51, top: '#7a5f8c', freq: 0.016});
		mist(fb, 440 - camY, 490 - camY, '#f6c9a8', 0.35);
		hills(fb, off * 0.5, 540 - camY, 34, ['#8fbf5a', '#5f9a44', '#3f7a38', '#356a30'], {seed: 17, terraces: true});
		mist(fb, 560 - camY, 600 - camY, '#f6d9b8', 0.25);
		hills(fb, off * 1.0, 650 - camY, 30, ['#6fae4a', '#3f8a3a', '#2c6a2e', '#245a28'], {seed: 29, terraces: true});
		track(fb, off * 2, 730 - camY, 790 - camY, {asphalt: ['#4a4450', '#544e5a', '#403a46']});
		fb.rect(0, 790 - camY, W2, 400, C('#2c6a2e'));
		for (let y = 790 - camY; y < fb.h; y++) for (let x = 0; x < W2; x++) if (((x + y) >> 4) & 1) fb.pset(x, y, C('#2a6430'));
		// the SF-26 arrives and parks; Hamilton stands beside it
		const g = 772 - camY;
		const carIn = b2f(3);
		const cp = Math.min(1, Math.max(0, (u - b2f(0.5)) / carIn));
		const cx = Math.round(lerp(362, -4, ease(cp)));
		drawCar(fb, A, '2026_hero', cx, g, f, {spin: cp < 1 ? 1 : 0, bob: (f >> 3) & 1, exhaust: true});
		const figAt = b2f(4);
		if (u >= figAt) {
			const fu = u - figAt;
			const raise = u >= b2f(6);
			const fig = A[`figure/2026_${raise ? 'fist' : 'stand'}`];
			const k = Math.min(1, fu / 8);
			fb.blitIf(fig, 262, g + 6 - fig.h, (px, py) => bayer(px, py) < k);
		}
		// the card
		const [what, place] = FINALE_CARD.text.split('… ');
		const placeName = place.split(' ')[0], placeYear = place.split(' ')[1];
		const w1 = im + b2f(5);
		if (t >= w1) center(fb, 132 - Math.max(0, 4 - (t - w1)) * 6, `${what}…`, '#ffffff', 4);
		const w2 = im + b2f(6);
		if (t >= w2) {
			const d = t - w2;
			center(fb, 172 - Math.max(0, 5 - d) * 8, placeName, '#ffd400', 8);
			center(fb, 236 - Math.max(0, 5 - (d - 4)) * 8, placeYear, '#ffd400', 8, d >= 4 ? undefined : 0);
			if (d < 14) ring(fb, 180, 210, d / 14, 220, '#fff1a8');
		}
		imaginedTag(fb, f, s + im);
		void len;
	},
});

// ------------------------------------------------------------------ assembly
export const SEGMENTS = (() => {
	let beats = 0;
	STARTS = [];
	for (const sg of SEGS) {
		STARTS.push(b2f(beats));
		beats += sg.beats;
	}
	if (Math.abs(beats - 147) > 1e-6) throw new Error(`segments sum to ${beats} beats, expected 147`);
	OFF = new Float32Array(FRAMES + 1);
	for (let f = 1; f <= FRAMES; f++) {
		let i = 0;
		for (let k = 0; k < SEGS.length; k++) if (f - 1 >= STARTS[k]) i = k;
		const end = i + 1 < SEGS.length ? STARTS[i + 1] : FRAMES;
		OFF[f] = OFF[f - 1] + SEGS[i].speed(f - 1 - STARTS[i], end - STARTS[i]);
	}
	return SEGS.map((sg, i) => ({...sg, start: STARTS[i], end: i + 1 < SEGS.length ? STARTS[i + 1] : FRAMES}));
})();

export const IMAGINED_FROM = SEGMENTS.find((s) => s.id === 'finale')!.start + b2f(IMAG_BEAT);
