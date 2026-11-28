import type { Instrument } from "../model";
import type { Zone } from "../syllables";

/**
 * Every sound here is synthesized with Web Audio oscillators and filtered
 * noise. No samples are shipped, so there is no third-party audio license.
 */

type DrumPreset = {
	kind: "drum";
	/** Pitch of the head right at the stroke and after it settles, in Hz. */
	head: [number, number];
	settle: number;
	decay: number;
	/** Stick noise: level and low-pass cutoff. */
	stick: [number, number];
	/** Two resonances of the rim (fuchi), in Hz. */
	rim: [number, number];
};

type BellPreset = {
	kind: "bell";
	partials: number[];
	decay: number;
	/** Decay of the muted edge stroke (chi, ki). */
	edgeDecay: number;
};

const PRESETS: Record<Instrument, DrumPreset | BellPreset> = {
	nagado: {
		kind: "drum",
		head: [158, 70],
		settle: 0.06,
		decay: 0.65,
		stick: [0.5, 1300],
		rim: [1120, 1790],
	},
	odaiko: {
		kind: "drum",
		head: [104, 46],
		settle: 0.09,
		decay: 1.25,
		stick: [0.42, 750],
		rim: [760, 1240],
	},
	okedo: {
		kind: "drum",
		head: [228, 108],
		settle: 0.05,
		decay: 0.34,
		stick: [0.55, 1900],
		rim: [1480, 2300],
	},
	shime: {
		kind: "drum",
		head: [590, 372],
		settle: 0.03,
		decay: 0.15,
		stick: [0.7, 3400],
		rim: [2600, 3900],
	},
	atarigane: {
		kind: "bell",
		partials: [2350, 3760, 5430],
		decay: 0.42,
		edgeDecay: 0.09,
	},
};

const SILENCE = 0.0001;

export type SynthVoice = {
	instrument: Instrument;
	zone: Zone;
	/** 0 to 1. */
	level: number;
	/** -1 (left) to 1 (right). */
	pan?: number;
};

export class TaikoSynth {
	private readonly context: BaseAudioContext;
	private readonly master: GainNode;
	private readonly noise: AudioBuffer;
	private readonly outputs = new Map<number, AudioNode>();

	constructor(context: BaseAudioContext, destination?: AudioNode) {
		this.context = context;
		const compressor = context.createDynamicsCompressor();
		compressor.threshold.value = -14;
		compressor.ratio.value = 4;
		this.master = context.createGain();
		this.master.gain.value = 0.85;
		this.master.connect(compressor);
		compressor.connect(destination ?? context.destination);

		const length = Math.floor(context.sampleRate * 0.25);
		this.noise = context.createBuffer(1, length, context.sampleRate);
		const data = this.noise.getChannelData(0);
		for (let index = 0; index < length; index++) {
			data[index] = Math.random() * 2 - 1;
		}
	}

	setVolume(volume: number): void {
		this.master.gain.value = Math.max(0, Math.min(1, volume));
	}

	private output(pan = 0): AudioNode {
		const key = Math.round(pan * 100);
		const cached = this.outputs.get(key);
		if (cached) return cached;
		let node: AudioNode = this.master;
		if (key !== 0 && typeof this.context.createStereoPanner === "function") {
			const panner = this.context.createStereoPanner();
			panner.pan.value = key / 100;
			panner.connect(this.master);
			node = panner;
		}
		this.outputs.set(key, node);
		return node;
	}

	private tone(
		output: AudioNode,
		time: number,
		from: number,
		to: number,
		settle: number,
		peak: number,
		decay: number,
		type: OscillatorType = "sine",
	): void {
		const oscillator = this.context.createOscillator();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(from, time);
		if (to !== from) {
			oscillator.frequency.exponentialRampToValueAtTime(to, time + settle);
		}
		const gain = this.context.createGain();
		gain.gain.setValueAtTime(SILENCE, time);
		gain.gain.exponentialRampToValueAtTime(
			Math.max(SILENCE, peak),
			time + 0.004,
		);
		gain.gain.exponentialRampToValueAtTime(SILENCE, time + decay);
		oscillator.connect(gain);
		gain.connect(output);
		oscillator.start(time);
		oscillator.stop(time + decay + 0.05);
	}

	private burst(
		output: AudioNode,
		time: number,
		filter: BiquadFilterType,
		frequency: number,
		peak: number,
		decay: number,
	): void {
		const source = this.context.createBufferSource();
		source.buffer = this.noise;
		const biquad = this.context.createBiquadFilter();
		biquad.type = filter;
		biquad.frequency.value = frequency;
		biquad.Q.value = filter === "bandpass" ? 3.5 : 0.7;
		const gain = this.context.createGain();
		gain.gain.setValueAtTime(Math.max(SILENCE, peak), time);
		gain.gain.exponentialRampToValueAtTime(SILENCE, time + decay);
		source.connect(biquad);
		biquad.connect(gain);
		gain.connect(output);
		source.start(time);
		source.stop(time + decay + 0.02);
	}

	/** Schedules one stroke at `time` (seconds on the audio clock). */
	hit(voice: SynthVoice, time: number): void {
		const level = Math.max(0, Math.min(1, voice.level));
		if (level <= 0) return;
		const output = this.output(voice.pan);
		const preset = PRESETS[voice.instrument];

		if (preset.kind === "bell") {
			const decay = voice.zone === "rim" ? preset.edgeDecay : preset.decay;
			preset.partials.forEach((frequency, index) => {
				const peak = (level * 0.3) / (index + 1);
				this.tone(output, time, frequency, frequency, 0, peak, decay, "square");
			});
			return;
		}

		if (voice.zone === "rim") {
			this.burst(output, time, "bandpass", preset.rim[1], level * 0.9, 0.045);
			this.tone(
				output,
				time,
				preset.rim[0],
				preset.rim[0],
				0,
				level * 0.5,
				0.06,
			);
			this.tone(
				output,
				time,
				preset.rim[1],
				preset.rim[1],
				0,
				level * 0.3,
				0.04,
			);
			return;
		}

		const [start, end] = preset.head;
		// A harder stroke stretches the head more: brighter attack, longer ring.
		const attack = start * (1 + 0.3 * level);
		const decay = preset.decay * (0.55 + 0.45 * level);
		this.tone(output, time, attack, end, preset.settle, level, decay);
		this.tone(
			output,
			time,
			attack * 1.59,
			end * 1.59,
			preset.settle,
			level * 0.28,
			decay * 0.4,
		);
		this.burst(
			output,
			time,
			"lowpass",
			preset.stick[1],
			level * preset.stick[0],
			0.03,
		);
	}

	/** Metronome click. */
	click(time: number, accent: boolean): void {
		const frequency = accent ? 1760 : 1175;
		this.tone(
			this.output(),
			time,
			frequency,
			frequency,
			0,
			accent ? 0.3 : 0.2,
			0.04,
			"triangle",
		);
	}
}
