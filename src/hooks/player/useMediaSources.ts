import { useState } from "react";

export function useMediaSources(sources: MediaSources) {

	const [currentIndex, setCurrentIndex] = useState(0);
	const currentSource = sources.files[currentIndex];

	function changeSource(index: number) {
		if (index >= 0 && index < sources.files.length) {
			setCurrentIndex(index);
		};
	};

	function nextSource(): boolean {

		if (currentIndex < sources.files.length - 1) {
			setCurrentIndex(prev => prev + 1);
			return true;
		};

		return false;

	};

	return {
		currentSource,
		changeSource,
		nextSource,
	};

};