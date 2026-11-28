import type { GroupColor, Song } from "./model";
import { syllableInfo } from "./syllables";

export type LegendEntry = { term: string; text: string };

/**
 * Legend of what the song actually uses: its syllables first, then the
 * writing conventions (casing, underline, parentheses, repeats, colors).
 */
export function buildLegend(song: Song): LegendEntry[] {
	const syllables: string[] = [];
	const groups: GroupColor[] = [];
	const weak: string[] = [];
	let accent = false;
	let strongAccent = false;
	let voice = false;
	let lineRepeat: number | undefined;
	let phraseRepeat: number | undefined;

	for (const section of song.sections) {
		for (const phrase of section.phrases) {
			if (phrase.repeat > 1) phraseRepeat ??= phrase.repeat;
			if (phrase.group && !groups.includes(phrase.group)) {
				groups.push(phrase.group);
			}
			for (const line of phrase.lines) {
				if (line.kind !== "notes") continue;
				if (line.repeat) lineRepeat ??= line.repeat.count;
				for (const token of line.tokens) {
					if (token.kind === "voice") {
						voice = true;
						continue;
					}
					if (token.accent === 1) accent = true;
					if (token.accent === 2) strongAccent = true;
					for (const unit of token.units) {
						if (unit.kind !== "syllable") continue;
						if (unit.weak && !weak.includes(unit.text)) weak.push(unit.text);
						if (!syllables.includes(unit.text)) syllables.push(unit.text);
					}
				}
			}
		}
	}

	const entries: LegendEntry[] = syllables.map((syllable) => ({
		term: syllable.toUpperCase(),
		text: syllableInfo(syllable).description,
	}));
	if (weak.length > 0) {
		entries.push({
			term: "minúsculas",
			text: `batida fraca (${weak.slice(0, 4).join(", ")})`,
		});
	}
	if (accent) entries.push({ term: "sublinhado", text: "acento" });
	if (strongAccent) {
		entries.push({ term: "sublinhado e negrito", text: "acento mais forte" });
	}
	if (voice) {
		entries.push({
			term: "(itálico)",
			text: "falado, não tocado: kakegoe ou contagem",
		});
	}
	if (lineRepeat !== undefined) {
		entries.push({
			term: `(X${lineRepeat})`,
			text: `repete a linha ${lineRepeat} vezes`,
		});
	}
	if (phraseRepeat !== undefined) {
		entries.push({
			term: `(x${phraseRepeat})`,
			text: `ao lado do número: repete a frase ${phraseRepeat} vezes`,
		});
	}
	for (const color of groups) {
		const label = song.groups.find((group) => group.color === color)?.label;
		entries.push({
			term: `faixa ${color}`,
			text: label ?? "grupo ou lado que toca a frase",
		});
	}
	if (song.swing) {
		entries.push({
			term: "suíngue",
			text: "tempo dividido em dois toca longo e curto",
		});
	}
	return entries;
}
