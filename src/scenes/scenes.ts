// The 16 story slots, one bar each at 126 BPM (slot 16 runs to frame 899).
// FACT captions come only from src/data/seasons.ts; IMAGINED content only
// from src/data/imagined.ts and always under the IMAGINED tag.
import {at, beatPulse, pulse} from '../config/beatmap';
import {FINALE_CARD} from '../data/imagined';
import {FLIPBOOK_CAPTION, MERCEDES_CAPTION, STANDING_2026, season} from '../data/seasons';
import {Assets} from '../engine/assets';
import {drawCar} from '../engine/car';
import {C, FB, bayer, rng} from '../engine/fb';
import {drawText, measure} from '../engine/font';
import {hills, ridge, sky, sun, track} from '../engine/env';
import {confetti, ditherMix, ditherWipe, flash, ring, speedLines, sparks} from '../engine/fx';
import {bigYear, captionCard, imaginedTag} from '../overlays/overlays';
import {GROUND, TRACK_BOT, TRACK_TOP, shot, venue} from './common';

export type Ctx = {fb: FB; A: Assets; f: number; tmpA: FB; tmpB: FB};

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
const centerText = (fb: FB, y: number, text: string, color: string, size: 1 | 2 | 4 | 8, shadow = '#0b0d12') =>
	drawText(fb, Math.round((fb.w - measure(text, {size})) / 2), y, text, C(color), {size, shadow: C(shadow)});
const bob = (f: number, from: number, to: number) => (beatPulse(f, from, to, 4) > 0.4 ? 1 : 0);

// ------------------------------------------------------------ S01 lights out
const LIGHTS = [at(1, 1), at(1, 2), at(1, 3), at(1, 4), at(1, 4, 0.5)];
const gantry = (fb: FB, f: number, lit: number, yOff = 0) => {
	const x0 = 150, y0 = 18 + yOff;
	fb.rect(x0 - 6, y0 - 6, 192, 4, C('#2a2e38'));
	fb.rect(x0, y0, 180, 34, C('#0c0d10'));
	fb.rect(x0, y0, 180, 1, C('#3a3f4b'));
	for (let i = 0; i < 5; i++) {
		const on = i < lit;
		for (let k = 0; k < 2; k++) {
			const cx = x0 + 22 + i * 34, cy = y0 + 9 + k * 15;
			fb.circle(cx, cy, 5, C(on ? '#ff2b2b' : '#2a0d0d'));
			if (on) {
				fb.pset(cx - 2, cy - 2, C('#ffb0a0'));
				fb.pset(cx - 1, cy - 2, C('#ff8070'));
			}
		}
	}
};

export const s01 = ({fb, A, f}: Ctx) => {
	venue(fb, 'overcast', 0, f);
	// grid slot markings
	const w = C('#e8e8e8');
	for (const gx of [80, 300]) {
		fb.hline(gx, gx + 18, GROUND + 24, w);
		fb.vline(gx, GROUND + 19, GROUND + 24, w);
	}
	drawCar(fb, A, 'rival', 330, GROUND - 22, f, {spin: 0, bob: (f >> 1) & 1, color: C('#2a2f3a'), shadow: false});
	drawCar(fb, A, '2007_hero', 92, GROUND + 18, f, {spin: 0, bob: (f >> 1) & 1, exhaust: true});
	const lit = LIGHTS.filter((l) => f >= l).length;
	gantry(fb, f, lit);
	const t = f - 4;
	if (t > 0) centerText(fb, 62, 'LEWIS HAMILTON', '#ffffff', 2);
	if (t > 0) {
		// type-on reveal: mask the right part
		const shown = Math.min(14, Math.floor(t * 0.8));
		const full = measure('LEWIS HAMILTON', {size: 2});
		const x0 = Math.round((fb.w - full) / 2) + measure('LEWIS HAMILTON'.slice(0, shown), {size: 2});
		if (shown < 14) fb.rect(x0, 60, full + 20, 18, C('#4c5466'));
	}
	if (f >= at(1, 3)) {
		const sub = '20 SEASONS IN FORMULA 1 · 2007-2026';
		drawText(fb, Math.round((fb.w - measure(sub)) / 2), 82, sub, C('#ffd23f'), {chars: Math.floor((f - at(1, 3)) * 2), shadow: C('#0b0d12')});
	}
	// red glow around the gantry as each light comes on
	const g = pulse(f, LIGHTS[lit - 1] ?? -99, 6);
	if (g > 0) {
		const c = C('#ff3030');
		for (let y = 8; y < 64; y++)
			for (let x = 136; x < 344; x++) {
				const inside = x >= 150 && x < 330 && y >= 18 && y < 52;
				if (!inside && bayer(x, y) < g * 0.35 * (1 - Math.abs(y - 35) / 30)) fb.pset(x, y, c);
			}
	}
};

