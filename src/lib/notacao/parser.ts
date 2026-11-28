import { type FormatKey, fold, KEYS, keyFromText, parseBeats } from "./format";
import {
	DEFAULT_BPM,
	DEFAULT_PART,
	GROUP_COLORS,
	type Group,
	type GroupColor,
	INSTRUMENTS,
	type Instrument,
	type Line,
	type LineRepeat,
	type Meter,
	type NotesLine,
	type Part,
	type Phrase,
	type Section,
	type Separator,
	type SequenceStep,
	type Song,
	songSchema,
	type Token,
	type Unit,
} from "./model";
import { isKnownSyllable, splitSyllables } from "./syllables";

export type NotationIssue = { line: number; column: number; message: string };

export type ParseResult =
	| { ok: true; song: Song; warnings: NotationIssue[] }
	| { ok: false; issues: NotationIssue[] };

export class NotationError extends Error {
	readonly issues: NotationIssue[];

	constructor(issues: NotationIssue[]) {
		super(
			issues.map((issue) => `linha ${issue.line}: ${issue.message}`).join("\n"),
		);
		this.name = "NotationError";
		this.issues = issues;
	}
}

type Report = (line: number, column: number, message: string) => void;

const DASHES = new Set(["-", "–", "—", "‐", "‑"]);
const PHRASE_HEADER =
	/^(\d+)\s*(?:\(\s*[xX]\s*(\d+)\s*\))?\s*(?:@\s*([\p{L}]+))?\s*:(.*)$/u;
const LINE_REPEAT = /^[xX]\s*(\d+)(?:\s+(.+))?$/;
const DURATION = /^\d+(?:\.\d+)?(?:\/\d+)?/;

const isSpace = (char: string) => /\s/.test(char);
const isWordChar = (char: string) => char === "_" || /\p{L}/u.test(char);

function toUnits(word: string): Unit[] {
	const units: Unit[] = [];
	for (const segment of word.split(/(_)/)) {
		if (segment === "") continue;
		if (segment === "_") {
			units.push({ kind: "rest" });
			continue;
		}
		for (const piece of splitSyllables(segment)) {
			const lower = piece.toLowerCase();
			units.push({
				kind: "syllable",
				text: lower,
				weak: piece === lower && piece !== piece.toUpperCase(),
			});
		}
	}
	return units;
}

function tokenizeNotes(
	text: string,
	report: (offset: number, message: string) => void,
	warn: (offset: number, message: string) => void,
): NotesLine | undefined {
	const chars = Array.from(text);
	const end = chars.length;
	const tokens: Token[] = [];
	let repeat: LineRepeat | undefined;
	let failed = false;
	let index = 0;

	const fail = (offset: number, message: string) => {
		failed = true;
		report(offset, message);
	};

	const readDuration = (): number | undefined => {
		if (chars[index] !== ":") return undefined;
		const start = index;
		index++;
		const match = DURATION.exec(chars.slice(index).join(""));
		const value = match ? parseBeats(match[0]) : undefined;
		if (!match || value === undefined) {
			fail(start, 'duração inválida depois de ":" (ex.: DON:2, doko:1/2)');
			return undefined;
		}
		index += Array.from(match[0]).length;
		return value;
	};

	while (true) {
		const separatorStart = index;
		let spaceBefore = false;
		let spaceAfter = false;
		let dash = false;
		while (index < end && (isSpace(chars[index]) || DASHES.has(chars[index]))) {
			if (isSpace(chars[index])) {
				if (dash) spaceAfter = true;
				else spaceBefore = true;
			} else {
				if (dash) fail(index, "dois hífens seguidos");
				dash = true;
			}
			index++;
		}
		if (index >= end) {
			if (dash) fail(separatorStart, "hífen sobrando no fim da linha");
			break;
		}
		if (repeat) {
			fail(index, "a repetição (X...) deve ser o último item da linha");
			break;
		}

		let sep: Separator | undefined;
		if (tokens.length === 0) {
			if (dash) fail(separatorStart, "a linha não pode começar com hífen");
		} else if (dash) {
			sep = spaceBefore ? "dash" : spaceAfter ? "hyphen-space" : "hyphen";
		}

		const tokenStart = index;
		let accent = 0;
		while (index < end && chars[index] === ">") {
			accent++;
			index++;
		}
		if (accent > 2) {
			fail(tokenStart, "use no máximo dois sinais de acento (>>)");
			accent = 2;
		}
		if (index >= end) {
			fail(tokenStart, "sinal de acento sem sílaba depois");
			break;
		}

		if (chars[index] === "(") {
			const close = chars.indexOf(")", index);
			if (close < 0) {
				fail(index, "parêntese aberto e não fechado");
				break;
			}
			const innerStart = index;
			const inner = chars
				.slice(index + 1, close)
				.join("")
				.trim();
			index = close + 1;
			const repeatMatch = LINE_REPEAT.exec(inner);
			if (repeatMatch) {
				if (accent > 0) fail(tokenStart, "a repetição não leva acento");
				if (dash) fail(separatorStart, "não use hífen antes da repetição");
				if (tokens.length === 0) {
					fail(innerStart, "repetição sem nada para repetir");
				}
				repeat = { count: Number(repeatMatch[1]) };
				if (repeatMatch[2]) repeat.label = repeatMatch[2].trim();
				continue;
			}
			if (inner === "") {
				fail(innerStart, "parênteses vazios");
				continue;
			}
			if (inner.includes("(")) {
				fail(innerStart, "parênteses dentro de parênteses");
				continue;
			}
			const duration = readDuration();
			tokens.push({
				kind: "voice",
				...(sep ? { sep } : {}),
				text: inner,
				emphasis: accent > 0,
				...(duration !== undefined ? { duration } : {}),
			});
			continue;
		}

		if (isWordChar(chars[index])) {
			const wordStart = index;
			while (index < end && isWordChar(chars[index])) index++;
			const units = toUnits(chars.slice(wordStart, index).join(""));
			for (const unit of units) {
				if (unit.kind === "syllable" && !isKnownSyllable(unit.text)) {
					warn(
						wordStart,
						`a sílaba "${unit.text}" não está no vocabulário: será tocada como batida no centro`,
					);
				}
			}
			const duration = readDuration();
			tokens.push({
				kind: "word",
				...(sep ? { sep } : {}),
				units,
				accent: accent as 0 | 1 | 2,
				...(duration !== undefined ? { duration } : {}),
			});
			continue;
		}

		fail(
			index,
			`caractere inesperado "${chars[index]}" (para um comentário impresso, use "obs: ...")`,
		);
		while (index < end && !isSpace(chars[index])) index++;
	}

	if (failed) return undefined;
	if (tokens.length === 0) return undefined;
	return { kind: "notes", tokens, ...(repeat ? { repeat } : {}) };
}

