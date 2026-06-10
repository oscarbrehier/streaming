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
import { deduplicateAndSort } from "@/lib/tmdb/search";

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

const CATEGORIES = [
	{ label: "all", path: "all" },
	{ label: "movies", path: "movie" },
	{ label: "series", path: "tv" },
] as const;

type MediaType = "all" | "movie" | "tv";

interface SearchPhase {
	title: string;
	description?: string;
};

const SEARCH_PHASES = {
	start: { title: "Searching", description: "Looking through the catalogue..." },
	title: { title: "First results in", description: "Direct matches found" },
	intent: { title: "Understanding query", description: "Identifying directors, movements, periods..." },
	append: { title: "Expanding search", description: "Finding related titles..." },
	done: { title: "Search complete", description: null },
} as const;

export function SearchForm({
	query,
	type,
	strict,
	data = null
}: {
	query: string | null;
	type: "all" | "movie" | "tv" | null;
	strict: boolean;
	data?: TMDBSearchResponse | null;
}) {

	const router = useRouter();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [searchQuery, setSearchQuery] = useState<string | null>(query ?? null);
	const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">(type ?? "all");

	const [isEnhancing, setIsEnhancing] = useState(false);
	const [enhancedResults, setEnhancedResults] = useState<TMDBMovie[] | null>(null);
	const enhanceController = useRef<AbortController | null>(null);

	const [progress, setProgress] = useState(0);
	const [phase, setPhase] = useState<SearchPhase | null>(null);
	const [intentChips, setIntentChips] = useState<{ label: string; value: string }[]>([]);

	const [searchTriggered, setSearchTriggered] = useState(false);

	const intentPeriodRef = useRef<{ from: number; to: number } | null>(null);
	const intentLanguageRef = useRef<string[] | null>(null);

	const displayResults = enhancedResults ?? data?.results ?? [];

	function handleSearch(value: string) {

		setSearchQuery(value);

		const path = value
			? `/search?query=${encodeURIComponent(value)}&type=${mediaType}`
			: `/search?type=${mediaType}`;

		router.replace(path);

	};

	function logSearchSummary(query: string, results: any[], sourceBreakdown: Record<string, number>) {
		const total = results.length;

		const breakdown = Object.entries(sourceBreakdown)
			.sort((a, b) => b[1] - a[1])
			.map(([src, count]) => `${src}: ${count} (${Math.round(count / total * 100)}%)`)
			.join(" | ");

		const top15 = results.slice(0, 15).map((r, i) => ({
			rank: i + 1,
			title: r.title ?? r.name,
			year: (r.release_date || r.first_air_date)?.split("-")[0] ?? "?",
			source: r._source ?? "unknown",
			similarity: r._similarity ? r._similarity.toFixed(3) : "-",
			score: ((r.vote_average ?? 0) * Math.log10(Math.max(r.vote_count ?? 1, 1))).toFixed(2),
			vote_average: r.vote_average,
			vote_count: r.vote_count,
			language: r.original_language,
		}));

		console.log(
			`\n${"=".repeat(60)}\nQUERY: "${query}"\nTOTAL: ${total} results\nSOURCES: ${breakdown}\n\nTOP 15:\n${top15.map(r =>
				`  ${String(r.rank).padStart(2)}. [${r.source}] ${r.title} (${r.year}) | lang:${r.language} | sim:${r.similarity} | score:${r.score} | ⭐${r.vote_average} (${r.vote_count} votes)`
			).join("\n")}\n${"=".repeat(60)}`
		);
	}

	useEffect(() => {

		if (!query) {
			setEnhancedResults(null);
			setIsEnhancing(false);
			setIntentChips([]);
			return;
		};

		enhanceController.current?.abort();
		enhanceController.current = new AbortController();
		intentPeriodRef.current = null;
		intentLanguageRef.current = null;

		setIsEnhancing(true);
		setEnhancedResults(null);
		setProgress(5);
		setPhase({ ...SEARCH_PHASES.start });
		setIntentChips([]);

		const seen = new Set<number>();
		let accumulated: TMDBMovie[] = [];

		console.log("QUERY:", query);

		const timer = setTimeout(async () => {

			try {

				const res = await fetch(
					`/api/search/enhanced?query=${encodeURIComponent(query)}&type=${type ?? "all"}&strict=${strict}`,
					{ signal: enhanceController.current?.signal }
				);

				const reader = res.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) return;

				const buffer = { current: "" };

				while (true) {

					const { done, value } = await reader.read();
					if (done) break;

					buffer.current += decoder.decode(value, { stream: true });
					const parts = buffer.current.split("\n\n");

					buffer.current = parts.pop() ?? "";

					for (const part of parts) {

						const line = part.trim();
						if (!line.startsWith("data: ")) continue;

						try {

							const data = JSON.parse(line.slice(6));

							if (data.type === "results") {

								setSearchTriggered(true);
								setPhase({ ...SEARCH_PHASES.title });
								setProgress(20);

								accumulated = data.results;
								data.results.forEach((r: TMDBMovie) => seen.add(r.id));

								setEnhancedResults([...accumulated]);

							};

							if (data.type === "intent") {
								setPhase({ ...SEARCH_PHASES.intent });
								setProgress(35);

								intentPeriodRef.current = data.intent.period ?? null;

								const impliedLanguage = (() => {
									const kws = (data.intent.keywords ?? []).join(" ").toLowerCase();
									const q = query?.toLowerCase() ?? "";
									if (kws.includes("hong kong") || q.includes("hong kong")) return ["cn", "zh"];
									if (q.includes("japanese") || kws.includes("japan")) return ["ja"];
									if (q.includes("french") || kws.includes("french")) return ["fr"];
									if (q.includes("korean") || kws.includes("korea")) return ["ko"];
									if (q.includes("italian") || kws.includes("italian")) return ["it"];
									return null;
								})();
								intentLanguageRef.current = impliedLanguage;

								const chips: { label: string; value: string }[] = [];

								if (data.intent.directors?.length) chips.push({ label: "DIRECTOR", value: data.intent.directors.slice(0, 3).join(", ") });
								if (data.intent.actors?.length) chips.push({ label: "ACTOR", value: data.intent.actors.slice(0, 2).join(", ") });
								if (data.intent.genres?.length) chips.push({ label: "GENRE", value: data.intent.genres.slice(0, 2).join(", ") });
								if (data.intent.movements?.length) chips.push({ label: "MOVEMENT", value: data.intent.movements[0] });
								if (data.intent.keywords?.length) chips.push({ label: "MOOD", value: data.intent.keywords.slice(0, 2).join(", ") });
								if (data.intent.period) chips.push({ label: "ERA", value: `${data.intent.period.from}–${data.intent.period.to}` });

								chips.forEach((chip, i) => {
									setTimeout(() => {
										setIntentChips(prev => [...prev, chip]);
									}, i * 150);
								});
							};

							if (data.type === "append") {

								setPhase({ ...SEARCH_PHASES.append });
								setProgress(prev => Math.min(prev + 10, 90));

								let newItems = data.results.filter((r: TMDBMovie) => !seen.has(r.id));

								if (intentPeriodRef.current) {
									newItems = newItems.filter((r: any) => {
										const date = r.release_date || r.first_air_date;
										const year = date ? parseInt(date.split("-")[0]) : null;
										return year === null ||
											(year >= intentPeriodRef.current!.from &&
												year <= intentPeriodRef.current!.to);
									});
								}

								if (intentLanguageRef.current) {
									newItems = newItems.filter((r: any) =>
										intentLanguageRef.current!.includes(r.original_language)
									);
								}

								newItems.forEach((r: TMDBMovie) => seen.add(r.id));
								accumulated = deduplicateAndSort([...accumulated, ...newItems]);

								const sourceCounts = accumulated.reduce((acc, r) => {
									const src = (r as any)._source ?? "unknown";
									acc[src] = (acc[src] ?? 0) + 1;
									return acc;
								}, {} as Record<string, number>);

								const total = accumulated.length;
								const breakdown = Object.entries(sourceCounts)
									.sort((a, b) => b[1] - a[1])
									.map(([src, count]) => `${src}: ${count} (${Math.round(count / total * 100)}%)`)
									.join(" | ");

								console.log(`[search:append] ${total} results — ${breakdown}`);

								setEnhancedResults([...accumulated]);

							};

							if (data.type === "done") {

								const sourceCounts = accumulated.reduce((acc, r) => {
									const src = (r as any)._source ?? "unknown";
									acc[src] = (acc[src] ?? 0) + 1;
									return acc;
								}, {} as Record<string, number>);

								logSearchSummary(query, accumulated, sourceCounts);

								setPhase({
									...SEARCH_PHASES.done,
									description: accumulated.length === 0
										? "Nothing found"
										: `${accumulated.length} title${accumulated.length === 1 ? "" : "s"} found`
								});

								setProgress(100);
								setTimeout(() => setProgress(0), 600);
								setIsEnhancing(false);

							};

						} catch { }

					};

				};

			} catch (e: any) {
				if (e.name !== "AbortError") console.error(e);
				setIsEnhancing(false);
			};

		}, 500);

		return () => {
			clearTimeout(timer);
			enhanceController.current?.abort();
		};

	}, [query, type, strict]);

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

		<div className="flex-1 w-full flex flex-col p-20 space-y-10">

			<div className="w-full flex items-center justify-between ">

				<div className="flex items-center w-full space-x-6">
					<SearchBar
						value={searchQuery ?? ""}
						onChange={(v) => handleSearch(v)}
						thinking={isEnhancing}
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
				{/* 				
				{data?.results && (
					<p className="shrink-0 uppercase text-ink3 font-jet-mono text-sm">{data.results.length} results</p>
				)} */}

			</div>

			<div className="h-px w-full bg-ink4/38 my-6 mt-0" />

			<div className="flex items-center justify-between space-x-4">

				<div className="flex space-x-2">

					{CATEGORIES.map((c, i) => (

						<Button
							key={i}
							label={c.label}
							size="md"
							variant={c.path === mediaType ? "secondary" : "outline"}
							onClick={() => setMediaType(c.path as MediaType)}
							className={cn(c.path !== mediaType && "text-ink2 hover:text-ink")}
						/>

					))}

				</div>

				<div className={cn(
					"flex items-center space-x-4 p-2 pl-3 rounded-full text-sm border",
					strict ? "bg-lavender/10 border-lavender/20" : "bg-panel"
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



			<div className="w-full rounded-2xl flex flex-col justify-center space-y-2">

				<div className="flex items-center space-x-2">
					<div className="size-1 rounded-full bg-olive animate-pulse" />
					<p className="uppercase font-jet-mono text-sm text-ink3">{intentChips ? "Looking for" : "Reading you search"}</p>
				</div>

				<div className="flex items-center space-x-4 ">

					{intentChips?.map((chip, i) => (

						<div
							key={i}
							className="flex items-center space-x-4 bg-panel border border-panel2 py-2 px-4 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-300"
						>
							<p className="uppercase font-jet-mono text-olive text-xs">{chip.label}</p>
							<p className="text-sm text-ink2">{chip.value}</p>
						</div>

					))}

				</div>

			</div>



			<div className="w-full flex flex-col space-y-2">

				{phase && (
					<div
						key={phase.title}
						className="w-full flex items-center justify-between animate-in fade-in duration-200"
					>

						<div>
							<p className="text-ink text-sm font-medium">{phase.title}</p>
							<p className="text-ink3 text-sm">{phase.description}</p>
						</div>

						{progress !== 0 && <p className="uppercase text-ink3 font-jet-mono text-sm">{progress} %</p>}

					</div>

				)}

				{progress !== 0 && (
					<div className="w-full h-0.5">
						<div
							className={cn(
								"h-full rounded-full bg-linear-to-r from-mint to-lavender transition-all duration-500 ease-out",
								progress === 0 ? "opacity-0" : "opacity-100",
							)}
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}

			</div>

			{!isEnhancing && searchTriggered && displayResults.length === 0 && query && (

				<div className="flex-1 w-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">

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

			<div className={cn(
				"w-full grid lg:grid-cols-8 md:grid-cols-4 sm:grid-cols-2 gap-y-12 gap-x-6 auto-rows-min transition-all duration-500",
				isEnhancing ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"
			)}>

				{displayResults.map((item, i) => {

					const posterUrl = item.poster_path ? constructImg(item.poster_path) : null;
					const date = item.release_date || item.first_air_date;
					const releaseYear = date && new Date(date).getFullYear().toString();

					return (

						<div
							key={item.id}
							className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300"
							style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
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
								<p className="uppercase text-ink3 font-jet-mono text-sm">{item._source}</p>
							</div>

						</div>

					);

				})}

			</div>


		</div>

	);

};