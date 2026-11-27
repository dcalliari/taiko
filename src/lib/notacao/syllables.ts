export type Hand = "right" | "left";
export type Zone = "center" | "rim";

export type SyllableInfo = {
	hand?: Hand;
	zone: Zone;
	/** Played lightly regardless of how it is written (tsu, ku). */
	soft: boolean;
	/** Spoken but not played (su, un). */
	silent: boolean;
	/** Legend text, pt-BR. */
	description: string;
};

const hit = (
	hand: Hand,
	description: string,
	extra: Partial<SyllableInfo> = {},
): SyllableInfo => ({
	hand,
	zone: "center",
	soft: false,
	silent: false,
	description,
	...extra,
});

const LEXICON: Record<string, SyllableInfo> = {
	don: hit("right", "batida cheia no centro, mão direita"),
	kon: hit("left", "batida cheia no centro, mão esquerda"),
	do: hit("right", "batida curta no centro, mão direita"),
	ko: hit("left", "batida curta no centro, mão esquerda"),
	go: hit("left", "batida curta no centro, mão esquerda"),
	ro: hit("left", "batida curta no centro, mão esquerda"),
	tsu: hit("right", "batida leve no centro, mão direita", { soft: true }),
	ku: hit("left", "batida leve no centro, mão esquerda", { soft: true }),
	zu: hit("right", "batida leve e arrastada, mão direita", { soft: true }),
	ka: hit("right", "batida na borda (fuchi), mão direita", { zone: "rim" }),
	ra: hit("left", "batida na borda (fuchi), mão esquerda", { zone: "rim" }),
	ta: hit("left", "batida na borda (fuchi), mão esquerda", { zone: "rim" }),
	ten: hit("right", "batida cheia no shime, mão direita"),
	te: hit("right", "batida curta, mão direita"),
	ke: hit("left", "batida curta, mão esquerda"),
	re: hit("left", "batida curta, mão esquerda"),
	chan: hit("right", "atarigane, batida aberta no centro"),
	chi: hit("right", "atarigane, batida na borda (ida)", { zone: "rim" }),
	ki: hit("left", "atarigane, batida na borda (volta)", { zone: "rim" }),
	su: {
		zone: "center",
		soft: false,
		silent: true,
		description: "pausa falada, não se toca",
	},
	un: {
		zone: "center",
		soft: false,
		silent: true,
		description: "pausa falada, não se toca",
	},
};

const UNKNOWN: SyllableInfo = {
	zone: "center",
	soft: false,
	silent: false,
	description: "batida no centro",
};

export function isKnownSyllable(text: string): boolean {
	return Object.hasOwn(LEXICON, text.toLowerCase());
}

/** Unknown syllables are playable: they fall back to a plain center hit. */
export function syllableInfo(text: string): SyllableInfo {
	return LEXICON[text.toLowerCase()] ?? UNKNOWN;
}

const VOWEL = /[aeiouáàâãäéèêëíìîïóòôõöúùûüāēīōū]/;

/**
 * Splits a romaji word into kuchi shōga syllables: consonants, vowels and an
 * optional closing "n" (DONKON = DON + KON, tsuteteko = tsu + te + te + ko).
 * Rule-based on purpose, so any group's vocabulary splits the same way.
 */
export function splitSyllables(word: string): string[] {
	const chars = Array.from(word);
	const isVowel = (index: number) =>
		index < chars.length && VOWEL.test(chars[index].toLowerCase());
	const syllables: string[] = [];
	let start = 0;
	while (start < chars.length) {
		let end = start;
		while (end < chars.length && !isVowel(end)) end++;
		if (end >= chars.length) {
			const tail = chars.slice(start).join("");
			if (syllables.length > 0) syllables[syllables.length - 1] += tail;
			else syllables.push(tail);
			break;
		}
		while (isVowel(end)) end++;
		if (
			end < chars.length &&
			chars[end].toLowerCase() === "n" &&
			!isVowel(end + 1)
		) {
			end++;
		}
		syllables.push(chars.slice(start, end).join(""));
		start = end;
	}
	return syllables;
}
