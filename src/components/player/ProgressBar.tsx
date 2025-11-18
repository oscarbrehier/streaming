"use client"

import { RefObject, useState } from "react";

export function ProgressBar({
	timecode,
	videoRef,
	onSeek,
	onProgressUpdate
}: {
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