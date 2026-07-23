import { v4 as uuid } from "uuid";
import { MovieMedia } from "./tmdb";

interface StreamProvider {
	id: string;
	enabled: boolean;
	builtin: boolean;
};

interface StreamProvideresResponse {
	success: boolean;
	sources: StreamProvider[];
};

interface StreamSource {
	url: string;
	type: string;
	quality: string;
};

async function getProviders(mediaId: number): Promise<string[]> {

	const res = await fetch("https://www.chillflix.lol/api/stream-sources", {
		headers: {
			'Referer': `https://www.chillflix.lol/movie/${mediaId}`
		}
	});

	if (!res.ok) return [];

	const data: StreamProvideresResponse = await res.json();

	if (!data.success) return [];

	return data.sources
		.filter((s) => s.enabled && s.builtin)
		.map((s) => s.id);

};

export async function getChillflix(movie: MovieMedia): Promise<MediaSources> {

	const providers = await getProviders(movie.tmdb);

	const results = await Promise.all(
		providers.map(async (provider) => {

			const params = new URLSearchParams({
				type: "movie",
				tmdbId: String(movie.tmdb),
				retry: "1",
				fresh: "1",
				provider,
			});

			try {

				const res = await fetch(`https://www.chillflix.lol/api/cinepro/sources?${params}`, {
					headers: {
						'Referer': `https://www.chillflix.lol/movie/${movie.tmdb}`
					}
				});
				console.log("RES", res.status, res)
				if (!res.ok) return [];

				const data: { sources?: StreamSource[] } = await res.json();

				console.log("DATA", data)

				return (data.sources ?? [])
					.filter((s) => s.type === "hls")
					.map((s) => ({
						id: uuid(),
						file: s.url,
						type: s.type,
						lang: "en"
					}));

			} catch {
				return [];

			};

		}),
	);

	return {
		files: results.flat(),
		subtitles: []
	};

};