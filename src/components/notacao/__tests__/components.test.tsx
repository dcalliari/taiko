import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ichigo, miyake } from "@/lib/notacao/musicas";
import { TaikoPlayer } from "@/lib/notacao/player/engine";
import { TaikoPlayerControls } from "../TaikoPlayerControls";
import { TaikoSheet } from "../TaikoSheet";
import { TaikoSheetPlayer } from "../TaikoSheetPlayer";

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("TaikoSheet", () => {
	it("draws one labelled SVG per page of the sheet", () => {
		const html = renderToStaticMarkup(<TaikoSheet song={ichigo} />);
		expect(count(html, "<svg")).toBe(2);
		expect(html).toContain('aria-label="ICHIGO, página 1 de 2"');
		expect(html).toContain('viewBox="0 0 595.28 841.89"');
	});

	it("prints the sheet text: header, sections, syllables and sequence", () => {
		const html = renderToStaticMarkup(<TaikoSheet song={ichigo} />);
		for (const text of [
			">ICHIGO<",
			">VERSO A<",
			">REFRÃO<",
			">KON<",
			">(HA!)<",
			">SEQUÊNCIA:<",
		]) {
			expect(html).toContain(text);
		}
	});

	it("fits each text to the width the layout measured", () => {
		const html = renderToStaticMarkup(<TaikoSheet song={ichigo} />);
		expect(html).toMatch(/<text[^>]*textLength="[\d.]+"[^>]*>ICHIGO</);
	});

	it("draws the play cursor over the active cells only", () => {
		const idle = renderToStaticMarkup(<TaikoSheet song={ichigo} />);
		const active = renderToStaticMarkup(
			<TaikoSheet song={ichigo} activeKeys={["0.0.0.0.0", "2.20.0.0.0"]} />,
		);
		expect(count(idle, "mix-blend-mode")).toBe(0);
		// One cell on each page.
		expect(count(active, "mix-blend-mode")).toBe(2);
	});

	it("tells the browser to print on the sheet's own paper, without margins", () => {
		const html = renderToStaticMarkup(<TaikoSheet song={ichigo} />);
		expect(html).toContain("@page { size: 595.28pt 841.89pt; margin: 0; }");
		// Only the last page may end without a page break.
		expect(count(html, "break-after:page")).toBe(1);
		expect(count(html, "break-after:auto")).toBe(1);
	});

	it("ignores a cursor that points at nothing on this view", () => {
		const html = renderToStaticMarkup(
			<TaikoSheet song={ichigo} activeKeys={["9.9.9.9.9"]} />,
		);
		expect(count(html, "mix-blend-mode")).toBe(0);
	});

	it("draws the beat grid on request", () => {
		const html = renderToStaticMarkup(
			<TaikoSheet song={ichigo} view="grade" />,
		);
		expect(html).toContain(">×8<");
		expect(html).toContain(">D×<");
	});
});

describe("TaikoPlayerControls", () => {
	const render = (song: typeof ichigo) => {
		const player = new TaikoPlayer(song);
		return renderToStaticMarkup(
			<TaikoPlayerControls
				song={song}
				player={player}
				snapshot={player.getSnapshot()}
			/>,
		);
	};

	it("offers transport, tempo, metronome and section loop", () => {
		const html = render(ichigo);
		for (const text of [
			"Tocar",
			"Parar",
			"Metrônomo",
			"Andamento",
			"120 bpm",
			"Repetir",
			"Música inteira, sem repetir",
			"1. VERSO A",
			"3. VERSO B",
		]) {
			expect(html).toContain(text);
		}
	});

	it("offers mute for the groups the song uses", () => {
		const html = render(ichigo);
		expect(html).toContain("azul");
		expect(html).toContain("laranja");
	});

	it("offers mute and solo for each part of a layered song", () => {
		const html = render(miyake);
		expect(html).toContain('aria-label="Mudo: Marcação"');
		expect(html).toContain('aria-label="Solo: Marcação"');
		expect(html).toContain('aria-label="Solo: Música Base"');
		expect(html).toContain("MÚSICA BASE + MARCAÇÃO (x4, 80 bpm)");
	});

	it("shows the tempo of the step being played, and the written one when stopped", () => {
		const player = new TaikoPlayer(miyake);
		const stopped = player.getSnapshot();
		const at = (snapshot: typeof stopped) =>
			renderToStaticMarkup(
				<TaikoPlayerControls
					song={miyake}
					player={player}
					snapshot={snapshot}
				/>,
			);
		expect(at(stopped)).toContain("66 bpm");
		const playing = { ...stopped, status: "playing" as const };
		expect(at({ ...playing, step: 1 })).toContain("66 bpm");
		expect(at({ ...playing, step: 2 })).toContain("80 bpm");
		expect(at({ ...playing, step: 3, tempoScale: 0.5 })).toContain("48 bpm");
	});

	it("skips solo when there is a single part", () => {
		expect(render(ichigo)).not.toContain("Solo:");
	});

	it("takes translated labels", () => {
		const player = new TaikoPlayer(ichigo);
		const html = renderToStaticMarkup(
			<TaikoPlayerControls
				song={ichigo}
				player={player}
				snapshot={player.getSnapshot()}
				labels={{ play: "再生", metronome: "メトロノーム" }}
			/>,
		);
		expect(html).toContain("再生");
		expect(html).toContain("メトロノーム");
		expect(html).toContain("Parar");
	});
});

describe("TaikoSheetPlayer", () => {
	it("renders on the server: controls, view switch, PDF button and sheet", () => {
		const html = renderToStaticMarkup(<TaikoSheetPlayer song={miyake} />);
		for (const text of [
			"Tocar",
			"Ficha",
			"Grade de tempos",
			"Baixar PDF",
			">MIYAKE<",
		]) {
			expect(html).toContain(text);
		}
	});
});
