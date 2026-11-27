"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Song } from "@/lib/notacao/model";
import { type PlayerSnapshot, TaikoPlayer } from "@/lib/notacao/player/engine";

export type UseTaikoPlayer = {
	player: TaikoPlayer;
	snapshot: PlayerSnapshot;
};

/**
 * Binds a `TaikoPlayer` to a component: one player per mount, reloaded when
 * the song changes and released on unmount. Audio only starts on `play()`.
 */
export function useTaikoPlayer(song: Song): UseTaikoPlayer {
	const [player] = useState(() => new TaikoPlayer(song));

	useEffect(() => {
		player.load(song);
	}, [player, song]);

	useEffect(() => () => player.dispose(), [player]);

	const snapshot = useSyncExternalStore(
		player.subscribe,
		player.getSnapshot,
		player.getSnapshot,
	);
	return { player, snapshot };
}
