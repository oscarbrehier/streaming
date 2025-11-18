import { BiFullscreen } from "react-icons/bi";
import { MdOutlineSubtitles, MdSubtitles } from "react-icons/md";

export function ControlButtons({
	subtitleUrl,
	captions,
	onCaptionChange,
	onFullscreenChange
}: {
	subtitleUrl: string | undefined,
	captions: boolean;
	onCaptionChange: (e: React.MouseEvent) => void;
	onFullscreenChange: () => void;
}) {

	return (

		<div className="flex items-center space-x-4">
			
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