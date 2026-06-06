"use client"

import { cn } from "@/lib/utils";
import { constructImg } from "@/lib/tmdb/constructImg";
import { Search, Sparkle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { SearchBar } from "./SearchBar";
import { Pill } from "@/components/Pill";
import { Button } from "@/components/Button";
import { Switch } from "@/components/ui/switch";

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
};

export interface TMDBSearchResponse {
	page: number;
	results: TMDBMovie[];
	total_pages: number;
	total_results: number;
};

const CATEGORIES = ["all", "movie", "tv"] as const;

export function SearchForm({
	query,
	type,
	strict,
	data
}: {
	query: string | null;
	type: "all" | "movie" | "tv" | null;
	strict: boolean;
	data: TMDBSearchResponse | null;
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
		setSearchQuery(query ?? null);
	}, [query]);

	useEffect(() => {

		if (searchInputRef.current) {

			const len = searchInputRef.current.value.length;
			searchInputRef.current.focus();
			searchInputRef.current.setSelectionRange(len, len);

		};

	}, []);

	return (

		<div className="flex-1 w-full flex flex-col p-20">

			<div className="w-full flex items-center justify-between ">

				<div className="flex items-center w-full space-x-6">
					<SearchBar
						value={searchQuery ?? ""}
						onChange={(v) => handleSearch(v)}
					/>

					{/* <div className="flex items-center space-x-4">
						<p className={cn(
							"text-sm w-28 text-right",
							strict ? "text-lavender" : "text-ink/50 "
						)}>
							Curated only
						</p>
						<Switch
							checked={strict}
							onCheckedChange={(val) => router.replace(
								`?query=${searchQuery ?? ""}&type=${type ?? "all"}&strict=${val}`,
								{ scroll: false }
							)}
						/>
					</div> */}

				</div>

				{data?.results && (
					<p className="shrink-0 uppercase text-ink3 font-jet-mono text-sm">{data.results.length} results</p>
				)}

			</div>

			<div className="h-px w-full bg-ink4/38 my-6" />

			<div className="flex items-center justify-between space-x-4">

				<div className="space-x-4">

					{CATEGORIES.map((c, i) => (

						<button
							key={i}
							onClick={() => setMediaType(c)}
							className={cn(
								"ring-1 h-8 px-4 rounded-full text-sm capitalize",
								"transition-all ease-in-out",
								c === mediaType ? "ring-ink/20 bg-panel2" : "bg-panel ring-ink/10 hover:ring-ink/20"
							)}
						>
							{c}
						</button>

					))}

				</div>

				<div className={cn(
					"flex items-center space-x-4 p-2 pl-3 rounded-full text-sm border",
					strict ? "bg-lavender/20 border-lavender/80" : "bg-panel"
				)}>

					<div className="flex items-center space-x-2">

						{strict ? (
							<Sparkle size={14} className="text-lavender" fill="var(--color-lavender)" />
						) : (
							<Sparkle size={14} className="text-ink opacity-50" fill="var(--color-ink)" />
						)}

						<p className={cn(
							"text-sm",
							strict ? "text-lavender" : "text-ink/50 "
						)}>
							Curated only
						</p>
					</div>

					<Switch
						color="var(--color-lavender)"
						checked={strict}
						onCheckedChange={(val) => router.replace(
							`?query=${searchQuery ?? ""}&type=${type ?? "all"}&strict=${val}`,
							{ scroll: false }
						)}
					/>

				</div>

			</div>

			{data?.results.length === 0 && (

				<div className="flex-1 w-full mt-10 flex items-center justify-center">

					<div className="flex flex-col items-center space-y-8">

						{strict ? (

							<>
								<p className="text-3xl font-bold text-center">
									No curated results for
									<br />
									<span className="text-lavender">"{query}"</span>
								</p>

								<div className="text-center">
									<p className="text-ink/50">
										Curated mode shows titles with a proven track record of quality.
									</p>
									<p className="text-ink/50">Turn off <span className="text-ink font-semibold">Curated only</span> to search the full library.</p>
								</div>

								<div className="flex space-x-4">

									<Button
										onClick={() => router.replace(
											`?query=${searchQuery ?? ""}&type=${type ?? "all"}&strict=false`,
											{ scroll: false }
										)}
										label="Search the full library"
										icon={<Sparkle size={16} className="text-lavender" fill="var(--color-lavender)" />}
									/>

									<Button
										onClick={() => router.push(`/search?type=${mediaType}`)}
										label="Clear search"
										variant="glass"
									/>

								</div>

							</>

						) : (

							<>

								<p className="text-3xl font-bold text-center">
									No results for
									<br />
									<span className="text-lavender">"{query}"</span>
								</p>

								<p className="text-ink/50">Try a different search term or check your spelling.</p>

								<Button
									onClick={() => router.push(`/search?type=${mediaType}`)}
									label="Clear search"
									variant="glass"
								/>

							</>
						)}

					</div>

				</div>

			)}

			<div className="w-full mt-10 overflow-y-auto grid lg:grid-cols-8 md:grid-cols-4 sm:grid-cols-2 gap-12 auto-rows-min">

				{data?.results?.map((item) => {

					const posterUrl = item.poster_path ? constructImg(item.poster_path) : null;
					const date = item.release_date || item.first_air_date;
					const releaseYear = date && new Date(date).getFullYear().toString();

					return (

						<div
							key={item.id}
							className="flex flex-col"
						>

							<a href={`/${item.type || mediaType}/${item.id}`} className="relative w-full rounded-2xl overflow-hidden grid grid-cols-1 grid-rows-1">

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

							</a>

							<div className="mt-2">
								<p className="font-semibold">{item.title ?? item.name}</p>
								<p className="uppercase text-ink3 font-jet-mono text-sm">{releaseYear}</p>
							</div>

						</div>

					);

				})}

			</div>


		</div>

	);

};