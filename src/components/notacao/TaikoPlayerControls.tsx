"use client";

import { Pause, Play, Square, Timer } from "lucide-react";
import { useId } from "react";
import { GROUP_FILL } from "@/lib/notacao/layout";
import type { GroupColor, Song } from "@/lib/notacao/model";
import {
	MAX_TEMPO_SCALE,
	MIN_TEMPO_SCALE,
	type PlayerSnapshot,
	type TaikoPlayer,
} from "@/lib/notacao/player/engine";
import { cn } from "@/lib/utils";

export type TaikoPlayerLabels = {
	play: string;
	pause: string;
	stop: string;
	tempo: string;
	resetTempo: string;
	metronome: string;
	sequence: string;
	loop: string;
	loopNone: string;
	parts: string;
	mute: string;
	solo: string;
	groups: string;
};

export const DEFAULT_PLAYER_LABELS: TaikoPlayerLabels = {
	play: "Tocar",
	pause: "Pausar",
	stop: "Parar",
	tempo: "Andamento",
	resetTempo: "Voltar ao andamento escrito",
	metronome: "Metrônomo",
	sequence: "Sequência",
	loop: "Repetir",
	loopNone: "Música inteira, sem repetir",
	parts: "Partes",
	mute: "Mudo",
	solo: "Solo",
	groups: "Grupos",
};

export type TaikoPlayerControlsProps = {
	song: Song;
	player: TaikoPlayer;
	snapshot: PlayerSnapshot;
	labels?: Partial<TaikoPlayerLabels>;
	className?: string;
};

const button =
	"inline-flex items-center gap-2 rounded border border-card-foreground/25 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const pressed =
	"border-primary bg-primary text-primary-foreground hover:bg-primary/90";

function groupsOf(song: Song): GroupColor[] {
	const groups: GroupColor[] = [];
	for (const section of song.sections) {
		for (const phrase of section.phrases) {
			if (phrase.group && !groups.includes(phrase.group)) {
				groups.push(phrase.group);
			}
		}
	}
	return groups;
}

/**
 * Transport and mixer for a `TaikoPlayer`: play, pause, stop, tempo, section
 * loop, metronome, and mute or solo for each part and group.
 */
