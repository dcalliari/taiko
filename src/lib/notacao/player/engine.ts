import type { GroupColor, Song } from "../model";
import {
	buildTimeline,
	type Timeline,
	type TimelineEvent,
	type TimelineStep,
} from "../timeline";
import { TaikoSynth } from "./synth";

export type PlayerStatus = "stopped" | "playing" | "paused";

export type PlayerSnapshot = {
	status: PlayerStatus;
	/** Cells sounding now, by `cellKey`. */
	activeKeys: readonly string[];
	/** The sequence of the loaded song, one entry per step. */
	steps: readonly TimelineStep[];
	/** Step of the sequence being played, or -1. */
	step: number;
	/** Tempo multiplier over the written bpm. */
	tempoScale: number;
	/** Step of the sequence that repeats, or null to play it all once. */
	loopStep: number | null;
	metronome: boolean;
	mutedParts: readonly string[];
	soloParts: readonly string[];
	mutedGroups: readonly GroupColor[];
};

/** What the player needs from an audio backend. Web Audio in the browser. */
export type PlayerAudio = {
	/** Seconds on the audio clock. */
	readonly currentTime: number;
	resume(): Promise<void>;
	hit(event: TimelineEvent, time: number, pan: number): void;
	click(time: number, accent: boolean): void;
	close(): void;
};

export type PlayerEnvironment = {
	createAudio(): PlayerAudio;
	setInterval(callback: () => void, ms: number): unknown;
	clearInterval(handle: unknown): void;
	isHidden?(): boolean;
};

export const MIN_TEMPO_SCALE = 0.25;
export const MAX_TEMPO_SCALE = 2;

const TICK_MS = 25;
const LOOKAHEAD = 0.15;
// Background tabs throttle timers to about once a second.
const HIDDEN_LOOKAHEAD = 1.5;
const START_DELAY = 0.06;
const EPSILON = 1e-9;

/** Each group sits slightly to one side, so call and response is audible. */
const GROUP_PAN: Record<GroupColor, number> = {
	azul: -0.35,
	laranja: 0.35,
};

export function createWebAudio(): PlayerAudio {
	const scope = globalThis as unknown as {
		AudioContext?: typeof AudioContext;
		webkitAudioContext?: typeof AudioContext;
	};
	const Context = scope.AudioContext ?? scope.webkitAudioContext;
	if (!Context) throw new Error("Este navegador não oferece Web Audio.");
	const context = new Context({ latencyHint: "interactive" });
	const synth = new TaikoSynth(context);
	return {
		get currentTime() {
			return context.currentTime;
		},
		resume: () => context.resume(),
		hit: (event, time, pan) =>
			synth.hit(
				{
					instrument: event.instrument,
					zone: event.zone,
					level: event.level,
					pan,
				},
				time,
			),
		click: (time, accent) => synth.click(time, accent),
		close: () => {
			void context.close();
		},
	};
}

export const browserEnvironment: PlayerEnvironment = {
	createAudio: createWebAudio,
	setInterval: (callback, ms) => globalThis.setInterval(callback, ms),
	clearInterval: (handle) =>
		globalThis.clearInterval(handle as ReturnType<typeof setInterval>),
	isHidden: () =>
		typeof document !== "undefined" && document.visibilityState === "hidden",
};

type Item = {
	time: number;
	step: number;
	event?: TimelineEvent;
	accent?: boolean;
};

type Region = {
	start: number;
	end: number;
	from: number;
	to: number;
	loop: boolean;
};

const hasLength = (step: TimelineStep) => step.end - step.start > EPSILON;

const sameList = (a: readonly unknown[], b: readonly unknown[]) =>
	a.length === b.length && a.every((value, index) => value === b[index]);

function toggled<T>(list: readonly T[], value: T, on: boolean): T[] {
	const without = list.filter((item) => item !== value);
	return on ? [...without, value] : without;
}

