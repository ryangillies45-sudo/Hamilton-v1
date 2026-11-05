// Shared scene building blocks: venue backdrops and the tracking shot.
import {Assets} from '../engine/assets';
import {drawCar, CarOpts} from '../engine/car';
import {C, FB} from '../engine/fb';
import {clouds, fence, floodlights, grandstand, hills, ridge, sky, sun, track, trees} from '../engine/env';
import {rain, speedLines, spray} from '../engine/fx';

export const GROUND = 200; // screen row where tyres touch the track
export const TRACK_TOP = 150;
export const TRACK_BOT = 232;

export type Venue = 'sunny' | 'wet' | 'night' | 'desert' | 'sunset' | 'dusk' | 'barcelona' | 'overcast' | 'dawn' | 'day2';

export const venue = (fb: FB, v: Venue, off: number, f: number) => {
	switch (v) {
		case 'sunny':
		case 'day2':
			sky(fb, 'day', 0, 120);
			clouds(fb, off * 0.04, 18, {seed: v === 'sunny' ? 21 : 44, count: 7});
			ridge(fb, off * 0.08, 112, 26, '#7ea6c4', {seed: 3, top: '#9cbcd6'});
			trees(fb, off * 0.3, 112, {seed: 8});
			grandstand(fb, off * 0.5, 96, f);
			fence(fb, off * 0.9, 132, 150);
			track(fb, off, TRACK_TOP, TRACK_BOT, {grass: '#3f8a3a'});
			break;
		case 'wet':
			sky(fb, 'wetDusk', 0, 120);
			clouds(fb, off * 0.05, 8, {seed: 5, count: 9, light: '#5b4a6e', shade: '#3b3352'});
			ridge(fb, off * 0.08, 112, 22, '#2a2440', {seed: 6});
			grandstand(fb, off * 0.5, 96, f, {dark: true, roof: '#8a8fa6', boards: ['#26304a', '#3a2d48']});
			fence(fb, off * 0.9, 132, 150, {color: '#6d7590'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {wet: true, asphalt: ['#2c2f3a', '#363a46', '#262934'], grass: '#23402c'});
			break;
		case 'night':
			sky(fb, 'night', 0, 130);
			ridge(fb, off * 0.06, 110, 18, '#0f1426', {seed: 12});
			floodlights(fb, off, 52);
			grandstand(fb, off * 0.5, 96, f, {dark: true, roof: '#5a6280', boards: ['#1b2440', '#00a19b', '#2b2f4a']});
			fence(fb, off * 0.9, 132, 150, {color: '#566079'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {night: true, asphalt: ['#262932', '#2e323c', '#20232a'], grass: '#14261a'});
			break;
		case 'desert':
			sky(fb, 'desert', 0, 122);
			sun(fb, 380, 92, 13, '#ffe6a8', '#ffb86b');
			ridge(fb, off * 0.06, 116, 16, '#b0705a', {seed: 31, top: '#d08a66', freq: 0.008});
			grandstand(fb, off * 0.5, 96, f, {roof: '#f0e6d8', boards: ['#3b2a4a', '#00a19b', '#ffffff']});
			fence(fb, off * 0.9, 132, 150, {color: '#a8a0a8'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {grass: '#c9a26a'});
			break;
		case 'sunset':
			sky(fb, 'sunset', 0, 122);
			sun(fb, 120, 100, 16, '#ffe1a0', '#ff9a5c');
			ridge(fb, off * 0.06, 114, 18, '#3a2448', {seed: 19});
			trees(fb, off * 0.3, 114, {seed: 4, dark: '#1f1830', mid: '#2c2240', light: '#3d2d52'});
			grandstand(fb, off * 0.5, 96, f, {dark: true, roof: '#c7a0a6', boards: ['#2a1e3a', '#00a19b']});
			fence(fb, off * 0.9, 132, 150, {color: '#8a7890'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#3a3440', '#443e4a', '#322c38'], grass: '#2e3a2a'});
			break;
		case 'dusk':
			sky(fb, 'dusk', 0, 122);
			ridge(fb, off * 0.06, 114, 18, '#20203a', {seed: 23});
			grandstand(fb, off * 0.5, 96, f, {dark: true, roof: '#7a7a96', boards: ['#1b2033', '#00a19b']});
			fence(fb, off * 0.9, 132, 150, {color: '#5f6680'});
			track(fb, off, TRACK_TOP, TRACK_BOT, {asphalt: ['#2c2e38', '#353844', '#25272f'], grass: '#1f2e24'});
			break;
		case 'barcelona':
			sky(fb, 'day', 0, 120);
			clouds(fb, off * 0.03, 14, {seed: 66, count: 5});
			ridge(fb, off * 0.05, 104, 40, '#8a93a8', {seed: 41, top: '#a9b1c2', freq: 0.02});
			hills(fb, off * 0.15, 118, 14, ['#a7b56a', '#8c9a52', '#6f7d43'], {seed: 9});
			grandstand(fb, off * 0.5, 96, f, {boards: ['#c8102e', '#ffd200', '#ffffff', '#1f2a44']});
			fence(fb, off * 0.9, 132, 150);
			track(fb, off, TRACK_TOP, TRACK_BOT, {grass: '#5c8a3a'});
			break;
		case 'overcast':
			sky(fb, 'overcast', 0, 120);
			clouds(fb, 0, 6, {seed: 2, count: 8, light: '#8a92a4', shade: '#6f7789'});
			ridge(fb, 0, 112, 20, '#4e5868', {seed: 3});
			grandstand(fb, off * 0.5, 96, f, {roof: '#b9c0cc'});
			fence(fb, off * 0.9, 132, 150);
			track(fb, off, TRACK_TOP, TRACK_BOT, {grass: '#35663a'});
			break;
		case 'dawn':
			break;
	}
};

export type ShotOpts = CarOpts & {venue: Venue; off: number; carX: number; lines?: number; wet?: boolean};

/** Side-on tracking shot: backdrop, car, speed lines, rain/spray. */
export const shot = (fb: FB, A: Assets, f: number, key: string, o: ShotOpts) => {
	venue(fb, o.venue, o.off, f);
	if (o.lines) speedLines(fb, f, {count: o.lines, speed: 16, y0: TRACK_TOP + 4, y1: TRACK_BOT - 6, color: '#8a8e98', len: 36, seed: 3});
	const r = drawCar(fb, A, key, o.carX, GROUND, f, o);
	if (o.wet) {
		spray(fb, f, r.x + r.w - 36, GROUND - 2);
		rain(fb, f, {count: 160, color: '#8e9cc0'});
	}
	if (o.lines && o.lines > 20) speedLines(fb, f, {count: Math.floor(o.lines / 3), speed: 22, y0: 20, y1: 140, color: '#ffffff', len: 24, seed: 9});
	return r;
};

export const black = (fb: FB) => fb.clear(C('#000000'));
