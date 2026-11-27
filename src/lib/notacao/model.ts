import { z } from "zod";
import { splitSyllables } from "./syllables";

export const INSTRUMENTS = [
	"nagado",
	"shime",
	"okedo",
	"odaiko",
	"atarigane",
] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

/** Row colors of the Kodon sheet. Each color is one "grupo/lado". */
export const GROUP_COLORS = ["azul", "laranja", "verde", "rosa"] as const;
export type GroupColor = (typeof GROUP_COLORS)[number];

/** How two tokens are joined on paper. None of them changes the timing. */
export const SEPARATORS = ["hyphen", "dash", "hyphen-space"] as const;
export type Separator = (typeof SEPARATORS)[number];

export const DEFAULT_BPM = 100;
export const MIN_BPM = 20;
export const MAX_BPM = 400;
export const MAX_REPEAT = 200;
export const MAX_DURATION = 32;

const singleLine = (label: string) =>
	z
		.string()
		.min(1, `${label}: não pode ficar em branco`)
		.refine((value) => value === value.trim() && !/[\r\n]/.test(value), {
			message: `${label}: deve caber em uma linha, sem espaços nas pontas`,
		});

const repeatCount = z
	.number()
	.int("a repetição deve ser um número inteiro")
	.min(1, "a repetição deve ser de pelo menos 1 vez")
	.max(MAX_REPEAT, `a repetição não pode passar de ${MAX_REPEAT} vezes`);

const duration = z
	.number()
	.positive("a duração deve ser maior que zero")
	.max(MAX_DURATION, `a duração não pode passar de ${MAX_DURATION} tempos`);

const bpm = z
	.number()
	.min(MIN_BPM, `o bpm deve ficar entre ${MIN_BPM} e ${MAX_BPM}`)
	.max(MAX_BPM, `o bpm deve ficar entre ${MIN_BPM} e ${MAX_BPM}`);

const separator = z.enum(SEPARATORS);

export const syllableUnitSchema = z.object({
	kind: z.literal("syllable"),
	/** Lowercase romaji. Strength lives in `weak`, not in the casing. */
	text: z.string().regex(/^[\p{Ll}\p{Lo}]+$/u, "sílaba inválida"),
	/** Written in lowercase on the sheet: a weak hit. */
	weak: z.boolean(),
});

/** Silent slot inside a word (`_`): shapes the timing, never printed. */
export const restUnitSchema = z.object({ kind: z.literal("rest") });

export const unitSchema = z.discriminatedUnion("kind", [
	syllableUnitSchema,
	restUnitSchema,
]);

export const wordTokenSchema = z
	.object({
		kind: z.literal("word"),
		/** Separator written before this token. Absent means a space. */
		sep: separator.optional(),
		units: z.array(unitSchema).min(1),
		/** 1 = underlined on the sheet, 2 = underlined and bold. */
		accent: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		/** Total beats of the word. Absent means the default of 1 beat. */
		duration: duration.optional(),
	})
	.superRefine((word, ctx) => {
		// Fused syllables must split back the same way, or the text form
		// would not round-trip.
		let run: string[] = [];
		const flush = () => {
			if (run.length === 0) return;
			const resplit = splitSyllables(run.join(""));
			if (resplit.join("|") !== run.join("|")) {
				ctx.addIssue({
					code: "custom",
					path: ["units"],
					message: `as sílabas "${run.join(" ")}" não formam uma palavra legível`,
				});
			}
			run = [];
		};
		for (const unit of word.units) {
			if (unit.kind === "syllable") run.push(unit.text);
			else flush();
		}
		flush();
		if (word.accent > 0 && word.units.every((unit) => unit.kind === "rest")) {
			ctx.addIssue({
				code: "custom",
				path: ["accent"],
				message: "pausa não leva acento",
			});
		}
	});

/** Spoken, not played: kakegoe such as (HA!) or a count such as (tsuku). */
export const voiceTokenSchema = z.object({
	kind: z.literal("voice"),
	sep: separator.optional(),
	text: singleLine("kakegoe").refine(
		(value) => !/[()]/.test(value) && !/^[xX]\s*\d/.test(value),
		{ message: "kakegoe inválido" },
	),
	/** Bold on the sheet. */
	emphasis: z.boolean(),
	/** Total beats. Absent means one beat per spoken word. */
	duration: duration.optional(),
});

export const tokenSchema = z.discriminatedUnion("kind", [
	wordTokenSchema,
	voiceTokenSchema,
]);

export const lineRepeatSchema = z.object({
	count: repeatCount,
	/** Free indication printed with the count, e.g. "CRESCENTE". */
	label: singleLine("indicação")
		.refine((value) => !/[()]/.test(value), {
			message: "a indicação não pode conter parênteses",
		})
		.optional(),
});

export const notesLineSchema = z
	.object({
		kind: z.literal("notes"),
		tokens: z.array(tokenSchema).min(1),
		repeat: lineRepeatSchema.optional(),
	})
	.superRefine((line, ctx) => {
		if (line.tokens[0]?.sep !== undefined) {
			ctx.addIssue({
				code: "custom",
				path: ["tokens", 0, "sep"],
				message: "a linha não pode começar com hífen",
			});
		}
	});

/** Printed in parentheses, neither played nor spoken. */
export const remarkLineSchema = z.object({
	kind: z.literal("remark"),
	text: singleLine("observação"),
});

export const lineSchema = z.discriminatedUnion("kind", [
	notesLineSchema,
	remarkLineSchema,
]);

