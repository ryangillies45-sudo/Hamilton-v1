// Fact/imagined guard: run with `npm run check`.
// - every season record has a source and a status
// - totals match the production plan fact sheet (106 wins, 209 podiums, 7 titles)
// - the 2026 standing reads exactly "P3*" / "*AS OF MEXICAN GP"
// - every imagined scene stamps the IMAGINED tag
import {readFileSync} from 'node:fs';

const seasons = readFileSync('src/data/seasons.ts', 'utf8');
const scenes = readFileSync('src/scenes/scenes.ts', 'utf8');
const imagined = readFileSync('src/data/imagined.ts', 'utf8');
const fail = [];
const rows = [...seasons.matchAll(/\{year: (\d{4}),.*?wins: (\d+), podiums: (\d+)(, title: (\d))?.*?sources: \[(.*?)\], status: '(\w+)'\}/g)];
if (rows.length !== 20) fail.push(`expected 20 seasons, found ${rows.length}`);
const years = rows.map((r) => +r[1]);
for (let y = 2007; y <= 2026; y++) if (!years.includes(y)) fail.push(`missing season ${y}`);
const wins = rows.reduce((n, r) => n + +r[2], 0);
const pods = rows.reduce((n, r) => n + +r[3], 0);
const titles = rows.filter((r) => r[5]).length;
if (wins !== 106) fail.push(`wins total ${wins} != 106`);
if (pods !== 209) fail.push(`podium total ${pods} != 209`);
if (titles !== 7) fail.push(`titles ${titles} != 7`);
for (const r of rows) if (!r[6].trim()) fail.push(`season ${r[1]} has no source`);
if (!seasons.includes("position: 'P3*', footnote: '*AS OF MEXICAN GP'")) fail.push('2026 standing text changed');
if (!imagined.includes("text: 'WHAT IF… RWANDA 2030'")) fail.push('finale card text changed');
for (const fn of ['s15', 's16']) {
	const body = scenes.slice(scenes.indexOf(`export const ${fn} =`), scenes.indexOf('};', scenes.indexOf(`export const ${fn} =`)));
	if (!body.includes('imaginedTag(')) fail.push(`${fn} (imagined) does not draw the IMAGINED tag`);
}
const s14 = scenes.slice(scenes.indexOf('export const s14 ='));
if (!s14.slice(0, s14.indexOf('};')).includes('imaginedTag(')) fail.push('s14 crossover lacks the IMAGINED tag');
if (/["“](I |I'm|We )/i.test(imagined)) fail.push('imagined.ts appears to contain a quote');
console.log(`seasons ${rows.length} · wins ${wins} · podiums ${pods} · titles ${titles}`);
if (fail.length) {
	console.error('FACT CHECK FAILED:\n- ' + fail.join('\n- '));
	process.exit(1);
}
console.log('fact check passed');
