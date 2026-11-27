import { describe, expect, it } from "vitest";
import type { NotesLine, WordToken } from "../model";
import { NotationError, parseSong, safeParseSong } from "../parser";

const song = (body: string) => `título: Teste\n${body}`;

function firstLine(body: string): NotesLine {
	const parsed = parseSong(song(`[A]\n1: ${body}`));
	const line = parsed.sections[0].phrases[0].lines[0];
	if (line.kind !== "notes") throw new Error("expected a notes line");
	return line;
}

function issuesOf(source: string) {
	const result = safeParseSong(source);
	if (result.ok) throw new Error("expected the parse to fail");
	return result.issues;
}

describe("parseSong: header", () => {
	it("reads the sheet header", () => {
		const parsed = parseSong(
			[
				"título: ICHIGO",
				"composição: Chad Nakagawa & Taishoji Taiko",
				"digitação: Andrey Viana",
				"bpm: 132",
				"compasso: 4/4",
				"suingue: sim",
				"obs: primeira nota",
				"obs: segunda nota",
			].join("\n"),
		);
		expect(parsed).toMatchObject({
			title: "ICHIGO",
			composer: "Chad Nakagawa & Taishoji Taiko",
			transcriber: "Andrey Viana",
			bpm: 132,
			meter: { beats: 4, unit: 4 },
			swing: true,
			notes: ["primeira nota", "segunda nota"],
		});
	});

	it("accepts keys without accents and in any casing", () => {
		const parsed = parseSong("TITULO: X\nComposicao: Y\nDIGITAÇÃO: Z");
		expect(parsed).toMatchObject({
			title: "X",
			composer: "Y",
			transcriber: "Z",
		});
	});

	it("fills in the defaults the sheet leaves out", () => {
		const parsed = parseSong("título: X");
		expect(parsed.bpm).toBe(100);
		expect(parsed.swing).toBe(false);
		expect(parsed.meter).toBeUndefined();
		expect(parsed.parts).toEqual([{ name: "Taiko", instrument: "nagado" }]);
		expect(parsed.sequence).toEqual([]);
	});

	it("reads swing as sim or não, with or without the accent", () => {
		expect(parseSong("título: X\nsuingue: sim").swing).toBe(true);
		expect(parseSong("título: X\nsuingue: não").swing).toBe(false);
		expect(parseSong("título: X\nsuingue: nao").swing).toBe(false);
	});

	it("treats a free meter as no meter", () => {
		expect(parseSong("título: X\ncompasso: livre").meter).toBeUndefined();
	});

	it("reads parts with their instruments and group names", () => {
		const parsed = parseSong(
			"título: X\npartes: Música Base (nagado), Marcação (Shime)\ngrupos: azul = Lado direito, laranja = Lado esquerdo",
		);
		expect(parsed.parts).toEqual([
			{ name: "Música Base", instrument: "nagado" },
			{ name: "Marcação", instrument: "shime" },
		]);
		expect(parsed.groups).toEqual([
			{ color: "azul", label: "Lado direito" },
			{ color: "laranja", label: "Lado esquerdo" },
		]);
	});

	it("ignores comments, blank lines and Windows line endings", () => {
		const parsed = parseSong(
			"# comentário\r\ntítulo: X\r\n\r\n[A]\r\n# outro\r\n1: DON\r\n",
		);
		expect(parsed.sections[0].phrases).toHaveLength(1);
	});
});

describe("parseSong: sections and phrases", () => {
	it("reads numbered phrases with repeats and groups", () => {
		const parsed = parseSong(
			song(
				[
					"[VERSO B]",
					"1 (x2) @azul: DONKON (X8)",
					"2 @Laranja:",
					"  DON",
					"  KON",
					"3: DON",
				].join("\n"),
			),
		);
		const [first, second, third] = parsed.sections[0].phrases;
		expect(parsed.sections[0].name).toBe("VERSO B");
		expect(first).toMatchObject({ repeat: 2, group: "azul" });
		expect(second).toMatchObject({ repeat: 1, group: "laranja" });
		expect(second.lines).toHaveLength(2);
		expect(third.group).toBeUndefined();
	});

	it("renumbers phrases by position, whatever number was typed", () => {
		const parsed = parseSong(song("[A]\n7: DON\n7: KON"));
		expect(parsed.sections[0].phrases).toHaveLength(2);
	});

	it("assigns a section to a declared part", () => {
		const parsed = parseSong(
			"título: X\npartes: Taiko (nagado), Marcação (shime)\n[BASE]\nparte: marcacao\n1: DONdo",
		);
		expect(parsed.sections[0].part).toBe("Marcação");
	});

	it("keeps printed remarks apart from what is played", () => {
		const parsed = parseSong(
			song(
				"[A]\n1:\n  DO KON (X4 CRESCENTE)\n  obs: do kon, Do Kon, DO KON , DON KON",
			),
		);
		expect(parsed.sections[0].phrases[0].lines[1]).toEqual({
			kind: "remark",
			text: "do kon, Do Kon, DO KON , DON KON",
		});
	});
});

