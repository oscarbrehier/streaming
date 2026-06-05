"use client"

import { Button } from "@/components/Button";
import { addToWatchlist, isInWatchlist } from "@/utils/db/watchlist";
import { Check, LoaderCircle, Plus } from "lucide-react"
import { MouseEvent, useEffect, useState } from "react";

export function AddToWatchlist({
	mediaId,
}: {
	mediaId: string;
}) {

	const [loading, setLoading] = useState(false);
	const [checking, setChecking] = useState(true);
	const [added, setAdded] = useState(false);

	useEffect(() => {

		setChecking(true);
		isInWatchlist(mediaId, "movie").then((res) => {
			setAdded(res);
			setChecking(false);
		});

	}, [mediaId]);

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

	let label = added ? "My Wishlist" : "My Watchlist";

	let icon = loading ? (
		<div className="animate-spin">
			<LoaderCircle className="text-neutral-200" size={16} />
		</div>
	) : added ? (
		<Check className="text-neutral-200 mt-0.5" size={20} />
	) : (
		<Plus className="text-neutral-200 mt-0.5" size={20} />
	);

	return (

		<Button
			label={loading ? undefined : label}
			icon={icon}
			variant="glass"
			disabled={loading || added}
			onClick={handleAdd}
		/>

	);

};