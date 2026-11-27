import { describe, expect, it } from "vitest";
import { ichigo } from "../musicas";
import { parseSong } from "../parser";
import {
	type PlayerAudio,
	type PlayerEnvironment,
	TaikoPlayer,
} from "../player/engine";
import type { TimelineEvent } from "../timeline";

type Hit = { key: string; part: string; time: number; pan: number };

/** A hand-cranked audio clock and timer, so the scheduler can be observed. */
function harness() {
	let now = 0;
	let timer: (() => void) | undefined;
	const hits: Hit[] = [];
	const clicks: { time: number; accent: boolean }[] = [];
	const state = { closed: false, created: 0 };
	const audio: PlayerAudio = {
		get currentTime() {
			return now;
		},
		resume: async () => {},
		hit: (event: TimelineEvent, time, pan) => {
			hits.push({ key: event.key, part: event.part, time, pan });
		},
		click: (time, accent) => {
			clicks.push({ time, accent });
		},
		close: () => {
			state.closed = true;
		},
	};
	const environment: PlayerEnvironment = {
		createAudio: () => {
			state.created++;
			return audio;
		},
		setInterval: (callback) => {
			timer = callback;
			return 1;
		},
		clearInterval: () => {
			timer = undefined;
		},
	};
	/** Lets `seconds` pass, firing the timer every 25 ms like a browser. */
	const advance = (seconds: number) => {
		const ticks = Math.round(seconds / 0.025);
		for (let index = 0; index < ticks; index++) {
			now += 0.025;
			timer?.();
		}
	};
	const times = () => hits.map((hit) => Number(hit.time.toFixed(3)));
	return { environment, advance, hits, clicks, times, state };
}

// 120 bpm: one beat is half a second.
const TWO_SECTIONS = `título: Teste
bpm: 120
compasso: 2/4
partes: Frase (nagado), Base (shime)
[A]
1: DON DON DONKON
[B]
parte: Base
1: KA KA
sequência: A > B`;

const CALL_AND_RESPONSE = `título: Teste
bpm: 120
[A]
1 @azul: DON
2 @laranja: KON`;

function start(source: string) {
	const test = harness();
	const player = new TaikoPlayer(parseSong(source), test.environment);
	return { ...test, player };
}

