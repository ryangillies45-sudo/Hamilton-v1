// All-time records as of the 2026 Mexico City Grand Prix. Each item was
// checked against Wikipedia "List of Formula One driver records" and "List of
// career achievements by Lewis Hamilton" (both stating "as of the 2026 Mexico
// City Grand Prix") and Formula1.com. `kind` separates outright from joint.
export type Record = {
	value: number;
	lines: string[]; // big label lines (size 4)
	sub: string[]; // supporting lines (size 2)
	kind: 'outright' | 'joint';
	source: string;
};

const D = 'https://en.wikipedia.org/wiki/List_of_Formula_One_driver_records';
const C = 'https://en.wikipedia.org/wiki/List_of_career_achievements_by_Lewis_Hamilton';

export const RECORDS: Record[] = [
	{value: 106, lines: ['GRAND PRIX', 'WINS'], sub: ['MOST IN F1 HISTORY', 'NEXT: SCHUMACHER 91'], kind: 'outright', source: D},
	{value: 105, lines: ['POLE', 'POSITIONS'], sub: ['MOST IN F1 HISTORY', 'NEXT: SCHUMACHER 68'], kind: 'outright', source: D},
	{value: 209, lines: ['PODIUM', 'FINISHES'], sub: ['MOST IN F1 HISTORY', 'RECORD SINCE 2020'], kind: 'outright', source: C},
	{value: 7, lines: ['WORLD', 'TITLES'], sub: ['JOINT MOST IN F1 HISTORY', 'TIED WITH SCHUMACHER'], kind: 'joint', source: C},
	{value: 84, lines: ['WINS WITH', 'ONE TEAM'], sub: ['MERCEDES 2013-2024', 'NEXT: VERSTAPPEN 74'], kind: 'outright', source: D},
	{value: 15, lines: ['WINNING', 'SEASONS'], sub: ['IN A ROW: 2007-2021', 'TIED WITH SCHUMACHER'], kind: 'joint', source: D},
	{value: 9, lines: ['BRITISH GP', 'WINS'], sub: ['MOST AT ONE GRAND PRIX', 'NEXT: SCHUMACHER 8'], kind: 'outright', source: D},
];