function resolveName<T extends string>(
	text: string,
	options: readonly T[],
): T | undefined {
	const wanted = fold(text);
	return options.find((option) => fold(option) === wanted);
}

function parseParts(value: string, fail: (message: string) => void): Part[] {
	const parts: Part[] = [];
	for (const entry of value.split(",")) {
		const text = entry.trim();
		if (text === "") continue;
		const match = /^(.+?)\s*\(([^)]*)\)$/.exec(text);
		const name = (match ? match[1] : text).trim();
		let instrument: Instrument = DEFAULT_PART.instrument;
		if (match) {
			const resolved = resolveName(match[2], INSTRUMENTS);
			if (!resolved) {
				fail(
					`instrumento "${match[2].trim()}" desconhecido (use: ${INSTRUMENTS.join(", ")})`,
				);
				continue;
			}
			instrument = resolved;
		}
		parts.push({ name, instrument });
	}
	if (parts.length === 0) fail("nenhuma parte informada");
	return parts;
}

function parseGroups(value: string, fail: (message: string) => void): Group[] {
	const groups: Group[] = [];
	for (const entry of value.split(",")) {
		const text = entry.trim();
		if (text === "") continue;
		const match = /^([^=]+)=(.+)$/.exec(text);
		const color = match ? resolveName(match[1], GROUP_COLORS) : undefined;
		if (!match || !color) {
			fail(
				`grupo "${text}" inválido (ex.: azul = Lado direito; cores: ${GROUP_COLORS.join(", ")})`,
			);
			continue;
		}
		groups.push({ color, label: match[2].trim() });
	}
	return groups;
}

function parseMeter(
	value: string,
	fail: (message: string) => void,
): Meter | undefined {
	if (fold(value) === "livre") return undefined;
	const match = /^(\d+)\s*\/\s*(\d+)$/.exec(value);
	if (!match) {
		fail('compasso inválido (ex.: 4/4, 6/8 ou "livre")');
		return undefined;
	}
	return { beats: Number(match[1]), unit: Number(match[2]) };
}

function parseSwing(
	value: string,
	fail: (message: string) => void,
): boolean | undefined {
	const folded = fold(value);
	if (folded === "sim") return true;
	if (folded === "nao") return false;
	fail('suingue inválido (use "sim" ou "não")');
	return undefined;
}

