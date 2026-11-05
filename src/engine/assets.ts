// Loads compiled PNG sprites (public/sprites) into pixel arrays.
import {staticFile} from 'remotion';
import cars from '../data/generated/cars.json';
import {Sprite} from './fb';

export type CarMeta = {
	key: string; name: string; team: string; w: number; h: number; gy: number; r: number;
	wheels: [number, number][]; exhaust: [number, number]; light: [number, number]; number: string; open?: boolean;
};
export const CARS = cars as unknown as Record<string, CarMeta>;

export type Assets = Record<string, Sprite>;

const names = (): string[] => {
	const n: string[] = [];
	for (const k of Object.keys(CARS)) {
		n.push(`cars/${k}`);
		for (let f = 0; f < 4; f++) n.push(`wheels/${k}_${f}`);
	}
	n.push('cars/2026_open');
	for (let y = 2007; y <= 2026; y++) n.push(`hamilton/card_${y}`);
	for (const s of ['', '_blink', '_glint1', '_glint2', '_dawn', '_dawn_blink', '_dawn_glint']) n.push(`hamilton/hero_2026${s}`);
	return n;
};

const loadOne = (name: string): Promise<Sprite> =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const c = document.createElement('canvas');
			c.width = img.width;
			c.height = img.height;
			const ctx = c.getContext('2d')!;
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, 0, 0);
			const d = ctx.getImageData(0, 0, img.width, img.height);
			resolve({w: img.width, h: img.height, px: new Uint32Array(d.data.buffer.slice(0))});
		};
		img.onerror = () => reject(new Error(`sprite failed: ${name}`));
		img.src = staticFile(`sprites/${name}.png`);
	});

let promise: Promise<Assets> | null = null;
export const loadAssets = (): Promise<Assets> => {
	if (!promise)
		promise = Promise.all(names().map(async (n) => [n, await loadOne(n)] as const)).then((e) => Object.fromEntries(e));
	return promise;
};
