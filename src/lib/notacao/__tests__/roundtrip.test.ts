import { describe, expect, it } from "vitest";
import { ichigo, ichigoSource, miyake, miyakeSource } from "../musicas";
import { parseSong } from "../parser";
import { serializeSong } from "../serializer";

/** The source as written, minus the comment lines the model does not keep. */
const withoutComments = (source: string) =>
	source
		.split("\n")
		.filter((line) => !line.trim().startsWith("#"))
		.join("\n");

describe.each([
	["ICHIGO", ichigo, ichigoSource],
	["MIYAKE", miyake, miyakeSource],
])("%s round trip", (_, song, source) => {
	it("serializes back to the text it was written in", () => {
		expect(serializeSong(song)).toBe(withoutComments(source));
	});

	it("parses its own serialization into the same model", () => {
		expect(parseSong(serializeSong(song))).toEqual(song);
	});

	it("survives a trip through JSON, as it would in a database", () => {
		const stored = JSON.parse(JSON.stringify(song));
		expect(serializeSong(stored)).toBe(serializeSong(song));
	});
});

describe("ICHIGO, against the group's printed sheet", () => {
	it("has the header of the sheet", () => {
		expect(ichigo).toMatchObject({
			title: "ICHIGO",
			composer: "Chad Nakagawa & Taishoji Taiko",
			transcriber: "Andrey Viana",
		});
	});

	it("has the three sections with their numbered phrases", () => {
		expect(
			ichigo.sections.map((section) => [section.name, section.phrases.length]),
		).toEqual([
			["VERSO A", 4],
			["REFRÃO", 2],
			["VERSO B", 21],
		]);
	});

	it("repeats the phrases the sheet marks with (x2)", () => {
		const repeats = (index: number) =>
			ichigo.sections[index].phrases.map((phrase) => phrase.repeat);
		expect(repeats(0)).toEqual([2, 2, 1, 1]);
		expect(repeats(1)).toEqual([2, 1]);
	});

	it("alternates blue and orange rows in VERSO B, the last one plain", () => {
		const groups = ichigo.sections[2].phrases.map((phrase) => phrase.group);
		expect(groups.slice(0, 20)).toEqual(
			Array.from({ length: 20 }, (_, index) =>
				index % 2 === 0 ? "azul" : "laranja",
			),
		);
		expect(groups[20]).toBeUndefined();
	});

	it("narrows the call and response: 8, 4, 2, then single strokes", () => {
		const counts = ichigo.sections[2].phrases.map((phrase) => {
			const line = phrase.lines[0];
			return line.kind === "notes" ? (line.repeat?.count ?? 1) : 0;
		});
		expect(counts).toEqual([
			8, 8, 8, 8, 4, 4, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		]);
	});

	it("keeps the sequence printed at the end of the sheet", () => {
		expect(ichigo.sequence.map((step) => step.sections[0])).toEqual([
			"VERSO A",
			"REFRÃO",
			"VERSO B",
			"VERSO A",
			"REFRÃO",
		]);
	});
});

describe("canonical form", () => {
	const canonical = (body: string) =>
		serializeSong(parseSong(`título: X\n[A]\n1: ${body}`)).split("\n")[4];

	it.each([
		["DONKON(X4)", "1: DONKON (X4)"],
		["DON - KON", "1: DON – KON"],
		["Do Kon", "1: DO KON"],
		["doko:0.5", "1: doko:1/2"],
		["DON:1.5", "1: DON:3/2"],
		["DON   KON", "1: DON KON"],
		["( HA! )", "1: (HA!)"],
		[">>(HA!)", "1: >(HA!)"],
	])("writes %s as %s", (written, expected) => {
		expect(canonical(written)).toBe(expected);
	});

	it("writes multi-line phrases indented under their number", () => {
		const text = serializeSong(parseSong("título: X\n[A]\n1 (x2): DON\nKON"));
		expect(text).toContain("1 (x2):\n  DON\n  KON\n");
	});

	it("leaves out what is default: single part, free meter, no sequence", () => {
		expect(serializeSong(parseSong("título: X"))).toBe("título: X\nbpm: 100\n");
	});
});
