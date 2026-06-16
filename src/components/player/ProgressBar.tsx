"use client"

import { RefObject, useState } from "react";
import { PlayerState } from "./Player";

export function ProgressBar({
	playerState,
	timecode,
	videoRef,
	onSeek,
	onProgressUpdate
}: {
	playerState: PlayerState;
	timecode: number,
	videoRef: RefObject<HTMLVideoElement | null>,
	onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onProgressUpdate: () => void;
}) {

	const [isSeeking, setIsSeeking] = useState(false);

	return (

		<div className="w-full h-auto mb-2">
			<input
				className="
                w-full h-1
                rounded-full
				outline-none
    			focus:outline-none
                appearance-none
                [&::-webkit-slider-thumb]:appearance-none 
				[&::-webkit-slider-thumb]:outline-none
    			[&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--color-lavender)]
                [&::-webkit-slider-thumb]:bg-lavender
                [&::-webkit-slider-thumb]:hover:bg-lavender
                [&::-webkit-slider-thumb]:hover:h-4  
                [&::-webkit-slider-thumb]:hover:w-4 
                [&::-webkit-slider-thumb]:h-2 
                [&::-webkit-slider-thumb]:w-2
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:transition-all
				[&::-moz-range-thumb]:outline-none
    			[&::-moz-range-thumb]:border-none
              "
				style={{
					background: `linear-gradient(to right, var(--color-lavender) 0%, var(--color-periwinkle) ${(timecode / (videoRef.current?.duration || 1)) * 100}%, color-mix(in srgb, var(--color-panel2) 80%, transparent) ${(timecode / (videoRef.current?.duration || 1)) * 100}%)`
				}}
				type="range"
				min="0"
				max={100}
				step={0.01}
				value={(timecode / (videoRef.current?.duration || 1)) * 100 || 0}
				disabled={playerState === "error"}
				onChange={(e) => {
					onSeek(e);
					setIsSeeking(true);
				}}
				onMouseUp={() => {

					if (isSeeking) {
						onProgressUpdate();
						setIsSeeking(false);
					};

				}}
			/>
		</div>

	);

};