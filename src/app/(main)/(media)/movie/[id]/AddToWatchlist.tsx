"use client"

import { Button } from "@/components/Button";
import { addToWatchlist, isInWatchlist, removeFromWatchlist } from "@/utils/db/watchlist";
import { Check, LoaderCircle, Plus, X } from "lucide-react"
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
		if (loading) return;

		setLoading(true);

		if (added) {

			const { success, error } = await removeFromWatchlist(mediaId);

			if (success) setAdded(false);
			else console.error(error);

		} else {

			const { success, error } = await addToWatchlist(mediaId);

			if (success) setAdded(true);
			else console.error(error);

		};

		setLoading(false);
	
	};

	if (checking) return (

		<Button
			size="sm"
			icon={<div className="animate-spin"><LoaderCircle className="text-neutral-200" size={16} /></div>}
			variant="glass"
			disabled
		/>

	);

	const label = added
		? "My Watchlist"
		: "My Watchlist";

	const icon = loading ? (
		<div className="animate-spin"><LoaderCircle className="text-neutral-200" size={16} /></div>
	) : added ? (
		<Check className="text-neutral-200 mt-0.5" size={18} />
	) : (
		<Plus className="text-neutral-200 mt-0.5" size={18} />
	);

	return (

		<Button
			size="sm"
			label={loading ? undefined : label}
			icon={icon}
			variant="glass"
			disabled={loading}
			onClick={handleAdd}
		/>
		
	);

};