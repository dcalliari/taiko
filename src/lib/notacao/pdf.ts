import { jsPDF } from "jspdf";
import { layoutSong, type SheetView } from "./layout";
import type { LayoutOptions, SheetLayout } from "./layout/flow";
import { resolveOptions } from "./layout/flow";
import type { Song } from "./model";

export type PdfOptions = LayoutOptions & {
	/** "ficha" is the sheet as the group writes it. Default. */
	view?: SheetView;
};

/**
 * The standard PDF fonts only cover WinAnsi (Latin-1 plus a few signs).
 * Anything else, such as kana, would come out as garbage, so it is replaced.
 */
const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

function toWinAnsi(text: string): string {
	let safe = "";
	for (const char of text) {
		const code = char.codePointAt(0) ?? 0;
		const supported =
			(code >= 0x20 && code <= 0x7e) ||
			(code >= 0xa0 && code <= 0xff) ||
			WIN_ANSI_EXTRA.includes(char);
		safe += supported ? char : "?";
	}
	return safe;
}

function fontStyle(bold: boolean, italic: boolean): string {
	if (bold && italic) return "bolditalic";
	if (bold) return "bold";
	return italic ? "italic" : "normal";
}

/** Draws a computed layout into a PDF and returns its bytes. */
export function layoutToPdf(
	layout: SheetLayout,
	info: { title: string; author: string },
): Uint8Array<ArrayBuffer> {
	const first = layout.pages[0];
	const doc = new jsPDF({
		unit: "pt",
		format: [first.width, first.height],
		orientation: first.width > first.height ? "landscape" : "portrait",
		compress: true,
		putOnlyUsedFonts: true,
	});
	doc.setProperties({
		title: toWinAnsi(info.title),
		author: toWinAnsi(info.author),
		creator: toWinAnsi(info.author),
	});
	doc.setLanguage("pt-BR");

	layout.pages.forEach((page, index) => {
		if (index > 0) {
			doc.addPage(
				[page.width, page.height],
				page.width > page.height ? "landscape" : "portrait",
			);
		}
		for (const item of page.items) {
			if (item.type === "rect") {
				if (item.fill) doc.setFillColor(item.fill);
				if (item.stroke) {
					doc.setDrawColor(item.stroke);
					doc.setLineWidth(item.strokeWidth ?? 1);
				}
				const style = item.fill && item.stroke ? "FD" : item.fill ? "F" : "S";
				doc.rect(item.x, item.y, item.width, item.height, style);
			} else if (item.type === "line") {
				doc.setDrawColor(item.stroke);
				doc.setLineWidth(item.strokeWidth);
				doc.line(item.x1, item.y1, item.x2, item.y2);
			} else {
				doc.setFont("helvetica", fontStyle(item.bold, item.italic));
				doc.setFontSize(item.size);
				doc.setTextColor(item.color);
				doc.text(toWinAnsi(item.text), item.x, item.y);
			}
		}
	});
	return new Uint8Array(doc.output("arraybuffer"));
}

/**
 * Renders the song sheet as a PDF. Runs unchanged in the browser and on the
 * server (Node), and needs no font files.
 */
export function songToPdf(
	song: Song,
	options: PdfOptions = {},
): Uint8Array<ArrayBuffer> {
	const { view = "ficha", ...layoutOptions } = options;
	return layoutToPdf(layoutSong(song, view, layoutOptions), {
		title: song.title,
		author: resolveOptions(layoutOptions).groupName,
	});
}
