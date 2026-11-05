// Beat clock: "We Do What We Want - Edit" (Alan Fitzpatrick) at 126 BPM, as
// specified by the director. The track itself is added later in CapCut and is
// never part of this project. All timing in the film is written in bars and
// beats; change BPM or OFFSET here and every scene re-times.
import {FPS} from './video';

export const BPM = 126;
export const OFFSET = 0; // frames before bar 1 beat 1
export const BEAT = (60 / BPM) * FPS; // 14.2857 frames
export const BAR = BEAT * 4; // 57.1429 frames

/** Frame of bar `bar` (1-based), beat `beat` (1-based), plus a fraction of a beat. */
export const at = (bar: number, beat = 1, frac = 0): number =>
	Math.round(OFFSET + ((bar - 1) * 4 + (beat - 1) + frac) * BEAT);

/** Continuous beat position of a frame (0 at bar 1 beat 1). */
export const beatPos = (f: number): number => (f - OFFSET) / BEAT;

/** 1 on the hit frame, decaying to 0 over `len` frames. */
export const pulse = (f: number, hit: number, len = 8): number => {
	const d = f - hit;
	if (d < 0 || d >= len) return 0;
	return 1 - d / len;
};

/** Pulse on every beat inside [from, to). */
export const beatPulse = (f: number, from: number, to: number, len = 6): number => {
	if (f < from || f >= to) return 0;
	const b = Math.floor(beatPos(f));
	const hit = Math.round(OFFSET + b * BEAT);
	return pulse(f, hit, len);
};
