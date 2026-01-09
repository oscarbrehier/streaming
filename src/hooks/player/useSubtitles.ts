import { useState } from "react";

export function useSubtitles(subtitles: SubtitleSource[]) {

	const [currentTrack, changeSubtitleTrack] = useState<SubtitleSource>(subtitles[0]);

	return {
		currentTrack,
		changeSubtitleTrack
	}

};