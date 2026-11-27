import type { Phrase, Song } from "../model";
import { cellKey, type TimedCell, type TimedLine, timeLine } from "../timing";
import {
	COLORS,
	Flow,
	GROUP_FILL,
	type LayoutOptions,
	resolveOptions,
	type SheetLayout,
	wrapText,
} from "./flow";
import { measureText } from "./metrics";
import {
	drawFooters,
	drawHeader,
	drawLegend,
	drawNotes,
	drawSectionTitle,
	drawSequence,
} from "./sheet";

const LABEL_COLUMN = 46;
const REPEAT_COLUMN = 66;
const BEATS_PER_ROW = 8;
const ROW_HEIGHT = 34;
const REMARK_PITCH = 13;
const EPSILON = 1e-9;

/** Legend of the marks only the grid prints, limited to the ones in use. */
function gridLegend(song: Song): { term: string; text: string }[] {
	let hand = false;
	let rim = false;
	let rest = false;
	for (const section of song.sections) {
		for (const phrase of section.phrases) {
			for (const line of phrase.lines) {
				if (line.kind !== "notes") continue;
				for (const cell of timeLine(line).cells) {
					if (cell.kind === "hit" && cell.hand) hand = true;
					if (cell.kind === "hit" && cell.zone === "rim") rim = true;
					if (cell.kind === "rest" && !cell.visible) rest = true;
				}
			}
		}
	}
	const entries: { term: string; text: string }[] = [];
	if (hand) {
		entries.push({
			term: "D / E",
			text: "mão direita / mão esquerda, pela sílaba",
		});
	}
	if (rim) entries.push({ term: "×", text: "batida na borda (fuchi)" });
	if (rest) entries.push({ term: "·", text: "pausa" });
	return entries;
}

type GridRow =
	| { kind: "remark"; text: string }
	| {
			kind: "beats";
			lineIndex: number;
			timed: TimedLine;
			/** One size for every syllable of the line, so it reads evenly. */
			hitSize: number;
			from: number;
			to: number;
			last: boolean;
	  };

function fitSize(
	text: string,
	size: number,
	maxWidth: number,
	bold: boolean,
): number {
	let fitted = size;
	while (fitted > 5 && measureText(text, fitted, bold) > maxWidth) {
		fitted -= 0.5;
	}
	return fitted;
}

const roomOf = (slotWidth: number) => Math.max(4, slotWidth - 3);

function phraseRows(
	phrase: Phrase,
	remarkWidth: number,
	beatWidth: number,
): GridRow[] {
	const rows: GridRow[] = [];
	phrase.lines.forEach((line, lineIndex) => {
		if (line.kind === "remark") {
			for (const text of wrapText(`(${line.text})`, remarkWidth, 9)) {
				rows.push({ kind: "remark", text });
			}
			return;
		}
		const timed = timeLine(line);
		const hitSize = Math.min(
			10,
			...timed.cells
				.filter((cell) => cell.kind === "hit")
				.map((cell) =>
					fitSize(
						cell.text,
						10,
						roomOf(cell.duration * beatWidth),
						cell.accent === 2,
					),
				),
		);
		for (let from = 0; from < timed.beats - EPSILON; from += BEATS_PER_ROW) {
			const to = Math.min(timed.beats, from + BEATS_PER_ROW);
			rows.push({
				kind: "beats",
				lineIndex,
				timed,
				hitSize,
				from,
				to,
				last: to >= timed.beats - EPSILON,
			});
		}
	});
	return rows;
}

function drawCell(
	flow: Flow,
	cell: TimedCell,
	x: number,
	top: number,
	slotWidth: number,
	hitSize: number,
): void {
	const room = roomOf(slotWidth);
	const baseline = top + 16;
	if (cell.kind === "voice") {
		const text = `(${cell.text})`;
		const bold = cell.accent > 0;
		// A kakegoe is one gesture: the beat dividers under it are covered.
		flow.rect({
			x: x + 0.6,
			y: top + 0.6,
			width: slotWidth - 1.2,
			height: ROW_HEIGHT - 1.2,
			fill: COLORS.paper,
		});
		flow.text(text, x + 2, baseline, {
			size: fitSize(text, 9, room, bold),
			bold,
			italic: true,
		});
		return;
	}
	if (cell.kind === "rest") {
		if (cell.visible) {
			flow.text(cell.text, x + 2, baseline, {
				size: fitSize(cell.text, 9, room, false),
				italic: true,
				color: COLORS.muted,
			});
		} else {
			flow.text("·", x + 2, baseline, { size: 10, color: COLORS.muted });
		}
		return;
	}
	flow.runs(
		[
			{
				text: cell.text,
				bold: cell.accent === 2,
				underline: cell.accent > 0,
			},
		],
		x + 2,
		baseline,
		hitSize,
	);
	const hand = cell.hand === "right" ? "D" : cell.hand === "left" ? "E" : "";
	const mark = `${hand}${cell.zone === "rim" ? "×" : ""}`;
	flow.text(mark, x + 2, top + 28, { size: 6.5, color: COLORS.muted });
}