function parseSequence(
	text: string,
	sectionNames: string[],
	fail: (message: string) => void,
): SequenceStep[] {
	const steps: SequenceStep[] = [];
	for (const rawStep of text.split(">")) {
		let stepText = rawStep.trim();
		if (stepText === "") {
			fail('passo vazio na sequência (sobrou um ">")');
			continue;
		}
		const step: SequenceStep = { sections: [], repeat: 1 };
		const options = /^(.*?)\s*\(([^)]*)\)$/.exec(stepText);
		if (options) {
			stepText = options[1].trim();
			for (const option of options[2].split(",")) {
				const repeat = /^[xX]\s*(\d+)$/.exec(option.trim());
				const tempo = /^(\d+(?:\.\d+)?)\s*bpm$/i.exec(option.trim());
				if (repeat) step.repeat = Number(repeat[1]);
				else if (tempo) step.bpm = Number(tempo[1]);
				else {
					fail(
						`opção "${option.trim()}" inválida na sequência (ex.: (x2) ou (x2, 96 bpm))`,
					);
				}
			}
		}
		for (const rawName of stepText.split("+")) {
			const name = resolveName(rawName, sectionNames);
			if (!name) {
				fail(
					`a sequência cita a seção "${rawName.trim()}", que não existe (seções: ${sectionNames.join(", ") || "nenhuma"})`,
				);
				continue;
			}
			step.sections.push(name);
		}
		if (step.sections.length > 0) steps.push(step);
	}
	return steps;
}