describe("parseSong: the running text", () => {
	it("splits fused syllables and reads the casing as strength", () => {
		const line = firstLine("DONdo-KONko-DON");
		expect(line.tokens).toEqual([
			{
				kind: "word",
				accent: 0,
				units: [
					{ kind: "syllable", text: "don", weak: false },
					{ kind: "syllable", text: "do", weak: true },
				],
			},
			{
				kind: "word",
				sep: "hyphen",
				accent: 0,
				units: [
					{ kind: "syllable", text: "kon", weak: false },
					{ kind: "syllable", text: "ko", weak: true },
				],
			},
			{
				kind: "word",
				sep: "hyphen",
				accent: 0,
				units: [{ kind: "syllable", text: "don", weak: false }],
			},
		]);
	});

	it("tells the four ways of joining words apart", () => {
		const line = firstLine("DON KON-DON – KON- KA");
		expect(line.tokens.map((token) => token.sep)).toEqual([
			undefined,
			undefined,
			"hyphen",
			"dash",
			"hyphen-space",
		]);
	});

	it("reads a spaced hyphen as the dash Word turns it into", () => {
		expect(firstLine("DON - KON").tokens[1].sep).toBe("dash");
	});

	it("reads accents: one sign underlines, two also make it bold", () => {
		const line = firstLine(">DON >>KON DON");
		expect(line.tokens.map((token) => (token as WordToken).accent)).toEqual([
			1, 2, 0,
		]);
	});

	it("reads kakegoe in parentheses as spoken, with optional emphasis", () => {
		const line = firstLine("DON (HA!) >(SA-SA-SA-SA!)");
		expect(line.tokens[1]).toEqual({
			kind: "voice",
			text: "HA!",
			emphasis: false,
		});
		expect(line.tokens[2]).toEqual({
			kind: "voice",
			text: "SA-SA-SA-SA!",
			emphasis: true,
		});
	});

	it("reads the repeat at the end of a line, with its indication", () => {
		expect(firstLine("DONKON (X8)").repeat).toEqual({ count: 8 });
		expect(firstLine("DONKON(x4)").repeat).toEqual({ count: 4 });
		expect(firstLine("DO KON (X4 CRESCENTE)").repeat).toEqual({
			count: 4,
			label: "CRESCENTE",
		});
	});

	it("reads fine timing: explicit beats and silent slots", () => {
		const line = firstLine(">DON:2- KA:1/2 _ _ko (SORE!):2 doko:0.5");
		expect(line.tokens).toMatchObject([
			{ kind: "word", duration: 2, accent: 1 },
			{ kind: "word", duration: 0.5, sep: "hyphen-space" },
			{ kind: "word", units: [{ kind: "rest" }] },
			{
				kind: "word",
				units: [{ kind: "rest" }, { kind: "syllable", text: "ko", weak: true }],
			},
			{ kind: "voice", text: "SORE!", duration: 2 },
			{ kind: "word", duration: 0.5 },
		]);
	});
});

