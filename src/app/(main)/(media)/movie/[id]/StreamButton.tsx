"use client"

import { Play } from "lucide-react";
import Link from "next/link";

export function StreamButton({
	movieId,
	isInProgress
}: {
	movieId: number;
	isInProgress: boolean;
}) {

	return (

		<Link
			href={`/watch/${movieId}`}
			className="capitalize bg-white text-black text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
		>
			<Play className="text-black mt-0.5" fill="#000" size={16} />
			<span>{isInProgress ? "Resume" : "Watch Now"}</span>
		</Link>

	);

};