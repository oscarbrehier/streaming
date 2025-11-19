"use client"

import { QualityLevel } from "@/hooks/player/useVideoQuality";
import { TvMinimal } from "lucide-react";
import { BiFullscreen } from "react-icons/bi";
import { MdOutlineSubtitles, MdSubtitles } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

function QualitySelector({
	qualities,
	currentQuality,
	onQualityChange,
	onClose,
}: {
	qualities: QualityLevel[],
	currentQuality: number | "auto"
	onQualityChange: (idx: number | "auto") => void;
	onClose: () => void;
}) {

	const selectorRef = useRef<HTMLDivElement>(null);

	const classes = (index: number | "auto") => cn(
		"w-full px-4 py-2 rounded-lg flex text-sm cursor-pointer",
		currentQuality === index ? "bg-purple-400/30 border border-purple-400 text-purple-200" : "border border-border hover:bg-neutral-800"
	);

	useEffect(() => {

		function handleOutsideClick(e: MouseEvent) {

			if (selectorRef.current && !selectorRef.current?.contains(e.target as Node)) {
				onClose();
			};

		};

		window.addEventListener("pointerdown", handleOutsideClick);
		return () => {
			window.removeEventListener("pointerdown", handleOutsideClick);
		};

	}, []);

	return (

		<div
			ref={selectorRef}
			onPointerDown={(e) => e.stopPropagation()}
			className="absolute h-auto w-96 bg-card rounded-2xl bottom-12 right-0 p-4"
		>

			<p className="text-lg font-semibold mb-4">Quality</p>

			<div className="space-y-2">

				{qualities.sort((a, b) => b.index - a.index).map((quality) => (

					<button
						key={quality.index}
						onClick={() => onQualityChange(quality.index)}
						className={classes(quality.index)}
					>
						<p>{quality.label}</p>
					</button>

				))}

				<button
					onClick={() => onQualityChange("auto")}
					className={classes("auto")}
				>
					<p>Auto</p>
				</button>

			</div>

		</div>

	);

};

export function ControlButtons({
	subtitleUrl,
	captions,
	onCaptionChange,
	onFullscreenChange,
	currentQuality,
	qualities,
	onQualityChange
}: {
	subtitleUrl: string | undefined,
	captions: boolean;
	onCaptionChange: (e: React.MouseEvent) => void;
	onFullscreenChange: () => void;
	currentQuality: number | "auto";
	qualities: QualityLevel[];
	onQualityChange: (idx: number | "auto") => void;
}) {

	const [qualitSelector, setQualitySelector] = useState(false);

	return (

		<div className="flex items-center space-x-4">

			{qualitSelector && (

				<QualitySelector
					onQualityChange={onQualityChange}
					qualities={qualities}
					currentQuality={currentQuality}
					onClose={() => setQualitySelector(false)}
				/>

			)}

			<button
				onPointerDown={(e) => e.stopPropagation()}
				onClick={() => setQualitySelector(prev => !prev)}
				title="Quality"
				className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
				<TvMinimal className="text-white" />
			</button>

			{subtitleUrl && (
				<button
					onClick={onCaptionChange}
					title="Subtitles"
					className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
					{captions ? <MdSubtitles className="text-white" /> : <MdOutlineSubtitles className="text-white" />}
				</button>
			)}

			<button
				onClick={onFullscreenChange}
				title="Fullscreen (F)"
				className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
				<BiFullscreen className="text-white" />
			</button>

		</div>

	);

};