// ------------------------------------------------------------ S02 2007 rookie
export const s02 = ({fb, A, f}: Ctx) => {
	const s = at(2), t = f - s;
	const speed = Math.min(9, t * 0.45);
	const off = t < 20 ? 0.225 * t * t : 90 + (t - 20) * 9;
	const carX = Math.round(lerp(112, 150, t / 24));
	venue(fb, 'sunny', off, f);
	speedLines(fb, f, {count: Math.min(28, t), speed: 16, y0: TRACK_TOP + 4, y1: TRACK_BOT - 6, color: '#8a8e98', len: 36});
	// overtake on beat 3: generic rival in the far lane drops back
	const hit = at(2, 3);
	const rx = Math.round(40 + (f - (hit - 14)) * 7);
	if (f > hit - 16 && rx < fb.w + 10) drawCar(fb, A, 'rival', rx, GROUND - 20, f, {spin: 1, shadow: true});
	drawCar(fb, A, '2007', carX, GROUND, f, {spin: speed > 0 ? 1 : 0, bob: bob(f, s, s + 57), exhaust: true});
	if (t < 8) sparks(fb, f, carX + 120, GROUND - 2);
	if (f >= hit && f < hit + 10) speedLines(fb, f, {count: 30, speed: 30, y0: 120, y1: 200, color: '#ffffff', len: 50, seed: 12});
	// gantry lifts away after lights out
	if (t < 12) gantry(fb, f, 0, -t * 6);
	bigYear(fb, f, '2007', s + 2);
	captionCard(fb, A, f, {year: 2007, start: s + 5, end: at(3) - 1});
	flash(fb, pulse(f, s, 5) * 0.8);
};

// ------------------------------------------------------------ S03 2008 title
export const s03 = ({fb, A, f}: Ctx) => {
	const s = at(3), t = f - s;
	const off = t * 8;
	const r = shot(fb, A, f, '2008', {venue: 'wet', off, carX: 150, spin: 1, bob: bob(f, s, s + 57), wet: true, light: (f >> 2) % 2 === 0, lines: 10});
	// chequered line passes at beat 3
	const hit = at(3, 3);
	const lineX = Math.round(r.x + 30 + (f - hit) * 8);
	if (lineX > -10 && lineX < fb.w)
		for (let y = TRACK_TOP + 2; y < TRACK_BOT - 4; y++)
			for (let k = 0; k < 6; k++) fb.pset(lineX + k + Math.round((y - TRACK_TOP) * 0.15), y, (Math.floor(y / 3) + Math.floor(k / 3)) % 2 ? C('#e8e8e8') : C('#151515'));
	bigYear(fb, f, '2008', s + 1);
	if (f >= hit) {
		const d = f - hit;
		const y = 56 - (d < 4 ? (4 - d) * 4 : 0);
		centerText(fb, y, 'WORLD CHAMPION', '#ffd23f', 4, '#2a1a00');
		ring(fb, fb.w / 2, 70, d / 16, 160, '#fff1a8');
	}
	captionCard(fb, A, f, {year: 2008, start: s + 4, end: at(4) - 1});
	flash(fb, pulse(f, s, 6));
	flash(fb, pulse(f, hit, 5) * 0.7, '#fff1a8');
};

// ------------------------------------------------------------ S04 2009-2012 flip-book
const FLIP = [2009, 2010, 2011, 2012];
const FLIP_VENUE = ['sunny', 'day2', 'desert', 'sunset'] as const;
export const s04 = ({fb, A, f}: Ctx) => {
	const s = at(4);
	const k = Math.min(3, Math.max(0, FLIP.findIndex((_, i) => f < at(4, i + 2))));
	const year = FLIP[k];
	const bs = at(4, k + 1);
	shot(fb, A, f, String(year), {venue: FLIP_VENUE[k], off: (f - s) * 12, carX: 150, spin: 1, bob: bob(f, s, s + 57), lines: 26});
	bigYear(fb, f, String(year), bs);
	captionCard(fb, A, f, {year, start: s + 2, end: at(5) - 1, text: FLIPBOOK_CAPTION, label: '2009-12', portrait: year});
	flash(fb, pulse(f, bs, 3) * 0.6);
};

