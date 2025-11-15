import { fetchtTMDB } from "./fetchTMDB";

export async function getTrailer(movieId: string): Promise<string | null> {
	
	try {

		const { results = [] } = await fetchtTMDB(`/movie/${movieId}/videos`);

		const trailers = results.filter((v: any) => v.type === "Trailer" && v.site === "YouTube");

		if (trailers.length === 0) {
			throw new Error("No trailers found for this media");
		};

		const official: any[] = [];
		const nonOfficial: any[] = [];

		for (const trailer of trailers) {
			(trailer.official ? official : nonOfficial).push(trailer);
		};

		const best = official[0] ?? nonOfficial[0];

		return best ? `https://www.youtube.com/watch?v=${best.key}` : null;

	} catch (err) {

		console.log(err)
		throw new Error("Could not load trailers for the requested media: " + err);

	};

};
