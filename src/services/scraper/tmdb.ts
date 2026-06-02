export interface MovieInfo {
	type: "movie";
	title: string;
	name: string;
	releaseYear: number;
	tmdb: string | number;
	imdb: string;
};

export interface TvInfo {
	type: "tv";
	name: string;
	releaseYear: string;
	tmdb: string | number;
	imdb: string;
	season: string | number;
	episode: string | number;
	episodeName: string;
};

export class TmdbError extends Error {
	constructor(
		message: string,
		public readonly provider: string,
		public readonly responseCode: number,
		public readonly hint?: string,
		public readonly issueLink: boolean = false
	) {
		super(message);
		this.name = 'TmdbError';
	}
};

export async function getMovieFromTmdb(tmdb_id: string | number): Promise<MovieInfo> {

	console.log(tmdb_id)

	const response = await fetch(
		`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
	);

	if (response.status !== 200) {
		throw new TmdbError("Invalid movie id", "user", 404, "Check the documentation again to see how to use this endpoint");
	};

	const data = await response.json();
	if (new Date(data.release_date) > new Date()) {
		throw new TmdbError("This movie has not been released.", "user", 400, "Check the documentation again to see how to use this endpoint");
	};

	const secondResponse = await fetch(
		`https://api.themoviedb.org/3/movie/${tmdb_id}/external_ids?api_key=${process.env.TMDB_API_KEY}`
	);

	if (secondResponse.status !== 200) {
		throw new TmdbError("Invalid movie id", "user", 404, "Check the documentation again to see how to use this endpoint");
	};

	const secondData = await secondResponse.json();
	return {
		type: "movie",
		title: data.title as string,
		name: data.original_title as string,
		releaseYear: Number(data.release_date.split("-")[0]),
		tmdb: tmdb_id,
		imdb: secondData.imdb_id as string,
	};
	
};

export async function getTvFromTmdb(
	tmdb_id: string | number,
	season: string | number,
	episode: string | number
): Promise<TvInfo> {

	const response = await fetch(
		`https://api.themoviedb.org/3/tv/${tmdb_id}/season/${season}/episode/${episode}?api_key=${process.env.TMDB_API_KEY}&append_to_response=external_ids`
	);

	if (response.status !== 200) {
		throw new TmdbError("Invalid tv id, season, or episode number", "user", 404, "Check the documentation again to see how to use this endpoint");
	};

	const data = await response.json();
	if (new Date(data.air_date) > new Date()) {
		throw new TmdbError("This episode has not been released yet.", "user", 405);
	};

	const secondResponse = await fetch(
		`https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
	);

	if (secondResponse.status !== 200) {
		throw new TmdbError("Invalid tv id, season, or episode number", "user", 404, "Check the documentation again to see how to use this endpoint");
	};

	const secondData = await secondResponse.json();

	const thirdResponse = await fetch(
		`https://api.themoviedb.org/3/tv/${tmdb_id}/external_ids?api_key=${process.env.TMDB_API_KEY}`
	);

	if (thirdResponse.status !== 200) {
		throw new TmdbError("Invalid tv id, season, or episode number", "user", 404, "Check the documentation again to see how to use this endpoint");
	};

	const thirdData = await thirdResponse.json();
	
	return {
		type: "tv",
		name: secondData.name as string,
		releaseYear: data.air_date.split("-")[0] as string,
		tmdb: tmdb_id,
		imdb: thirdData.imdb_id as string,
		season,
		episode,
		episodeName: data.name as string,
	};

};