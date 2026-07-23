"use client"

import { QualityLevel } from "@/hooks/player/useVideoQuality";
import { ClosedCaption, Cloud, LucideProps, SunMedium, TvMinimal } from "lucide-react";
import { BiFullscreen } from "react-icons/bi";
import { MdOutlineSubtitles, MdSubtitles } from "react-icons/md";
import { PointerEvent, useMemo } from "react";
import { SettingsPanel, SettingsView } from "./SettingsPanel";
import dynamic from "next/dynamic";
import { SubtitleSelector } from "./SubtitleSelector";
import { useSettingsController } from "@/hooks/player/useSettingsController";
import QualitySelector from "./QualitySelector";

const MediaSourceSelector = dynamic(() => import("./MediaSourceSelector"));

interface ViewControlsProps {
	subtitles: SubtitleSource[];
	currentSubtitleTrack: SubtitleSource | null;
	captions: boolean;

	sources: MediaSources;
	currentSource: MediaSourceFile;

	currentQuality: number | "auto";
	qualities: QualityLevel[];

	onFullscreenToggle: () => void;
	onQualityChange: (quality: number | "auto") => void;
	onSourceChange: (sourceIdx: number) => void;
	onSubtitleChange: (track: SubtitleSource) => void;
}

const panels: { title: SettingsView }[] = [
	{ title: "sources", },
	{ title: "subtitles", },
	{ title: "quality", },
];

type SettingsPanelConfig = {
	id: SettingsView;
	title: string;
	trigger: {
		icon: React.ComponentType<{ className?: string; }>;
		isVisible?: () => boolean;
	};
	render: () => React.ReactNode;
}

export function ViewControls({
	subtitles,
	currentSubtitleTrack,
	captions,
	sources,
	currentSource,
	onFullscreenToggle,
	currentQuality,
	qualities,
	onQualityChange,
	onSourceChange,
	onSubtitleChange,
}: ViewControlsProps) {

	const settings = useSettingsController("sources");

	const panelConfigs = useMemo<SettingsPanelConfig[]>(() => [
		{
			id: "sources",
			title: "Sources",
			trigger: { icon: Cloud },
			render: () => (
				<MediaSourceSelector
					sources={sources.files}
					currentSource={currentSource}
					onSourceChange={onSourceChange}
				/>
			),
		},
		{
			id: "subtitles",
			title: "Subtitles",
			trigger: {
				icon: ClosedCaption,
				isVisible: () => sources.subtitles.length > 0,
			},
			render: () => (
				<SubtitleSelector
					currentTrack={currentSubtitleTrack}
					subtitles={subtitles}
					onTrackChange={onSubtitleChange}
				/>
			),
		},
		{
			id: "quality",
			title: "Quality",
			trigger: { icon: SunMedium },
			render: () => (
				<QualitySelector
					qualities={qualities}
					currentQuality={currentQuality}
					onQualityChange={onQualityChange}
				/>
			),
		},
	], [
		sources,
		currentSource,
		qualities,
		currentQuality,
		captions,
		currentSubtitleTrack,
		subtitles,
	]);

	const activePanel = panelConfigs.find(p => p.id === settings.view);

	return (

		<div className="flex items-center space-x-4">

			<SettingsPanel
				open={settings.open}
				panels={panelConfigs.map(p => ({ title: p.id }))}
				view={settings.view}
				onViewChange={settings.setView}
				onClose={settings.close}
			>
				{activePanel ? activePanel.render() : null}
			</SettingsPanel>

			{panelConfigs.map(panel => {
				if (panel.trigger.isVisible && !panel.trigger.isVisible()) return null;

				const Icon = panel.trigger.icon;

				return (
					<PanelTriggerItem
						key={panel.id}
						title={panel.title}
						Icon={Icon}
						onClick={(e) => settings.toggleView(e, panel.id)}
					/>
				);
			})}

			<button
				onClick={onFullscreenToggle}
				title="Fullscreen (F)"
				className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
				<BiFullscreen className="text-ink/75" size={18} />
			</button>

		</div>

	);

};

function PanelTriggerItem({
	onClick,
	title,
	Icon,
}: {
	onClick: (e: PointerEvent<HTMLButtonElement>) => void;
	title: string;
	Icon: React.ComponentType<LucideProps>;
}) {

	return (
		<button
			onPointerDown={onClick}
			title={title}
			className="hover:bg-neutral-700 transition-all ease-in-out duration-200 w-8 h-8 flex items-center justify-center rounded-md text-2xl">
			{<Icon className="text-ink/75" size={18} />}
		</button>
	);

};