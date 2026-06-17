"use client"

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { PlayerState } from "./Player";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";

export function PlaybackControls({
	playerState,
	isPlaying,
	handleMediaButtons,
	volume,
	onVolumeUpdate,
	formattedTime,
	formattedDuration
}: {
	playerState: PlayerState;
	isPlaying: boolean;
	handleMediaButtons: () => void;
	volume: number;
	onVolumeUpdate: (volume: number) => void;
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
	};

	function handleMute() {
		const updatedVolume = volume === 0 ? 0.5 : 0;
		onVolumeUpdate(updatedVolume);
	};

	return (
		<div className="flex items-center space-x-8">

			{/* Play/Pause */}

			<button
				className={cn(
					"hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md",
					"disabled:text-neutral-500 text-white disabled:hover:bg-transparent"
				)}
				title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
				onClick={handleMediaButtons}
				disabled={playerState === "error"}
			>
				{isPlaying ? <FaPause /> : <FaPlay />}
			</button>

			{/* Volume */}
			<div className="flex items-center space-x-4">

				<button
					onClick={handleMute}
					className="text-ink2"
				>
					{(() => {
						if (volume === 0) return <VolumeX size={16} />;
						if (volume < 0.4) return <Volume size={16} />;
						if (volume < 0.7) return <Volume1 size={16} />;
						return <Volume2 size={16} />;
					})()}
				</button>

				<div className="group relative w-20 h-1 flex items-center cursor-pointer">

					<div className="absolute w-full h-full bg-panel2 rounded-full" />


					<div
						className="absolute top-0 left-0 h-full bg-lavender rounded-full"
						style={{ width: `${volume * 100}%` }}
					/>

					<div
						className="
						absolute h-2.5 w-2.5 
						bg-white
						rounded-full shadow-md 
						-translate-x-1/2
						
						/* Hidden by default, scaled down */
						opacity-0 scale-50 
						
						/* Smoothly transitions into view on hover */
						transition-all duration-150 ease-out
						group-hover:opacity-100 group-hover:scale-100
					"
						style={{ left: `${volume * 100}%` }}
					/>

					<input
						type="range"
						title="Volume"
						className="
							absolute top-0 left-0 w-full h-full
							opacity-0 cursor-pointer z-10
						"
						min={0}
						max={1}
						step={0.01}
						value={volume}
						onChange={(e) => onVolumeUpdate(Number(e.currentTarget.value))}
					/>

				</div>

			</div>

			{/* Time Display */}
			<p className="text-ink2 text-sm font-jet-mono font-semibold">{formattedTime} <span className="text-ink3">/ {formattedDuration}</span></p>
		</div>
	);
}