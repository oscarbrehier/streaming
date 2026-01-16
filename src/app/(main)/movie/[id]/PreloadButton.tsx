import { triggerBackgroundScrape } from "@/lib/api/streaming";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { HardDriveDownload } from "lucide-react";
import { MouseEvent } from "react";

export function PreloadButton({ mediaId }: { mediaId: string }) {

	async function preloadStreamingSources(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();
		await triggerBackgroundScrape(mediaId);

	};

	return (

		<button
			onClick={preloadStreamingSources}
			className={cn(
				"capitalize bg-neutral-500 text-neutral-50 text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4",
				glass("active")
			)}
		>
			<HardDriveDownload className="text-neutral-50" size={16} />
			<span>Preload</span>
		</button>

	);

};