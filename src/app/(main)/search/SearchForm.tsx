"use client"

import { cn } from "@/lib/utils";
import { Sparkle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/Button";
import { Switch } from "@/components/ui/switch";
import { deduplicateAndSort } from "@/lib/tmdb/search";
import { BackdropCard } from "@/components/cards/Backdrop";

export interface TMDBSearchResponse {
	page: number;
	results: SearchResult[];
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
	const [enhancedResults, setEnhancedResults] = useState<SearchResult[] | null>(null);
	const enhanceController = useRef<AbortController | null>(null);

	const [progress, setProgress] = useState(0);
	const [phase, setPhase] = useState<SearchPhase | null>(null);
	const [intentChips, setIntentChips] = useState<{ label: string; value: string }[]>([]);

	const [searchTriggered, setSearchTriggered] = useState(false);

	const [hasAnyResults, setHasAnyResults] = useState(false);

	const intentRef = useRef<any>(null);
	const intentPeriodRef = useRef<{ from: number; to: number } | null>(null);
	const intentLanguageRef = useRef<string[] | null>(null);

	const displayResults: SearchResult[] = enhancedResults ?? (data?.results as unknown as SearchResult[]) ?? [];

	function handleSearch(value: string) {

		setSearchQuery(value);

		const path = value
			? `/search?query=${encodeURIComponent(value)}&type=${mediaType}`
			: `/search?type=${mediaType}`;

		router.replace(path);

	};

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
		intentRef.current = null;

		setIsEnhancing(true);
		setEnhancedResults(null);
		setProgress(5);
		setPhase({ ...SEARCH_PHASES.start });
		setIntentChips([]);
		setHasAnyResults(false);

		const seen = new Set<number>();
		let accumulated: SearchResult[] = [];

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

								setHasAnyResults(true);

								accumulated = data.results;
								data.results.forEach((r: SearchResult) => seen.add(r.id));

								setEnhancedResults([...accumulated]);

							};

							if (data.type === "intent") {

								setPhase({ ...SEARCH_PHASES.intent });
								setProgress(35);

								intentRef.current = data.intent;
								intentPeriodRef.current = data.intent.period ?? null;

								const chips: { label: string; value: string }[] = [];

								if (data.intent.directors?.length) chips.push({ label: "DIRECTOR", value: data.intent.directors.slice(0, 3).join(", ") });
								if (data.intent.actors?.length) chips.push({ label: "ACTOR", value: data.intent.actors.slice(0, 2).join(", ") });
								if (data.intent.genres?.length) chips.push({ label: "GENRE", value: data.intent.genres.slice(0, 2).join(", ") });
								if (data.intent.movements?.length) chips.push({ label: "MOVEMENT", value: data.intent.movements[0] });
								if (data.intent.keywords?.length) chips.push({ label: "MOOD", value: data.intent.keywords.slice(0, 2).join(", ") });
								if (data.intent.period) chips.push({ label: "ERA", value: `${data.intent.period.from}–${data.intent.period.to ?? ""}` });

								setIntentChips(chips);

							};

							if (data.type === "append") {

								setPhase({ ...SEARCH_PHASES.append });
								setProgress(prev => Math.min(prev + 10, 90));

								let newItems = data.results.filter((r: SearchResult) => !seen.has(r.id));

								if (intentPeriodRef.current && (intentRef.current?.directors?.length > 0 || intentRef.current?.movements?.length > 0)) {

									const { from, to } = intentPeriodRef.current;

									newItems = newItems.filter((r: any) => {
										const date = r.release_date || r.first_air_date;
										const year = date ? parseInt(date.split("-")[0]) : null;
										if (!year) return true;
										if (from && year < from) return false;
										if (to && year > to) return false;
										return true;
									});

								};

								if (intentLanguageRef.current) {
									newItems = newItems.filter((r: any) =>
										intentLanguageRef.current!.includes(r.original_language)
									);
								};

								newItems.forEach((r: SearchResult) => seen.add(r.id));
								accumulated = deduplicateAndSort([...accumulated, ...newItems]);

								setEnhancedResults([...accumulated]);

							};

							if (data.type === "done") {

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

		<div className="flex-1 w-screen flex flex-col xl:p-20 lg:p-10 p-6 space-y-10">

			<div className="w-full flex items-center justify-between ">

				<div className="flex items-center w-full space-x-6">
					<SearchBar
						value={searchQuery ?? ""}
						onChange={(v) => handleSearch(v)}
						thinking={isEnhancing}
					/>

				</div>

			</div>

			<div className="h-px w-full bg-ink4/38 my-6 mt-0" />

			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">

				<div className="flex space-x-2">

					{CATEGORIES.map((c, i) => (

						<Button
							key={i}
							label={c.label}
							size="sm"
							variant={c.path === mediaType ? "secondary" : "outline"}
							onClick={() => setMediaType(c.path as MediaType)}
							className={cn(c.path !== mediaType && "text-ink2 hover:text-ink")}
							collapseLabel={false}
						/>

					))}

				</div>

				<div className={cn(
					"flex items-center space-x-4 h-8 px-2 pl-3 rounded-full text-sm border",
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


			{query && intentChips.length > 0 && (

				<div className="w-full flex flex-col justify-center space-y-2">

					<div className="flex items-center space-x-2">
						<div className="size-1 rounded-full bg-olive animate-pulse" />
						<p className="uppercase font-jet-mono text-sm text-ink3">Looking for</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{intentChips.map((chip, i) => (
							<div
								key={i}
								className="flex items-center space-x-2 bg-panel border border-panel2 py-1.5 px-3 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-300"
							>
								<p className="uppercase font-jet-mono text-olive text-xs">{chip.label}</p>
								<p className="text-xs sm:text-sm text-ink2 capitalize">{chip.value}</p>
							</div>
						))}
					</div>

				</div>

			)}

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

					<div className="w-full flex flex-col items-center space-y-8">

						{strict ? (

							<>
								<p className="text-3xl font-bold text-center">
									No curated results for
									<br />
									<span className="inline-block max-w-70 sm:max-w-100 truncate align-bottom text-lavender">{query}</span>
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
				"w-full grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-1 auto-rows-min transition-all duration-500",
				isEnhancing && !hasAnyResults ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"
			)}>

				{displayResults.map((item, i) => {

					const director = item.credits?.crew?.find(c => c.job === "Director")?.name;

					return (
						<BackdropCard
							key={item.id}
							media={item}
							director={director}
						/>
					);

				})}

			</div>


		</div>

	);

};