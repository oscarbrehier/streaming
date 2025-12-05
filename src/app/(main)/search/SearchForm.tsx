"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { constructImg } from "@/lib/tmdb/constructImg";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface TMDBMovie {
	id: number;
	title?: string;
	name?: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date?: string;
	first_air_date?: string;
	vote_average: number;
	type?: "movie" | "tv";
}

export interface TMDBSearchResponse {
	page: number;
	results: TMDBMovie[];
	total_pages: number;
	total_results: number;
}

export function SearchForm({
	query,
	type,
	data
}: {
	query: string | null,
	type: "all" | "movie" | "tv" | null
	data: TMDBSearchResponse | null
}) {

	const router = useRouter();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [searchQuery, setSearchQuery] = useState<string | null>(query ?? null);
	const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">(type ?? "all");

	function handleSearch(value: string) {

		setSearchQuery(value);

		const path = value
			? `/search?query=${encodeURIComponent(value)}&type=${mediaType}`
			: `/search?type=${mediaType}`;

		router.replace(path);

	};

	useEffect(() => {

		const path = searchQuery
			? `/search?query=${encodeURIComponent(searchQuery)}&type=${mediaType}`
			: `/search?type=${mediaType}`;

		router.replace(path);

	}, [mediaType]);

	useEffect(() => {

		if (searchInputRef.current) {

			const len = searchInputRef.current.value.length;
			searchInputRef.current.focus();
			searchInputRef.current.setSelectionRange(len, len);

		};

	}, []);

	return (

		<div className="flex-1 w-full flex flex-col items-center py-10 sm:px-10 px-4">

			<div className="flex flex-col space-y-2 w-full max-w-4xl">

				{/* <Input
					ref={searchInputRef}
					className="w-full"
					placeholder="Search for movies, TV shows..."
					value={searchQuery ?? ""}
					onChange={(e) => handleSearch(e.target.value)}
				/> */}

				<div className="rounded-4xl bg-neutral-800 h-10 flex items-center justify-between px-4 space-x-4">

					<input
						type="text"
						placeholder="Search"
						className="outline-none w-full"
						value={searchQuery ?? ""}
						onChange={(e) => handleSearch(e.target.value)}
					/>

					<Search size={20} className="text-neutral-500" />

				</div>

				<div className="grid grid-cols-3 gap-2 flex-none max-w-fit">

					{(["all", "movie", "tv"] as const).map((type) => (

						<button
							key={type}
							// size="sm"
							className={cn(
								"capitalize h-8 px-3 rounded-4xl text-sm cursor-pointer border",
								type === mediaType ? "bg-neutral-800 border-transparent" : "bg-transparent text-accent-foreground border border-input"
							)}
							// variant={type == mediaType ? "secondary" : "outline"}
							onClick={() => setMediaType(type)}
						>
							{type}
						</button>

					))}

				</div>

			</div>

			<div className="w-full mt-10 overflow-y-auto grid lg:grid-cols-8 md:grid-cols-4 sm:grid-cols-2 gap-4 auto-rows-min">

				{data?.results?.map((item) => {

					const posterUrl = item.poster_path ? constructImg(item.poster_path) : null;
					const date = item.release_date || item.first_air_date;
					const releaseYear = date && new Date(date).getFullYear().toString();

					return (

						<a href={`/${item.type || mediaType}/${item.id}`} key={item.id} className="relative w-full rounded-md overflow-hidden grid grid-cols-1 grid-rows-1">

							<div className="relative w-full col-start-1 row-start-1" style={{ paddingBottom: '150%' }}>

								{posterUrl ? (
									<Image
										src={posterUrl}
										alt={item.title || item.name || "Poster"}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
									/>

								) : (

									<div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-white text-sm">
										{item.title || item.name}
									</div>

								)}
							</div>

							{item.type && (
								<div className="py-1 px-2 absolute top-2 left-2 col-start-1 row-start-1 z-10 rounded-xl bg-neutral-800/80">
									<p className="text-xs capitalize">{item.type}</p>
								</div>
							)}

							{releaseYear && (
								<div className="py-1 px-2 absolute top-2 right-2 col-start-1 row-start-1 z-10 rounded-xl bg-neutral-800/80">
									<p className="text-xs">{releaseYear}</p>
								</div>
							)}

						</a>

					);

				})}

			</div>


		</div>

	);

};