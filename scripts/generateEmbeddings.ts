import { config } from "dotenv";
config({ path: ".env.local" });

import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { fetchTMDB } from "@/lib/tmdb/fetchTMDB";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function buildFilmText(film: any, credits?: any, keywords?: any): Promise<string> {
	const directors = credits?.crew
		?.filter((c: any) => c.job === "Director")
		?.map((c: any) => c.name)
		?.join(", ") ?? "";

	const cast = credits?.cast
		?.slice(0, 5)
		?.map((c: any) => c.name)
		?.join(", ") ?? "";

	const genres = film.genres?.map((g: any) => g.name).join(", ")
		?? film.genre_ids?.join(", ")
		?? "";

	const kwList = (keywords?.keywords ?? keywords?.results ?? [])
		?.slice(0, 10)
		?.map((k: any) => k.name)
		?.join(", ") ?? "";

	const productionCountries = film.production_countries
		?.map((c: any) => c.name)
		?.join(", ") ?? "";

	return [
		film.title ?? film.name,
		film.overview,
		directors && `Directed by ${directors}`,
		cast && `Starring ${cast}`,
		genres && `Genres: ${genres}`,
		kwList && `Keywords: ${kwList}`,
		film.release_date && `Released: ${film.release_date.split("-")[0]}`,
		film.original_language && `Language: ${film.original_language}`,
		productionCountries && `Country: ${productionCountries}`,
	].filter(Boolean).join(". ");

};

async function embedBatch(texts: string[]): Promise<number[][]> {

	const res = await mistral.embeddings.create({
		model: "mistral-embed",
		inputs: texts,
	});

	return res.data.map(d => d.embedding).filter((e): e is number[] => e !== undefined);

};

async function processPage(
	supabase: any,
	page: number,
	mediaType: "movie" | "tv",
	queryParams: string = `sort_by=vote_count.desc&vote_count.gte=50`
) {

	const data = await fetchTMDB(
		`/discover/${mediaType}?${queryParams}&page=${page}&language=en-US`
	);

	const films = data.results;
	if (!films?.length) return 0;

	const withCredits = await Promise.all(
		films.map(async (film: any) => {
			try {
				const [credits, keywords] = await Promise.all([
					fetchTMDB(`/${mediaType}/${film.id}/credits`),
					fetchTMDB(`/${mediaType}/${film.id}/keywords`),
				]);
				return { film, credits, keywords };
			} catch {
				return { film, credits: null, keywords: null };
			}
		})
	);

	const texts = await Promise.all(
		withCredits.map(({ film, credits, keywords }) =>
			buildFilmText(film, credits, keywords)
		)
	);

	const embeddings = await embedBatch(texts);

	const rows = withCredits.map(({ film }, i) => ({
		tmdb_id: film.id,
		media_type: mediaType,
		title: film.title ?? film.name,
		embedding: embeddings[i],
	}));

	const { error } = await supabase
		.from("film_embeddings")
		.upsert(rows, { onConflict: "tmdb_id" });

	if (error) console.error("Insert error:", error);
	return films.length;

};

async function runSecondPass(supabase: any) {

	for (const mediaType of ["movie", "tv"] as const) {

		console.log(`Second pass: ${mediaType}s by vote_average...`);

		for (let page = 1; page <= 500; page++) {

			try {
				const count = await processPage(
					supabase,
					page,
					mediaType,
					`sort_by=vote_average.desc&vote_count.gte=200`
				);

				console.log(`${mediaType} page ${page}: ${count} films`);
				if (count === 0) break;

				await new Promise(r => setTimeout(r, 300));

			} catch (err) {
				console.error(`Error on page ${page}:`, err);
			};

		};

	};

};

async function run() {

	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_SECRET!
	);

	// const limits = { movie: 500, tv: 200 };

	// for (const mediaType of ["movie", "tv"] as const) {

	// 	console.log(`Processing ${mediaType}s...`);

	// 	for (let page = 1; page <= limits[mediaType]; page++) {

	// 		try {

	// 			const count = await processPage(supabase, page, mediaType);
	// 			console.log(`${mediaType} page ${page}: ${count} films`);

	// 			if (count === 0) {
	// 				console.log(`No more results, stopping at page ${page}`);
	// 				break;
	// 			};

	// 			await new Promise(r => setTimeout(r, 200));

	// 		} catch (err) {
	// 			console.error(`Error on page ${page}:`, err);
	// 		};

	// 	};

	// };

	await runSecondPass(supabase);

};

run();