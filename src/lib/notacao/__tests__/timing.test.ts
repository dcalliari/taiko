import { describe, expect, it } from "vitest";
import type { NotesLine } from "../model";
import { ichigo, miyake } from "../musicas";
import { parseSong } from "../parser";
import { phraseBeats, sectionBeats, timeLine } from "../timing";

function timed(text: string) {
	const song = parseSong(`título: X\n[A]\n1: ${text}`);
	return timeLine(song.sections[0].phrases[0].lines[0] as NotesLine);
}

const grid = (text: string) =>
	timed(text).cells.map((cell) => [cell.text, cell.start, cell.duration]);

describe("duration rule", () => {
	it("gives every written word one beat", () => {
		expect(grid("DON KON DON")).toEqual([
			["DON", 0, 1],
			["KON", 1, 1],
			["DON", 2, 1],
		]);
	});

	it("splits the beat evenly among fused syllables", () => {
		expect(grid("DONKON")).toEqual([
			["DON", 0, 0.5],
			["KON", 0.5, 0.5],
		]);
		expect(grid("dokodoko")).toEqual([
			["do", 0, 0.25],
			["ko", 0.25, 0.25],
			["do", 0.5, 0.25],
			["ko", 0.75, 0.25],
		]);
	});

	it("adds no time for spaces, hyphens or dashes", () => {
		expect(timed("DON KON").beats).toBe(2);
		expect(timed("DON-KON").beats).toBe(2);
		expect(timed("DON – KON").beats).toBe(2);
		expect(timed("DON- KON").beats).toBe(2);
	});

	it("gives a kakegoe one beat per spoken word", () => {
		expect(grid("(HA!)")).toEqual([["HA!", 0, 1]]);
		expect(grid("(SA-SA-SA-SA!)")).toEqual([["SA-SA-SA-SA!", 0, 4]]);
		expect(grid("(ICHI-NI-SO-RE!)")).toEqual([["ICHI-NI-SO-RE!", 0, 4]]);
	});

	it("lets explicit beats override the default", () => {
		expect(grid("DON:2 doko:1/2 (SORE!):2")).toEqual([
			["DON", 0, 2],
			["do", 2, 0.25],
			["ko", 2.25, 0.25],
			["SORE!", 2.5, 2],
		]);
	});

	it("treats _ as a silent slot, alone or inside a word", () => {
		const cells = timed("DON _ _ko").cells;
		expect(cells.map((cell) => [cell.kind, cell.start, cell.visible])).toEqual([
			["hit", 0, true],
			["rest", 1, false],
			["rest", 2, false],
			["hit", 2.5, true],
		]);
	});

	it("keeps a spoken rest visible but does not play it", () => {
		expect(timed("DON su").cells[1]).toMatchObject({
			kind: "rest",
			text: "su",
			visible: true,
		});
	});

	it("carries hand, zone, strength and accent on every cell", () => {
		expect(timed(">DON ko KA >>ra tsu").cells).toMatchObject([
			{ hand: "right", zone: "center", weak: false, accent: 1 },
			{ hand: "left", zone: "center", weak: true, accent: 0 },
			{ hand: "right", zone: "rim", weak: false, accent: 0 },
			{ hand: "left", zone: "rim", weak: true, accent: 2 },
			{ hand: "right", zone: "center", weak: true, soft: true },
		]);
	});

	it("reports the inline repeat without unrolling it", () => {
		expect(timed("DO KON (X4 CRESCENTE)")).toMatchObject({
			beats: 2,
			repeat: 4,
			label: "CRESCENTE",
		});
	});
});

describe("length of the example songs", () => {
	it("makes every section of ICHIGO a whole number of 4/4 bars", () => {
		expect(ichigo.sections.map(sectionBeats)).toEqual([64, 48, 68]);
	});

	it("gives ICHIGO's first phrase sixteen beats, played twice", () => {
		expect(phraseBeats(ichigo.sections[0].phrases[0])).toBe(32);
	});

	it("gives MIYAKE a one-beat base under a 22-beat phrase", () => {
		expect(miyake.sections.map(sectionBeats)).toEqual([1, 22]);
		expect(miyake.sections[1].phrases.map(phraseBeats)).toEqual([14, 4, 4]);
	});
});
