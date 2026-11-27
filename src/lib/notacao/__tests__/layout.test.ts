import { describe, expect, it } from "vitest";
import {
	GROUP_FILL,
	type LayoutItem,
	layoutGrid,
	layoutSheet,
	layoutSong,
	measureText,
	type SheetLayout,
	type TextItem,
} from "../layout";
import { ichigo, miyake } from "../musicas";
import { parseSong } from "../parser";

const items = (layout: SheetLayout): LayoutItem[] =>
	layout.pages.flatMap((page) => page.items);

const texts = (layout: SheetLayout): TextItem[] =>
	items(layout).filter((item): item is TextItem => item.type === "text");

const printed = (layout: SheetLayout) => texts(layout).map((item) => item.text);

describe("measureText", () => {
	it("uses the standard Helvetica widths", () => {
		expect(measureText("A", 1000)).toBe(667);
		expect(measureText("a", 1000)).toBe(556);
		expect(measureText(" ", 1000)).toBe(278);
		expect(measureText("DON", 1000)).toBe(722 + 778 + 722);
		expect(measureText("A", 1000, true)).toBe(722);
	});

	it("measures accented letters as their base letter", () => {
		expect(measureText("ç", 1000)).toBe(measureText("c", 1000));
		expect(measureText("Ã", 1000)).toBe(measureText("A", 1000));
		expect(measureText("–", 1000)).toBe(556);
	});
});

describe("layoutSheet: the Kodon sheet", () => {
	const layout = layoutSheet(ichigo);

	it("fits ICHIGO on two A4 pages, like the group's sheet", () => {
		expect(layout.pages).toHaveLength(2);
		expect(layout.pages[0]).toMatchObject({ width: 595.28, height: 841.89 });
	});

	it("prints the group, the title and the sheet header", () => {
		const all = printed(layout);
		expect(all).toContain("GRUPO KODON AMAZON TAIKO");
		expect(all).toContain("ICHIGO");
		expect(all).toContain("Composição: ");
		expect(all).toContain("Chad Nakagawa & Taishoji Taiko");
		expect(all).toContain("Digitação: ");
		expect(all).toContain("120 bpm, compasso 4/4");
	});

	it("prints one titled table per section and the sequence at the end", () => {
		const all = printed(layout);
		for (const title of ["VERSO A", "REFRÃO", "VERSO B", "SEQUÊNCIA:"]) {
			expect(all).toContain(title);
		}
		expect(all).toContain("VERSO A > REFRÃO > VERSO B > VERSO A > REFRÃO");
	});

	it("numbers the phrases and marks the repeated ones", () => {
		const all = printed(layout);
		expect(all.filter((text) => text === "21")).toHaveLength(1);
		expect(all.filter((text) => text === "(x2)")).toHaveLength(3);
	});

	it("paints the rows of each group: ten blue and ten orange", () => {
		const fills = items(layout).flatMap((item) =>
			item.type === "rect" && item.fill ? [item.fill] : [],
		);
		expect(fills.filter((fill) => fill === GROUP_FILL.azul)).toHaveLength(10);
		expect(fills.filter((fill) => fill === GROUP_FILL.laranja)).toHaveLength(
			10,
		);
	});

	it("prints syllables in their casing, kakegoe in italics", () => {
		const weak = texts(layout).find((item) => item.text === "do");
		const kakegoe = texts(layout).find((item) => item.text === "(HA!)");
		const loud = texts(layout).find((item) => item.text === "(SA-SA-SA-SA!)");
		expect(weak).toBeDefined();
		expect(kakegoe).toMatchObject({ italic: true, bold: false });
		expect(loud).toMatchObject({ italic: true, bold: true });
	});

	it("underlines accents: 2 x 2 in VERSO A, 1 in REFRÃO, 6 in VERSO B", () => {
		// Underlines are the only black lines; the header rule is red and the
		// legend rule is grey.
		const underlines = items(layout).filter(
			(item) => item.type === "line" && item.stroke === "#000000",
		);
		expect(underlines).toHaveLength(4 + 1 + 6);
	});

	it("prints remarks in parentheses and inline repeats as written", () => {
		const all = printed(layout);
		expect(all).toContain("(do kon, Do Kon, DO KON , DON KON)");
		expect(all).toContain("(X4 CRESCENTE)");
		expect(all).toContain("(X8)");
	});

	it("never prints the timing marks", () => {
		const all = printed(layout).join("|");
		expect(all).not.toContain("_");
		expect(all).not.toContain(":2");
	});

	it("maps every printed syllable and kakegoe to a box for the cursor", () => {
		// First line of the sheet: >DON (HA!) – >>DON (HA!)
		for (const key of ["0.0.0.0.0", "0.0.0.1.0", "0.0.0.2.0", "0.0.0.3.0"]) {
			expect(layout.cells[key]).toMatchObject({ page: 0 });
		}
		// DONdo: one box per syllable, side by side.
		const don = layout.cells["1.0.0.0.0"];
		const weakDo = layout.cells["1.0.0.0.1"];
		expect(weakDo.x).toBeGreaterThan(don.x);
		expect(weakDo.y).toBe(don.y);
		// The silent slot after DONdo-KONko-DON has no box on the sheet.
		expect(layout.cells["1.0.0.3.0"]).toBeUndefined();
	});

	it("keeps everything inside the page", () => {
		for (const page of layout.pages) {
			for (const item of page.items) {
				if (item.type !== "text") continue;
				expect(item.x).toBeGreaterThanOrEqual(0);
				expect(item.x + item.width).toBeLessThanOrEqual(page.width);
				expect(item.y).toBeLessThanOrEqual(page.height);
			}
		}
	});

	it("declares the width it measured for every text", () => {
		for (const item of texts(layout)) {
			expect(item.width).toBeCloseTo(
				measureText(item.text, item.size, item.bold),
			);
		}
	});

	it("explains the syllables and conventions the song uses", () => {
		const all = printed(layout);
		expect(all).toContain("LEGENDA");
		expect(all).toContain("batida cheia no centro, mão direita");
		expect(all).toContain("batida na borda (fuchi), mão direita");
		expect(all).toContain("acento");
		expect(all).toContain("grupo ou lado que toca a frase");
	});

	it("can leave the group name and the legend out", () => {
		const bare = printed(layoutSheet(ichigo, { groupName: "", legend: false }));
		expect(bare).not.toContain("GRUPO KODON AMAZON TAIKO");
		expect(bare).not.toContain("LEGENDA");
	});

	it("names the part of each section when the song has more than one", () => {
		const all = printed(layoutSheet(miyake));
		expect(all).toContain("Marcação (nagado)");
		expect(all).toContain("66 bpm, com suíngue");
		expect(all).toContain("MARCAÇÃO (x8) > MÚSICA BASE + MARCAÇÃO (x4) >");
	});

	it("wraps a line too long for the row instead of running off it", () => {
		const long = parseSong(
			`título: X\n[A]\n1: ${Array.from({ length: 40 }, () => "DONKON").join(" ")}`,
		);
		const wrapped = layoutSheet(long);
		const rows = new Set(
			texts(wrapped)
				.filter((item) => item.text === "DON")
				.map((item) => item.y),
		);
		expect(rows.size).toBeGreaterThan(1);
	});

	it("starts a new page rather than cutting a row in half", () => {
		const tall = parseSong(
			`título: X\n[A]\n${Array.from({ length: 60 }, (_, index) => `${index + 1}: DON`).join("\n")}`,
		);
		const paged = layoutSheet(tall);
		expect(paged.pages.length).toBeGreaterThan(1);
		for (const page of paged.pages) {
			for (const item of page.items) {
				if (item.type !== "rect" || !item.stroke) continue;
				expect(item.y + item.height).toBeLessThanOrEqual(page.height - 56);
			}
		}
	});
});

