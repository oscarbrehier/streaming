import { MediaPreview } from "@/components/dashboard/MediaPreview"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { constructImg } from "@/lib/tmdb/constructImg"
import { ChangeEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type MediaType = "movie" | "tv";

export function MediaSelector({
	selectedMedia,
	onSelectMedia,
	className
}: {
	selectedMedia: MovieSummary | null;
	onSelectMedia: (media: MovieSummary | null) => void;
	className?: string;
}) {

	const [mediaType, setMediaType] = useState<MediaType>("movie");
	const [searchQuery, setSearchQuery] = useState<string | null>(null);
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
	const [searchResults, setSearchResults] = useState<MovieSummary[]>([]);

	useEffect(() => {

		if (!searchQuery) return;

		setSearchResults([]);
		search(searchQuery);


	}, [mediaType]);

	useEffect(() => {
		return () => {
			if (searchTimeout) clearTimeout(searchTimeout);
		};
	}, [searchTimeout]);

	async function search(query: string) {

		if (!query) return;

		setSearchQuery(query);
		onSelectMedia(null);

		try {

			const endpoint = `/search/${mediaType}?query=${encodeURIComponent(query)}&language=en-US&page=1`;
			const res = await fetch(`/api/tmdb?endpoint=${encodeURIComponent(endpoint)}`);

			if (!res.ok) {
				throw new Error('Search failed');
			}

			const data = await res.json();
			setSearchResults(data.results);

		} catch (error) {

			console.error('Search error:', error);
			setSearchResults([]);

		};

	};

	function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		};

		const timeout = setTimeout(() => {
			search(e.target.value.trim());
		}, 500);

		setSearchTimeout(timeout);

	};

	return (

		<div className={cn("h-full w-full flex flex-col space-y-10 p-8")}>

			{!selectedMedia ? (

				<>

					<div className="w-full flex flex-col space-y-2">

						<Input
							type="text"
							placeholder="Search for titles"
							onChange={handleSearchChange}
						/>

						<div className="flex space-x-2">

							<Button
								size="sm"
								onClick={() => setMediaType("movie")}
								variant={mediaType === "movie" ? "outline" : "secondary"}
							>
								Movie
							</Button>

							<Button
								size="sm"
								onClick={() => setMediaType("tv")}
								variant={mediaType === "tv" ? "outline" : "secondary"}
							>
								TV
							</Button>

						</div>

					</div>

					<div className="w-full grid xl:grid-cols-4 grid-cols-2 gap-4 overflow-y-auto">

						{
							searchResults.map((item) => (

								<div
									onClick={() => onSelectMedia(item)}
									style={{
										backgroundImage: `
										linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0)),
										url(${constructImg(item.poster_path)})
									`
									}}
									className="bg-cover bg-center h-96 rounded-xl overflow-hidden bg-neutral-800 flex items-end p-4"
									key={item.id}
								>
									{item.title}
								</div>

							))
						}

					</div>

				</>

			) : (

				<MediaPreview
					media={selectedMedia}
					onClose={() => onSelectMedia(null)}
				/>

			)}

		</div>

	);

};