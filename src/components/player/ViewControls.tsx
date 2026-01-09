"use client"

import { QualityLevel } from "@/hooks/player/useVideoQuality";
import { Cloud, TvMinimal } from "lucide-react";
import { BiFullscreen } from "react-icons/bi";
import { MdOutlineSubtitles, MdSubtitles } from "react-icons/md";
import { MouseEvent, useState } from "react";
import { SettingsPanel, SettingsView } from "./SettingsPanel";
import dynamic from "next/dynamic";

const MediaSourceSelector = dynamic(() => import("./MediaSourceSelector"));
const QualitySelector = dynamic(() => import("./QualitySelector"));

const panels: { title: SettingsView }[] = [
	{ title: "sources", },
	{ title: "subtitles", },
	{ title: "quality", },
];

export function ViewControls({
	subtitleUrl,
	captions,
	sources,
	currentSource,
	onCaptionChange,
	onFullscreenChange,
	currentQuality,
	qualities,
	onQualityChange,
	onSourceChange,
}: {
	subtitleUrl: string | undefined,
	captions: boolean;
	currentQuality: number | "auto";
	qualities: QualityLevel[];
	sources: MediaSources;
	currentSource: MediaSourceFile;
	onCaptionChange: (e: React.MouseEvent) => void;
	onFullscreenChange: () => void;
	onQualityChange: (idx: number | "auto") => void;
	onSourceChange: (source: MediaSourceFile) => void;
}) {

	const [settingsOpen, setSettingsOpen] = useState(false);
	const [settingsView, setSettingsView] = useState<SettingsView>("sources");

	function openSettings(e: MouseEvent<HTMLButtonElement>, view: SettingsView) {

		e.stopPropagation();
		e.preventDefault();

		if (settingsOpen && settingsView === view) {
			setSettingsOpen(false);
			return;
		};

		setSettingsView(view);
		setSettingsOpen(true);

	};

	return (

		<div className="flex items-center space-x-4">

			<SettingsPanel
				open={settingsOpen}
				panels={panels}
				view={settingsView}
				onViewChange={(v) => setSettingsView(v)}
				onClose={() => setSettingsOpen(false)}
			>

				{settingsView === "sources" && (
					<MediaSourceSelector
						sources={sources.files}
						currentSource={currentSource}
						onSourceChange={onSourceChange}
					/>
				)}

				{settingsView === "quality" && (
					<QualitySelector
						onQualityChange={onQualityChange}
						qualities={qualities}
						currentQuality={currentQuality}
					/>
				)}

			</SettingsPanel>

			<button
				onPointerDown={(e) => openSettings(e, "sources")}
				title="Sources"
				className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
				<Cloud className="text-white" />
			</button>

			<button
				onPointerDown={(e) => openSettings(e, "quality")}
				title="Quality"
				className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
				<TvMinimal className="text-white" />
			</button>

			{sources.subtitles.length >= 1 && (
				<button
					onPointerDown={(e) => openSettings(e, "subtitles")}
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