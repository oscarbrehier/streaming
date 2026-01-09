import { useState } from "react";

export function useMediaSources(sources: MediaSources) {

	const [currentSource, setCurrentSource] = useState<MediaSourceFile>(sources.files[0]);

	function changeSource(source: MediaSourceFile) {
		setCurrentSource(source);
	};

	return {
		currentSource,
		setCurrentSource,
		changeSource
	};

};