export const phraseSchema = z.object({
	repeat: repeatCount,
	group: z.enum(GROUP_COLORS).optional(),
	lines: z.array(lineSchema).min(1, "a frase precisa de pelo menos uma linha"),
});

const sectionName = singleLine("nome da seção").refine(
	(value) => !/[[\]>+()]/.test(value),
	{ message: "o nome da seção não pode conter [ ] > + ( )" },
);

const partName = singleLine("nome da parte").refine(
	(value) => !/[,()]/.test(value),
	{ message: "o nome da parte não pode conter vírgula nem parênteses" },
);

export const sectionSchema = z.object({
	name: sectionName,
	/** Name of the part that plays it. Absent means the first part. */
	part: partName.optional(),
	phrases: z.array(phraseSchema),
});

export const partSchema = z.object({
	name: partName,
	instrument: z.enum(INSTRUMENTS),
});

export const groupSchema = z.object({
	color: z.enum(GROUP_COLORS),
	label: singleLine("nome do grupo").refine((value) => !/[,=]/.test(value), {
		message: "o nome do grupo não pode conter vírgula nem sinal de igual",
	}),
});

export const sequenceStepSchema = z
	.object({
		/** Played together. The first one sets the length, the others loop. */
		sections: z.array(sectionName).min(1),
		repeat: repeatCount,
		bpm: bpm.optional(),
	})
	.superRefine((step, ctx) => {
		if (new Set(step.sections).size !== step.sections.length) {
			ctx.addIssue({
				code: "custom",
				path: ["sections"],
				message: "a mesma seção aparece duas vezes no mesmo passo",
			});
		}
	});

export const meterSchema = z.object({
	beats: z.number().int().min(1).max(32),
	unit: z.number().int().min(1).max(32),
});

export const DEFAULT_PART: Part = { name: "Taiko", instrument: "nagado" };

export const songSchema = z
	.object({
		title: singleLine("título"),
		/** "Composição" on the sheet. */
		composer: singleLine("composição").optional(),
		/** "Digitação" on the sheet: who wrote the sheet down. */
		transcriber: singleLine("digitação").optional(),
		/** Beats per minute, where one beat is one written word. */
		bpm,
		/** Absent means free meter. */
		meter: meterSchema.optional(),
		swing: z.boolean(),
		parts: z.array(partSchema).min(1),
		/** Names for the row colors. Colors work without an entry here. */
		groups: z.array(groupSchema),
		notes: z.array(singleLine("observação")),
		sections: z.array(sectionSchema),
		/** Empty means every section once, in written order. */
		sequence: z.array(sequenceStepSchema),
	})
	.superRefine((song, ctx) => {
		const sectionNames = new Set<string>();
		song.sections.forEach((section, index) => {
			if (sectionNames.has(section.name)) {
				ctx.addIssue({
					code: "custom",
					path: ["sections", index, "name"],
					message: `já existe uma seção chamada "${section.name}"`,
				});
			}
			sectionNames.add(section.name);
		});

		const partNames = new Set<string>();
		song.parts.forEach((part, index) => {
			if (partNames.has(part.name)) {
				ctx.addIssue({
					code: "custom",
					path: ["parts", index, "name"],
					message: `já existe uma parte chamada "${part.name}"`,
				});
			}
			partNames.add(part.name);
		});

		song.sections.forEach((section, index) => {
			if (section.part !== undefined && !partNames.has(section.part)) {
				ctx.addIssue({
					code: "custom",
					path: ["sections", index, "part"],
					message: `a parte "${section.part}" não foi declarada em "partes"`,
				});
			}
		});

		const groupColors = new Set<string>();
		song.groups.forEach((group, index) => {
			if (groupColors.has(group.color)) {
				ctx.addIssue({
					code: "custom",
					path: ["groups", index, "color"],
					message: `o grupo "${group.color}" foi declarado duas vezes`,
				});
			}
			groupColors.add(group.color);
		});

		song.sequence.forEach((step, stepIndex) => {
			step.sections.forEach((name, nameIndex) => {
				if (!sectionNames.has(name)) {
					ctx.addIssue({
						code: "custom",
						path: ["sequence", stepIndex, "sections", nameIndex],
						message: `a sequência cita a seção "${name}", que não existe`,
					});
				}
			});
		});
	});

export type SyllableUnit = z.infer<typeof syllableUnitSchema>;
export type RestUnit = z.infer<typeof restUnitSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type WordToken = z.infer<typeof wordTokenSchema>;
export type VoiceToken = z.infer<typeof voiceTokenSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type LineRepeat = z.infer<typeof lineRepeatSchema>;
export type NotesLine = z.infer<typeof notesLineSchema>;
export type RemarkLine = z.infer<typeof remarkLineSchema>;
export type Line = z.infer<typeof lineSchema>;
export type Phrase = z.infer<typeof phraseSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Part = z.infer<typeof partSchema>;
export type Group = z.infer<typeof groupSchema>;
export type SequenceStep = z.infer<typeof sequenceStepSchema>;
export type Meter = z.infer<typeof meterSchema>;
export type Song = z.infer<typeof songSchema>;

/** The sequence as played: the written one, or every section once. */
export function resolveSequence(song: Song): SequenceStep[] {
	if (song.sequence.length > 0) return song.sequence;
	return song.sections.map((section) => ({
		sections: [section.name],
		repeat: 1,
	}));
}

export function partOfSection(song: Song, section: Section): Part {
	return song.parts.find((part) => part.name === section.part) ?? song.parts[0];
}
