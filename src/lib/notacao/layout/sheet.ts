import { SEPARATOR_TEXT } from "../format";
import { buildLegend } from "../legend";
import {
	type NotesLine,
	type Phrase,
	partOfSection,
	type Section,
	type Song,
} from "../model";
import { serializeSequenceStep } from "../serializer";
import { cellKey } from "../timing";
import {
	COLORS,
	Flow,
	GROUP_FILL,
	type LayoutOptions,
	type Run,
	resolveOptions,
	runsWidth,
	type SheetLayout,
	wrapText,
} from "./flow";
import { measureText } from "./metrics";

const BODY = 11;
const LINE_BOX = 14;
const LINE_GAP = 7;
const ROW_PAD_Y = 7;
const CELL_PAD_X = 7;
const NUMBER_COLUMN = 50;
const BORDER = 0.75;

/** A token with the separator printed before it. */
type Atom = { lead: string; runs: Run[]; glued: boolean };

/**
 * The line as printed on the Kodon sheet: syllables in their casing,
 * underline for accents, kakegoe in italics. Timing marks (`_`, `:beats`)
 * are left out on purpose.
 */
function notesAtoms(
	line: NotesLine,
	keyOf: (token: number, unit: number) => string,
): Atom[] {
	const atoms: Atom[] = [];
	line.tokens.forEach((token, tokenIndex) => {
		const runs: Run[] = [];
		if (token.kind === "voice") {
			runs.push({
				text: `(${token.text})`,
				italic: true,
				bold: token.emphasis,
				key: keyOf(tokenIndex, 0),
			});
		} else {
			token.units.forEach((unit, unitIndex) => {
				if (unit.kind !== "syllable") return;
				runs.push({
					text: unit.weak ? unit.text : unit.text.toUpperCase(),
					bold: token.accent === 2,
					underline: token.accent > 0,
					key: keyOf(tokenIndex, unitIndex),
				});
			});
		}
		if (runs.length === 0) return;
		const sep = token.sep ?? "space";
		atoms.push({
			lead: atoms.length === 0 ? "" : SEPARATOR_TEXT[sep],
			runs,
			glued: sep === "hyphen" || sep === "hyphen-space",
		});
	});
	if (line.repeat && atoms.length > 0) {
		const label = line.repeat.label ? ` ${line.repeat.label}` : "";
		atoms.push({
			lead: " ",
			runs: [{ text: `(X${line.repeat.count}${label})` }],
			glued: true,
		});
	}
	return atoms;
}

function wrapAtoms(atoms: Atom[], maxWidth: number, size: number): Run[][] {
	const lines: Run[][] = [];
	let current: Run[] = [];
	let width = 0;
	for (const atom of atoms) {
		const atomWidth = runsWidth(atom.runs, size);
		const leadWidth = measureText(atom.lead, size);
		const fits = width + leadWidth + atomWidth <= maxWidth;
		if (!fits && current.length > 0 && !atom.glued) {
			lines.push(current);
			// A broken dash stays visible at the start of the next line.
			const lead = atom.lead.trim();
			current = lead === "" ? [] : [{ text: `${lead} ` }];
			width = runsWidth(current, size);
		} else if (atom.lead !== "") {
			current.push({ text: atom.lead });
			width += leadWidth;
		}
		current.push(...atom.runs);
		width += atomWidth;
	}
	if (current.length > 0) lines.push(current);
	return lines;
}

function phraseLines(
	phrase: Phrase,
	sectionIndex: number,
	phraseIndex: number,
	maxWidth: number,
): Run[][] {
	const lines: Run[][] = [];
	phrase.lines.forEach((line, lineIndex) => {
		if (line.kind === "remark") {
			for (const text of wrapText(`(${line.text})`, maxWidth, BODY)) {
				lines.push([{ text }]);
			}
			return;
		}
		const atoms = notesAtoms(line, (token, unit) =>
			cellKey(sectionIndex, phraseIndex, lineIndex, token, unit),
		);
		lines.push(...wrapAtoms(atoms, maxWidth, BODY));
	});
	return lines;
}

function rowHeight(lineCount: number): number {
	const lines = Math.max(1, lineCount);
	return ROW_PAD_Y * 2 + lines * LINE_BOX + (lines - 1) * LINE_GAP;
}

