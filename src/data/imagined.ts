// IMAGINED layer. Nothing here is a fact. These items may only be drawn inside
// withImagined(), which always stamps the IMAGINED tag on the frame.
// No words, quotes or announcements are attributed to Lewis Hamilton.
export type Imagined = {kind: 'imagined'; text: string; note: string};

export const FINALE_CARD: Imagined = {
	kind: 'imagined',
	text: 'WHAT IF… RWANDA 2030',
	note: 'Imagined scenario. Real context: F1 agreed a 10-year deal (13 Oct 2026) for an African Grand Prix in Rwanda from the early 2030s; no date exists and nothing involves Hamilton.',
};
