export interface MovieMedia {
	type: "movie";
	title: string;
	originalTitle: string;
	releaseYear: number;
	tmdb: number;
	imdb: string | null;
};

export interface ShowMedia {
	type: "tv";
	title: string;
	originalTitle: string;
	releaseYear: number;
	tmdb: number;
	imdb: string | null;
	season: number;
	episode: number;
	episodeName: string;
};

export type ScrapeMedia = MovieMedia | ShowMedia;

export class TmdbError extends Error {
	constructor(
		message: string,
		public readonly provider: string,
		public readonly responseCode: number,
		public readonly hint?: string,
		public readonly issueLink: boolean = false,
	) {
		super(message);
		this.name = "TmdbError";
		Object.setPrototypeOf(this, TmdbError.prototype);
	}
}

const TMDB_BASE = "https://api.themoviedb.org/3";
const DOCS_HINT = "Check the documentation again to see how to use this endpoint";

interface TmdbMovie {
	title: string;
	original_title: string;
	release_date?: string;
	imdb_id: string | null;
};

interface TmdbShow {
	name: string;
	original_name: string;
	external_ids: { imdb_id: string | null };
};

interface TmdbEpisode {
	name: string;
	air_date?: string;
};

async function tmdbFetch<T>(
	path: string,
	notFound: string,
	params: Record<string, string> = {},
): Promise<T> {

	const apiKey = process.env.TMDB_API_KEY;
	
	if (!apiKey) {
		throw new TmdbError("TMDB API key is not configured", "server", 500);
	};

	const query = new URLSearchParams({ api_key: apiKey, ...params });
	const res = await fetch(`${TMDB_BASE}${path}?${query}`);

	if (res.status === 404) throw new TmdbError(notFound, "user", 404, DOCS_HINT);

	if (!res.ok) {
		
		throw new TmdbError(
			`TMDB request failed with status ${res.status}`,
			"tmdb",
			res.status,
		);

	};

	return (await res.json()) as T;

};

function assertReleased(date: string | undefined, message: string): string {

	if (!date) throw new TmdbError(message, "user", 400, DOCS_HINT);

	if (new Date(date) > new Date()) {
		throw new TmdbError(message, "user", 400, DOCS_HINT);
	};

	return date;

};

export async function getMovieFromTmdb(
	tmdbId: string | number,
): Promise<MovieMedia> {

	const movie = await tmdbFetch<TmdbMovie>(
		`/movie/${tmdbId}`,
		"Invalid movie id",
	);

	const releaseDate = assertReleased(
		movie.release_date,
		"This movie has not been released.",
	);

	return {
		type: "movie",
		title: movie.title,
		originalTitle: movie.original_title,
		releaseYear: Number(releaseDate.slice(0, 4)),
		tmdb: Number(tmdbId),
		imdb: movie.imdb_id,
	};

};

export async function getTvFromTmdb(
	tmdbId: string | number,
	season: string | number,
	episode: string | number,
): Promise<ShowMedia> {

	const notFound = "Invalid tv id, season, or episode number";

	const [episodeData, show] = await Promise.all([
		tmdbFetch<TmdbEpisode>(
			`/tv/${tmdbId}/season/${season}/episode/${episode}`,
			notFound,
		),
		tmdbFetch<TmdbShow>(`/tv/${tmdbId}`, notFound, {
			append_to_response: "external_ids",
		}),
	]);

	const airDate = assertReleased(
		episodeData.air_date,
		"This episode has not been released yet.",
	);

	return {
		type: "tv",
		title: show.name,
		originalTitle: show.original_name,
		releaseYear: Number(airDate.slice(0, 4)),
		tmdb: Number(tmdbId),
		imdb: show.external_ids.imdb_id,
		season: Number(season),
		episode: Number(episode),
		episodeName: episodeData.name,
	};

};