export function drawHeader(flow: Flow, song: Song): void {
	const { groupName, labels } = flow.options;
	if (groupName !== "") {
		flow.text(groupName.toUpperCase(), flow.left, flow.y + 8, {
			size: 8.5,
			bold: true,
			color: COLORS.brand,
		});
		flow.line({
			x1: flow.left,
			y1: flow.y + 14,
			x2: flow.right,
			y2: flow.y + 14,
			stroke: COLORS.brand,
			strokeWidth: 1,
		});
		flow.y += 32;
	}

	for (const text of wrapText(song.title, flow.width, 15, true)) {
		flow.text(text, flow.left, flow.y + 13, {
			size: 15,
			bold: true,
			italic: true,
		});
		flow.y += 21;
	}

	const tempo = [`${song.bpm} bpm`];
	if (song.swing) tempo.push(labels.swing);
	if (song.meter) {
		tempo.push(`${labels.meter} ${song.meter.beats}/${song.meter.unit}`);
	}
	const fields: [string, string | undefined][] = [
		[labels.composer, song.composer],
		[labels.transcriber, song.transcriber],
		[labels.tempo, tempo.join(", ")],
	];
	for (const [label, value] of fields) {
		if (value === undefined) continue;
		const labelText = `${label}: `;
		const labelWidth = measureText(labelText, BODY, true);
		const lines = wrapText(value, flow.width - labelWidth, BODY);
		lines.forEach((text, index) => {
			if (index === 0) {
				flow.text(labelText, flow.left, flow.y + 11, {
					size: BODY,
					bold: true,
				});
			}
			flow.text(text, flow.left + labelWidth, flow.y + 11, {
				size: BODY,
				italic: true,
			});
			flow.y += 15;
		});
	}
	flow.y += 12;
}

export function drawSectionTitle(
	flow: Flow,
	song: Song,
	section: Section,
): void {
	const width = flow.text(section.name, flow.left, flow.y + 11, {
		size: BODY,
		bold: true,
		italic: true,
	});
	if (song.parts.length > 1) {
		const part = partOfSection(song, section);
		flow.text(
			`${part.name} (${part.instrument})`,
			flow.left + width + 8,
			flow.y + 11,
			{ size: 9, italic: true, color: COLORS.muted },
		);
	}
	flow.y += 19;
}

function drawSection(flow: Flow, song: Song, sectionIndex: number): void {
	const section = song.sections[sectionIndex];
	const contentWidth = flow.width - NUMBER_COLUMN;
	const textWidth = contentWidth - CELL_PAD_X * 2;
	const rows = section.phrases.map((phrase, phraseIndex) =>
		phraseLines(phrase, sectionIndex, phraseIndex, textWidth),
	);

	// The title never stays alone at the bottom of a page.
	flow.ensure(19 + (rows.length > 0 ? rowHeight(rows[0].length) : 0));
	drawSectionTitle(flow, song, section);

	rows.forEach((lines, phraseIndex) => {
		const phrase = section.phrases[phraseIndex];
		const height = rowHeight(lines.length);
		flow.ensure(height);
		const top = flow.y;
		flow.rect({
			x: flow.left,
			y: top,
			width: contentWidth,
			height,
			stroke: COLORS.ink,
			strokeWidth: BORDER,
			...(phrase.group ? { fill: GROUP_FILL[phrase.group] } : {}),
		});
		flow.rect({
			x: flow.left + contentWidth,
			y: top,
			width: NUMBER_COLUMN,
			height,
			stroke: COLORS.ink,
			strokeWidth: BORDER,
		});
		lines.forEach((runs, lineIndex) => {
			const baseline =
				top + ROW_PAD_Y + lineIndex * (LINE_BOX + LINE_GAP) + 10.5;
			flow.runs(runs, flow.left + CELL_PAD_X, baseline, BODY);
		});

		const number = String(phraseIndex + 1);
		const repeat = phrase.repeat > 1 ? `(x${phrase.repeat})` : "";
		const numberWidth = measureText(number, BODY);
		const repeatWidth = measureText(repeat, 7.5, true);
		const start =
			flow.left +
			contentWidth +
			(NUMBER_COLUMN - numberWidth - repeatWidth) / 2;
		const baseline = top + height / 2 + 4;
		flow.text(number, start, baseline, { size: BODY });
		flow.text(repeat, start + numberWidth, baseline + 2, {
			size: 7.5,
			bold: true,
		});
		flow.y += height;
	});
	flow.y += 18;
}

export function drawSequence(flow: Flow, song: Song): void {
	if (song.sequence.length === 0) return;
	const size = 12;
	const steps = song.sequence.map(serializeSequenceStep);
	const lines: string[] = [];
	let current = "";
	for (const step of steps) {
		const candidate = current === "" ? step : `${current} > ${step}`;
		if (current !== "" && measureText(candidate, size, true) > flow.width) {
			lines.push(`${current} >`);
			current = step;
		} else {
			current = candidate;
		}
	}
	if (current !== "") lines.push(current);

	flow.ensure(26 + lines.length * 18);
	flow.y += 8;
	flow.text(`${flow.options.labels.sequence}:`, flow.left, flow.y + 12, {
		size,
		bold: true,
		italic: true,
	});
	flow.y += 26;
	for (const text of lines) {
		flow.text(text, flow.left, flow.y + 12, {
			size,
			bold: true,
			italic: true,
		});
		flow.y += 18;
	}
	flow.y += 8;
}

