import { v4 as uuid } from "uuid";

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

async function getProviders(): Promise<string[]> {

	const res = await fetch("https://www.chillflix.lol/api/stream-sources");

	if (!res.ok) return [];

	const data: StreamProvideresResponse = await res.json();

	if (!data.success) return [];

	return data.sources
		.filter((s) => s.enabled && s.builtin)
		.map((s) => s.id);

};

export async function getChillflix(mediaId: number): Promise<MediaSources> {

	const providers = await getProviders();

	const results = await Promise.all(
		providers.map(async (provider) => {

			const params = new URLSearchParams({
				type: "movie",
				tmdbId: String(mediaId),
				retry: "1",
				fresh: "1",
				provider,
			});

			try {

				const res = await fetch(`https://www.chillflix.lol/api/cinepro/sources?${params}`);
				if (!res.ok) return [];

				const data: { sources?: StreamSource[] } = await res.json();
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