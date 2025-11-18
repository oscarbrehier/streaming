"use client"

import { useEffect, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

export function PlaybackControls({
	isPlaying,
	handleMediaButtons,
	volume,
	onVolumeUpdate,
	formattedTime,
	formattedDuration
}: {
	isPlaying: boolean;
	handleMediaButtons: () => void;
	volume: number;
	onVolumeUpdate: (volume: string) => void;
	formattedTime: string;
	formattedDuration: string;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="flex items-center space-x-4">
				<button className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md">
					<FaPlay className="text-white" />
				</button>
				<div className="w-20 h-1" /> {/* Placeholder for volume slider */}
				<p className="text-white text-sm">0:00 / 0:00</p>
			</div>
		);
	}

	return (
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
				className={`
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
				  [&::-webkit-slider-thumb]:transition-all`}
				style={{
					background: `linear-gradient(to right, #9333ea ${volume * 100}%, rgb(64, 64, 64) ${volume * 100}%)`
				}}
				min={0}
				max={1}
				step={0.01}
				value={volume}
				onChange={(e) => onVolumeUpdate(e.currentTarget.value)}
			/>

			{/* Time Display */}
			<p className="text-white text-sm">{formattedTime} / {formattedDuration}</p>
		</div>
	);
}