export function safeParseSong(source: string): ParseResult {
	const issues: NotationIssue[] = [];
	const warnings: NotationIssue[] = [];
	const report: Report = (line, column, message) => {
		issues.push({ line, column, message });
	};
	const pathLines = new Map<string, number>();

	const seenKeys = new Map<FormatKey, number>();
	let title: string | undefined;
	let composer: string | undefined;
	let transcriber: string | undefined;
	let bpm: number | undefined;
	let meter: Meter | undefined;
	let swing = false;
	let parts: Part[] | undefined;
	let groups: Group[] = [];
	const notes: string[] = [];
	const sections: Section[] = [];
	let section: Section | undefined;
	let phrase: Phrase | undefined;
	let sequence: { text: string; line: number } | undefined;
	let collectingSequence = false;

	const addContent = (text: string, line: number, column: number) => {
		if (!section || !phrase) return;
		const sectionIndex = sections.length - 1;
		const phraseIndex = section.phrases.length - 1;
		const path = `sections.${sectionIndex}.phrases.${phraseIndex}.lines.${phrase.lines.length}`;
		const pair = /^([\p{L}]+)\s*:(.*)$/u.exec(text);
		let parsed: Line | undefined;
		if (pair && keyFromText(pair[1]) === "note") {
			const remark = pair[2].trim();
			if (remark === "") {
				report(line, column, "observação vazia");
				return;
			}
			parsed = { kind: "remark", text: remark };
		} else {
			parsed = tokenizeNotes(
				text,
				(offset, message) => report(line, column + offset, message),
				(offset, message) =>
					warnings.push({ line, column: column + offset, message }),
			);
		}
		if (!parsed) return;
		pathLines.set(path, line);
		phrase.lines.push(parsed);
	};

	const rows = source.replace(/\r\n?/g, "\n").split("\n");
	rows.forEach((raw, rowIndex) => {
		const line = rowIndex + 1;
		const text = raw.trim();
		if (text === "" || text.startsWith("#")) return;
		const column = raw.length - raw.trimStart().length + 1;
		const fail = (message: string) => report(line, column, message);

		const sectionHeader = /^\[(.*)\]$/.exec(text);
		if (sectionHeader) {
			collectingSequence = false;
			section = { name: sectionHeader[1].trim(), phrases: [] };
			phrase = undefined;
			pathLines.set(`sections.${sections.length}`, line);
			sections.push(section);
			return;
		}

		const pair = /^([\p{L}]+)\s*:(.*)$/u.exec(text);
		const key = pair ? keyFromText(pair[1]) : undefined;
		const value = pair ? pair[2].trim() : "";

		if (key === "sequence") {
			if (sequence) {
				fail(`a sequência já foi escrita na linha ${sequence.line}`);
				return;
			}
			sequence = { text: value, line };
			pathLines.set("sequence", line);
			collectingSequence = true;
			section = undefined;
			phrase = undefined;
			return;
		}
		if (collectingSequence && sequence) {
			sequence.text = `${sequence.text} ${text}`.trim();
			return;
		}

		if (!section) {
			if (!key) {
				fail(
					'linha fora de seção: no cabeçalho use "chave: valor"; para as frases, abra uma seção com [NOME]',
				);
				return;
			}
			if (key === "part") {
				fail('"parte" só vale dentro de uma seção');
				return;
			}
			if (key !== "note") {
				const previous = seenKeys.get(key);
				if (previous !== undefined) {
					fail(`"${KEYS[key]}" já foi informado na linha ${previous}`);
					return;
				}
				seenKeys.set(key, line);
				if (value === "") {
					fail(`"${KEYS[key]}" está sem valor`);
					return;
				}
			}
			switch (key) {
				case "title":
					title = value;
					pathLines.set("title", line);
					break;
				case "composer":
					composer = value;
					pathLines.set("composer", line);
					break;
				case "transcriber":
					transcriber = value;
					pathLines.set("transcriber", line);
					break;
				case "bpm": {
					const parsed = Number(value.replace(",", "."));
					if (Number.isNaN(parsed)) fail("bpm inválido (ex.: bpm: 120)");
					else bpm = parsed;
					pathLines.set("bpm", line);
					break;
				}
				case "meter":
					meter = parseMeter(value, fail);
					pathLines.set("meter", line);
					break;
				case "swing":
					swing = parseSwing(value, fail) ?? false;
					break;
				case "parts":
					parts = parseParts(value, fail);
					pathLines.set("parts", line);
					break;
				case "groups":
					groups = parseGroups(value, fail);
					pathLines.set("groups", line);
					break;
				case "note":
					if (value === "") fail("observação vazia");
					else {
						pathLines.set(`notes.${notes.length}`, line);
						notes.push(value);
					}
					break;
			}
			return;
		}

		const phraseHeader = PHRASE_HEADER.exec(text);
		if (phraseHeader) {
			const group = phraseHeader[3]
				? resolveName<GroupColor>(phraseHeader[3], GROUP_COLORS)
				: undefined;
			if (phraseHeader[3] && !group) {
				fail(
					`grupo "@${phraseHeader[3]}" desconhecido (cores: ${GROUP_COLORS.join(", ")})`,
				);
			}
			phrase = {
				repeat: phraseHeader[2] ? Number(phraseHeader[2]) : 1,
				...(group ? { group } : {}),
				lines: [],
			};
			pathLines.set(
				`sections.${sections.length - 1}.phrases.${section.phrases.length}`,
				line,
			);
			section.phrases.push(phrase);
			const rest = phraseHeader[4];
			if (rest.trim() !== "") {
				const offset = text.length - rest.trimStart().length;
				addContent(rest.trim(), line, column + offset);
			}
			return;
		}

		if (key === "part") {
			if (phrase) {
				fail('"parte" deve vir logo depois do nome da seção');
				return;
			}
			if (value === "") {
				fail('"parte" está sem valor');
				return;
			}
			section.part = value;
			return;
		}
		if (key && key !== "note") {
			fail(`"${KEYS[key]}" só vale no cabeçalho, antes da primeira seção`);
			return;
		}
		if (!phrase) {
			fail('frase sem número: comece cada frase com "1:", "2 (x2):"...');
			return;
		}
		addContent(text, line, column);
	});

	if (title === undefined) {
		report(1, 1, `falta o título (${KEYS.title}: nome da música)`);
	}

	let steps: SequenceStep[] = [];
	if (sequence) {
		const { line } = sequence;
		if (sequence.text === "") report(line, 1, "sequência vazia");
		else {
			steps = parseSequence(
				sequence.text,
				sections.map((item) => item.name),
				(message) => report(line, 1, message),
			);
		}
	}

	if (parts) {
		const declared = parts.map((part) => part.name);
		for (const item of sections) {
			if (item.part === undefined) continue;
			item.part = resolveName(item.part, declared) ?? item.part;
		}
	}

	const candidate = {
		title: title ?? "",
		...(composer !== undefined ? { composer } : {}),
		...(transcriber !== undefined ? { transcriber } : {}),
		bpm: bpm ?? DEFAULT_BPM,
		...(meter ? { meter } : {}),
		swing,
		parts: parts ?? [{ ...DEFAULT_PART }],
		groups,
		notes,
		sections,
		sequence: steps,
	};

	if (issues.length === 0) {
		const validated = songSchema.safeParse(candidate);
		if (validated.success) {
			return { ok: true, song: validated.data, warnings };
		}
		for (const issue of validated.error.issues) {
			const path = issue.path.map(String);
			let line = 1;
			for (let length = path.length; length > 0; length--) {
				const known = pathLines.get(path.slice(0, length).join("."));
				if (known !== undefined) {
					line = known;
					break;
				}
			}
			report(line, 1, issue.message);
		}
	}

	issues.sort((a, b) => a.line - b.line || a.column - b.column);
	return { ok: false, issues };
}

/** Parses the Kodon sheet text. Throws `NotationError` listing every problem. */
export function parseSong(source: string): Song {
	const result = safeParseSong(source);
	if (!result.ok) throw new NotationError(result.issues);
	return result.song;
}
