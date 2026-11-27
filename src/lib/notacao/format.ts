import type { Separator } from "./model";

/** Canonical keys of the text format, as the serializer writes them. */
export const KEYS = {
	title: "título",
	composer: "composição",
	transcriber: "digitação",
	bpm: "bpm",
	meter: "compasso",
	swing: "suingue",
	parts: "partes",
	groups: "grupos",
	note: "obs",
	sequence: "sequência",
	part: "parte",
} as const;

export type FormatKey = keyof typeof KEYS;

/** Lowercase, no accents, single spaces: how names and keys are compared. */
export function fold(text: string): string {
	return text
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

const KEY_BY_FOLD = new Map<string, FormatKey>(
	(Object.keys(KEYS) as FormatKey[]).map((key) => [fold(KEYS[key]), key]),
);

export function keyFromText(text: string): FormatKey | undefined {
	return KEY_BY_FOLD.get(fold(text));
}

export const SEPARATOR_TEXT: Record<Separator | "space", string> = {
	space: " ",
	hyphen: "-",
	dash: " – ",
	"hyphen-space": "- ",
};

const DENOMINATORS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];

/** Beats as the shortest exact fraction ("2", "1/2", "3/4"). */
export function formatBeats(value: number): string {
	for (const denominator of DENOMINATORS) {
		const numerator = value * denominator;
		if (Math.abs(numerator - Math.round(numerator)) < 1e-9) {
			return denominator === 1
				? String(Math.round(numerator))
				: `${Math.round(numerator)}/${denominator}`;
		}
	}
	return String(value);
}

/** Accepts "2", "0.5" and "1/2". Returns undefined when not a positive number. */
export function parseBeats(text: string): number | undefined {
	const match = /^(\d+(?:\.\d+)?)(?:\/(\d+))?$/.exec(text.trim());
	if (!match) return undefined;
	const value = Number(match[1]) / (match[2] ? Number(match[2]) : 1);
	return Number.isFinite(value) && value > 0 ? value : undefined;
}
