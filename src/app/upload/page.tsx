"use client"

import FileUploadSection from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { constructImg } from "@/utils/movies/constructImg";
import { fetchtTMDB } from "@/utils/movies/fetchTMDB";
import { ArrowLeft, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { MediaPreview } from "./MediaPreview";

export default function Page() {

	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [mediaType, setMediaType] = useState("movie");
	const [selectedMedia, setSelectedMedia] = useState<null | any>(null);

	const [searchQuery, setSearchQuery] = useState<string | null>(null);
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
	const [searchResults, setSearchResults] = useState<any[]>([]);

	useEffect(() => {
		if (!searchQuery) return;
		search(searchQuery);
	}, [mediaType]);

	function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		};

		const timeout = setTimeout(() => {
			search(e.target.value.trim());
		}, 500);

		setSearchTimeout(timeout);

	};

	async function search(query: string) {

		if (!query) return;

		setSearchQuery(query);
		setSelectedMedia(null);

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

	return (

		<div className="h-auto min-h-screen w-full bg-white grid grid-cols-2">

			<div className="h-screen">

				<FileUploadSection
					onFileSelect={setFile}
					selectedMovie={selectedMedia}
					uploadedFile={file}
				/>

			</div>

			<div className="h-screen w-full flex flex-col space-y-10 pt-8 p-8">

				{!selectedMedia ? (

					<>

						<div className="w-full flex flex-col space-y-2">

							<Input
								type="text"
								placeholder="Search for titles"
								onChange={(e) => handleSearchChange(e)}
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

						<div className="w-full h-screen grid grid-cols-4 gap-4 overflow-y-auto">

							{
								searchResults.map((item) => (

									<div
										onClick={() => setSelectedMedia(item)}
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
						onClose={() => setSelectedMedia(null)}
					/>

				)}

			</div>

		</div>

	);

};