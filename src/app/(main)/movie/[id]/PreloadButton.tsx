"use client"

import { triggerBackgroundScrape } from "@/lib/api/streaming";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { Check, HardDriveDownload, Loader2 } from "lucide-react";
import { MouseEvent, useState, useTransition } from "react";

export function PreloadButton({ mediaId }: { mediaId: string }) {

	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<"idle" | "ready">("idle");

	function handlePreload(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();

		startTransition(async () => {
			const success = await triggerBackgroundScrape(mediaId);
			if (success) setStatus("ready");
		});

	};

	return (

		<button
			onClick={handlePreload}
			className={cn(
				"capitalize bg-neutral-500 text-neutral-50 text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4",
				glass("active")
			)}
			disabled={isPending || status === "ready"}
		>
			{isPending ? (
				<div className="animate-spin">
					<Loader2 className="text-neutral-50" size={16} />
				</div>
			) : status === "ready" ? (

				<>
					<Check className="text-neutral-50" size={16} />
					<span>Ready</span>
				</>

			) : (

				<>
					<HardDriveDownload className="text-neutral-50" size={16} />
					<span>Preload</span>
				</>

			)}
		</button>

	);

};