// FACT layer. Every number and caption shown for a real season comes from
// these records. Sources: Wikipedia "List of career achievements by Lewis
// Hamilton" and "List of Formula One driver records" (both "as of the 2026
// Mexico City Grand Prix"), RacingNews365 statistics, Formula1.com results.
export type Team = 'mclaren' | 'mercedes' | 'ferrari';

export type Season = {
	year: number;
	team: Team;
	car: string; // official chassis name
	short: string; // on-screen name
	position: number; // championship position (1 = World Champion)
	wins: number;
	podiums: number;
	poles: number;
	title?: number; // championship number if champion
	note?: string; // short factual line shown in the stage area
	points?: number; // shown for 2026 only
	sources: string[];
};

const ACH = 'https://en.wikipedia.org/wiki/List_of_career_achievements_by_Lewis_Hamilton';
const RN365 = 'https://racingnews365.com (Lewis Hamilton statistics)';
const F1 = 'https://www.formula1.com/en/results/2026/drivers/LEWHAM01/lewis-hamilton';

const S = (o: Omit<Season, 'sources'>, extra: string[] = []): Season => ({...o, sources: [ACH, RN365, ...extra]});

export const SEASONS: Season[] = [
	S({year: 2007, team: 'mclaren', car: 'McLaren MP4-22', short: 'MP4-22', position: 2, wins: 4, podiums: 12, poles: 6, note: 'DEBUT · MISSED TITLE BY 1 POINT'}),
	S({year: 2008, team: 'mclaren', car: 'McLaren MP4-23', short: 'MP4-23', position: 1, wins: 5, podiums: 10, poles: 7, title: 1}),
	S({year: 2009, team: 'mclaren', car: 'McLaren MP4-24', short: 'MP4-24', position: 5, wins: 2, podiums: 5, poles: 4}),
	S({year: 2010, team: 'mclaren', car: 'McLaren MP4-25', short: 'MP4-25', position: 4, wins: 3, podiums: 9, poles: 1}),
	S({year: 2011, team: 'mclaren', car: 'McLaren MP4-26', short: 'MP4-26', position: 5, wins: 3, podiums: 6, poles: 1}),
	S({year: 2012, team: 'mclaren', car: 'McLaren MP4-27', short: 'MP4-27', position: 4, wins: 4, podiums: 7, poles: 7}),
	S({year: 2013, team: 'mercedes', car: 'Mercedes F1 W04', short: 'W04', position: 4, wins: 1, podiums: 5, poles: 5, note: 'FIRST MERCEDES WIN: HUNGARY'}),
	S({year: 2014, team: 'mercedes', car: 'Mercedes F1 W05 Hybrid', short: 'W05 HYBRID', position: 1, wins: 11, podiums: 16, poles: 7, title: 2}),
	S({year: 2015, team: 'mercedes', car: 'Mercedes F1 W06 Hybrid', short: 'W06 HYBRID', position: 1, wins: 10, podiums: 17, poles: 11, title: 3}),
	S({year: 2016, team: 'mercedes', car: 'Mercedes F1 W07 Hybrid', short: 'W07 HYBRID', position: 2, wins: 10, podiums: 17, poles: 12, note: 'RUNNER-UP BY 5 POINTS'}),
	S({year: 2017, team: 'mercedes', car: 'Mercedes-AMG F1 W08 EQ Power+', short: 'W08', position: 1, wins: 9, podiums: 13, poles: 11, title: 4}),
	S({year: 2018, team: 'mercedes', car: 'Mercedes-AMG F1 W09 EQ Power+', short: 'W09', position: 1, wins: 11, podiums: 17, poles: 11, title: 5}),
	S({year: 2019, team: 'mercedes', car: 'Mercedes-AMG F1 W10 EQ Power+', short: 'W10', position: 1, wins: 11, podiums: 17, poles: 5, title: 6}),
	S({year: 2020, team: 'mercedes', car: 'Mercedes-AMG F1 W11 EQ Performance', short: 'W11', position: 1, wins: 11, podiums: 14, poles: 10, title: 7}),
	S({year: 2021, team: 'mercedes', car: 'Mercedes-AMG F1 W12 E Performance', short: 'W12', position: 2, wins: 8, podiums: 17, poles: 5}),
	S({year: 2022, team: 'mercedes', car: 'Mercedes-AMG F1 W13 E Performance', short: 'W13', position: 6, wins: 0, podiums: 9, poles: 0}),
	S({year: 2023, team: 'mercedes', car: 'Mercedes-AMG F1 W14 E Performance', short: 'W14', position: 3, wins: 0, podiums: 6, poles: 1}),
	S({year: 2024, team: 'mercedes', car: 'Mercedes-AMG F1 W15 E Performance', short: 'W15', position: 7, wins: 2, podiums: 5, poles: 0, note: 'LAST MERCEDES SEASON'}),
	S({year: 2025, team: 'ferrari', car: 'Ferrari SF-25', short: 'SF-25', position: 6, wins: 0, podiums: 0, poles: 0, note: 'FERRARI DEBUT · SPRINT WIN, CHINA'}),
	S({year: 2026, team: 'ferrari', car: 'Ferrari SF-26', short: 'SF-26', position: 3, wins: 1, podiums: 7, poles: 1, points: 259, note: 'FIRST FERRARI WIN: BARCELONA'}, [F1, 'https://www.formula1.com/en/results/2026/drivers']),
];

export const season = (y: number): Season => {
	const s = SEASONS.find((x) => x.year === y);
	if (!s) throw new Error(`no season ${y}`);
	return s;
};

export const TEAM_NAME: Record<Team, string> = {mclaren: 'MCLAREN', mercedes: 'MERCEDES', ferrari: 'FERRARI'};

const sum = (a: number, b: number, k: 'wins' | 'poles' | 'podiums') =>
	SEASONS.filter((s) => s.year >= a && s.year <= b).reduce((n, s) => n + s[k], 0);
export const MCLAREN_0912_WINS = sum(2009, 2012, 'wins'); // 12
export const MERCEDES_WINS = sum(2013, 2024, 'wins'); // 84
export const MERCEDES_POLES = sum(2013, 2024, 'poles'); // 78

// 2026 standing, as directed: P3* with the footnote directly underneath.
export const STANDING_2026 = {position: 'P3*', footnote: '*AS OF MEXICAN GP', points: 259, wins: 1, podiums: 7, poles: 1};
