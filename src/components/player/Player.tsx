"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";
import Hls from "hls.js";
import { createClient } from "@/utils/supabase/client";
import { useVideoProgress } from "@/hooks/player/useVideoProgress";
import { useVideoControls } from "@/hooks/player/useVideoControls";
import { useKeyBoardShortcuts } from "@/hooks/player/useKeyboardShortcuts";
import { formatTime } from "@/utils/timeFormat";
import { PlaybackControls } from "./PlaybackControls";
import { RatingOverlay } from "./RatingOverlay";
import { MediaService } from "@/services/media";
import { ProgressBar } from "./ProgressBar";
import { useMediaState } from "@/hooks/player/useMediaState";
import { ViewControls } from "./ViewControls";
import { useVideoQuality } from "@/hooks/player/useVideoQuality";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { useMediaSources } from "@/hooks/player/useMediaSources";
import { useSubtitles } from "@/hooks/player/useSubtitles";
import { Loader2 } from "lucide-react";

const supabase = createClient();

interface VideoPlayerProps {
	userId: string;
	profileId: string;
	mediaId: string;
	title?: string;
	showRating?: boolean;
	mediaStatus: UserMediaStatus;
	sources: MediaSources;
};

export type PlayerState = "loading" | "ready" | "error";

const ratings = [
	{ value: 1, emoji: "❤️", title: "Love It" },
	{ value: 2, emoji: "👍", title: "Like It" },
	{ value: 3, emoji: "👎", title: "Not for Me" }
];

