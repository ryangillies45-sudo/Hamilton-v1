// Scene list in bars (126 BPM) and the per-frame compositor.
import {at} from './config/beatmap';
import {FRAMES} from './config/video';
import {Assets} from './engine/assets';
import {C, FB} from './engine/fb';
import {applyShake, shake} from './engine/fx';
import {titleCounter} from './overlays/overlays';
import * as S from './scenes/scenes';

type Scene = {id: string; start: number; kind: 'fact' | 'symbolic' | 'imagined'; draw: (c: S.Ctx) => void};

export const SCENES: Scene[] = [
	{id: 'S01 lights out', start: at(1), kind: 'symbolic', draw: S.s01},
	{id: 'S02 2007 rookie', start: at(2), kind: 'fact', draw: S.s02},
	{id: 'S03 2008 first title', start: at(3), kind: 'fact', draw: S.s03},
	{id: 'S04 2009-2012', start: at(4), kind: 'fact', draw: S.s04},
	{id: 'S05 2013 Mercedes', start: at(5), kind: 'fact', draw: S.s05},
	{id: 'S06 2014-15', start: at(6), kind: 'fact', draw: S.s06},
	{id: 'S07 2016-17', start: at(7), kind: 'fact', draw: S.s07},
	{id: 'S08 2018-19', start: at(8), kind: 'fact', draw: S.s08},
	{id: 'S09 2020 title 7', start: at(9), kind: 'fact', draw: S.s09},
	{id: 'S10 2021-23', start: at(10), kind: 'fact', draw: S.s10},
	{id: 'S11 2024 farewell', start: at(11), kind: 'fact', draw: S.s11},
	{id: 'S12 2025 red reveal', start: at(12), kind: 'fact', draw: S.s12},
	{id: 'S13 2026 Barcelona', start: at(13), kind: 'fact', draw: S.s13},
	{id: 'S14 2026 so far / line', start: at(14), kind: 'fact', draw: S.s14},
	{id: 'S15 finale I', start: at(15), kind: 'imagined', draw: S.s15},
	{id: 'S16 finale II', start: at(16), kind: 'imagined', draw: S.s16},
];

// Imagined content begins at bar 14 beat 3; every frame from here carries the IMAGINED tag.
export const IMAGINED_FROM = at(14, 3);

const TITLES: [number, number][] = [[at(3, 3), 1], [at(6), 2], [at(6, 3), 3], [at(7, 3), 4], [at(8), 5], [at(8, 3), 6], [at(9), 7]];
const HITS: [number, number][] = [[at(2), 3], [at(3, 3), 3], [at(9), 5], [at(13), 4], [at(14, 2), 3], [at(16), 4], [at(16, 2), 4]];

const tmpA = new FB();
const tmpB = new FB();

export const sceneAt = (f: number) => {
	let s = SCENES[0];
	for (const sc of SCENES) if (f >= sc.start) s = sc;
	return s;
};

export const renderFrame = (fb: FB, f: number, A: Assets) => {
	f = Math.max(0, Math.min(FRAMES - 1, f));
	fb.clear(C('#000000'));
	sceneAt(f).draw({fb, A, f, tmpA, tmpB});
	if (f >= at(3) && f < at(14)) {
		let n = 0, pop = -100;
		for (const [fr, c] of TITLES) if (f >= fr) { n = c; pop = fr; }
		titleCounter(fb, f, n, pop);
	}
	let dx = 0, dy = 0;
	for (const [h, a] of HITS) {
		const [x, y] = shake(f, h, a);
		dx += x;
		dy += y;
	}
	applyShake(fb, dx, dy);
};
