"use client"

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyList() {

	const router = useRouter();

	return (

		<EmptyState
			title="Nothing saved yet"
			description="Find something worth watching and tap + My Watchlist to keep it here."
			className="mb-20"
		>

			<div className="flex space-x-4">

				<Button
					onClick={() => router.push("/search")}
					label="Browse the catalogue"
					icon={<Search size={16} className="" />}
				/>

			</div>

		</EmptyState>

	);

};