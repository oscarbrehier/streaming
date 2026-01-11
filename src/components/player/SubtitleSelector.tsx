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

			<div className="h-96 w-full space-y-2 overflow-y-scroll">

				<SettingsOptionButton
					onClick={() => onTrackChange(null as any)}
					active={currentTrack === null}
					className="py-3 px-4 text-start"
				>
					<p className="uppercase">Off</p>
				</SettingsOptionButton>

				{subtitles.map((track) => (
					<SettingsOptionButton
						key={track.id}
						onClick={() => onTrackChange(track)}
						active={currentTrack?.id === track.id}
						className="py-3 px-4 text-start"
					>
						<p className="uppercase">{track.lang}</p>
					</SettingsOptionButton>
				))}
				
			</div>


		</div>

	);

};