function drawBeatsRow(
	flow: Flow,
	song: Song,
	row: Extract<GridRow, { kind: "beats" }>,
	keyOf: (cell: TimedCell) => string,
	gridLeft: number,
	beatWidth: number,
): void {
	const top = flow.y;
	const span = row.to - row.from;
	const xOf = (beat: number) => gridLeft + (beat - row.from) * beatWidth;

	for (let beat = row.from; beat < row.to - EPSILON; beat++) {
		const width = Math.min(1, row.to - beat) * beatWidth;
		flow.rect({
			x: xOf(beat),
			y: top,
			width,
			height: ROW_HEIGHT,
			stroke: COLORS.faint,
			strokeWidth: 0.5,
		});
		const count = song.meter ? (beat % song.meter.beats) + 1 : beat + 1;
		flow.text(String(count), xOf(beat) + 2, top + 6.5, {
			size: 5,
			color: COLORS.faint,
		});
	}
	flow.rect({
		x: gridLeft,
		y: top,
		width: span * beatWidth,
		height: ROW_HEIGHT,
		stroke: COLORS.ink,
		strokeWidth: 0.75,
	});
	if (song.meter) {
		for (let beat = row.from + 1; beat < row.to - EPSILON; beat++) {
			if (beat % song.meter.beats !== 0) continue;
			flow.line({
				x1: xOf(beat),
				y1: top,
				x2: xOf(beat),
				y2: top + ROW_HEIGHT,
				stroke: COLORS.ink,
				strokeWidth: 0.9,
			});
		}
	}

	for (const cell of row.timed.cells) {
		if (cell.start < row.from - EPSILON || cell.start >= row.to - EPSILON) {
			continue;
		}
		const slotWidth = Math.min(cell.duration, row.to - cell.start) * beatWidth;
		drawCell(flow, cell, xOf(cell.start), top, slotWidth, row.hitSize);
		flow.cells[keyOf(cell)] = {
			page: flow.pages.length - 1,
			x: xOf(cell.start),
			y: top,
			width: slotWidth,
			height: ROW_HEIGHT,
		};
	}

	if (row.last && row.timed.repeat > 1) {
		const x = xOf(row.to) + 6;
		flow.text(`×${row.timed.repeat}`, x, top + 16, { size: 10, bold: true });
		if (row.timed.label) {
			const label = row.timed.label;
			flow.text(label, x, top + 27, {
				size: fitSize(label, 6.5, REPEAT_COLUMN - 8, false),
				color: COLORS.muted,
			});
		}
	}
}

function drawSection(flow: Flow, song: Song, sectionIndex: number): void {
	const section = song.sections[sectionIndex];
	const gridLeft = flow.left + LABEL_COLUMN;
	const gridWidth = flow.width - LABEL_COLUMN - REPEAT_COLUMN;
	const beatWidth = gridWidth / BEATS_PER_ROW;
	const blocks = section.phrases.map((phrase) =>
		phraseRows(phrase, gridWidth, beatWidth),
	);
	const heightOf = (row: GridRow) =>
		row.kind === "remark" ? REMARK_PITCH : ROW_HEIGHT;

	const firstRow = blocks[0]?.[0];
	flow.ensure(19 + (firstRow ? heightOf(firstRow) : 0));
	drawSectionTitle(flow, song, section);

	blocks.forEach((rows, phraseIndex) => {
		const phrase = section.phrases[phraseIndex];
		rows.forEach((row, rowIndex) => {
			const height = heightOf(row);
			flow.ensure(height);
			const top = flow.y;
			if (row.kind === "beats") {
				flow.rect({
					x: flow.left,
					y: top,
					width: LABEL_COLUMN,
					height,
					stroke: COLORS.ink,
					strokeWidth: 0.75,
					...(phrase.group ? { fill: GROUP_FILL[phrase.group] } : {}),
				});
			}
			if (rowIndex === 0) {
				const number = String(phraseIndex + 1);
				const repeat = phrase.repeat > 1 ? ` (x${phrase.repeat})` : "";
				const numberWidth = flow.text(number, flow.left + 6, top + 16, {
					size: 11,
					bold: true,
				});
				flow.text(repeat, flow.left + 6 + numberWidth, top + 16, {
					size: 7.5,
					bold: true,
				});
			}
			if (row.kind === "remark") {
				flow.text(row.text, gridLeft + 2, top + 9, {
					size: 9,
					color: COLORS.muted,
				});
			} else {
				drawBeatsRow(
					flow,
					song,
					row,
					(cell) =>
						cellKey(
							sectionIndex,
							phraseIndex,
							row.lineIndex,
							cell.token,
							cell.unit,
						),
					gridLeft,
					beatWidth,
				);
			}
			flow.y += height;
		});
		flow.y += 5;
	});
	flow.y += 13;
}

/**
 * The same song on a beat grid: one box per beat, every syllable at the
 * instant it is played. Shows how the sheet text was timed.
 */
export function layoutGrid(
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
	drawLegend(flow, song, gridLegend(song));
	drawFooters(flow, song);
	return { pages: flow.pages, cells: flow.cells };
}
