import { useState } from "react";

export function useSubtitles(subtitles: SubtitleSource[]) {

	const [currentTrack, changeSubtitleTrack] = useState<SubtitleSource | null>(
		subtitles && subtitles.length > 0 ? subtitles[1] : null
	); 

	return {
		currentTrack,
		changeSubtitleTrack
	};

};