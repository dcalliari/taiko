"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import {
	type LayoutOptions,
	SHEET_VIEWS,
	type SheetView,
} from "@/lib/notacao/layout";
import type { Song } from "@/lib/notacao/model";
import { cn } from "@/lib/utils";
import { downloadSongPdf } from "./downloadSongPdf";
import {
	TaikoPlayerControls,
	type TaikoPlayerLabels,
} from "./TaikoPlayerControls";
import { TaikoSheet } from "./TaikoSheet";
import { useTaikoPlayer } from "./useTaikoPlayer";

export type TaikoSheetPlayerLabels = TaikoPlayerLabels & {
	view: string;
	views: Record<SheetView, string>;
	downloadPdf: string;
};

export type TaikoSheetPlayerProps = {
	song: Song;
	initialView?: SheetView;
	options?: LayoutOptions;
	labels?: Partial<TaikoSheetPlayerLabels>;
	className?: string;
};

const VIEW_LABELS: Record<SheetView, string> = {
	ficha: "Ficha",
	grade: "Grade de tempos",
};

/**
 * The whole thing in one piece: the sheet, the player that follows it
 * syllable by syllable, the switch between sheet and beat grid, and the PDF
 * download. For a custom arrangement, use `TaikoSheet`, `TaikoPlayerControls`
 * and `useTaikoPlayer` directly.
 */
export function TaikoSheetPlayer({
	song,
	initialView = "ficha",
	options,
	labels,
	className,
}: TaikoSheetPlayerProps) {
	const [view, setView] = useState<SheetView>(initialView);
	const [exporting, setExporting] = useState(false);
	const { player, snapshot } = useTaikoPlayer(song);
	const viewLabels = { ...VIEW_LABELS, ...labels?.views };

	const download = async () => {
		setExporting(true);
		try {
			await downloadSongPdf(song, { ...options, view });
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<TaikoPlayerControls
				song={song}
				player={player}
				snapshot={snapshot}
				labels={labels}
				className="print:hidden"
			/>
			<div className="flex flex-wrap items-center gap-3 text-sm print:hidden">
				<fieldset className="flex items-center gap-1">
					<legend className="sr-only">{labels?.view ?? "Visão"}</legend>
					{SHEET_VIEWS.map((option) => (
						<button
							key={option}
							type="button"
							aria-pressed={view === option}
							onClick={() => setView(option)}
							className={cn(
								"rounded border border-border px-3 py-1.5 font-medium transition-colors",
								view === option
									? "border-primary bg-primary text-primary-foreground"
									: "hover:bg-foreground/10",
							)}
						>
							{viewLabels[option]}
						</button>
					))}
				</fieldset>
				<button
					type="button"
					onClick={download}
					disabled={exporting}
					className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-medium transition-colors hover:bg-foreground/10 disabled:opacity-50"
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					{labels?.downloadPdf ?? "Baixar PDF"}
				</button>
			</div>
			<TaikoSheet
				song={song}
				view={view}
				options={options}
				activeKeys={snapshot.activeKeys}
			/>
		</div>
	);
}
