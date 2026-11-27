import type { GroupColor } from "../model";
import { measureText } from "./metrics";

export type RectItem = {
	type: "rect";
	x: number;
	y: number;
	width: number;
	height: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
};

export type LineItem = {
	type: "line";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	stroke: string;
	strokeWidth: number;
};

export type TextItem = {
	type: "text";
	x: number;
	/** Baseline. */
	y: number;
	text: string;
	size: number;
	bold: boolean;
	italic: boolean;
	color: string;
	/** Measured width: renderers stretch the text to it so boxes line up. */
	width: number;
};

export type LayoutItem = RectItem | LineItem | TextItem;

export type LayoutPage = { width: number; height: number; items: LayoutItem[] };

export type CellBox = {
	page: number;
	x: number;
	y: number;
	width: number;
	height: number;
};

/** Device-independent drawing of a sheet, in points, one entry per page. */
export type SheetLayout = {
	pages: LayoutPage[];
	/** Where each playable cell sits, by `cellKey`, for the play cursor. */
	cells: Record<string, CellBox>;
};

export type SheetLabels = {
	composer: string;
	transcriber: string;
	tempo: string;
	swing: string;
	meter: string;
	sequence: string;
	legend: string;
	note: string;
	/** `{n}` and `{total}` are replaced. */
	page: string;
};

export const DEFAULT_LABELS: SheetLabels = {
	composer: "Composição",
	transcriber: "Digitação",
	tempo: "Andamento",
	swing: "com suíngue",
	meter: "compasso",
	sequence: "SEQUÊNCIA",
	legend: "LEGENDA",
	note: "Obs.",
	page: "página {n} de {total}",
};

export type LayoutOptions = {
	pageWidth?: number;
	pageHeight?: number;
	margin?: number;
	/** Printed on top of every sheet. Empty string hides it. */
	groupName?: string;
	legend?: boolean;
	labels?: Partial<SheetLabels>;
};

export type ResolvedOptions = {
	pageWidth: number;
	pageHeight: number;
	margin: number;
	groupName: string;
	legend: boolean;
	labels: SheetLabels;
};

export const DEFAULT_GROUP_NAME = "Grupo Kodon Amazon Taiko";

export function resolveOptions(options: LayoutOptions = {}): ResolvedOptions {
	return {
		// A4 in points.
		pageWidth: options.pageWidth ?? 595.28,
		pageHeight: options.pageHeight ?? 841.89,
		margin: options.margin ?? 56,
		groupName: options.groupName ?? DEFAULT_GROUP_NAME,
		legend: options.legend ?? true,
		labels: { ...DEFAULT_LABELS, ...options.labels },
	};
}

export const COLORS = {
	ink: "#000000",
	muted: "#555555",
	faint: "#b4b4b4",
	paper: "#ffffff",
	/** `--kodon-red` of the site: hsl(352 73% 44%). */
	brand: "#c21e34",
} as const;

/** Row fills of the Kodon sheet (Word's light blue and light orange). */
export const GROUP_FILL: Record<GroupColor, string> = {
	azul: "#d9e2f3",
	laranja: "#f7caac",
	verde: "#e2efd9",
	rosa: "#f8d7e8",
};

export type TextStyle = {
	size: number;
	bold?: boolean;
	italic?: boolean;
	color?: string;
};

export type Run = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	color?: string;
	/** `cellKey` of the cell this run prints. */
	key?: string;
};

/** Top-to-bottom page builder shared by the sheet and the grid views. */
export class Flow {
	readonly options: ResolvedOptions;
	readonly pages: LayoutPage[] = [];
	readonly cells: Record<string, CellBox> = {};
	y = 0;

	constructor(options: ResolvedOptions) {
		this.options = options;
		this.addPage();
	}

	get page(): LayoutPage {
		return this.pages[this.pages.length - 1];
	}

	get left(): number {
		return this.options.margin;
	}

	get right(): number {
		return this.options.pageWidth - this.options.margin;
	}

	get width(): number {
		return this.right - this.left;
	}

	/** Lowest y the content may reach. The footer sits below it. */
	get bottom(): number {
		return this.options.pageHeight - this.options.margin;
	}

	addPage(): void {
		const { pageWidth, pageHeight, margin } = this.options;
		this.pages.push({
			width: pageWidth,
			height: pageHeight,
			items: [
				{
					type: "rect",
					x: 0,
					y: 0,
					width: pageWidth,
					height: pageHeight,
					fill: COLORS.paper,
				},
			],
		});
		this.y = margin;
	}

	/** Starts a new page when `height` does not fit in what is left. */
	ensure(height: number): void {
		if (this.y + height > this.bottom && this.y > this.options.margin) {
			this.addPage();
		}
	}

	rect(item: Omit<RectItem, "type">): void {
		this.page.items.push({ type: "rect", ...item });
	}

	line(item: Omit<LineItem, "type">): void {
		this.page.items.push({ type: "line", ...item });
	}

	/** Draws left-aligned text on `baseline` and returns its width. */
	text(text: string, x: number, baseline: number, style: TextStyle): number {
		const width = measureText(text, style.size, style.bold);
		if (text !== "") {
			this.page.items.push({
				type: "text",
				x,
				y: baseline,
				text,
				size: style.size,
				bold: style.bold ?? false,
				italic: style.italic ?? false,
				color: style.color ?? COLORS.ink,
				width,
			});
		}
		return width;
	}

	textCentered(
		text: string,
		center: number,
		baseline: number,
		style: TextStyle,
	): void {
		const width = measureText(text, style.size, style.bold);
		this.text(text, center - width / 2, baseline, style);
	}

	/** Draws runs side by side from `x`, registering play-cursor boxes. */
	runs(runs: Run[], x: number, baseline: number, size: number): number {
		let cursor = x;
		for (const run of runs) {
			const width = this.text(run.text, cursor, baseline, {
				size,
				bold: run.bold,
				italic: run.italic,
				color: run.color,
			});
			if (run.underline) {
				this.line({
					x1: cursor,
					y1: baseline + size * 0.14,
					x2: cursor + width,
					y2: baseline + size * 0.14,
					stroke: run.color ?? COLORS.ink,
					strokeWidth: size * (run.bold ? 0.09 : 0.06),
				});
			}
			if (run.key !== undefined) {
				this.cells[run.key] = {
					page: this.pages.length - 1,
					x: cursor - 1,
					y: baseline - size * 0.82,
					width: width + 2,
					height: size * 1.12,
				};
			}
			cursor += width;
		}
		return cursor - x;
	}
}

export function runsWidth(runs: Run[], size: number): number {
	return runs.reduce(
		(sum, run) => sum + measureText(run.text, size, run.bold),
		0,
	);
}

/** Greedy word wrap for plain text. */
export function wrapText(
	text: string,
	maxWidth: number,
	size: number,
	bold = false,
): string[] {
	const lines: string[] = [];
	let current = "";
	for (const word of text.split(/\s+/).filter((item) => item !== "")) {
		const candidate = current === "" ? word : `${current} ${word}`;
		if (current !== "" && measureText(candidate, size, bold) > maxWidth) {
			lines.push(current);
			current = word;
		} else {
			current = candidate;
		}
	}
	if (current !== "") lines.push(current);
	return lines.length > 0 ? lines : [""];
}
