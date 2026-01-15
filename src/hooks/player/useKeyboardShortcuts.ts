import { PlayerState } from "@/components/player/Player";
import { useEffect } from "react";

export function useKeyBoardShortcuts(
	playerState: PlayerState,
	togglePlay: () => void,
	toggleFullscreen: () => void,
	skipForward: () => void,
	skipBackward: () => void,
) {

	useEffect(() => {

		if (playerState !== "ready") return;

		const handleKeyDown = (e: KeyboardEvent) => {

			const actions: Record<string, () => void> = {
				"Space": togglePlay,
				"KeyF": toggleFullscreen,
				"ArrowRight": skipForward,
				"ArrowLeft": skipBackward
			};

			const action = actions[e.code];
			if (action) {
				e.preventDefault();
				action();
			};

		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);

	}, [playerState, togglePlay, toggleFullscreen, skipForward, skipBackward]);

};