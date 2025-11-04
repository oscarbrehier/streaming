import Hls from "hls.js";
import { useEffect, useRef } from "react"

export function HLSPlayer({ source }: { source: string }) {

	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {

		if (!source || !videoRef.current) return ;

		const video = videoRef.current;

		if (video.canPlayType("application/apple.vnd.mpegurl")) {
			video.src = source;
		} else if (Hls.isSupported()) {

			const hls = new Hls();
			hls.loadSource(source);
			hls.attachMedia(video);

			return () => {
				hls.destroy();
			};

		};

	}, [source]);

	return (

		<video ref={videoRef} controls={true} />

	);

};