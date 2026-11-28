import { describe, expect, it } from "vitest";
import {
	partOfSection,
	resolveSequence,
	type Song,
	songSchema,
} from "../model";
import { ichigo, miyake } from "../musicas";

const base: Song = {
	title: "Teste",
	bpm: 120,
	swing: false,
	parts: [{ name: "Taiko", instrument: "nagado" }],
	groups: [],
	notes: [],
	sections: [
		{
			name: "A",
			phrases: [
				{
					repeat: 1,
					lines: [
						{
							kind: "notes",
							tokens: [
								{
									kind: "word",
									accent: 0,
									units: [{ kind: "syllable", text: "don", weak: false }],
								},
							],
						},
					],
				},
			],
		},
	],
	sequence: [],
};

const messagesOf = (song: unknown) => {
	const result = songSchema.safeParse(song);
	return result.success
		? []
		: result.error.issues.map((issue) => issue.message);
};

describe("songSchema", () => {
	it("accepts the example songs", () => {
		expect(songSchema.safeParse(ichigo).success).toBe(true);
		expect(songSchema.safeParse(miyake).success).toBe(true);
		expect(songSchema.safeParse(base).success).toBe(true);
	});

	it("rejects a tempo outside the playable range", () => {
		expect(messagesOf({ ...base, bpm: 5 })).toHaveLength(1);
		expect(messagesOf({ ...base, bpm: 1000 })).toHaveLength(1);
	});

	it("rejects two sections with the same name", () => {
		const song = { ...base, sections: [...base.sections, ...base.sections] };
		expect(messagesOf(song).join()).toContain("já existe uma seção");
	});

	it("rejects a sequence that cites a section that does not exist", () => {
		const song = { ...base, sequence: [{ sections: ["B"], repeat: 1 }] };
		expect(messagesOf(song).join()).toContain('cita a seção "B"');
	});

	it("rejects a section assigned to an undeclared part", () => {
		const song = {
			...base,
			sections: [{ ...base.sections[0], part: "Fue" }],
		};
		expect(messagesOf(song).join()).toContain("não foi declarada");
	});

	it("rejects an instrument outside the list", () => {
		const song = { ...base, parts: [{ name: "X", instrument: "bumbo" }] };
		expect(messagesOf(song)).toHaveLength(1);
	});

	it("rejects syllables that would not read back the same way", () => {
		const word = (texts: string[]) => ({
			...base,
			sections: [
				{
					name: "A",
					phrases: [
						{
							repeat: 1,
							lines: [
								{
									kind: "notes",
									tokens: [
										{
											kind: "word",
											accent: 0,
											units: texts.map((text) => ({
												kind: "syllable",
												text,
												weak: false,
											})),
										},
									],
								},
							],
						},
					],
				},
			],
		});
		expect(messagesOf(word(["don", "kon"]))).toEqual([]);
		// "doko" is two syllables, and "ko" + "n" would read back as "kon".
		expect(messagesOf(word(["doko"])).join()).toContain("não formam");
		expect(messagesOf(word(["ko", "n"])).join()).toContain("não formam");
	});

	it("rejects a kakegoe that would read back as a repeat", () => {
		const song = structuredClone(base);
		song.sections[0].phrases[0].lines = [
			{
				kind: "notes",
				tokens: [{ kind: "voice", text: "X8", emphasis: false }],
			},
		];
		expect(messagesOf(song)).toHaveLength(1);
	});
});

describe("resolveSequence", () => {
	it("returns the written sequence when there is one", () => {
		expect(resolveSequence(ichigo)).toBe(ichigo.sequence);
	});

	it("falls back to every section once, in written order", () => {
		expect(resolveSequence({ ...ichigo, sequence: [] })).toEqual([
			{ sections: ["VERSO A"], repeat: 1 },
			{ sections: ["REFRÃO"], repeat: 1 },
			{ sections: ["VERSO B"], repeat: 1 },
		]);
	});
});

describe("partOfSection", () => {
	it("uses the first part unless the section names another", () => {
		const [marcacao, musicaBase] = miyake.sections;
		expect(partOfSection(miyake, marcacao).name).toBe("Marcação");
		expect(partOfSection(miyake, musicaBase).name).toBe("Música Base");
	});
});
