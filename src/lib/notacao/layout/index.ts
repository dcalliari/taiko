import type { Song } from "../model";
import type { LayoutOptions, SheetLayout } from "./flow";
import { layoutGrid } from "./grid";
import { layoutSheet } from "./sheet";

export type {
	CellBox,
	LayoutItem,
	LayoutOptions,
	LayoutPage,
	LineItem,
	RectItem,
	SheetLabels,
	SheetLayout,
	TextItem,
} from "./flow";
export {
	COLORS,
	DEFAULT_GROUP_NAME,
	DEFAULT_LABELS,
	GROUP_FILL,
} from "./flow";
export { layoutGrid } from "./grid";
export { measureText } from "./metrics";
export { layoutSheet } from "./sheet";

/** "ficha": the sheet as the group writes it. "grade": the beat grid. */
export const SHEET_VIEWS = ["ficha", "grade"] as const;
export type SheetView = (typeof SHEET_VIEWS)[number];

export function layoutSong(
	song: Song,
	view: SheetView = "ficha",
	options: LayoutOptions = {},
): SheetLayout {
	return view === "grade"
		? layoutGrid(song, options)
		: layoutSheet(song, options);
}