describe("parseSong: sequence", () => {
	const base = song(
		"[VERSO A]\n1: DON\n[REFRÃO]\n1: KON\n[MARCAÇÃO]\n1: DONdo",
	);

	it("reads the order of the sections", () => {
		const parsed = parseSong(`${base}\nsequência: VERSO A > REFRÃO > VERSO A`);
		expect(parsed.sequence).toEqual([
			{ sections: ["VERSO A"], repeat: 1 },
			{ sections: ["REFRÃO"], repeat: 1 },
			{ sections: ["VERSO A"], repeat: 1 },
		]);
	});

	it("accepts the sheet's own form, with the steps on the next line", () => {
		const parsed = parseSong(`${base}\nSEQUÊNCIA:\nverso a > refrao`);
		expect(parsed.sequence.map((step) => step.sections[0])).toEqual([
			"VERSO A",
			"REFRÃO",
		]);
	});

	it("reads layers, repeats and tempo changes", () => {
		const parsed = parseSong(
			`${base}\nsequência: MARCAÇÃO (x8) > VERSO A + MARCAÇÃO (x2, 96 bpm)`,
		);
		expect(parsed.sequence).toEqual([
			{ sections: ["MARCAÇÃO"], repeat: 8 },
			{ sections: ["VERSO A", "MARCAÇÃO"], repeat: 2, bpm: 96 },
		]);
	});
});

describe("parseSong: problems", () => {
	it("throws a NotationError that lists every problem with its line", () => {
		let caught: unknown;
		try {
			parseSong("título: X\n[A]\n1: DON:abc\n2: DON %\n");
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(NotationError);
		const { issues } = caught as NotationError;
		expect(issues.map((issue) => issue.line)).toEqual([3, 4]);
		expect((caught as NotationError).message).toContain("linha 3");
	});

	it.each([
		["a missing title", "bpm: 100", "falta o título"],
		["an unknown header line", "título: X\nqualquer coisa", "fora de seção"],
		["a repeated key", "título: X\ntítulo: Y", "já foi informado"],
		["an invalid meter", "título: X\ncompasso: valsa", "compasso inválido"],
		[
			"a swing that is not sim or não",
			"título: X\nsuingue: com",
			"suingue inválido",
		],
		[
			"a swing written as a boolean",
			"título: X\nsuingue: true",
			"suingue inválido",
		],
		["an unknown instrument", "título: X\npartes: A (bumbo)", "desconhecido"],
		["a tempo out of range", "título: X\nbpm: 900", "bpm deve ficar"],
		["a phrase without number", "título: X\n[A]\nDON KON", "frase sem número"],
		["an unknown group", "título: X\n[A]\n1 @roxo: DON", "desconhecido"],
		[
			"a group colour the sheet does not use",
			"título: X\n[A]\n1 @verde: DON",
			"desconhecido",
		],
		[
			"a named group of an unused colour",
			"título: X\ngrupos: rosa = Fundo",
			"inválido",
		],
		["a leading hyphen", "título: X\n[A]\n1: -DON", "começar com hífen"],
		["a trailing hyphen", "título: X\n[A]\n1: DON-", "hífen sobrando"],
		["an open parenthesis", "título: X\n[A]\n1: DON (HA!", "não fechado"],
		[
			"a repeat in the middle",
			"título: X\n[A]\n1: DON (X2) KON",
			"último item",
		],
		["a repeat of nothing", "título: X\n[A]\n1: (X2)", "nada para repetir"],
		["an accented rest", "título: X\n[A]\n1: >_", "pausa não leva acento"],
		["a zero repeat", "título: X\n[A]\n1 (x0): DON", "pelo menos 1"],
		[
			"a header key inside a section",
			"título: X\n[A]\nbpm: 90",
			"só vale no cabeçalho",
		],
		[
			"a sequence citing a missing section",
			"título: X\n[A]\n1: DON\nsequência: A > B",
			'cita a seção "B"',
		],
		[
			"two sections with one name",
			"título: X\n[A]\n[A]",
			"já existe uma seção",
		],
		[
			"an undeclared part",
			"título: X\n[A]\nparte: Fue\n1: DON",
			"não foi declarada",
		],
	])("reports %s", (_, source, message) => {
		expect(
			issuesOf(source)
				.map((issue) => issue.message)
				.join("\n"),
		).toContain(message);
	});

	it("points at the line of a problem found only by validation", () => {
		const issues = issuesOf("título: X\n[A]\n1: DON\n[B]\n1: KON\n2 (x0): DON");
		expect(issues).toEqual([expect.objectContaining({ line: 6 })]);
	});

	it("warns about syllables outside the vocabulary without failing", () => {
		const result = safeParseSong("título: X\n[A]\n1: DON bam");
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.warnings).toEqual([
			expect.objectContaining({ line: 3, column: 8 }),
		]);
		expect(result.warnings[0].message).toContain('"bam"');
	});
});
