/**
 * Advance widths of Helvetica and Helvetica-Bold (Adobe core font metrics),
 * in 1/1000 of the font size, for the characters 0x20 to 0x7E. The oblique
 * faces share these widths. Arial and Liberation Sans are metric-compatible,
 * so text measured here fits the PDF and the on-screen SVG alike.
 */
const REGULAR = [
	278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
	278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
	584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556,
	833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
	278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222,
	500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500,
	500, 334, 260, 334, 584,
];

const BOLD = [
	278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278,
	278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584,
	584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611,
	833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333,
	278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278,
	556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556,
	500, 389, 280, 389, 584,
];

/** Characters outside ASCII that the sheet prints: [regular, bold]. */
const EXTRA: Record<string, [number, number]> = {
	"–": [556, 556],
	"—": [1000, 1000],
	"•": [350, 350],
	"·": [278, 278],
	"×": [584, 584],
	"…": [1000, 1000],
	"°": [400, 400],
	ª: [370, 370],
	º: [365, 365],
	"‘": [222, 278],
	"’": [222, 278],
	"“": [333, 500],
	"”": [333, 500],
	"«": [556, 556],
	"»": [556, 556],
	"¡": [333, 333],
	"¿": [611, 611],
	" ": [278, 278],
};

const FALLBACK = 556;
const WIDE_FALLBACK = 1000;

function charWidth(char: string, bold: boolean): number {
	const table = bold ? BOLD : REGULAR;
	const code = char.codePointAt(0) ?? 0;
	if (code >= 0x20 && code <= 0x7e) return table[code - 0x20];
	const extra = EXTRA[char];
	if (extra) return extra[bold ? 1 : 0];
	// Accented Latin letters are as wide as their base letter.
	const base = char.normalize("NFD")[0];
	const baseCode = base.codePointAt(0) ?? 0;
	if (base !== char && baseCode >= 0x20 && baseCode <= 0x7e) {
		return table[baseCode - 0x20];
	}
	return code >= 0x2e80 ? WIDE_FALLBACK : FALLBACK;
}

/** Width of `text` in points when set in Helvetica at `size`. */
export function measureText(text: string, size: number, bold = false): number {
	let units = 0;
	for (const char of text) units += charWidth(char, bold);
	return (units * size) / 1000;
}
