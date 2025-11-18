"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPlay, FaPause } from "react-icons/fa";
import { BiFullscreen } from "react-icons/bi";
import { MdOutlineSubtitles, MdSubtitles } from "react-icons/md";
import { IoChevronBack } from "react-icons/io5";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { createClient } from "@/utils/supabase/client";

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

async function updateProgress(mediaId: string, userId: string, progress: number) {

	if (!mediaId || !userId) return;

	await supabase
		.from("user_media_status")
		.upsert({
			media_id: mediaId,
			user_id: userId,
			progress_sec: progress
		}, {
			onConflict: "user_id, media_id"
		});

}

async function markAsComplete(mediaId: string, userId: string): Promise<{ success: boolean }> {

	if (!mediaId || !userId) return { success: false };

	const maxRetries = 2;
	let retry = 0;

	while (retry <= maxRetries) {

		const { error } = await supabase
			.from("user_media_status")
			.upsert({
				user_id: userId,
				media_id: mediaId,
				completed: true
			}, {
				onConflict: "user_id, media_id"
			});

		if (!error) return { success: true };

		if (retry <= maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
		};

		retry++;

	};

	return { success: false };

};

export default function VideoPlayer({
	userId,
	mediaId,
	videoUrl,
	subtitleUrl,
	onRating,
	showRating = true,
	mediaStatus
}: VideoPlayerProps) {

	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);
	const playerRef = useRef<HTMLDivElement>(null);
	const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);

	const [timecode, setTimecode] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(0.5);
	const [controls, setControls] = useState(true);
	const [fullscreen, setFullscreen] = useState(false);
	const [captions, setCaptions] = useState(true);
	const [formattedTime, setFormattedTime] = useState("0:00");
	const [formattedDuration, setFormattedDuration] = useState("0:00");
	const [rating, setRating] = useState(mediaStatus.rating ?? 0);
	const [isMarkedComplete, setIsMarkedComplete] = useState(mediaStatus.completed ?? false);
	const [isSeeking, setIsSeeking] = useState(false);

	async function handleProgressUpdate() {

		if (!videoRef.current) return;

		const timecode = videoRef.current.currentTime;
		const duration = videoRef.current.duration;

		const viewPercentage = (timecode / duration) * 100;

		if (viewPercentage >= 90 && !isMarkedComplete) {

			const { success } = await markAsComplete(mediaId, userId);
			setIsMarkedComplete(success);

		};

		await updateProgress(mediaId, userId, timecode);

	};

	function updatePlaybackTime() {

		if (videoRef.current) {

			const playingTime = formatTime(videoRef.current.currentTime);
			setFormattedTime(playingTime);
			setTimecode(videoRef.current.currentTime);

		};

	};

	// HLS support
	useEffect(() => {

		if (!videoUrl || !videoRef.current) return;

		const video = videoRef.current;

		if (videoUrl.endsWith(".m3u8")) {

			if (video.canPlayType("application/vnd.apple.mpegurl")) {

				video.src = videoUrl;

			} else if (Hls.isSupported()) {

				const hls = new Hls();
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

	}, [videoRef.current?.currentTime, videoRef.current?.duration, handleProgressUpdate]);

	// Handle controls visibility
	useEffect(() => {

		const handleMouseMove = () => {

			setControls(true);

			if (mouseMoveTimeout.current) {
				clearTimeout(mouseMoveTimeout.current);
			};

			if (isPlaying) {

				mouseMoveTimeout.current = setTimeout(() => {
					setControls(false);
				}, 3000);

			};

		};

		if (isPlaying) {

			document.addEventListener("mousemove", handleMouseMove);
			mouseMoveTimeout.current = setTimeout(() => {
				setControls(false);
			}, 3000);

		} else {
			setControls(true);
		};

		return () => {

			document.removeEventListener("mousemove", handleMouseMove);
			if (mouseMoveTimeout.current) {
				clearTimeout(mouseMoveTimeout.current);
			};

		};

	}, [isPlaying]);

	// Keyboard shortcuts
	useEffect(() => {

		const handleKeyDown = (e: KeyboardEvent) => {

			if (e.code === 'Space') {
				e.preventDefault();
				handleMediaButtons();
			};

			if (e.code === 'KeyF') {
				e.preventDefault();
				handleFullscreen();
			};

			if (e.code === 'ArrowRight') {
				e.preventDefault();
				skipForward();
			};

			if (e.code === 'ArrowLeft') {
				e.preventDefault();
				skipBackward();
			};

		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);

	}, [isPlaying, fullscreen]);

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

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {

		if (!videoRef.current) return;

		setIsSeeking(true);
		updatePlaybackTime();

		const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
		videoRef.current.currentTime = newTime;

		setTimecode(newTime);

	};

	const formatTime = (time: number) => {

		const seconds = time;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		const formattedHours = hours > 0 ? `${hours}:` : '';
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

		return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;

	};

	const changeVolume = (value: string) => {

		const volumeValue = Number(value);

		setVolume(volumeValue);

		if (videoRef.current) {
			videoRef.current.volume = volumeValue;
		};

	};

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

	const updateRating = (ratingValue: number) => {

		setRating(ratingValue);
		if (onRating) {
			onRating(ratingValue);
		};

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

				{/* Center - Rating (when paused) */}
				{isPlaying === false && showRating && (
					<div className="flex-1 flex justify-center items-center">
						<motion.div
							initial={{ scale: 0.5 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 260, damping: 20 }}
							className="flex items-center justify-center h-14 px-4 rounded-2xl space-x-2 bg-neutral-800 cursor-pointer">

							<div
								title="Love It"
								onClick={() => updateRating(1)}
								className={`w-8 h-8 flex items-center justify-center transition-opacity ${rating === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}>
								<span className="text-2xl">❤️</span>
							</div>

							<div
								title="Like It"
								onClick={() => updateRating(2)}
								className={`w-8 h-8 flex items-center justify-center transition-opacity ${rating === 2 ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}>
								<span className="text-2xl">👍</span>
							</div>

							<div
								title="Not for Me"
								onClick={() => updateRating(3)}
								className={`w-8 h-8 flex items-center justify-center transition-opacity ${rating === 3 ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}>
								<span className="text-2xl">👎</span>
							</div>
						</motion.div>
					</div>
				)}

				{/* Bottom Controls */}
				<div className="flex flex-col items-center px-5 pb-2">
					{/* Progress Bar */}
					<div className="w-full h-auto mb-2">
						<input
							className="
                w-full h-1
                rounded-full
                appearance-none
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:bg-purple-500
                [&::-webkit-slider-thumb]:hover:bg-purple-600
                [&::-webkit-slider-thumb]:hover:h-4  
                [&::-webkit-slider-thumb]:hover:w-4 
                [&::-webkit-slider-thumb]:h-2 
                [&::-webkit-slider-thumb]:w-2
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:transition-all
              "
							style={{
								background: `linear-gradient(to right, #a855f7 ${(timecode / (videoRef.current?.duration || 1)) * 100}%, rgb(64, 64, 64) ${(timecode / (videoRef.current?.duration || 1)) * 100}%)`
							}}
							type="range"
							min="0"
							max={100}
							step={0.01}
							value={(timecode / (videoRef.current?.duration || 1)) * 100 || 0}
							onChange={handleSeek}
							onMouseUp={() => {
								if (isSeeking) {
									handleProgressUpdate();
									setIsSeeking(false);
								};
							}}
						/>
					</div>

					{/* Control Buttons */}
					<div className="w-full h-10 flex items-center justify-between">
						<div className="flex items-center space-x-4">
							{/* Play/Pause */}
							<button
								className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md"
								title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
								onClick={handleMediaButtons}>
								{isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
							</button>

							{/* Volume */}
							<input
								type="range"
								title="Volume"
								className="
                  w-20 h-1
                  rounded-full
                  appearance-none
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:bg-purple-600
                  [&::-webkit-slider-thumb]:hover:bg-purple-700
                  [&::-webkit-slider-thumb]:hover:h-4  
                  [&::-webkit-slider-thumb]:hover:w-4 
                  [&::-webkit-slider-thumb]:h-2 
                  [&::-webkit-slider-thumb]:w-2
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:transition-all"
								style={{
									background: `linear-gradient(to right, #9333ea ${volume * 100}%, rgb(64, 64, 64) ${volume * 100}%)`
								}}
								min={0}
								max={1}
								step={0.01}
								value={volume}
								onChange={(e) => changeVolume(e.currentTarget.value)}
							/>

							{/* Time Display */}
							<p className="text-white text-sm">{formattedTime} / {formattedDuration}</p>
						</div>

						<div className="flex items-center space-x-4">
							{/* Subtitles */}
							{subtitleUrl && (
								<button
									onClick={handleCaptions}
									title="Subtitles"
									className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
									{captions ? <MdSubtitles className="text-white" /> : <MdOutlineSubtitles className="text-white" />}
								</button>
							)}

							{/* Fullscreen */}
							<button
								onClick={handleFullscreen}
								title="Fullscreen (F)"
								className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
								<BiFullscreen className="text-white" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}