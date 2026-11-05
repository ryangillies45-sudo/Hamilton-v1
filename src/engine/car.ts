// Car rig: body + 4-frame wheel spin + suspension bob + exhaust shimmer.
import {Assets, CARS} from './assets';
import {C, FB, bayer} from './fb';

export type CarOpts = {
	spin?: number; // wheel frames advanced per film frame (0 = parked)
	bob?: number; // 0/1 body lift this frame
	open?: boolean; // SF-26 active-aero "straight mode"
	rim?: number; // rim-light colour for dark liveries
	light?: boolean; // rain light on
	shadow?: boolean;
	color?: number; // draw as a flat silhouette
	exhaust?: boolean;
};

/** Draw a car with its nose pointing left. (x, ground) = sprite left edge and the screen row the tyres touch. */
export const drawCar = (fb: FB, A: Assets, key: string, x: number, ground: number, f: number, o: CarOpts = {}) => {
	const m = CARS[key];
	const y = Math.round(ground - m.gy);
	x = Math.round(x);
	if (o.shadow !== false) {
		const c = C('#07080b');
		const x0 = x + m.wheels[0][0] - m.r - 4, x1 = x + m.wheels[1][0] + m.r + 6;
		for (let yy = 0; yy < 3; yy++)
			for (let xx = x0 + yy * 2; xx < x1 - yy * 2; xx++) if (bayer(xx, ground + yy) < 0.7 - yy * 0.22) fb.pset(xx, ground + yy, c);
	}
	const bob = o.bob ?? 0;
	const body = A[`cars/${key}${o.open && m.open ? '_open' : ''}`];
	fb.blit(body, x, y - bob, {color: o.color, rim: o.rim});
	const spin = o.spin ?? 0;
	const idx = ((4 - (Math.floor(f * spin) % 4)) % 4 + 4) % 4; // rotate as if rolling left
	for (const [wx, wy] of m.wheels) {
		const w = A[`wheels/${key}_${spin ? idx : 0}`];
		fb.blit(w, x + wx - m.r, y + wy - m.r, {color: o.color});
	}
	if (o.light && !o.color) {
		const [lx, ly] = m.light;
		fb.rect(x + lx, y + ly - 1 - bob, 2, 2, C('#ff2a2a'));
		fb.pset(x + lx + 2, y + ly - 1 - bob, C('#ff8a7a'));
	}
	if (o.exhaust && !o.color) {
		const [ex, ey] = m.exhaust;
		const g = [C('#c9ccd4'), C('#8d929c'), C('#5c616b')];
		for (let i = 0; i < 6; i++) {
			const px = x + ex + i * 2 + ((f + i) % 2);
			const py = y + ey - bob + (((f >> 1) + i) % 3) - 1;
			if ((f + i * 3) % 4 !== 0) fb.pset(px, py, g[Math.min(2, i >> 1)]);
		}
	}
	return {x, y: y - bob, w: m.w, h: m.h};
};
