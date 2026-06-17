import { useState } from "react";

export function useSubtitles(subtitles: SubtitleSource[]) {

	const [currentTrack, changeSubtitleTrack] = useState<SubtitleSource | null>(null); 

	return {
		currentTrack,
		changeSubtitleTrack
	};

};