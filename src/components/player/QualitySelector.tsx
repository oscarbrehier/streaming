import { QualityLevel } from "@/hooks/player/useVideoQuality";
import { SettingsOptionButton } from "./SettingsPanel";

export default function QualitySelector({
	qualities,
	currentQuality,
	onQualityChange,
}: {
	qualities: QualityLevel[],
	currentQuality: number | "auto"
	onQualityChange: (idx: number | "auto") => void;
}) {

	return (

		<div
			className="h-full w-full space-y-2"
		>

			<SettingsOptionButton
				onClick={() => onQualityChange("auto")}
				active={currentQuality === "auto"}
				className="flex flex-col items-start"
			>
				<span className="text-sm font-semibold text-ink/90">Auto</span>
				<span className="text-xs text-ink2">Recommended - adapts to bandwitch</span>
			</SettingsOptionButton>

			{qualities.sort((a, b) => b.index - a.index).map((quality) => (

				<SettingsOptionButton
					key={quality.index}
					onClick={() => onQualityChange(quality.index)}
					active={currentQuality === quality.index}
					className="py-3 px-4 text-start"
				>
					{quality.label}
				</SettingsOptionButton>

			))}

		</div>

	);

};
