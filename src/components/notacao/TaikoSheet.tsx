import { memo } from "react";
import {
	type LayoutOptions,
	type LayoutPage,
	layoutSong,
	type SheetLayout,
	type SheetView,
} from "@/lib/notacao/layout";
import type { Song } from "@/lib/notacao/model";
import { cn } from "@/lib/utils";

export type TaikoSheetProps = {
	song: Song;
	/** "ficha" is the sheet as the group writes it; "grade" is the beat grid. */
	view?: SheetView;
	/** Cells to highlight, by `cellKey`: the play cursor. */
	activeKeys?: readonly string[];
	options?: LayoutOptions;
	className?: string;
	/** Accessible name of each page. `{n}` and `{total}` are replaced. */
	pageLabel?: string;
};

// Arial and Liberation Sans share Helvetica's metrics, which the layout uses.
const FONT_FAMILY = "Helvetica, Arial, 'Liberation Sans', sans-serif";
const CURSOR_FILL = "#e7b008";

// Hook-free cache, so the sheet also renders as a React Server Component.
const layouts = new WeakMap<Song, Map<string, SheetLayout>>();

function cachedLayout(
	song: Song,
	view: SheetView,
	options: LayoutOptions | undefined,
): SheetLayout {
	let bySong = layouts.get(song);
	if (!bySong) {
		bySong = new Map();
		layouts.set(song, bySong);
	}
	const key = `${view}:${JSON.stringify(options ?? {})}`;
	let layout = bySong.get(key);
	if (!layout) {
		layout = layoutSong(song, view, options);
		bySong.set(key, layout);
	}
	return layout;
}

const SheetPage = memo(function SheetPage({ page }: { page: LayoutPage }) {
	return (
		<>
			{page.items.map((item, index) => {
				if (item.type === "rect") {
					return (
						<rect
							// biome-ignore lint/suspicious/noArrayIndexKey: a page is a fixed drawing list
							key={index}
							x={item.x}
							y={item.y}
							width={item.width}
							height={item.height}
							fill={item.fill ?? "none"}
							stroke={item.stroke ?? "none"}
							strokeWidth={item.strokeWidth}
						/>
					);
				}
				if (item.type === "line") {
					return (
						<line
							// biome-ignore lint/suspicious/noArrayIndexKey: a page is a fixed drawing list
							key={index}
							x1={item.x1}
							y1={item.y1}
							x2={item.x2}
							y2={item.y2}
							stroke={item.stroke}
							strokeWidth={item.strokeWidth}
						/>
					);
				}
				return (
					<text
						// biome-ignore lint/suspicious/noArrayIndexKey: a page is a fixed drawing list
						key={index}
						x={item.x}
						y={item.y}
						fontSize={item.size}
						fontWeight={item.bold ? 700 : 400}
						fontStyle={item.italic ? "italic" : "normal"}
						fill={item.color}
						textLength={item.width > 0 ? item.width : undefined}
						lengthAdjust="spacing"
						xmlSpace="preserve"
					>
						{item.text}
					</text>
				);
			})}
		</>
	);
});

/**
 * Draws a song sheet as SVG, one A4 page per `<svg>`. Pure: no state, no
 * router, no data fetching. The same layout feeds the PDF export, so what is
 * on screen is what gets printed.
 */
export function TaikoSheet({
	song,
	view = "ficha",
	activeKeys = [],
	options,
	className,
	pageLabel = "{title}, página {n} de {total}",
}: TaikoSheetProps) {
	const layout = cachedLayout(song, view, options);
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-6 print:block print:gap-0",
				className,
			)}
		>
			{layout.pages.map((page, pageIndex) => (
				<svg
					// biome-ignore lint/suspicious/noArrayIndexKey: pages only exist by position
					key={pageIndex}
					viewBox={`0 0 ${page.width} ${page.height}`}
					role="img"
					aria-label={pageLabel
						.replace("{title}", song.title)
						.replace("{n}", String(pageIndex + 1))
						.replace("{total}", String(layout.pages.length))}
					className="h-auto w-full max-w-[794px] bg-white shadow-lg print:max-w-none print:shadow-none"
					style={{ fontFamily: FONT_FAMILY, breakAfter: "page" }}
				>
					<SheetPage page={page} />
					{activeKeys.map((key) => {
						const box = layout.cells[key];
						if (!box || box.page !== pageIndex) return null;
						return (
							<rect
								key={key}
								x={box.x}
								y={box.y}
								width={box.width}
								height={box.height}
								rx={2}
								fill={CURSOR_FILL}
								fillOpacity={0.6}
								style={{ mixBlendMode: "multiply" }}
							/>
						);
					})}
				</svg>
			))}
		</div>
	);
}
