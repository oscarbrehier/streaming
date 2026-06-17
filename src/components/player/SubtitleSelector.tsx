"use client"

import { cn } from "@/lib/utils";
import { SettingsOptionButton } from "./SettingsPanel";
import { Check, ChevronRight } from "lucide-react";
import { useState } from "react";

export function SubtitleSelector({
	subtitles,
	currentTrack,
	onTrackChange
}: {
	subtitles: SubtitleSource[];
	currentTrack: SubtitleSource | null;
	onTrackChange: (track: SubtitleSource) => void;
}) {

	const [expandedLang, setExpandedLang] = useState<string | null>(null);

	const grouped = subtitles.reduce((acc, track) => {
		if (!acc[track.lang]) acc[track.lang] = [];
		acc[track.lang].push(track);
		return acc;
	}, {} as Record<string, SubtitleSource[]>);

	return (

		<div className="h-full w-full space-y-2 overflow-y-scroll pb-4">

			<SettingsOptionButton
				onClick={() => onTrackChange(null as any)}
				active={currentTrack === null}
			>
				<Check size={16} strokeWidth={3} className={cn("text-olive", currentTrack !== null && "opacity-0")} />
				<span className="text-sm font-semibold text-ink/90">Off</span>
			</SettingsOptionButton>

			{Object.entries(grouped).map(([lang, tracks]) => {

				const isActive = tracks.some(t => t.id === currentTrack?.id);
				const hasMultiple = tracks.length > 1;
				const isExpanded = expandedLang === lang;

				return (

					<div key={lang}>

						<SettingsOptionButton
							onClick={() => {
								if (hasMultiple) {
									setExpandedLang(isExpanded ? null : lang);
								} else {
									onTrackChange(tracks[0]);
								}
							}}
							active={isActive}
						>
							<Check size={16} strokeWidth={3} className={cn("text-olive", !isActive && "opacity-0")} />
							<span className="text-sm font-semibold text-ink/90">{lang}</span>
							<span className="flex-1 flex justify-end">
								{hasMultiple && (
									<ChevronRight
										size={14}
										className={cn("text-ink3 transition-transform", isExpanded && "rotate-90")}
									/>
								)}
							</span>
						</SettingsOptionButton>

						{hasMultiple && isExpanded && (
							<div className="mt-1 space-y-1">
								{tracks.map((track, i) => (
									<SettingsOptionButton
										key={track.id}
										onClick={() => onTrackChange(track)}
										active={currentTrack?.id === track.id}
									>
										<Check size={16} strokeWidth={3} className={cn("text-olive", currentTrack?.id !== track.id && "opacity-0")} />
										<span className="text-sm text-ink/70">{track.lang} - {i + 1}</span>
									</SettingsOptionButton>
								))}
							</div>
						)}

					</div>

				);

			})}

		</div>

	);

};