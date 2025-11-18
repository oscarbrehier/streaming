"use client"

import { formatTime } from "@/utils/timeFormat";
import { RefObject, useState } from "react";

export function useMediaState(
	videoRef: RefObject<HTMLVideoElement | null>,
) {

	const [timecode, setTimecode] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(0.5);
	const [formattedTime, setFormattedTime] = useState("0:00");
	const [formattedDuration, setFormattedDuration] = useState("0:00");

	function updatePlaybackTime() {

		if (videoRef.current) {

			const playingTime = formatTime(videoRef.current.currentTime);
			setFormattedTime(playingTime);
			setTimecode(videoRef.current.currentTime);

		};

	};

	return {
		timecode, setTimecode,
		isPlaying, setIsPlaying,
		volume, setVolume,
		formattedTime, setFormattedTime,
		formattedDuration, setFormattedDuration,
		updatePlaybackTime
	};

};