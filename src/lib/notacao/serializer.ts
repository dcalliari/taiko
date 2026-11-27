import { formatBeats, KEYS, SEPARATOR_TEXT } from "./format";
import {
	DEFAULT_PART,
	type Line,
	type NotesLine,
	type Phrase,
	type SequenceStep,
	type Song,
	type Token,
} from "./model";

function durationSuffix(duration: number | undefined): string {
	return duration === undefined ? "" : `:${formatBeats(duration)}`;
}

export function serializeToken(token: Token): string {
	if (token.kind === "voice") {
		return `${token.emphasis ? ">" : ""}(${token.text})${durationSuffix(token.duration)}`;
	}
	const letters = token.units
		.map((unit) => {
			if (unit.kind === "rest") return "_";
			return unit.weak ? unit.text : unit.text.toUpperCase();
		})
		.join("");
	return `${">".repeat(token.accent)}${letters}${durationSuffix(token.duration)}`;
}

export function serializeNotesLine(line: NotesLine): string {
	let text = "";
	line.tokens.forEach((token, index) => {
		if (index > 0) text += SEPARATOR_TEXT[token.sep ?? "space"];
		text += serializeToken(token);
	});
	if (line.repeat) {
		const label = line.repeat.label ? ` ${line.repeat.label}` : "";
		text += ` (X${line.repeat.count}${label})`;
	}
	return text;
}

function serializeLine(line: Line): string {
	return line.kind === "remark"
		? `${KEYS.note}: ${line.text}`
		: serializeNotesLine(line);
}

function serializePhrase(phrase: Phrase, number: number): string[] {
	const repeat = phrase.repeat > 1 ? ` (x${phrase.repeat})` : "";
	const group = phrase.group ? ` @${phrase.group}` : "";
	const header = `${number}${repeat}${group}:`;
	if (phrase.lines.length === 1) {
		return [`${header} ${serializeLine(phrase.lines[0])}`];
	}
	return [header, ...phrase.lines.map((line) => `  ${serializeLine(line)}`)];
}

export function serializeSequenceStep(step: SequenceStep): string {
	const options: string[] = [];
	if (step.repeat > 1) options.push(`x${step.repeat}`);
	if (step.bpm !== undefined) options.push(`${step.bpm} bpm`);
	const suffix = options.length > 0 ? ` (${options.join(", ")})` : "";
	return `${step.sections.join(" + ")}${suffix}`;
}

/** Writes the song in the canonical text form. `parseSong` reads it back. */
export function serializeSong(song: Song): string {
	const lines: string[] = [`${KEYS.title}: ${song.title}`];
	if (song.composer !== undefined) {
		lines.push(`${KEYS.composer}: ${song.composer}`);
	}
	if (song.transcriber !== undefined) {
		lines.push(`${KEYS.transcriber}: ${song.transcriber}`);
	}
	lines.push(`${KEYS.bpm}: ${song.bpm}`);
	if (song.meter) {
		lines.push(`${KEYS.meter}: ${song.meter.beats}/${song.meter.unit}`);
	}
	if (song.swing) lines.push(`${KEYS.swing}: sim`);
	const defaultParts =
		song.parts.length === 1 &&
		song.parts[0].name === DEFAULT_PART.name &&
		song.parts[0].instrument === DEFAULT_PART.instrument;
	if (!defaultParts) {
		const parts = song.parts.map((part) => `${part.name} (${part.instrument})`);
		lines.push(`${KEYS.parts}: ${parts.join(", ")}`);
	}
	if (song.groups.length > 0) {
		const groups = song.groups.map(
			(group) => `${group.color} = ${group.label}`,
		);
		lines.push(`${KEYS.groups}: ${groups.join(", ")}`);
	}
	for (const note of song.notes) lines.push(`${KEYS.note}: ${note}`);

	for (const section of song.sections) {
		lines.push("", `[${section.name}]`);
		if (section.part !== undefined) {
			lines.push(`${KEYS.part}: ${section.part}`);
		}
		section.phrases.forEach((phrase, index) => {
			lines.push(...serializePhrase(phrase, index + 1));
		});
	}

	if (song.sequence.length > 0) {
		const steps = song.sequence.map(serializeSequenceStep);
		lines.push("", `${KEYS.sequence}: ${steps.join(" > ")}`);
	}
	return `${lines.join("\n")}\n`;
}