describe("layoutGrid: the beat grid", () => {
	const layout = layoutGrid(ichigo);

	it("places each syllable at the instant it is played", () => {
		// DON KONDON KONDON-KON: DON on beat 1, KON and DON sharing beat 2.
		const don = layout.cells["0.0.1.0.0"];
		const kon = layout.cells["0.0.1.1.0"];
		const secondDon = layout.cells["0.0.1.1.1"];
		expect(kon.x - don.x).toBeCloseTo(don.width);
		expect(secondDon.x - kon.x).toBeCloseTo(don.width / 2);
		expect(kon.width).toBeCloseTo(don.width / 2);
	});

	it("gives the silent slots a box, unlike the sheet", () => {
		expect(layout.cells["1.0.0.3.0"]).toBeDefined();
		expect(printed(layout)).toContain("·");
	});

	it("shows the hand under each stroke and marks the rim", () => {
		const all = printed(layout);
		expect(all).toContain("D");
		expect(all).toContain("E");
		expect(all).toContain("D×");
	});

	it("shows an inline repeat once, with its count", () => {
		const all = printed(layout);
		expect(all).toContain("×8");
		expect(all).toContain("CRESCENTE");
	});

	it("breaks a long line into rows of eight beats", () => {
		const song = parseSong(
			`título: X\n[A]\n1: ${Array.from({ length: 12 }, () => "DON").join(" ")}`,
		);
		const grid = layoutGrid(song);
		expect(grid.cells["0.0.0.8.0"].y).toBeGreaterThan(
			grid.cells["0.0.0.7.0"].y,
		);
		expect(grid.cells["0.0.0.8.0"].x).toBeCloseTo(grid.cells["0.0.0.0.0"].x);
	});
});

describe("layoutSong", () => {
	it("draws the sheet by default and the grid on request", () => {
		expect(layoutSong(ichigo)).toEqual(layoutSheet(ichigo));
		expect(layoutSong(ichigo, "grade")).toEqual(layoutGrid(ichigo));
	});
});
