"use client"

import { useEffect, useState } from "react";

export function useSubtitleCue(videoRef: React.RefObject<HTMLVideoElement | null>) {

	const [cueText, setCueText] = useState<string>("");

	useEffect(() => {

		const video = videoRef.current;
		if (!video) return;

		const listeners = new Map<TextTrack, () => void>();

		function attachToTrack(track: TextTrack) {
			if (listeners.has(track)) return;

			const handler = () => {
				const cues = track.activeCues;
				if (!cues || cues.length === 0) {
					setCueText("");
					return;
				}
				const text = Array.from(cues)
					.map(cue => (cue as VTTCue).text)
					.join("\n")
					.replace(/<[^>]*>/g, "");
				setCueText(text);
			};

			track.addEventListener("cuechange", handler);
			listeners.set(track, handler);
		}

		function attachToAllTracks() {
			console.log("[cue] tracks:", Array.from(video!.textTracks).map(t => ({ label: t.label, mode: t.mode, cues: t.cues?.length })));
			Array.from(video!.textTracks).forEach(attachToTrack);
		}

		attachToAllTracks();

		const onAddTrack = (e: TrackEvent) => {
			if (e.track) attachToTrack(e.track);
		};

		video.textTracks.addEventListener("addtrack", onAddTrack as any);

		return () => {
			video.textTracks.removeEventListener("addtrack", onAddTrack as any);
			listeners.forEach((handler, track) => {
				track.removeEventListener("cuechange", handler);
			});
			listeners.clear();
		};

	}, [videoRef]);

	return cueText;

}