export default function VideoPlayer({
	userId,
	profileId,
	mediaId,
	title,
	showRating = true,
	mediaStatus,
	sources
}: VideoPlayerProps) {

	const { updateRating, setMediaDuration } = new MediaService(supabase, mediaId, userId, profileId);

	const router = useRouter();

	const videoRef = useRef<HTMLVideoElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const hlsRef = useRef<Hls>(null);

	const {
		timecode, setTimecode,
		isPlaying, setIsPlaying,
		volume, setVolume,
		formattedTime, setFormattedTime,
		formattedDuration, setFormattedDuration,
		updatePlaybackTime
	} = useMediaState(videoRef)

	const [fullscreen, setFullscreen] = useState(false);

	const [rating, setRating] = useState(mediaStatus.rating ?? 0);

	const [playerState, setPlayerState] = useState<PlayerState>("loading");

	const { currentSource, changeSource, nextSource } = useMediaSources(sources);
	const { currentTrack, changeSubtitleTrack } = useSubtitles(sources.subtitles);
	const { qualities, changeQuality, currentQuality, setupQualityListener } = useVideoQuality(hlsRef);

	const { controls } = useVideoControls(videoRef, isPlaying);
	const { handleProgressUpdate } = useVideoProgress(videoRef, mediaId, userId, mediaStatus.completed);

	function handleSourceFailover() {

		const wasSwitched = nextSource();
		if (!wasSwitched) notFound();

	};

	// HLS support
	useEffect(() => {

		if (!currentSource || !currentSource.file || !videoRef.current) return;

		const videoUrl = currentSource.file;

		const video = videoRef.current;

		if (Hls.isSupported()) {

			const hls = new Hls();

			setPlayerState("loading");

			hlsRef.current = hls;

			setupQualityListener(hls);

			hls.loadSource(videoUrl);

			hls.on(Hls.Events.ERROR, (event, data) => {

				if (data.fatal) {

					if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
						data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT) {
						return;
					};

					setPlayerState("error");

					if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
						console.log("Network failure, failed to fetch source.");
						handleSourceFailover();
					} else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
						console.log("Media failure, trying to recover");
						hls.recoverMediaError();
					} else {
						hls.destroy();
					};

				};

			});

			// hls.on(Hls.Events.MANIFEST_PARSED, (_, __) => {
			// 	setPlayerState("ready");
			// });

			hls.attachMedia(video);

			return () => {
				hls.destroy();
			};

		};

		// Safari support
		if (video.canPlayType("application/vnd.apple.mpegurl")) {

			video.src = videoUrl;

			const setReady = () => setPlayerState("ready");
			video.addEventListener("canplay", setReady);
			video.addEventListener("loadedmetadata", setReady);

			video.addEventListener("error", handleSourceFailover, { once: true });

			return () => {
				video.removeEventListener("error", handleSourceFailover);
				video.removeEventListener("canplay", setReady);
				video.removeEventListener("loadedmetadata", setReady);
			};

		} else {
			video.src = videoUrl;
		};

	}, [currentSource]);

	useEffect(() => {

		const video = videoRef.current;
		if (!video) return;

		const handleWaiting = () => setPlayerState(prev => (prev !== "error" ? "loading" : prev));
		const handlePlaying = () => setPlayerState("ready");
		const handleSeeked = () => {
			if (video.readyState >= 3) setPlayerState("ready");
		};

		const handlePlayState = () => setIsPlaying(true);
		const handlePauseState = () => setIsPlaying(false);

		video.addEventListener("waiting", handleWaiting);
		video.addEventListener("playing", handlePlaying);
		video.addEventListener("canplay", handlePlaying);
		video.addEventListener("seeked", handleSeeked);
		video.addEventListener("play", handlePlayState);
		video.addEventListener("pause", handlePauseState);

		return () => {
			video.removeEventListener("waiting", handleWaiting);
			video.removeEventListener("playing", handlePlaying);
			video.removeEventListener("canplay", handlePlaying);
			video.removeEventListener("seeked", handleSeeked);
			video.removeEventListener("play", handlePlayState);
			video.removeEventListener("pause", handlePauseState);
		};

	}, [videoRef]);

	useEffect(() => {

		if (!videoRef || !videoRef.current) return;

		if (!mediaStatus.duration_sec) {
			console.log(videoRef.current.duration)
			setMediaDuration(videoRef.current.duration);
		};

	}, [videoRef.current?.duration]);

	// Update timecode display
	useEffect(() => {

		if (videoRef.current?.duration) {
			setFormattedDuration(formatTime(videoRef.current.duration));
		};

		const playbackInterval = isPlaying ? setInterval(updatePlaybackTime, 100) : null;
		const updateProgressInterval = setInterval(async () => handleProgressUpdate(), 20 * 1000);

		return () => {
			if (playbackInterval) clearInterval(playbackInterval);
			clearInterval(updateProgressInterval);
		};

	}, [isPlaying, handleProgressUpdate]);

	const handleMediaButtons = async () => {

		if (!videoRef.current) return;

		if (isPlaying) {
			videoRef.current.pause();
			setIsPlaying(false);
		} else {

			try {

				const playPromise = videoRef.current.play();

				if (playPromise !== undefined) {
					await playPromise;
					setIsPlaying(true);
				};

			} catch (err) {

				if (err instanceof Error && err.name === 'AbortError') {
					console.log("Playback was interrupted by a new request");
				} else {
					console.error("PLayback error:", err);
				};

			};

		};

		handleProgressUpdate();

	};

	const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {

		if (!videoRef.current) return;

		updatePlaybackTime();

		const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
		videoRef.current.currentTime = newTime;

		setTimecode(newTime);

	}, []);

	const changeVolume = useCallback((value: string) => {

		const volumeValue = Number(value);

		setVolume(volumeValue);

		if (videoRef.current) {
			videoRef.current.volume = volumeValue;
		};

	}, []);

	const handleFullscreen = () => {

		if (!playerRef.current) return;

		if (fullscreen) {
			document.exitFullscreen();
		} else {
			playerRef.current.requestFullscreen();
		};

		setFullscreen(!fullscreen);

	};

	const handleUpdateRating = (ratingValue: number) => {

		setRating(ratingValue);
		updateRating(ratingValue);

	};

	const skipForward = () => {

		if (videoRef.current) {

			videoRef.current.currentTime = Math.min(
				videoRef.current.currentTime + 10,
				videoRef.current.duration
			);

		};

	};

	const skipBackward = () => {

		if (videoRef.current) {
			videoRef.current.currentTime = Math.max(
				videoRef.current.currentTime - 10,
				0
			);
		};

	};

	useKeyBoardShortcuts(
		playerState,
		handleMediaButtons,
		handleFullscreen,
		skipForward,
		skipBackward
	);

	useEffect(() => {

		const video = videoRef.current;
		if (!video) return;

		const existingTracks = video.querySelectorAll('track');
		existingTracks.forEach(track => track.remove());

		Array.from(video.textTracks).forEach(track => {
			track.mode = 'disabled';
		});

		if (!currentTrack) {
			return;
		}

		const trackElement = document.createElement('track');

		trackElement.kind = 'subtitles';
		trackElement.label = currentTrack.lang;

		const cacheBuster = `?t=${Date.now()}`;

		trackElement.src = `/api${currentTrack.url}${cacheBuster}`;
		trackElement.srclang = currentTrack.lang;
		trackElement.default = true;

		video.appendChild(trackElement);

		video.textTracks[0].mode = 'hidden';

		const handleLoad = () => {
			requestAnimationFrame(() => {
				if (video.textTracks[0]) {
					video.textTracks[0].mode = 'showing';
				}
			});
		};

		trackElement.addEventListener('load', handleLoad, { once: true });

		return () => {
			trackElement.removeEventListener('load', handleLoad);
		};

	}, [currentTrack]);

	return (
		<div className="h-auto w-auto relative bg-black" ref={playerRef}>

			<video
				className="h-screen w-full absolute object-contain bg-black"
				ref={videoRef}
				onLoadedMetadata={() => {

					if (videoRef.current && mediaStatus.progress_sec > 0) {
						setPlayerState("loading");
						videoRef.current.currentTime = mediaStatus.progress_sec;
						updatePlaybackTime();
					};

				}}
			/>

			<div className={`h-screen w-full absolute flex flex-col justify-between z-2147483640 transition-opacity duration-300 ${controls ? 'opacity-100' : 'opacity-0'}`}>

				{/* Top Bar - Back Button */}
				<div className='h-12 w-full flex items-center px-5 pt-5 space-x-8'>

					<button
						onClick={() => router.back()}
						title="Back"
						className={cn(
							// "text-2xl cursor-pointer hover:bg-neutral-500/30 size-10 rounded-full flex items-center justify-center transition-colors",
							"size-10 rounded-full text-2xl flex items-center justify-center cursor-pointer",
							glass("on-focus")
						)}>
						<IoChevronBack className="text-neutral-100" size={20} />
					</button>

					{title && (
						<p className="font-medium text-lg mb-1">{title}</p>
					)}

				</div>

				<div className="flex-1 flex justify-center items-center relative">

					{/* Rating (when paused and activated) */}
					{isPlaying === false && playerState !== "loading" && showRating && (

						<RatingOverlay
							rating={rating}
							onRatingUpdate={(v) => handleUpdateRating(v)}
							ratings={ratings}
						/>

					)}

					{playerState === "loading" && (

						<div className="absolute animate-spin">
							<Loader2 size={26} />
						</div>

					)}

				</div>



				{/* Bottom Controls */}
				<div className="flex flex-col items-center px-5 pb-2">

					<ProgressBar
						playerState={playerState}
						timecode={timecode}
						videoRef={videoRef}
						onSeek={handleSeek}
						onProgressUpdate={handleProgressUpdate}
					/>

					{/* Control Buttons */}
					<div className="w-full h-10 flex items-center justify-between">

						<PlaybackControls
							playerState={playerState}
							isPlaying={isPlaying}
							handleMediaButtons={handleMediaButtons}
							volume={volume}
							onVolumeUpdate={(val) => changeVolume(val)}
							formattedTime={formattedTime}
							formattedDuration={formattedDuration}
						/>

						<ViewControls
							subtitles={sources.subtitles}
							currentSubtitleTrack={currentTrack}
							captions={true}
							onFullscreenToggle={handleFullscreen}
							currentQuality={currentQuality}
							qualities={qualities}
							onQualityChange={changeQuality}
							sources={sources}
							currentSource={currentSource}
							onSourceChange={(sourceIdx) => changeSource(sourceIdx)}
							onSubtitleChange={changeSubtitleTrack}
						/>

					</div>

				</div>

			</div>

		</div>

	);

};