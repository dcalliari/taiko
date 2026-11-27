import type {
	NotesLine,
	Phrase,
	Section,
	Token,
	VoiceToken,
	WordToken,
} from "./model";
import { type Hand, syllableInfo, type Zone } from "./syllables";

/**
 * Duration rule of the sheet text:
 * - every written word lasts one beat, split evenly among its fused syllables
 *   (DON = 1 beat, DONKON = two halves, dokodoko = four quarters);
 * - spaces, hyphens and dashes only separate words, they never add time;
 * - a kakegoe lasts one beat per spoken word;
 * - `word:beats` overrides the total and `_` is a silent slot.
 */
export const DEFAULT_WORD_BEATS = 1;

export type TimedCell = {
	kind: "hit" | "rest" | "voice";
	/** Beats from the start of one pass of the line. */
	start: number;
	duration: number;
	/** As printed: syllable in its written casing, or the kakegoe text. */
	text: string;
	/** Lowercase syllable, when the cell came from one. */
	syllable?: string;
	hand?: Hand;
	zone?: Zone;
	/** Light by nature (tsu, ku), on top of `weak`. */
	soft: boolean;
	/** Written in lowercase. */
	weak: boolean;
	accent: 0 | 1 | 2;
	/** False for `_`: timing only, never printed on the sheet. */
	visible: boolean;
	token: number;
	unit: number;
};

export type TimedLine = {
	cells: TimedCell[];
	/** Length of one pass. */
	beats: number;
	repeat: number;
	label?: string;
};

export function countSpokenWords(token: VoiceToken): number {
	const words = token.text.split(/[\s\-–—]+/).filter((word) => word !== "");
	return Math.max(1, words.length);
}

export function tokenBeats(token: Token): number {
	if (token.duration !== undefined) return token.duration;
	return token.kind === "voice"
		? countSpokenWords(token) * DEFAULT_WORD_BEATS
		: DEFAULT_WORD_BEATS;
}

function wordCells(
	word: WordToken,
	tokenIndex: number,
	start: number,
): TimedCell[] {
	const slot = tokenBeats(word) / word.units.length;
	return word.units.map((unit, unitIndex) => {
		const base = {
			start: start + unitIndex * slot,
			duration: slot,
			token: tokenIndex,
			unit: unitIndex,
		};
		if (unit.kind === "rest") {
			return {
				...base,
				kind: "rest",
				text: "",
				soft: false,
				weak: false,
				accent: 0,
				visible: false,
			};
		}
		const info = syllableInfo(unit.text);
		return {
			...base,
			kind: info.silent ? "rest" : "hit",
			text: unit.weak ? unit.text : unit.text.toUpperCase(),
			syllable: unit.text,
			...(info.hand ? { hand: info.hand } : {}),
			zone: info.zone,
			soft: info.soft,
			weak: unit.weak,
			accent: info.silent ? 0 : word.accent,
			visible: true,
		};
	});
}

/** Places every syllable of a line on the beat grid. */
export function timeLine(line: NotesLine): TimedLine {
	const cells: TimedCell[] = [];
	let cursor = 0;
	line.tokens.forEach((token, tokenIndex) => {
		const beats = tokenBeats(token);
		if (token.kind === "word") {
			cells.push(...wordCells(token, tokenIndex, cursor));
		} else {
			cells.push({
				kind: "voice",
				start: cursor,
				duration: beats,
				text: token.text,
				soft: false,
				weak: false,
				accent: token.emphasis ? 1 : 0,
				visible: true,
				token: tokenIndex,
				unit: 0,
			});
		}
		cursor += beats;
	});
	return {
		cells,
		beats: cursor,
		repeat: line.repeat?.count ?? 1,
		...(line.repeat?.label ? { label: line.repeat.label } : {}),
	};
}

/** Beats of one pass of the phrase, inline repeats included. */
export function phrasePassBeats(phrase: Phrase): number {
	let beats = 0;
	for (const line of phrase.lines) {
		if (line.kind !== "notes") continue;
		const timed = timeLine(line);
		beats += timed.beats * timed.repeat;
	}
	return beats;
}

export function phraseBeats(phrase: Phrase): number {
	return phrasePassBeats(phrase) * phrase.repeat;
}

export function sectionBeats(section: Section): number {
	return section.phrases.reduce((sum, phrase) => sum + phraseBeats(phrase), 0);
}

/** Address of a cell on the sheet, shared by the layout and the player. */
export function cellKey(
	section: number,
	phrase: number,
	line: number,
	token: number,
	unit: number,
): string {
	return `${section}.${phrase}.${line}.${token}.${unit}`;
}
