import {
	type GroupColor,
	type Instrument,
	partOfSection,
	resolveSequence,
	type Song,
} from "./model";
import { serializeSequenceStep } from "./serializer";
import type { Zone } from "./syllables";
import { cellKey, type TimedCell, timeLine } from "./timing";

export type TimelineEvent = {
	/** Cell address on the sheet (see `cellKey`). */
	key: string;
	kind: "hit" | "rest" | "voice";
	/** Seconds from the start, at the written tempo. */
	time: number;
	duration: number;
	/** Index into `Timeline.steps`. */
	step: number;
	part: string;
	instrument: Instrument;
	group?: GroupColor;
	zone: Zone;
	/** Loudness from 0 to 1: casing, accent, soft syllables and crescendo. */
	level: number;
};

export type TimelineTick = { time: number; accent: boolean; step: number };

export type TimelineStep = {
	label: string;
	start: number;
	end: number;
	bpm: number;
	beats: number;
};

export type Timeline = {
	events: TimelineEvent[];
	/** Metronome clicks, one per beat. */
	ticks: TimelineTick[];
	/** One entry per step of the sequence, repeats included. */
	steps: TimelineStep[];
	duration: number;
};

const EPSILON = 1e-9;

/**
 * Swing as a time warp inside each beat: the half-beat lands on the last
 * third (long-short), everything else follows proportionally.
 */
export function swingBeat(position: number): number {
	const whole = Math.floor(position + EPSILON);
	const fraction = Math.max(0, position - whole);
	const warped =
		fraction < 0.5 ? (fraction * 4) / 3 : 2 / 3 + ((fraction - 0.5) * 2) / 3;
	return whole + warped;
}

function baseLevel(cell: TimedCell): number {
	let level = cell.weak ? 0.4 : 0.72;
	if (cell.accent === 1) level = 0.9;
	if (cell.accent === 2) level = 1;
	return cell.soft ? level * 0.6 : level;
}

/** Loudness factor of pass `index` out of `count` for a repeat indication. */
export function repeatDynamics(
	label: string | undefined,
	index: number,
	count: number,
): number {
	if (!label || count < 2) return 1;
	const progress = index / (count - 1);
	if (/decresc|diminu/i.test(label)) return 1 - 0.6 * progress;
	if (/cresc/i.test(label)) return 0.4 + 0.6 * progress;
	return 1;
}

type PassCell = {
	key: string;
	kind: TimelineEvent["kind"];
	start: number;
	duration: number;
	zone: Zone;
	level: number;
	group?: GroupColor;
};

type SectionPass = { cells: PassCell[]; beats: number; lineStarts: number[] };

/** One full pass of a section, in beats, with every repeat written out. */
function sectionPass(song: Song, sectionIndex: number): SectionPass {
	const section = song.sections[sectionIndex];
	const cells: PassCell[] = [];
	const lineStarts: number[] = [];
	let cursor = 0;
	section.phrases.forEach((phrase, phraseIndex) => {
		for (let pass = 0; pass < phrase.repeat; pass++) {
			phrase.lines.forEach((line, lineIndex) => {
				if (line.kind !== "notes") return;
				const timed = timeLine(line);
				lineStarts.push(cursor);
				for (let turn = 0; turn < timed.repeat; turn++) {
					const dynamics = repeatDynamics(timed.label, turn, timed.repeat);
					for (const cell of timed.cells) {
						cells.push({
							key: cellKey(
								sectionIndex,
								phraseIndex,
								lineIndex,
								cell.token,
								cell.unit,
							),
							kind: cell.kind,
							start: cursor + cell.start,
							duration: cell.duration,
							zone: cell.zone ?? "center",
							level: cell.kind === "hit" ? baseLevel(cell) * dynamics : 0,
							...(phrase.group ? { group: phrase.group } : {}),
						});
					}
					cursor += timed.beats;
				}
			});
		}
	});
	return { cells, beats: cursor, lineStarts };
}

/** Flattens the sequence into timed events the player can schedule. */
export function buildTimeline(song: Song): Timeline {
	const events: TimelineEvent[] = [];
	const ticks: TimelineTick[] = [];
	const steps: TimelineStep[] = [];
	const warp = song.swing ? swingBeat : (position: number) => position;
	const passes = new Map<string, SectionPass>();
	const passOf = (name: string): SectionPass | undefined => {
		const cached = passes.get(name);
		if (cached) return cached;
		const index = song.sections.findIndex((section) => section.name === name);
		if (index < 0) return undefined;
		const pass = sectionPass(song, index);
		passes.set(name, pass);
		return pass;
	};

	let clock = 0;
	resolveSequence(song).forEach((step) => {
		const bpm = step.bpm ?? song.bpm;
		const secondsPerBeat = 60 / bpm;
		const lead = passOf(step.sections[0]);
		const length = lead?.beats ?? 0;
		const stepIndex = steps.length;
		const start = clock;

		for (let turn = 0; lead && length > EPSILON && turn < step.repeat; turn++) {
			const origin = clock;
			step.sections.forEach((name, layerIndex) => {
				const pass = passOf(name);
				const section = song.sections.find((item) => item.name === name);
				if (!pass || !section || pass.beats <= EPSILON) return;
				const part = partOfSection(song, section);
				// Only the first section sets the length: the others loop under it.
				const loops = layerIndex === 0 ? 1 : Math.ceil(length / pass.beats);
				for (let loop = 0; loop < loops; loop++) {
					const offset = loop * pass.beats;
					for (const cell of pass.cells) {
						const from = offset + cell.start;
						if (from >= length - EPSILON) continue;
						const to = Math.min(from + cell.duration, length);
						events.push({
							key: cell.key,
							kind: cell.kind,
							time: origin + warp(from) * secondsPerBeat,
							duration: (warp(to) - warp(from)) * secondsPerBeat,
							step: stepIndex,
							part: part.name,
							instrument: part.instrument,
							...(cell.group ? { group: cell.group } : {}),
							zone: cell.zone,
							level: Math.min(1, cell.level),
						});
					}
				}
			});

			for (let beat = 0; beat < length - EPSILON; beat++) {
				let lineStart = 0;
				for (const candidate of lead.lineStarts) {
					if (candidate <= beat + EPSILON) lineStart = candidate;
					else break;
				}
				const sinceLine = beat - lineStart;
				const accent = song.meter
					? Math.abs(sinceLine % song.meter.beats) < EPSILON
					: sinceLine < EPSILON;
				ticks.push({
					time: origin + beat * secondsPerBeat,
					accent,
					step: stepIndex,
				});
			}
			clock += length * secondsPerBeat;
		}

		steps.push({
			label: serializeSequenceStep(step),
			start,
			end: clock,
			bpm,
			beats: length * step.repeat,
		});
	});

	events.sort((a, b) => a.time - b.time);
	return { events, ticks, steps, duration: clock };
}
