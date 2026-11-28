import { extractText, getDocumentProxy } from "unpdf";
import { describe, expect, it } from "vitest";
import { ichigo, miyake } from "../musicas";
import { parseSong } from "../parser";
import { songToPdf } from "../pdf";

/** Reads the PDF back with pdf.js, the engine browsers use to show PDFs. */
async function read(bytes: Uint8Array) {
	const document = await getDocumentProxy(new Uint8Array(bytes));
	const { totalPages, text } = await extractText(document, {
		mergePages: true,
	});
	const metadata = await document.getMetadata();
	return {
		pages: totalPages,
		text: text.replace(/\s+/g, " "),
		info: metadata.info as Record<string, unknown>,
	};
}

describe("songToPdf", () => {
	it("produces a PDF file", () => {
		const bytes = songToPdf(ichigo);
		expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
		expect(bytes.byteLength).toBeGreaterThan(2000);
	});

	it("prints ICHIGO as the group's sheet: header, sections, sequence", async () => {
		const { pages, text, info } = await read(songToPdf(ichigo));
		expect(pages).toBe(2);
		expect(info.Title).toBe("ICHIGO");
		expect(info.Author).toBe("Grupo Kodon Amazon Taiko");
		for (const expected of [
			"GRUPO KODON AMAZON TAIKO",
			"ICHIGO",
			"Composição: Chad Nakagawa & Taishoji Taiko",
			"Digitação: Andrey Viana",
			"Andamento: 120 bpm",
			"VERSO A",
			"REFRÃO",
			"VERSO B",
			"(SA-SA-SA-SA!)",
			"(ICHI-NI-SO-RE!)",
			"SEQUÊNCIA:",
			"VERSO A > REFRÃO > VERSO B > VERSO A > REFRÃO",
			"LEGENDA",
			"batida cheia no centro, mão direita",
		]) {
			expect(text).toContain(expected);
		}
	});

	it("keeps accented letters and the dash readable", async () => {
		const { text } = await read(songToPdf(ichigo));
		expect(text).toContain("REFRÃO");
		expect(text).toContain("–");
		expect(text).toContain("página 1 de 2");
	});

	it("prints MIYAKE with its base, its phrase and its notes", async () => {
		const { pages, text } = await read(songToPdf(miyake));
		expect(pages).toBe(1);
		for (const expected of [
			"MIYAKE",
			"MARCAÇÃO",
			"MÚSICA BASE",
			"(tsuku)",
			"66 bpm, com suíngue",
			"Obs.:",
		]) {
			expect(text).toContain(expected);
		}
	});

	it("exports the beat grid as an alternative view", async () => {
		const { text } = await read(songToPdf(ichigo, { view: "grade" }));
		expect(text).toContain("×8");
		expect(text).toContain("mão direita / mão esquerda");
	});

	it("honors the layout options", async () => {
		const { text } = await read(
			songToPdf(ichigo, { groupName: "Oficina de Taiko", legend: false }),
		);
		expect(text).toContain("OFICINA DE TAIKO");
		expect(text).not.toContain("LEGENDA");
	});

	it("replaces what the standard fonts cannot print instead of failing", async () => {
		const song = parseSong("título: 三宅 Miyake\n[A]\n1: DON");
		const { text } = await read(songToPdf(song));
		expect(text).toContain("?? Miyake");
	});

	it("still produces a page for a song with no sections", async () => {
		const { pages, text } = await read(songToPdf(parseSong("título: Vazia")));
		expect(pages).toBe(1);
		expect(text).toContain("Vazia");
	});
});
