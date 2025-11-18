import { useEffect } from "react";

export function useKeyBoardShortcuts(
	togglePlay: () => void,
	toggleFullscreen: () => void,
	skipForward: () => void,
	skipBackward: () => void,
) {

	useEffect(() => {

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

	}, [togglePlay, toggleFullscreen, skipForward, skipBackward]);

};