describe("TaikoPlayer", () => {
	it("starts stopped, silent and without touching the audio device", () => {
		const { player, state } = start(TWO_SECTIONS);
		expect(player.getSnapshot()).toMatchObject({
			status: "stopped",
			activeKeys: [],
			step: -1,
			tempoScale: 1,
			loopStep: null,
			metronome: false,
		});
		expect(state.created).toBe(0);
	});

	it("schedules every stroke at its instant on the audio clock", async () => {
		const { player, advance, times } = start(TWO_SECTIONS);
		await player.play();
		advance(3);
		// The song starts 60 ms after play, so the first stroke is not clipped.
		expect(times()).toEqual([0.06, 0.56, 1.06, 1.31, 1.56, 2.06]);
	});

	it("schedules ahead of time instead of when the timer fires", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		await player.play();
		advance(0.45);
		// 0.45 s in, the stroke due at 0.56 s is already queued, and nothing
		// further than the lookahead window is.
		expect(hits.map((hit) => hit.time)).toEqual([0.06, 0.56]);
	});

	it("stops by itself at the end and rewinds", async () => {
		const { player, advance } = start(TWO_SECTIONS);
		await player.play();
		expect(player.getSnapshot().status).toBe("playing");
		advance(3);
		expect(player.getSnapshot()).toMatchObject({
			status: "stopped",
			activeKeys: [],
			step: -1,
		});
	});

	it("moves the cursor to the cell being played and tracks the step", async () => {
		const { player, advance } = start(TWO_SECTIONS);
		await player.play();
		advance(0.2);
		expect(player.getSnapshot()).toMatchObject({
			activeKeys: ["0.0.0.0.0"],
			step: 0,
		});
		advance(1.15);
		// 1.35 s on the clock is 1.29 s into the song: the KON of DONKON.
		expect(player.getSnapshot().activeKeys).toEqual(["0.0.0.2.1"]);
		advance(0.5);
		expect(player.getSnapshot()).toMatchObject({
			activeKeys: ["1.0.0.0.0"],
			step: 1,
		});
	});

	it("notifies subscribers only when something changes", async () => {
		const { player, advance } = start(TWO_SECTIONS);
		let calls = 0;
		const unsubscribe = player.subscribe(() => {
			calls++;
		});
		await player.play();
		const afterPlay = calls;
		// Several timer ticks inside the same stroke: nothing new to report.
		advance(0.2);
		expect(calls).toBe(afterPlay);
		// The cursor moves to the second stroke: one notification.
		advance(0.4);
		expect(calls).toBe(afterPlay + 1);
		unsubscribe();
		advance(1);
		expect(calls).toBe(afterPlay + 1);
	});

	it("plays slower or faster without changing the song", async () => {
		const { player, advance, times } = start(TWO_SECTIONS);
		player.setTempoScale(0.5);
		await player.play();
		advance(6);
		expect(times()).toEqual([0.06, 1.06, 2.06, 2.56, 3.06, 4.06]);
		expect(player.getSnapshot().tempoScale).toBe(0.5);
	});

	it("changes tempo in the middle of the song from that point on", async () => {
		const { player, advance, times } = start(TWO_SECTIONS);
		await player.play();
		advance(0.3);
		player.setTempoScale(2);
		advance(3);
		// At 0.3 s the song is 0.24 s in. From there on it runs twice as fast:
		// the strokes written at 0.5 s and 1 s come 0.13 s and 0.38 s later.
		expect(times().slice(0, 3)).toEqual([0.06, 0.43, 0.68]);
	});

	it("keeps the tempo within sane bounds", () => {
		const { player } = start(TWO_SECTIONS);
		player.setTempoScale(100);
		expect(player.getSnapshot().tempoScale).toBe(2);
		player.setTempoScale(0);
		expect(player.getSnapshot().tempoScale).toBe(0.25);
	});

	it("repeats one step of the sequence until told otherwise", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		player.setLoopStep(1);
		await player.play();
		advance(3.5);
		expect(new Set(hits.map((hit) => hit.part))).toEqual(new Set(["Base"]));
		// Section B is two beats long: KA every half second, around and around.
		expect(hits.length).toBeGreaterThanOrEqual(6);
		const gaps = hits.slice(1).map((hit, index) => hit.time - hits[index].time);
		for (const gap of gaps) expect(gap).toBeCloseTo(0.5);
		expect(player.getSnapshot()).toMatchObject({ status: "playing", step: 1 });
	});

	it("ignores a loop on a step that does not exist", () => {
		const { player } = start(TWO_SECTIONS);
		player.setLoopStep(9);
		expect(player.getSnapshot().loopStep).toBeNull();
	});

	it("keeps the loop where it is when seeking to a step with no duration", async () => {
		const { player, advance, hits } = start(
			"título: Teste\nbpm: 120\n[A]\n1: DON DON\n[B]\nsequência: A > B",
		);
		expect(player.getSnapshot().steps).toHaveLength(2);
		player.setLoopStep(0);
		await player.play();
		advance(0.5);
		player.seekToStep(1);
		expect(player.getSnapshot().loopStep).toBe(0);
		const before = hits.length;
		advance(3);
		expect(hits.length).toBeGreaterThanOrEqual(before + 4);
		expect(player.getSnapshot()).toMatchObject({ status: "playing", step: 0 });
	});

	it("jumps to a step of the sequence", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		player.seekToStep(1);
		await player.play();
		advance(1.5);
		expect(hits.map((hit) => hit.key)).toEqual(["1.0.0.0.0", "1.0.0.1.0"]);
	});

	it("mutes a part", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		player.setPartMuted("Base", true);
		await player.play();
		advance(3);
		expect(hits.map((hit) => hit.part)).toEqual([
			"Frase",
			"Frase",
			"Frase",
			"Frase",
		]);
	});

	it("solos a part, whatever is muted", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		player.setPartSolo("Base", true);
		player.setPartMuted("Base", true);
		await player.play();
		advance(3);
		expect(hits.map((hit) => hit.part)).toEqual(["Base", "Base"]);
		player.setPartSolo("Base", false);
		player.setPartMuted("Base", false);
		expect(player.getSnapshot()).toMatchObject({
			soloParts: [],
			mutedParts: [],
		});
	});

	it("mutes a group and places the groups on opposite sides", async () => {
		const both = start(CALL_AND_RESPONSE);
		await both.player.play();
		both.advance(2);
		expect(both.hits.map((hit) => Math.sign(hit.pan))).toEqual([-1, 1]);

		const one = start(CALL_AND_RESPONSE);
		one.player.setGroupMuted("laranja", true);
		await one.player.play();
		one.advance(2);
		expect(one.hits.map((hit) => hit.key)).toEqual(["0.0.0.0.0"]);
	});

	it("clicks the metronome on every beat only when asked to", async () => {
		const silent = start(TWO_SECTIONS);
		await silent.player.play();
		silent.advance(3);
		expect(silent.clicks).toEqual([]);

		const { player, advance, clicks } = start(TWO_SECTIONS);
		player.setMetronome(true);
		await player.play();
		advance(3);
		expect(clicks.map((click) => Number(click.time.toFixed(3)))).toEqual([
			0.06, 0.56, 1.06, 1.56, 2.06,
		]);
		// compasso 2/4: every other click is accented, restarting on each line.
		expect(clicks.map((click) => click.accent)).toEqual([
			true,
			false,
			true,
			true,
			false,
		]);
	});

	it("does not play kakegoe or silent slots", async () => {
		const { player, advance, hits } = start(
			"título: X\nbpm: 120\n[A]\n1: DON (HA!) _ su KON",
		);
		await player.play();
		advance(3.5);
		expect(hits.map((hit) => hit.key)).toEqual(["0.0.0.0.0", "0.0.0.4.0"]);
	});

	it("pauses and resumes without repeating or skipping a stroke", async () => {
		const { player, advance, times } = start(TWO_SECTIONS);
		await player.play();
		advance(0.7);
		player.pause();
		expect(player.getSnapshot().status).toBe("paused");
		const beforePause = times().length;
		advance(5);
		expect(times()).toHaveLength(beforePause);
		await player.play();
		advance(3);
		expect(times()).toHaveLength(6);
		expect(new Set(times()).size).toBe(6);
	});

	it("moves the cursor and the step when seeking while paused", async () => {
		const { player, advance } = start(TWO_SECTIONS);
		await player.play();
		advance(1.7);
		player.pause();
		expect(player.getSnapshot()).toMatchObject({ status: "paused", step: 1 });
		player.seekToStep(0);
		expect(player.getSnapshot()).toMatchObject({
			status: "paused",
			step: 0,
			activeKeys: ["0.0.0.0.0"],
		});
		player.stop();
		player.seekToStep(1);
		expect(player.getSnapshot()).toMatchObject({
			status: "stopped",
			step: -1,
			activeKeys: [],
		});
	});

	it("toggles between playing and paused", async () => {
		const { player, advance } = start(TWO_SECTIONS);
		player.toggle();
		await Promise.resolve();
		await Promise.resolve();
		expect(player.getSnapshot().status).toBe("playing");
		advance(0.2);
		player.toggle();
		expect(player.getSnapshot().status).toBe("paused");
	});

	it("does not start if stopped while the audio device was waking up", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		const pending = player.play();
		player.stop();
		await pending;
		advance(1);
		expect(player.getSnapshot().status).toBe("stopped");
		expect(hits).toEqual([]);
	});

	it("stops, resets the mixer and rebuilds when another song is loaded", async () => {
		const { player, advance, hits } = start(TWO_SECTIONS);
		player.setPartMuted("Base", true);
		player.setLoopStep(1);
		await player.play();
		advance(0.2);
		player.load(ichigo);
		expect(player.getSnapshot()).toMatchObject({
			status: "stopped",
			mutedParts: [],
			loopStep: null,
		});
		expect(player.getTimeline().steps).toHaveLength(5);
		const before = hits.length;
		advance(1);
		expect(hits).toHaveLength(before);
	});

	it("announces the new sequence even when nothing else changed", () => {
		const { player } = start(TWO_SECTIONS);
		expect(player.getSnapshot().steps.map((step) => step.label)).toEqual([
			"A",
			"B",
		]);
		let calls = 0;
		player.subscribe(() => {
			calls++;
		});
		player.load(ichigo);
		expect(calls).toBe(1);
		expect(player.getSnapshot().steps.map((step) => step.label)).toEqual([
			"VERSO A",
			"REFRÃO",
			"VERSO B",
			"VERSO A",
			"REFRÃO",
		]);
	});

	it("keeps playing state when the same song object is loaded again", async () => {
		const song = parseSong(TWO_SECTIONS);
		const test = harness();
		const player = new TaikoPlayer(song, test.environment);
		await player.play();
		player.load(song);
		expect(player.getSnapshot().status).toBe("playing");
	});

	it("releases the audio device on dispose and can play again after", async () => {
		const { player, advance, state } = start(TWO_SECTIONS);
		await player.play();
		advance(0.2);
		player.dispose();
		expect(state.closed).toBe(true);
		expect(player.getSnapshot().status).toBe("stopped");
		await player.play();
		expect(state.created).toBe(2);
		expect(player.getSnapshot().status).toBe("playing");
	});

	it("does nothing when asked to play an empty song", async () => {
		const { player, state } = start("título: Vazia");
		await player.play();
		expect(player.getSnapshot().status).toBe("stopped");
		expect(state.created).toBe(0);
	});
});