/**
 * Plays a song with sample-accurate timing: a timer wakes up every few
 * milliseconds and schedules the strokes of the next instants on the audio
 * clock. Framework-free; `subscribe`/`getSnapshot` plug into any UI.
 */
export class TaikoPlayer {
	private readonly environment: PlayerEnvironment;
	private readonly listeners = new Set<() => void>();
	private song!: Song;
	private timeline!: Timeline;
	private items: Item[] = [];
	private stepRanges: { from: number; to: number }[] = [];
	private longest = 0;
	private audio: PlayerAudio | undefined;
	private timer: unknown;
	private snapshot: PlayerSnapshot = {
		status: "stopped",
		activeKeys: [],
		steps: [],
		step: -1,
		tempoScale: 1,
		loopStep: null,
		metronome: false,
		mutedParts: [],
		soloParts: [],
		mutedGroups: [],
	};
	/** Seconds into the written timeline where playback (re)starts. */
	private position = 0;
	private anchorAudio = 0;
	private anchorVirtual = 0;
	private horizon = 0;
	private lap = 0;
	private cursor = 0;
	private starting = 0;

	constructor(song: Song, environment: PlayerEnvironment = browserEnvironment) {
		this.environment = environment;
		this.load(song);
	}

	readonly subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	readonly getSnapshot = (): PlayerSnapshot => this.snapshot;

	getTimeline(): Timeline {
		return this.timeline;
	}

	/** Replaces the song. Playback stops and the mixer is reset. */
	load(song: Song): void {
		if (song === this.song) return;
		this.halt();
		this.song = song;
		this.timeline = buildTimeline(song);
		this.items = [
			...this.timeline.events.map((event) => ({
				time: event.time,
				step: event.step,
				event,
			})),
			...this.timeline.ticks.map((tick) => ({
				time: tick.time,
				step: tick.step,
				accent: tick.accent,
			})),
		].sort((a, b) => a.time - b.time || a.step - b.step);
		this.stepRanges = this.timeline.steps.map((_, step) => {
			const from = this.items.findIndex((item) => item.step === step);
			if (from < 0) return { from: 0, to: 0 };
			let to = from;
			while (to < this.items.length && this.items[to].step === step) to++;
			return { from, to };
		});
		this.longest = this.timeline.events.reduce(
			(longest, event) => Math.max(longest, event.duration),
			0,
		);
		this.position = 0;
		this.update({
			status: "stopped",
			activeKeys: [],
			steps: this.timeline.steps,
			step: -1,
			loopStep: null,
			mutedParts: [],
			soloParts: [],
			mutedGroups: [],
		});
	}

	async play(): Promise<void> {
		if (this.snapshot.status === "playing") return;
		if (this.timeline.duration <= EPSILON) return;
		const attempt = ++this.starting;
		this.audio ??= this.environment.createAudio();
		const audio = this.audio;
		await audio.resume();
		// A stop, a pause or another play may have happened while waiting.
		if (attempt !== this.starting || this.audio !== audio) return;
		this.anchor(audio.currentTime + START_DELAY, this.position, this.position);
		this.timer = this.environment.setInterval(this.tick, TICK_MS);
		this.update({ status: "playing" });
		this.tick();
	}

	pause(): void {
		if (this.snapshot.status !== "playing" || !this.audio) return;
		// Strokes up to the horizon are already on the audio clock, so the
		// song resumes right after them instead of playing them twice.
		const virtual = Math.max(this.virtualNow(this.audio), this.horizon);
		this.position = this.nominal(virtual);
		this.halt();
		this.update({ status: "paused" });
	}

	stop(): void {
		this.halt();
		this.position = this.region().loop ? this.region().start : 0;
		this.update({ status: "stopped", activeKeys: [], step: -1 });
	}

	toggle(): void {
		if (this.snapshot.status === "playing") this.pause();
		else void this.play();
	}

