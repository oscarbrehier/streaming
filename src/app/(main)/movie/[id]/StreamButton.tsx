"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBridge } from "@/context/BridgeContext"
import { BRIDGE_UI_CONFIG } from "@/utils/constants";
import { Play } from "lucide-react";
import Link from "next/link";

export function StreamButton({
	movieId,
	isInProgress
}: {
	movieId: number;
	isInProgress: boolean;
}) {

	const { isConnected } = useBridge();

	return isConnected ? (

		<Link
			href={`/watch/${movieId}`}
			className="capitalize bg-white text-black text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
		>
			<Play className="text-black mt-0.5" fill="#000" size={16} />
			<span>{isInProgress ? "Resume" : "Watch Now"}</span>
		</Link>

	) : (

		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className="cursor-not-allowed capitalize opacity-50 bg-neutral-200 text-black text-md h-10 px-6 rounded-3xl flex items-center sm:space-x-4"
				>
					<Play className="mt-0.5" fill="#000" size={16} />
					<span>{isInProgress ? "Resume" : "Watch now"}</span>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				{BRIDGE_UI_CONFIG.TOOLTIPS.STREAMING}
			</TooltipContent>
		</Tooltip>

	)

};