// ------------------------------------------------------------ S05 2013 move to Mercedes
export const s05 = (ctx: Ctx) => {
	const {fb, A, f, tmpA, tmpB} = ctx;
	const s = at(5), t = f - s;
	const draw2013 = (out: FB) => {
		const go = at(5, 3);
		const v = f < go ? 2 : 2 + (f - go) * 0.6;
		const off = f < go ? t * 2 : (go - s) * 2 + (f - go) * 2 + 0.3 * (f - go) * (f - go);
		// pit lane: garages, pit wall, pit-lane asphalt
		sky(out, 'day', 0, 70);
		out.rect(0, 52, out.w, 10, C('#9aa3b2'));
		for (let x = 0; x < out.w; x++) {
			const wx = (((x - off * 0.6) % 110) + 110) % 110;
			const inGarage = wx >= 10 && wx < 100;
			for (let y = 62; y < 138; y++) out.pset(x, y, inGarage ? (y < 66 ? C('#3a3f48') : C(y < 120 ? '#0f2a2c' : '#123336')) : C('#c9ced6'));
			out.pset(x, 64, C('#00a19b'));
			if (inGarage && wx % 22 === 0) out.rect(x, 70, 3, 2, C('#e8fbff'));
		}
		drawText(out, Math.round(30 - (off * 0.6) % 110 + 110), 100, 'PIT LANE', C('#4fd8cc'));
		out.rect(0, 138, out.w, 12, C('#b8bec8'));
		out.hline(0, out.w, 138, C('#e6e9ee'));
		track(out, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#4a4d55', '#53565e', '#42454c'], kerb: false, grass: '#3f8a3a'});
		// pit-lane speed line
		for (let x = 0; x < out.w; x += 1) if (((x - Math.floor(off)) % 12 + 12) % 12 < 7) out.pset(x, TRACK_BOT - 6, C('#f2f2f2'));
		drawCar(out, A, '2013', 160, GROUND, f, {spin: v > 0 ? 1 : 0, bob: bob(f, s, s + 57), exhaust: true});
	};
	if (t < 12) {
		// team-swap wipe from the McLaren track to the Mercedes pit lane
		tmpA.clear(0);
		shot(tmpA, A, f, '2012', {venue: 'sunset', off: (f - at(4)) * 12, carX: 150, spin: 1, lines: 20});
		tmpB.clear(0);
		draw2013(tmpB);
		ditherWipe(fb, tmpA, tmpB, t / 11);
		// teal leading edge
		const ex = Math.round((t / 11) * 1.25 * fb.w - 0.1 * fb.w);
		for (let y = 0; y < fb.h; y++) for (let k = 0; k < 6; k++) if (bayer(ex + k, y) < 0.6) fb.pset(ex + k, y, C('#00a19b'));
	} else {
		draw2013(fb);
	}
	bigYear(fb, f, '2013', s + 2);
	captionCard(fb, A, f, {year: 2013, start: s + 7, end: at(6) - 1});
};

// ------------------------------------------------------------ S06–S08 Mercedes title run
type Beat = {year: number; venue: Parameters<typeof shot>[4]['venue']; hit: number; end: number; rim?: string};
const run = (ctx: Ctx, beats: Beat[], barStart: number, speed: (t: number) => number, lines: number) => {
	const {fb, A, f} = ctx;
	const cur = [...beats].reverse().find((b) => f >= b.hit) ?? beats[0];
	const t = f - barStart;
	shot(fb, A, f, String(cur.year), {
		venue: cur.venue, off: t * speed(t) + barStart, carX: 150, spin: 1, bob: bob(f, barStart, barStart + 57),
		lines, rim: cur.rim ? C(cur.rim) : undefined, exhaust: true,
	});
	bigYear(fb, f, String(cur.year), cur.hit);
	captionCard(fb, A, f, {year: cur.year, start: cur.hit + 2, end: cur.end});
	flash(fb, pulse(f, cur.hit, 4) * 0.85);
};

export const s06 = (ctx: Ctx) =>
	run(ctx, [
		{year: 2014, venue: 'desert', hit: at(6), end: at(6, 3) - 1},
		{year: 2015, venue: 'sunny', hit: at(6, 3), end: at(7) - 1},
	], at(6), () => 10, 14);

export const s07 = (ctx: Ctx) =>
	run(ctx, [
		{year: 2016, venue: 'night', hit: at(7), end: at(7, 3) - 1},
		{year: 2017, venue: 'day2', hit: at(7, 3), end: at(8) - 1},
	], at(7), () => 11, 16);

export const s08 = (ctx: Ctx) => {
	const s = at(8);
	run(ctx, [
		{year: 2018, venue: 'sunny', hit: at(8), end: at(8, 3) - 1},
		{year: 2019, venue: 'dusk', hit: at(8, 3), end: at(9) - 1},
	], s, (t) => 11 + t * 0.12, 18 + Math.floor((ctx.f - s) * 0.5));
	// riser into the phrase midpoint: streaks and a building white-out
	const rise = (ctx.f - at(8, 4)) / (at(9) - at(8, 4));
	if (rise > 0) {
		speedLines(ctx.fb, ctx.f, {count: 20 + Math.floor(rise * 40), speed: 34, y0: 0, y1: ctx.fb.h, color: '#ffffff', len: 60, seed: 21});
		flash(ctx.fb, rise * rise * 0.55);
	}
};

// ------------------------------------------------------------ S09 2020 seventh title
export const s09 = ({fb, A, f}: Ctx) => {
	const s = at(9), t = f - s;
	venue(fb, 'night', t * 9 + s, f);
	speedLines(fb, f, {count: 16, speed: 16, y0: TRACK_TOP + 4, y1: TRACK_BOT - 6, color: '#5a6080', len: 36});
	// livery flips silver -> black with a dithered sweep on the downbeat
	const flipT = t / 9;
	if (flipT < 1) {
		drawCar(fb, A, '2020', 150, GROUND, f, {spin: 1, bob: bob(f, s, s + 57), rim: C('#4fd8cc')});
		const sweep = 150 + flipT * 190;
		const m = A['cars/2019'];
		fb.blitIf(m, 150, GROUND - 44, (x, y) => x > sweep + (bayer(x, y) - 0.5) * 16);
	} else {
		drawCar(fb, A, '2020', 150, GROUND, f, {spin: 1, bob: bob(f, s, s + 57), rim: C('#4fd8cc'), exhaust: true});
	}
	confetti(fb, f, s, {seed: 7, count: 220, ox: 240, oy: 120, life: 56});
	// huge 7
	if (f >= s) {
		const d = f - s;
		const y = 34 - (d < 4 ? (4 - d) * 6 : 0);
		drawText(fb, 300, y, '7', C('#ffd23f'), {size: 8, shadow: C('#3a2600')});
		drawText(fb, 352, y + 30, 'TITLES', C('#ffffff'), {size: 2, shadow: C('#000000')});
		ring(fb, 320, 62, d / 18, 200, '#fff1a8');
	}
	bigYear(fb, f, '2020', s);
	captionCard(fb, A, f, {year: 2020, start: s + 5, end: at(10) - 1});
	flash(fb, pulse(f, s, 7));
};

// ------------------------------------------------------------ S10 2021-2023 (half-time feel)
export const s10 = ({fb, A, f}: Ctx) => {
	const s = at(10), t = f - s;
	const b3 = at(10, 3), b4 = at(10, 4);
	const key = f < b3 ? '2021' : f < b4 ? '2022' : '2023';
	const black = key !== '2022';
	shot(fb, A, f, key, {venue: 'dusk', off: t * 5 + s, carX: 150, spin: (f & 1), bob: (f >> 3) & 1, rim: black ? C('#8fa0c8') : undefined, lines: 4});
	if (f < b3) {
		bigYear(fb, f, '2021', s);
		captionCard(fb, A, f, {year: 2021, start: s + 2, end: b3 - 1});
	} else {
		bigYear(fb, f, key, f < b4 ? b3 : b4);
		captionCard(fb, A, f, {year: 2022, start: b3 + 1, end: at(11) - 1, label: '2022-23', text: season(2022).caption, portrait: f < b4 ? 2022 : 2023});
	}
	flash(fb, Math.max(pulse(f, s, 4), pulse(f, b3, 3), pulse(f, b4, 3)) * 0.35);
};

// ------------------------------------------------------------ S11 2024 farewell
export const s11 = ({fb, A, f}: Ctx) => {
	const s = at(11), t = f - s;
	const v = lerp(11, 3, t / 40);
	const off = s + t * 11 - Math.max(0, t) * Math.max(0, t) * 0.1;
	const r = shot(fb, A, f, '2024', {venue: 'sunset', off, carX: 150, spin: v > 4 ? 1 : 0.5, bob: bob(f, s, s + 57), lines: Math.max(0, 12 - t / 3)});
	// finish line crossed on the downbeat
	const lineX = Math.round(r.x + 10 + (f - s) * 11 - (f - s) * (f - s) * 0.1);
	if (lineX < fb.w)
		for (let y = TRACK_TOP + 2; y < TRACK_BOT - 4; y++)
			for (let k = 0; k < 6; k++) fb.pset(lineX + k + Math.round((y - TRACK_TOP) * 0.15), y, (Math.floor(y / 3) + Math.floor(k / 3)) % 2 ? C('#e8e8e8') : C('#151515'));
	bigYear(fb, f, '2024', s);
	const b3 = at(11, 3);
	captionCard(fb, A, f, {year: 2024, start: s + 2, end: b3 - 1});
	captionCard(fb, A, f, {year: 2024, start: b3, end: at(12) - 1, text: MERCEDES_CAPTION, label: '2013-24'});
	flash(fb, pulse(f, s, 5) * 0.8);
};

// ------------------------------------------------------------ S12 2025 red reveal
export const s12 = ({fb, A, f}: Ctx) => {
	const s = at(12), t = f - s;
	const go = at(12, 3);
	// garage interior
	fb.gradient(0, 150, ['#0b0b0e', '#15151b', '#1f1f27', '#2a2a33'].map(C));
	for (let x = 0; x < fb.w; x += 40) fb.vline(x, 20, 150, C('#24242c'));
	drawText(fb, 168, 34, 'SCUDERIA FERRARI HP', C('#5e0e18'), {size: 2});
	// spotlights
	for (const lx of [150, 330]) {
		for (let y = 10; y < 200; y++) {
			const half = (y - 10) * 0.35;
			for (let x = Math.round(lx - half); x <= lx + half; x++) if (bayer(x, y) < 0.22) fb.pset(x, y, C('#5a2a2e'));
		}
		fb.rect(lx - 6, 6, 13, 4, C('#d8d8d8'));
	}
	fb.rect(0, 150, fb.w, 120, C('#3a3d44'));
	for (let x = 0; x < fb.w; x += 24) fb.vline(x, 150, 270, C('#33363c'));
	fb.hline(0, fb.w, 150, C('#5a5e66'));
	const carX = f < go ? 150 : Math.round(150 - Math.pow(f - go, 2) * 0.18);
	drawCar(fb, A, '2025', carX, GROUND, f, {spin: f < go ? 0 : 1, bob: f < go ? (f >> 1) & 1 : bob(f, s, s + 57), exhaust: true});
	// garage door rises on the downbeat
	const lift = Math.min(1, t / 12);
	const doorBottom = Math.round(lerp(200, -10, lift * lift * (3 - 2 * lift)));
	for (let y = 0; y < doorBottom; y++) {
		const rib = (doorBottom - y) % 8;
		fb.hline(0, fb.w, y, C(rib === 0 ? '#5a080d' : rib < 3 ? '#9a1018' : '#c4141c'));
	}
	if (doorBottom > 0) fb.hline(0, fb.w, doorBottom, C('#ff6a5e'));
	bigYear(fb, f, '2025', s + 2, '#ff4d4d');
	captionCard(fb, A, f, {year: 2025, start: s + 6, end: at(13) - 1});
	flash(fb, pulse(f, s, 6) * 0.9, '#ff2a2a');
};

// ------------------------------------------------------------ S13 2026 Barcelona win
export const s13 = ({fb, A, f}: Ctx) => {
	const s = at(13), t = f - s;
	const open = f >= at(13, 2) && f < at(13, 4);
	const carX = t < 10 ? Math.round(lerp(470, 96, (t / 10) * (2 - t / 10))) : Math.round(lerp(96, 70, (t - 10) / 46));
	const r = shot(fb, A, f, '2026_hero', {venue: 'barcelona', off: s + t * 15, carX, spin: 1, bob: bob(f, s, s + 57), open, lines: 26, exhaust: true});
	// active-aero indicator
	if (open && (f >> 2) % 2 === 0) drawText(fb, r.x + r.w - 96, r.y - 4, 'ACTIVE AERO · STRAIGHT MODE', C('#ffd23f'), {shadow: C('#000')});
	confetti(fb, f, s, {seed: 26, count: 200, ox: 240, oy: 90, cols: ['#dc1b24', '#ffd200', '#ffffff', '#ff6a5e'], life: 56});
	if (f >= s) {
		const d = f - s;
		const y = 50 - (d < 4 ? (4 - d) * 4 : 0);
		centerText(fb, y, 'FIRST FERRARI GP WIN', '#ffd200', 2, '#3a0006');
		centerText(fb, y + 18, 'BARCELONA-CATALUNYA · 14 JUNE 2026', '#ffffff', 1);
	}
	bigYear(fb, f, '2026', s, '#ff4d4d');
	captionCard(fb, A, f, {year: 2026, start: s + 4, end: at(14) - 1});
	flash(fb, pulse(f, s, 7), '#fff1a8');
};

// ------------------------------------------------------------ S14 2026 so far, then the line
const studio = (fb: FB, f: number) => {
	fb.gradient(0, fb.h, ['#120305', '#2a060b', '#4a0a12', '#2a060b'].map(C));
	// diagonal light stripes
	for (let y = 0; y < fb.h; y++)
		for (let x = 0; x < fb.w; x++) if (((x + y + Math.floor(f * 0.5)) % 48) < 6 && bayer(x, y) < 0.25) fb.pset(x, y, C('#6e0f19'));
};

const heroFrame = (f: number, dawn = false) => {
	const blink = f % 47 > 43;
	const glint = f % 29;
	if (dawn) return blink ? 'hamilton/hero_2026_dawn_blink' : glint < 3 ? 'hamilton/hero_2026_dawn_glint' : 'hamilton/hero_2026_dawn';
	if (blink) return 'hamilton/hero_2026_blink';
	if (glint < 2) return 'hamilton/hero_2026_glint2';
	if (glint < 4) return 'hamilton/hero_2026_glint1';
	return 'hamilton/hero_2026';
};

const stats2026 = (fb: FB, A: Assets, f: number) => {
	const s = at(14);
	studio(fb, f);
	const t = f - s;
	const hx = Math.round(lerp(-110, 40, (t + 1) / 6));
	const breathe = (Math.floor(f / 15) % 2);
	fb.blit(A[heroFrame(f)], hx, fb.h - 124 + breathe);
	drawText(fb, 34, 18, 'LEWIS HAMILTON', C('#ffffff'), {size: 2, shadow: C('#000')});
	drawText(fb, 34, 36, 'SCUDERIA FERRARI HP · 2026', C('#ffd200'), {shadow: C('#000')});
	const x = 232;
	if (f >= s) {
		const d = f - s;
		drawText(fb, x, 26 - (d < 3 ? (3 - d) * 4 : 0), '2026', C('#ffffff'), {size: 4, shadow: C('#000')});
	}
	const b2 = at(14, 2);
	if (f >= b2) {
		const d = f - b2;
		const y = 70 - (d < 4 ? (4 - d) * 6 : 0);
		const pos = STANDING_2026.position.replace('*', '');
		drawText(fb, x, y, pos, C('#ffd200'), {size: 8, shadow: C('#3a0006')});
		drawText(fb, x + measure(pos, {size: 8}) + 6, y + 2, '*', C('#ffd200'), {size: 4, shadow: C('#3a0006')});
		drawText(fb, x + 4, 134, STANDING_2026.footnote, C('#ffffff'), {size: 2, chars: Math.floor(d * 2.5), shadow: C('#000')});
		drawText(fb, x, 160, `${STANDING_2026.podiums} PODIUMS · ${STANDING_2026.wins} WIN`, C('#ffffff'), {size: 2, chars: Math.max(0, Math.floor((d - 4) * 2)), shadow: C('#000')});
		drawText(fb, x, 180, "DRIVERS' CHAMPIONSHIP", C('#c9a0a6'), {chars: Math.max(0, Math.floor((d - 6) * 3))});
	}
};

const dawnScene = (fb: FB, A: Assets, f: number, carProgress: number, hero: boolean) => {
	const s = at(14, 3);
	const t = f - s;
	sky(fb, 'dawn', 0, 140);
	sun(fb, 250, Math.round(120 - t * 0.25), 18, '#fff1c4', '#ffb070');
	ridge(fb, t * 0.2, 118, 26, '#5a4a78', {seed: 51, top: '#7a5f8c', freq: 0.016});
	// mist band
	for (let y = 108; y < 124; y++) for (let x = 0; x < fb.w; x++) if (bayer(x, y) < 0.3 - Math.abs(y - 116) * 0.03) fb.pset(x, y, C('#f6c9a8'));
	hills(fb, t * 0.5, 140, 22, ['#8fbf5a', '#5f9a44', '#3f7a38', '#356a30'], {seed: 17, terraces: true});
	hills(fb, t * 1.0, 170, 18, ['#6fae4a', '#3f8a3a', '#2c6a2e', '#245a28'], {seed: 29, terraces: true});
	// imagined circuit through the hills
	track(fb, t * 3, 180, 236, {asphalt: ['#4a4450', '#544e5a', '#403a46'], grass: '#2c6a2e'});
	const p = Math.min(1, carProgress);
	const cx = Math.round(lerp(-340, 18, p * (2 - p)));
	drawCar(fb, A, '2026_hero', cx, 230, f, {spin: p < 1 ? 1 : 0, bob: (f >> 2) & 1, exhaust: true});
	if (hero) fb.blit(A[heroFrame(f, true)], 362, fb.h - 124 + (Math.floor(f / 15) % 2));
};

export const s14 = (ctx: Ctx) => {
	const {fb, A, f, tmpA, tmpB} = ctx;
	const b3 = at(14, 3);
	if (f < b3) {
		stats2026(fb, A, f);
		return;
	}
	// crossover: history ends, the imagined dawn wipes in
	const t = f - b3;
	tmpA.clear(0);
	stats2026(tmpA, A, f);
	tmpB.clear(0);
	dawnScene(tmpB, A, f, 0, false);
	ditherWipe(fb, tmpA, tmpB, t / 16);
	// the line
	const lineW = Math.min(fb.w, t * 40);
	fb.rect(Math.round((fb.w - lineW) / 2), 200, lineW, 2, C('#ffffff'));
	if (t > 2) centerText(fb, 208, 'HISTORY ENDS HERE', '#ffffff', 2, '#000000');
	if (t > 8) centerText(fb, 228, 'WHAT FOLLOWS IS IMAGINED', '#ffd400', 1, '#000000');
	imaginedTag(fb, f, b3);
};

// ------------------------------------------------------------ S15 Finale I (imagined)
export const s15 = ({fb, A, f}: Ctx) => {
	const s = at(15);
	dawnScene(fb, A, f, (f - s) / 40, true);
	imaginedTag(fb, f, at(14, 3));
	flash(fb, pulse(f, s, 5) * 0.6, '#fff1c4');
};

// ------------------------------------------------------------ S16 Finale II (imagined)
export const s16 = ({fb, A, f}: Ctx) => {
	const s = at(16);
	dawnScene(fb, A, f, 1, true);
	// darken behind the card
	for (let y = 40; y < 150; y++) for (let x = 0; x < fb.w; x++) if (bayer(x, y) < 0.55) fb.pset(x, y, C('#140a10'));
	const [what, place] = FINALE_CARD.text.split('… ');
	const d = f - s;
	const y1 = 54 - (d < 4 ? (4 - d) * 8 : 0);
	centerText(fb, y1, `${what}…`, '#ffffff', 4, '#000000');
	const b2 = at(16, 2);
	if (f >= b2) {
		const d2 = f - b2;
		centerText(fb, 98 - (d2 < 4 ? (4 - d2) * 8 : 0), place, '#ffd400', 4, '#3a2600');
		ring(fb, fb.w / 2, 112, d2 / 14, 220, '#fff1a8');
	}
	imaginedTag(fb, f, at(14, 3));
	flash(fb, Math.max(pulse(f, s, 5), pulse(f, b2, 4)) * 0.8);
};

export const rngSeed = rng;
