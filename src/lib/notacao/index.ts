// PDF export lives in "./pdf" and is not re-exported here: it pulls in jsPDF,
// which only the code that actually exports a PDF should load.
export { fold, formatBeats, KEYS, parseBeats } from "./format";
export type {
	CellBox,
	LayoutItem,
	LayoutOptions,
	LayoutPage,
	SheetLabels,
	SheetLayout,
	SheetView,
} from "./layout";
export {
	DEFAULT_GROUP_NAME,
	GROUP_FILL,
	layoutGrid,
	layoutSheet,
	layoutSong,
	SHEET_VIEWS,
} from "./layout";
export type { LegendEntry } from "./legend";
export { buildLegend } from "./legend";
export type {
	Group,
	GroupColor,
	Instrument,
	Line,
	LineRepeat,
	Meter,
	NotesLine,
	Part,
	Phrase,
	RemarkLine,
	Section,
	Separator,
	SequenceStep,
	Song,
	Token,
	Unit,
	VoiceToken,
	WordToken,
} from "./model";
export {
	DEFAULT_BPM,
	DEFAULT_PART,
	GROUP_COLORS,
	INSTRUMENTS,
	MAX_BPM,
	MIN_BPM,
	partOfSection,
	resolveSequence,
	songSchema,
} from "./model";
export type { NotationIssue, ParseResult } from "./parser";
export { NotationError, parseSong, safeParseSong } from "./parser";
export type {
	PlayerAudio,
	PlayerEnvironment,
	PlayerSnapshot,
	PlayerStatus,
} from "./player/engine";
export {
	MAX_TEMPO_SCALE,
	MIN_TEMPO_SCALE,
	TaikoPlayer,
} from "./player/engine";
export { TaikoSynth } from "./player/synth";
export { serializeSong } from "./serializer";
export type { Hand, SyllableInfo, Zone } from "./syllables";
export { isKnownSyllable, splitSyllables, syllableInfo } from "./syllables";
export type {
	Timeline,
	TimelineEvent,
	TimelineStep,
	TimelineTick,
} from "./timeline";
export { buildTimeline, swingBeat } from "./timeline";
export type { TimedCell, TimedLine } from "./timing";
export {
	cellKey,
	phraseBeats,
	sectionBeats,
	timeLine,
	tokenBeats,
} from "./timing";
