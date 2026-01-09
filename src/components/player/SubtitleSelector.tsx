import { SettingsOptionButton } from "./SettingsPanel";

export function SubtitleSelector({
	subtitles,
	currentTrack,
	onTrackChange
}: {
	subtitles: SubtitleSource[];
	currentTrack: SubtitleSource | null;
	onTrackChange: (track: SubtitleSource) => void;
}) {

	return (

		<div className="h-96 w-full space-y-2 overflow-y-scroll">

			{!currentTrack ? (

				<div>

				</div>

			) : subtitles.map((track, idx) => (

				<SettingsOptionButton
					key={track.id}
					onClick={() => onTrackChange(track)}
					active={currentTrack.id === track.id}
					className="py-3 px-4 text-start"
				>
					<p className="uppercase">{track.lang}</p>
				</SettingsOptionButton>

			))}


		</div>

	);

};