	/** 1 plays at the written bpm, 0.5 at half speed. */
	setTempoScale(scale: number): void {
		const tempoScale = Math.min(
			MAX_TEMPO_SCALE,
			Math.max(MIN_TEMPO_SCALE, scale),
		);
		if (this.snapshot.status === "playing" && this.audio) {
			const now = this.audio.currentTime;
			this.anchorVirtual = this.virtualNow(this.audio);
			this.anchorAudio = now;
		}
		this.update({ tempoScale });
	}

	/** Repeats one step of the sequence; `null` plays the song through. */
	setLoopStep(step: number | null): void {
		if (step !== null) {
			const target = this.timeline.steps[step];
			if (!target || !hasLength(target)) return;
		}
		this.relocate(() => this.update({ loopStep: step }));
	}

	/** Jumps to the start of a step of the sequence. */
	seekToStep(step: number): void {
		const target = this.timeline.steps[step];
		if (!target) return;
		this.relocate(() => {
			if (this.snapshot.loopStep !== null && hasLength(target)) {
				this.update({ loopStep: step });
			}
		}, target.start);
	}

	setMetronome(metronome: boolean): void {
		this.update({ metronome });
	}

	setPartMuted(part: string, muted: boolean): void {
		this.update({
			mutedParts: toggled(this.snapshot.mutedParts, part, muted),
		});
	}

	setPartSolo(part: string, solo: boolean): void {
		this.update({ soloParts: toggled(this.snapshot.soloParts, part, solo) });
	}

	setGroupMuted(group: GroupColor, muted: boolean): void {
		this.update({
			mutedGroups: toggled(this.snapshot.mutedGroups, group, muted),
		});
	}

	/** Stops and releases the audio device. The player can be played again. */
	dispose(): void {
		this.stop();
		this.audio?.close();
		this.audio = undefined;
	}

	private update(patch: Partial<PlayerSnapshot>): void {
		const next = { ...this.snapshot, ...patch };
		const keys = Object.keys(patch) as (keyof PlayerSnapshot)[];
		const changed = keys.some((key) => {
			const before = this.snapshot[key];
			const after = next[key];
			return Array.isArray(before) && Array.isArray(after)
				? !sameList(before, after)
				: before !== after;
		});
		if (!changed) return;
		this.snapshot = next;
		for (const listener of this.listeners) listener();
	}

