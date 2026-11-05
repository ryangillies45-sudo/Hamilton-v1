// FACT layer. Every on-screen caption about a real season is built from these
// records. Sources: docs/production-plan.md sections 11 and 16.
export type Team = 'mclaren' | 'mercedes' | 'ferrari';

export type Season = {
	year: number;
	team: Team;
	car: string;
	position: string; // championship result
	wins: number;
	podiums: number;
	title?: number; // title number if champion
	caption: string;
	sources: string[];
	status: 'verified' | 'derived';
};

const RN365 = 'https://racingnews365.com (Lewis Hamilton statistics)';
const F1RES = 'https://www.formula1.com/en/results/2026/drivers/LEWHAM01/lewis-hamilton';

export const SEASONS: Season[] = [
	{year: 2007, team: 'mclaren', car: 'McLaren MP4-22', position: 'P2', wins: 4, podiums: 12, caption: 'ROOKIE · P2 · 4 WINS', sources: [RN365], status: 'verified'},
	{year: 2008, team: 'mclaren', car: 'McLaren MP4-23', position: 'Champion', wins: 5, podiums: 10, title: 1, caption: 'WORLD CHAMPION', sources: [RN365], status: 'verified'},
	{year: 2009, team: 'mclaren', car: 'McLaren MP4-24', position: 'P5', wins: 2, podiums: 5, caption: '2 WINS', sources: [RN365], status: 'verified'},
	{year: 2010, team: 'mclaren', car: 'McLaren MP4-25', position: 'P4', wins: 3, podiums: 9, caption: '3 WINS', sources: [RN365], status: 'verified'},
	{year: 2011, team: 'mclaren', car: 'McLaren MP4-26', position: 'P5', wins: 3, podiums: 6, caption: '3 WINS', sources: [RN365], status: 'verified'},
	{year: 2012, team: 'mclaren', car: 'McLaren MP4-27', position: 'P4', wins: 4, podiums: 7, caption: '4 WINS', sources: [RN365], status: 'verified'},
	{year: 2013, team: 'mercedes', car: 'Mercedes F1 W04', position: 'P4', wins: 1, podiums: 5, caption: 'FIRST MERCEDES WIN · HUNGARY', sources: [RN365], status: 'verified'},
	{year: 2014, team: 'mercedes', car: 'Mercedes F1 W05 Hybrid', position: 'Champion', wins: 11, podiums: 16, title: 2, caption: 'CHAMPION · TITLE 2', sources: [RN365], status: 'verified'},
	{year: 2015, team: 'mercedes', car: 'Mercedes F1 W06 Hybrid', position: 'Champion', wins: 10, podiums: 17, title: 3, caption: 'CHAMPION · TITLE 3', sources: [RN365], status: 'verified'},
	{year: 2016, team: 'mercedes', car: 'Mercedes F1 W07 Hybrid', position: 'P2', wins: 10, podiums: 17, caption: 'P2 · 10 WINS', sources: [RN365], status: 'verified'},
	{year: 2017, team: 'mercedes', car: 'Mercedes-AMG F1 W08 EQ Power+', position: 'Champion', wins: 9, podiums: 13, title: 4, caption: 'CHAMPION · TITLE 4', sources: [RN365], status: 'verified'},
	{year: 2018, team: 'mercedes', car: 'Mercedes-AMG F1 W09 EQ Power+', position: 'Champion', wins: 11, podiums: 17, title: 5, caption: 'CHAMPION · TITLE 5', sources: [RN365], status: 'verified'},
	{year: 2019, team: 'mercedes', car: 'Mercedes-AMG F1 W10 EQ Power+', position: 'Champion', wins: 11, podiums: 17, title: 6, caption: 'CHAMPION · TITLE 6', sources: [RN365], status: 'verified'},
	{year: 2020, team: 'mercedes', car: 'Mercedes-AMG F1 W11 EQ Performance', position: 'Champion', wins: 11, podiums: 14, title: 7, caption: 'CHAMPION · TITLE 7', sources: [RN365], status: 'verified'},
	{year: 2021, team: 'mercedes', car: 'Mercedes-AMG F1 W12 E Performance', position: 'P2', wins: 8, podiums: 17, caption: 'P2 · 8 WINS', sources: [RN365], status: 'verified'},
	{year: 2022, team: 'mercedes', car: 'Mercedes-AMG F1 W13 E Performance', position: 'P6', wins: 0, podiums: 9, caption: 'NO WINS', sources: [RN365], status: 'verified'},
	{year: 2023, team: 'mercedes', car: 'Mercedes-AMG F1 W14 E Performance', position: 'P3', wins: 0, podiums: 6, caption: 'NO WINS', sources: [RN365], status: 'verified'},
	{year: 2024, team: 'mercedes', car: 'Mercedes-AMG F1 W15 E Performance', position: 'P7', wins: 2, podiums: 5, caption: '2 WINS · SILVERSTONE · SPA', sources: [RN365], status: 'verified'},
	{year: 2025, team: 'ferrari', car: 'Ferrari SF-25', position: 'P6', wins: 0, podiums: 0, caption: 'P6 · SPRINT WIN · CHINA', sources: [RN365, 'https://www.formula1.com (2025 season review)'], status: 'verified'},
	{year: 2026, team: 'ferrari', car: 'Ferrari SF-26', position: 'P3*', wins: 1, podiums: 7, caption: 'FIRST FERRARI GP WIN · BARCELONA · WIN 106', sources: [F1RES, 'https://www.formula1.com/en/results/2026/drivers'], status: 'verified'},
];

export const season = (y: number): Season => {
	const s = SEASONS.find((x) => x.year === y);
	if (!s) throw new Error(`no season ${y}`);
	return s;
};

// Multi-season captions (sums derived from the records above).
const sum = (a: number, b: number) =>
	SEASONS.filter((s) => s.year >= a && s.year <= b).reduce((n, s) => n + s.wins, 0);
export const FLIPBOOK_CAPTION = `2009-2012 · ${sum(2009, 2012)} WINS`;
export const MERCEDES_CAPTION = `MERCEDES · 12 SEASONS · ${sum(2013, 2024)} WINS · 6 TITLES`;

// 2026 standing as directed: shown as P3* with the footnote below it.
export const STANDING_2026 = {position: 'P3*', footnote: '*AS OF MEXICAN GP', podiums: 7, wins: 1};
