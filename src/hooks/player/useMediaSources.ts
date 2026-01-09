import { useState } from "react";

export function useMediaSources(sources: MediaSources) {

	const [currentSource, changeSource] = useState<MediaSourceFile>(sources.files[0]);

	return {
		currentSource,
		changeSource
	};

};