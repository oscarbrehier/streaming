"use client"

import { cn } from "@/lib/utils"
import { glass } from "@/styles"
import { addToWatchlist } from "@/utils/db/watchlist";
import { Check, LoaderCircle, Plus } from "lucide-react"
import { MouseEvent, useState } from "react";

export function AddToWatchlist({ 
	mediaId,
	isAdded
}: { 
	mediaId: string;
	isAdded: boolean; 
}) {

	const [loading, setLoading] = useState(false);
	const [added, setAdded] = useState(isAdded);

	async function handleAdd(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();
		if (loading || added) return;

		setLoading(true);

		const { success, error } = await addToWatchlist(mediaId);

		setLoading(false);

		if (success) {
			setAdded(true);
		} else {
			console.error(error);
		};

	};

	return (

		<button
			disabled={loading || added}
			onClick={handleAdd}
			className={cn(
				"capitalize text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center sm:space-x-4 group",
				"disabled:opacity-70 disabled:cursor-not-allowed",
				glass("active")
			)}
		>
			{loading ? (
				<div className="animate-spin">
					<LoaderCircle className="text-neutral-200" size={16} />
				</div>
			) : added ? (
				<>
					<Check className="text-neutral-200 mt-0.5" size={20} />
					<span className="sm:block hidden">My Wishlist</span>
				</>
			) : (
				<>
					<Plus className="text-neutral-200 mt-0.5" size={20} />
					<span className="sm:block hidden">My Watchlist</span>
				</>
			)}
		</button>

	);

};