export function TaikoPlayerControls({
	song,
	player,
	snapshot,
	labels: customLabels,
	className,
}: TaikoPlayerControlsProps) {
	const labels = { ...DEFAULT_PLAYER_LABELS, ...customLabels };
	const tempoId = useId();
	const loopId = useId();
	const playing = snapshot.status === "playing";
	const { steps } = snapshot;
	const groups = groupsOf(song);
	const bpm = Math.round(song.bpm * snapshot.tempoScale);

	return (
		<div
			className={cn(
				"flex flex-col gap-4 rounded-md border border-border bg-card p-4 text-card-foreground",
				className,
			)}
		>
			<div className="flex flex-wrap items-center gap-3">
				<button
					type="button"
					className={cn(button, pressed)}
					onClick={() => player.toggle()}
				>
					{playing ? (
						<Pause className="h-4 w-4" aria-hidden="true" />
					) : (
						<Play className="h-4 w-4" aria-hidden="true" />
					)}
					{playing ? labels.pause : labels.play}
				</button>
				<button
					type="button"
					className={button}
					onClick={() => player.stop()}
					disabled={snapshot.status === "stopped"}
				>
					<Square className="h-4 w-4" aria-hidden="true" />
					{labels.stop}
				</button>
				<button
					type="button"
					className={cn(button, snapshot.metronome && pressed)}
					aria-pressed={snapshot.metronome}
					onClick={() => player.setMetronome(!snapshot.metronome)}
				>
					<Timer className="h-4 w-4" aria-hidden="true" />
					{labels.metronome}
				</button>
				<div className="flex items-center gap-2 text-sm">
					<label htmlFor={tempoId} className="font-medium">
						{labels.tempo}
					</label>
					<input
						id={tempoId}
						type="range"
						min={Math.ceil(song.bpm * MIN_TEMPO_SCALE)}
						max={Math.floor(song.bpm * MAX_TEMPO_SCALE)}
						step={1}
						value={bpm}
						onChange={(event) =>
							player.setTempoScale(Number(event.target.value) / song.bpm)
						}
						className="w-40 accent-primary"
					/>
					<output htmlFor={tempoId} className="w-16 tabular-nums">
						{bpm} bpm
					</output>
					{snapshot.tempoScale !== 1 && (
						<button
							type="button"
							className="text-xs underline underline-offset-2"
							onClick={() => player.setTempoScale(1)}
						>
							{labels.resetTempo}
						</button>
					)}
				</div>
			</div>

			{steps.length > 0 && (
				<div className="flex flex-wrap items-center gap-2 text-sm">
					<span className="font-medium">{labels.sequence}</span>
					{steps.map((step, index) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: a step is its position in the sequence
							key={index}
							type="button"
							className={cn(
								button,
								"px-2 py-1 text-xs",
								snapshot.step === index && pressed,
							)}
							aria-current={snapshot.step === index ? "step" : undefined}
							onClick={() => player.seekToStep(index)}
						>
							{step.label}
						</button>
					))}
					<label htmlFor={loopId} className="ml-2 font-medium">
						{labels.loop}
					</label>
					<select
						id={loopId}
						className="rounded border border-card-foreground/25 bg-card px-2 py-1 text-sm"
						value={snapshot.loopStep ?? ""}
						onChange={(event) =>
							player.setLoopStep(
								event.target.value === "" ? null : Number(event.target.value),
							)
						}
					>
						<option value="">{labels.loopNone}</option>
						{steps.map((step, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: a step is its position in the sequence
							<option key={index} value={index}>
								{index + 1}. {step.label}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
				<fieldset className="flex flex-wrap items-center gap-3">
					<legend className="sr-only">{labels.parts}</legend>
					<span className="font-medium" aria-hidden="true">
						{labels.parts}
					</span>
					{song.parts.map((part) => {
						const muted = snapshot.mutedParts.includes(part.name);
						const solo = snapshot.soloParts.includes(part.name);
						return (
							<span key={part.name} className="flex items-center gap-1">
								<span>{part.name}</span>
								<button
									type="button"
									className={cn(
										button,
										"px-2 py-0.5 text-xs",
										muted && pressed,
									)}
									aria-pressed={muted}
									aria-label={`${labels.mute}: ${part.name}`}
									title={labels.mute}
									onClick={() => player.setPartMuted(part.name, !muted)}
								>
									M
								</button>
								{song.parts.length > 1 && (
									<button
										type="button"
										className={cn(
											button,
											"px-2 py-0.5 text-xs",
											solo && pressed,
										)}
										aria-pressed={solo}
										aria-label={`${labels.solo}: ${part.name}`}
										title={labels.solo}
										onClick={() => player.setPartSolo(part.name, !solo)}
									>
										S
									</button>
								)}
							</span>
						);
					})}
				</fieldset>

				{groups.length > 0 && (
					<fieldset className="flex flex-wrap items-center gap-2">
						<legend className="sr-only">{labels.groups}</legend>
						<span className="font-medium" aria-hidden="true">
							{labels.groups}
						</span>
						{groups.map((group) => {
							const muted = snapshot.mutedGroups.includes(group);
							const name =
								song.groups.find((item) => item.color === group)?.label ??
								group;
							return (
								<button
									key={group}
									type="button"
									className={cn(
										button,
										"px-2 py-1 text-xs",
										muted && "line-through opacity-50",
									)}
									aria-pressed={!muted}
									onClick={() => player.setGroupMuted(group, !muted)}
								>
									<span
										className="h-3 w-3 rounded-sm border border-black/30"
										style={{ backgroundColor: GROUP_FILL[group] }}
										aria-hidden="true"
									/>
									{name}
								</button>
							);
						})}
					</fieldset>
				)}
			</div>
		</div>
	);
}
