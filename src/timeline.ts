// Per-frame compositor for the 70-second vertical film.
import {FRAMES} from './config/video';
import {Assets} from './engine/assets';
import {C, FB, bayer} from './engine/fb';
import {applyShake, shake} from './engine/fx';
import {Ctx, IMAGINED_FROM, SEGMENTS} from './scenes/film';

export {IMAGINED_FROM, SEGMENTS};

const tmpA = new FB();
const tmpB = new FB();

export const segmentAt = (f: number) => {
	let s = SEGMENTS[0];
	for (const sg of SEGMENTS) if (f >= sg.start) s = sg;
	return s;
};

// One deliberate camera shake: the seventh world title.
const T7 = SEGMENTS.find((s) => s.id === 'y2020')!;

export const renderFrame = (fb: FB, f: number, A: Assets) => {
	f = Math.max(0, Math.min(FRAMES - 1, f));
	fb.clear(C('#000000'));
	const sg = segmentAt(f);
	const ctx: Ctx = {fb, A, f, s: sg.start, e: sg.end, tmpA, tmpB};
	sg.draw(ctx);
	// soft dark fade under TikTok's caption area during the seasons
	if (sg.id !== 'finale' && sg.id !== 'records') {
		const ink = C('#05060a');
		for (let y = 520; y < fb.h; y++) {
			const k = ((y - 520) / 120) * 0.75;
			for (let x = 0; x < fb.w; x++) if (bayer(x, y) < k) fb.px[y * fb.w + x] = ink;
		}
	}
	const [dx, dy] = shake(f, T7.start + Math.round(3 * (1800 / 126)), 2, 8);
	applyShake(fb, dx, dy);
};
