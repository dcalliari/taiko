import { describe, expect, it } from "vitest";
import { ichigo, miyake } from "../musicas";
import { parseSong } from "../parser";
import { buildTimeline, repeatDynamics, swingBeat } from "../timeline";

const build = (text: string) => buildTimeline(parseSong(text));

describe("buildTimeline", () => {
	it("places strokes in seconds from the tempo", () => {
		const timeline = build("título: X\nbpm: 120\n[A]\n1: DON DONKON (HA!) _");
		expect(
			timeline.events.map((event) => [event.kind, event.time, event.duration]),
		).toEqual([
			["hit", 0, 0.5],
			["hit", 0.5, 0.25],
			["hit", 0.75, 0.25],
			["voice", 1, 0.5],
			["rest", 1.5, 0.5],
		]);
		expect(timeline.duration).toBe(2);
	});

	it("unrolls phrase repeats and inline repeats", () => {
		const timeline = build("título: X\nbpm: 60\n[A]\n1 (x2): DON (X3)");
		expect(timeline.events.map((event) => event.time)).toEqual([
			0, 1, 2, 3, 4, 5,
		]);
		expect(new Set(timeline.events.map((event) => event.key))).toEqual(
			new Set(["0.0.0.0.0"]),
		);
	});

	it("follows the written sequence, with repeats and tempo changes", () => {
		const timeline = build(
			"título: X\nbpm: 60\n[A]\n1: DON DON\n[B]\n1: KA\nsequência: A (x2) > B (120 bpm) > A",
		);
		expect(
			timeline.steps.map((step) => [step.label, step.start, step.end]),
		).toEqual([
			["A (x2)", 0, 4],
			["B (120 bpm)", 4, 4.5],
			["A", 4.5, 6.5],
		]);
		expect(timeline.duration).toBe(6.5);
	});

	it("plays every section once when no sequence is written", () => {
		const timeline = build("título: X\nbpm: 60\n[A]\n1: DON\n[B]\n1: KA");
		expect(timeline.steps.map((step) => step.label)).toEqual(["A", "B"]);
	});

	it("loops the layered sections under the first one", () => {
		const timeline = build(
			"título: X\nbpm: 60\npartes: Frase (nagado), Base (shime)\n[FRASE]\n1: DON _ KON\n[BASE]\nparte: Base\n1: tenteke\nsequência: FRASE + BASE",
		);
		const base = timeline.events.filter((event) => event.part === "Base");
		expect(base.map((event) => event.time)).toEqual([
			0,
			1 / 3,
			2 / 3,
			1,
			1 + 1 / 3,
			1 + 2 / 3,
			2,
			2 + 1 / 3,
			2 + 2 / 3,
		]);
		expect(base[0].instrument).toBe("shime");
		expect(timeline.duration).toBe(3);
	});

	it("makes strong, weak, soft and accented strokes differ in loudness", () => {
		const timeline = build("título: X\n[A]\n1: DON do tsu >DON >>DON");
		const [strong, weak, soft, accent, strongest] = timeline.events.map(
			(event) => event.level,
		);
		expect(weak).toBeLessThan(strong);
		expect(soft).toBeLessThan(weak);
		expect(accent).toBeGreaterThan(strong);
		expect(strongest).toBeGreaterThan(accent);
	});

	it("carries the group of the phrase and the zone of the stroke", () => {
		const timeline = build("título: X\n[A]\n1 @laranja: DON KA");
		expect(timeline.events).toMatchObject([
			{ group: "laranja", zone: "center" },
			{ group: "laranja", zone: "rim" },
		]);
	});

	it("clicks once per beat, accenting bars or the start of each line", () => {
		const metered = build(
			"título: X\nbpm: 60\ncompasso: 2/4\n[A]\n1: DON DON DON DON",
		);
		expect(metered.ticks.map((tick) => tick.accent)).toEqual([
			true,
			false,
			true,
			false,
		]);
		const free = build("título: X\nbpm: 60\n[A]\n1:\n  DON DON DON\n  KA KA");
		expect(free.ticks.map((tick) => tick.accent)).toEqual([
			true,
			false,
			false,
			true,
			false,
		]);
	});
});

describe("dynamics of a repeat indication", () => {
	it("grows through a CRESCENTE and fades through a DECRESCENTE", () => {
		const up = [0, 1, 2, 3].map((turn) => repeatDynamics("CRESCENTE", turn, 4));
		expect(up).toEqual([...up].sort((a, b) => a - b));
		expect(up[3]).toBe(1);
		const down = [0, 1, 2, 3].map((turn) =>
			repeatDynamics("decrescente", turn, 4),
		);
		expect(down[0]).toBe(1);
		expect(down[3]).toBeLessThan(down[0]);
	});

	it("leaves other indications and plain repeats alone", () => {
		expect(repeatDynamics(undefined, 0, 4)).toBe(1);
		expect(repeatDynamics("RÁPIDO", 0, 4)).toBe(1);
	});

	it("is what makes ICHIGO's 'DO KON (X4 CRESCENTE)' swell", () => {
		const levels = buildTimeline(ichigo)
			.events.filter((event) => event.key === "0.2.0.0.0")
			.slice(0, 4)
			.map((event) => event.level);
		expect(levels).toEqual([...levels].sort((a, b) => a - b));
		expect(levels[0]).toBeLessThan(levels[3]);
	});
});

describe("swing", () => {
	it("moves the half beat to the last third and keeps the beat in place", () => {
		expect(swingBeat(0)).toBe(0);
		expect(swingBeat(0.5)).toBeCloseTo(2 / 3);
		expect(swingBeat(1)).toBe(1);
		expect(swingBeat(3.5)).toBeCloseTo(3 + 2 / 3);
	});

	it("plays MIYAKE's base long-short and leaves the beat untouched", () => {
		const timeline = buildTimeline(miyake);
		const beat = 60 / miyake.bpm;
		const [don, weakDo, nextDon] = timeline.events;
		expect(don.time).toBe(0);
		expect(weakDo.time).toBeCloseTo((2 / 3) * beat);
		expect(nextDon.time).toBeCloseTo(beat);
	});
});

describe("the example songs", () => {
	it("lasts as long as ICHIGO's sequence adds up to", () => {
		const timeline = buildTimeline(ichigo);
		const beats = 64 + 48 + 68 + 64 + 48;
		expect(timeline.duration).toBeCloseTo((beats * 60) / ichigo.bpm);
		expect(timeline.steps).toHaveLength(5);
		expect(timeline.ticks).toHaveLength(beats);
	});

	it("keeps MIYAKE's base running under every pass of the phrase", () => {
		const timeline = buildTimeline(miyake);
		const second = timeline.steps[1];
		const inStep = timeline.events.filter(
			(event) => event.time >= second.start && event.time < second.end,
		);
		const base = inStep.filter((event) => event.part === "Marcação");
		// Four passes of 22 beats, two base strokes per beat.
		expect(base).toHaveLength(4 * 22 * 2);
		expect(second.beats).toBe(88);
		expect(timeline.steps.map((step) => step.bpm)).toEqual([66, 66, 80, 96]);
	});
});