	private halt(): void {
		this.starting++;
		if (this.timer !== undefined) {
			this.environment.clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	private region(): Region {
		const loop = this.snapshot.loopStep;
		const step = loop === null ? undefined : this.timeline.steps[loop];
		if (loop !== null && step) {
			return {
				start: step.start,
				end: step.end,
				...this.stepRanges[loop],
				loop: true,
			};
		}
		return {
			start: 0,
			end: this.timeline.duration,
			from: 0,
			to: this.items.length,
			loop: false,
		};
	}

	/** Seconds played since the region start, laps included. */
	private virtualNow(audio: PlayerAudio): number {
		return (
			this.anchorVirtual +
			(audio.currentTime - this.anchorAudio) * this.snapshot.tempoScale
		);
	}

	private nominal(virtual: number): number {
		const region = this.region();
		const length = region.end - region.start;
		const elapsed = Math.max(0, virtual);
		return (
			region.start +
			(region.loop ? elapsed % length : Math.min(elapsed, length))
		);
	}

	/**
	 * Pins the timeline to the audio clock: `position` sounds at `audioTime`.
	 * Scheduling restarts at `scheduleFrom`, which skips what already sounded.
	 */
	private anchor(
		audioTime: number,
		position: number,
		scheduleFrom: number,
	): void {
		const region = this.region();
		const inside = position >= region.start && position < region.end - EPSILON;
		const start = inside ? position : region.start;
		const from = inside ? Math.max(scheduleFrom, start) : start;
		this.position = start;
		this.anchorAudio = audioTime;
		this.anchorVirtual = start - region.start;
		this.horizon = this.anchorVirtual;
		this.lap = 0;
		let cursor = region.from;
		while (cursor < region.to && this.items[cursor].time < from - EPSILON) {
			cursor++;
		}
		this.cursor = cursor;
	}

	/** Applies a change of region or position without stopping the audio. */
	private relocate(change: () => void, target?: number): void {
		const audio = this.audio;
		if (this.snapshot.status !== "playing" || !audio) {
			change();
			if (target !== undefined) this.position = target;
			const region = this.region();
			if (this.position < region.start || this.position >= region.end) {
				this.position = region.start;
			}
			if (this.snapshot.status === "paused") {
				this.update({
					activeKeys: this.activeAt(this.position),
					step: this.stepAt(this.position),
				});
			}
			return;
		}
		const virtual = this.virtualNow(audio);
		const current = this.nominal(virtual);
		const scheduled = current + Math.max(0, this.horizon - virtual);
		change();
		if (target === undefined) {
			this.anchor(audio.currentTime, current, scheduled);
		} else {
			this.anchor(audio.currentTime + START_DELAY, target, target);
		}
		this.tick();
	}

	private audible(event: TimelineEvent): boolean {
		const { mutedParts, soloParts, mutedGroups } = this.snapshot;
		if (event.group && mutedGroups.includes(event.group)) return false;
		return soloParts.length > 0
			? soloParts.includes(event.part)
			: !mutedParts.includes(event.part);
	}

	private readonly tick = (): void => {
		const audio = this.audio;
		if (!audio || this.snapshot.status !== "playing") return;
		const region = this.region();
		const length = region.end - region.start;
		const scale = this.snapshot.tempoScale;
		const now = audio.currentTime;
		const virtual = this.virtualNow(audio);
		const lookahead = this.environment.isHidden?.()
			? HIDDEN_LOOKAHEAD
			: LOOKAHEAD;
		const horizon = virtual + lookahead * scale;

		if (region.to > region.from) {
			while (true) {
				if (this.cursor >= region.to) {
					if (!region.loop) break;
					this.lap++;
					this.cursor = region.from;
				}
				const item = this.items[this.cursor];
				const itemVirtual = item.time - region.start + this.lap * length;
				if (itemVirtual >= horizon) break;
				const when =
					this.anchorAudio + (itemVirtual - this.anchorVirtual) / scale;
				// Anything later than this was missed by a stalled timer.
				if (when >= now - 0.03) this.sound(audio, item, Math.max(when, now));
				this.cursor++;
			}
		}
		this.horizon = Math.max(this.horizon, horizon);

		if (!region.loop && virtual >= length) {
			this.stop();
			return;
		}
		const position = this.nominal(virtual);
		this.update({
			activeKeys: this.activeAt(position),
			step: this.stepAt(position),
		});
	};

	private sound(audio: PlayerAudio, item: Item, when: number): void {
		const { event } = item;
		if (!event) {
			if (this.snapshot.metronome) audio.click(when, item.accent ?? false);
			return;
		}
		if (event.kind !== "hit" || !this.audible(event)) return;
		audio.hit(event, when, event.group ? GROUP_PAN[event.group] : 0);
	}

	private activeAt(position: number): string[] {
		const { events } = this.timeline;
		let low = 0;
		let high = events.length;
		while (low < high) {
			const middle = (low + high) >> 1;
			if (events[middle].time <= position + EPSILON) low = middle + 1;
			else high = middle;
		}
		const keys = new Set<string>();
		for (let index = low - 1; index >= 0; index--) {
			const event = events[index];
			if (event.time < position - this.longest - EPSILON) break;
			if (event.time + event.duration > position + EPSILON) {
				keys.add(event.key);
			}
		}
		return [...keys].sort();
	}

	private stepAt(position: number): number {
		const { steps } = this.timeline;
		for (let index = steps.length - 1; index >= 0; index--) {
			const step = steps[index];
			if (!hasLength(step)) continue;
			if (position >= step.start - EPSILON) return index;
		}
		return -1;
	}
}
