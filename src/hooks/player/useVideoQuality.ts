import Hls from "hls.js";
import { RefObject, useCallback, useEffect, useState } from "react";

export interface QualityLevel {
	index: number;
	height: number;
	width: number;
	bitrate: number;
	label: string;
};

export function useVideoQuality(
	hlsRef: RefObject<Hls | null>
) {

	const [qualities, setQualities] = useState<QualityLevel[]>([]);
	const [currentQuality, setCurrentQuality] = useState<number | "auto">("auto");

	const setupQualityListener = useCallback((hls: Hls) => {

		hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {

			const levels = data.levels.map((level, index) => ({
				index,
				height: level.height,
				width: level.width,
				bitrate: level.bitrate,
				label: `${level.height}p`
			}));

			setQualities(levels);

		});

	}, []);

	const changeQuality = useCallback((qualityIndex: number | "auto") => {

		if (!hlsRef.current) return;

		const setToAuto = () => {
			hlsRef.current!.currentLevel = -1;
			setCurrentQuality("auto");
		};

		if (qualityIndex === "auto") {
			setToAuto();
			return;
		};

		const isValidQuality = qualities.some(q => q.index === qualityIndex);

		if (!isValidQuality) {
			setToAuto();
			return;
		};

		hlsRef.current.currentLevel = qualityIndex;
		setCurrentQuality(qualityIndex);

	}, [hlsRef, qualities]);

	return {
		qualities, setQualities,
		currentQuality, setCurrentQuality,
		changeQuality,
		setupQualityListener
	};

};