export function drawNotes(flow: Flow, song: Song): void {
	if (song.notes.length === 0) return;
	const size = 9.5;
	const label = `${flow.options.labels.note}: `;
	const labelWidth = measureText(label, size, true);
	flow.y += 4;
	for (const note of song.notes) {
		const lines = wrapText(note, flow.width - labelWidth, size);
		flow.ensure(lines.length * 13);
		lines.forEach((text, index) => {
			if (index === 0) {
				flow.text(label, flow.left, flow.y + 9, {
					size,
					bold: true,
					color: COLORS.muted,
				});
			}
			flow.text(text, flow.left + labelWidth, flow.y + 9, {
				size,
				italic: true,
				color: COLORS.muted,
			});
			flow.y += 13;
		});
		flow.y += 2;
	}
	flow.y += 6;
}

export function drawLegend(
	flow: Flow,
	song: Song,
	extra: { term: string; text: string }[] = [],
): void {
	if (!flow.options.legend) return;
	const entries = [...buildLegend(song), ...extra];
	if (entries.length === 0) return;
	const size = 8.5;
	const pitch = 11.5;
	const gutter = 16;
	const columnWidth = (flow.width - gutter) / 2;

	const cells = entries.map((entry) => {
		const term = `${entry.term}  `;
		const termWidth = measureText(term, size, true);
		return {
			term,
			termWidth,
			lines: wrapText(entry.text, columnWidth - termWidth, size),
		};
	});

	const rows: (typeof cells)[] = [];
	for (let index = 0; index < cells.length; index += 2) {
		rows.push(cells.slice(index, index + 2));
	}
	const heightOf = (row: typeof cells) =>
		Math.max(...row.map((cell) => cell.lines.length)) * pitch;
	// The legend moves to the next page as a block rather than splitting.
	flow.ensure(24 + rows.reduce((sum, row) => sum + heightOf(row), 0));
	flow.y += 6;
	flow.line({
		x1: flow.left,
		y1: flow.y,
		x2: flow.right,
		y2: flow.y,
		stroke: COLORS.faint,
		strokeWidth: 0.5,
	});
	flow.text(flow.options.labels.legend, flow.left, flow.y + 12, {
		size: 7.5,
		bold: true,
		color: COLORS.muted,
	});
	flow.y += 18;

	for (const row of rows) {
		const height = heightOf(row);
		flow.ensure(height);
		row.forEach((cell, column) => {
			const x = flow.left + column * (columnWidth + gutter);
			flow.text(cell.term, x, flow.y + 8, {
				size,
				bold: true,
				color: COLORS.muted,
			});
			cell.lines.forEach((text, lineIndex) => {
				flow.text(text, x + cell.termWidth, flow.y + 8 + lineIndex * pitch, {
					size,
					color: COLORS.muted,
				});
			});
		});
		flow.y += height;
	}
}

export function drawFooters(flow: Flow, song: Song): void {
	const { groupName, labels, pageWidth, pageHeight, margin } = flow.options;
	flow.pages.forEach((page, index) => {
		const numbering = labels.page
			.replace("{n}", String(index + 1))
			.replace("{total}", String(flow.pages.length));
		const text = [groupName, song.title, numbering]
			.filter((part) => part !== "")
			.join(" · ");
		const size = 7.5;
		page.items.push({
			type: "text",
			x: pageWidth / 2 - measureText(text, size) / 2,
			y: pageHeight - margin / 2,
			text,
			size,
			bold: false,
			italic: false,
			color: COLORS.muted,
			width: measureText(text, size),
		});
	});
}

/**
 * The sheet as the group writes it: one table per section, one numbered row
 * per phrase, running kuchi shōga text, colored rows for groups and the
 * sequence at the end.
 */
export function layoutSheet(
	song: Song,
	options: LayoutOptions = {},
): SheetLayout {
	const flow = new Flow(resolveOptions(options));
	drawHeader(flow, song);
	song.sections.forEach((_, index) => {
		drawSection(flow, song, index);
	});
	drawSequence(flow, song);
	drawNotes(flow, song);
	drawLegend(flow, song);
	drawFooters(flow, song);
	return { pages: flow.pages, cells: flow.cells };
}
