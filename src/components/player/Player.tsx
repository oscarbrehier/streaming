"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { ControlButtons } from "./ControlButtons";
import { useVideoQuality } from "@/hooks/player/useVideoQuality";

interface VideoPlayerProps {
	userId: string;
	mediaId: string;
	videoUrl: string;
	subtitleUrl?: string;
	onRating?: (rating: number) => void;
	showRating?: boolean;
	mediaStatus: UserMediaStatus;
};

const supabase = createClient();

const ratings = [
	{ value: 1, emoji: "❤️", title: "Love It" },
	{ value: 2, emoji: "👍", title: "Like It" },
	{ value: 3, emoji: "👎", title: "Not for Me" }
];

export default function VideoPlayer({
	userId,
	mediaId,
	videoUrl,
	subtitleUrl,
	onRating,
	showRating = true,
	mediaStatus
}: VideoPlayerProps) {

	const { updateRating, setMediaDuration } = new MediaService(supabase, mediaId, userId);

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
	const [captions, setCaptions] = useState(true);
	const [rating, setRating] = useState(mediaStatus.rating ?? 0);

	const { controls } = useVideoControls(videoRef, isPlaying);
	const { handleProgressUpdate } = useVideoProgress(videoRef, mediaId, userId, mediaStatus.completed);
	const { qualities, changeQuality, currentQuality, setupQualityListener } = useVideoQuality(hlsRef); 

	// HLS support
	useEffect(() => {

		if (!videoUrl || !videoRef.current) return;

		const video = videoRef.current;

		if (videoUrl.endsWith(".m3u8")) {

			if (video.canPlayType("application/vnd.apple.mpegurl")) {

				video.src = videoUrl;

			} else if (Hls.isSupported()) {

				const hls = new Hls();

				hlsRef.current = hls;

				setupQualityListener(hls);

				hls.loadSource(videoUrl);
				hls.attachMedia(video);

				return () => {
					hls.destroy();
				};

			};

		} else {

			video.src = videoUrl;

		};

	}, [videoUrl]);

	useEffect(() => {

		if (!videoRef || !videoRef.current) return ;

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

	const handleMediaButtons = () => {

		if (!videoRef.current) return;

		if (isPlaying) {
			videoRef.current.pause();
		} else {
			videoRef.current.play();
		};

		handleProgressUpdate();
		setIsPlaying(!isPlaying);

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

	const handleCaptions = (e: React.MouseEvent) => {

		e.preventDefault();
		setCaptions(!captions);

		if (videoRef.current && videoRef.current.textTracks[0]) {
			const track = videoRef.current.textTracks[0];
			track.mode = captions ? 'hidden' : 'showing';
		};

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
		handleMediaButtons,
		handleFullscreen,
		skipForward,
		skipBackward
	);

	return (
		<div className="h-auto w-auto relative bg-black" ref={playerRef}>

			<video
				className="h-screen w-full absolute object-contain bg-black"
				ref={videoRef}
				onLoadedMetadata={() => {

					if (videoRef.current && mediaStatus.progress_sec > 0) {
						videoRef.current.currentTime = mediaStatus.progress_sec;
						updatePlaybackTime();
					};

				}}
			>
				{subtitleUrl && (
					<track
						label="English"
						kind="captions"
						src={subtitleUrl}
						default
					/>
				)}
			</video>

			<div className={`h-screen w-full absolute flex flex-col justify-between z-[2147483647] transition-opacity duration-300 ${controls ? 'opacity-100' : 'opacity-0'}`}>

				{/* Top Bar - Back Button */}
				<div className='h-12 w-full flex items-center px-5 pt-5'>
					<button
						onClick={() => router.back()}
						title="Back"
						className='text-2xl cursor-pointer hover:bg-neutral-700 h-8 w-8 rounded-md flex items-center justify-center transition-colors'>
						<IoChevronBack className="text-white" />
					</button>
				</div>

				{/* Rating (when paused and activated) */}
				{isPlaying === false && showRating && (

					<RatingOverlay
						rating={rating}
						onRatingUpdate={(v) => handleUpdateRating(v)}
						ratings={ratings}
					/>

				)}

				{/* Bottom Controls */}
				<div className="flex flex-col items-center px-5 pb-2">

					<ProgressBar
						timecode={timecode}
						videoRef={videoRef}
						onSeek={handleSeek}
						onProgressUpdate={handleProgressUpdate}
					/>

					{/* Control Buttons */}
					<div className="w-full h-10 flex items-center justify-between">

						<PlaybackControls
							isPlaying={isPlaying}
							handleMediaButtons={handleMediaButtons}
							volume={volume}
							onVolumeUpdate={(val) => changeVolume(val)}
							formattedTime={formattedTime}
							formattedDuration={formattedDuration}
						/>

						<ControlButtons
							subtitleUrl={subtitleUrl}
							captions={captions}
							onCaptionChange={handleCaptions}
							onFullscreenChange={handleFullscreen}
							currentQuality={currentQuality}
							qualities={qualities}
							onQualityChange={changeQuality}
						/>

					</div>

				</div>

			</div>

		</div>

	);

};