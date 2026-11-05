// Fact/imagined guard: run with `npm run check`.
import {readFileSync} from 'node:fs';
const seasons = readFileSync('src/data/seasons.ts', 'utf8');
const records = readFileSync('src/data/records.ts', 'utf8');
const film = readFileSync('src/scenes/film.ts', 'utf8');
const imagined = readFileSync('src/data/imagined.ts', 'utf8');
const fail = [];
const rows = [...seasons.matchAll(/S\(\{year: (\d{4}), team: '(\w+)'.*?position: (\d+), wins: (\d+), podiums: (\d+), poles: (\d+)(?:, title: (\d))?/g)].map((r) => ({
	year: +r[1], team: r[2], pos: +r[3], wins: +r[4], podiums: +r[5], poles: +r[6], title: r[7] ? +r[7] : 0,
}));
if (rows.length !== 20) fail.push(`expected 20 seasons, found ${rows.length}`);
const tot = (k, pred = () => true) => rows.filter(pred).reduce((n, r) => n + r[k], 0);
const wins = tot('wins'), pods = tot('podiums'), poles = tot('poles');
const titles = rows.filter((r) => r.pos === 1);
if (wins !== 106) fail.push(`wins ${wins} != 106`);
if (pods !== 209) fail.push(`podiums ${pods} != 209`);
if (poles !== 105) fail.push(`poles ${poles} != 105`);
if (titles.length !== 7) fail.push(`titles ${titles.length} != 7`);
titles.forEach((r, i) => { if (r.title !== i + 1) fail.push(`${r.year} should be title ${i + 1}`); });
const champYears = titles.map((r) => r.year).join(',');
if (champYears !== '2008,2014,2015,2017,2018,2019,2020') fail.push(`title years ${champYears}`);
if (tot('poles', (r) => r.team === 'mclaren') !== 26) fail.push('McLaren poles != 26');
if (tot('poles', (r) => r.team === 'mercedes') !== 78) fail.push('Mercedes poles != 78');
if (tot('wins', (r) => r.team === 'mercedes') !== 84) fail.push('Mercedes wins != 84');
if (!seasons.includes("position: 'P3*', footnote: '*AS OF MEXICAN GP', points: 259, wins: 1, podiums: 7")) fail.push('2026 standing text changed');
const rec = [...records.matchAll(/value: (\d+),.*?kind: '(\w+)'/g)].map((r) => [+r[1], r[2]]);
const want = [[106, 'outright'], [105, 'outright'], [209, 'outright'], [7, 'joint'], [84, 'outright'], [15, 'joint'], [9, 'outright']];
if (JSON.stringify(rec) !== JSON.stringify(want)) fail.push(`records changed: ${JSON.stringify(rec)}`);
if (!imagined.includes("text: 'WHAT IF… RWANDA 2030'")) fail.push('finale card text changed');
const fin = film.slice(film.indexOf("id: 'finale'"));
if (!fin.includes('imaginedTag(fb, f, s + im)')) fail.push('finale does not stamp the IMAGINED tag');
console.log(`seasons ${rows.length} · wins ${wins} · podiums ${pods} · poles ${poles} · titles ${titles.length} (${champYears})`);
if (fail.length) {
	console.error('FACT CHECK FAILED:\n- ' + fail.join('\n- '));
	process.exit(1);
}
console.log('fact check passed');
