import { getChillflix } from "./chillflix";
import { getLookmovie } from "./lookmovie";
import { getMovieFromTmdb, MovieMedia } from "./tmdb";

type Provider = (media: MovieMedia) => Promise<MediaSources>;

const EMPTY: MediaSources = { files: [], subtitles: [] };

const providers: Record<string, Provider> = {
	lookmovie: (media) => getLookmovie(media),
	chillflix: (media) => getChillflix(media)
};

function dedupe<T>(items: T[], key: (item: T) => string): T[] {

	const seen = new Set<string>();

	return items.filter((item) => {

		const k = key(item);
		if (seen.has(k)) return false;

		seen.add(k);

		return true;

	});

};

export async function scrape(mediaId: string): Promise<MediaSources> {

	const media = await getMovieFromTmdb(mediaId);

	const results = await Promise.all(
		Object.entries(providers).map(async ([name, provider]) => {

			console.log("PROVIDER", name);
			
			try {
				return await provider(media);
			} catch (err) {
				console.log("PROVIDER", name, "failed");
				return EMPTY;
			};

		})
	);
	
	return {
		files: dedupe(
			results.flatMap((r) => r.files ?? []),
			(f) => f.file,
		),
		subtitles: dedupe(
			results.flatMap((s) => s.subtitles ?? []),
			(s) => s.url,
		),
	};

};
