import { config } from "dotenv";
config({ path: ".env.local" });

import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { fetchtTMDB } from "@/lib/tmdb/fetchTMDB";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

function buildFilmText(film: any, credits?: any): string {

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

	return [
		film.title ?? film.name,
		film.overview,
		directors && `Directed by ${directors}`,
		cast && `Starring ${cast}`,
		genres && `Genres: ${genres}`,
		film.release_date && `Released: ${film.release_date.split("-")[0]}`,
		film.original_language && `Language: ${film.original_language}`,
	].filter(Boolean).join(". ");

};

async function embedBatch(texts: string[]): Promise<number[][]> {

	const res = await mistral.embeddings.create({
		model: "mistral-embed",
		inputs: texts,
	});

	return res.data.map(d => d.embedding).filter((e): e is number[] => e !== undefined);

};

async function processPage(supabase: any, page: number, mediaType: "movie" | "tv") {

	const data = await fetchtTMDB(
		`/discover/${mediaType}?sort_by=vote_count.desc&vote_count.gte=50&page=${page}&language=en-US`
	);

	const films = data.results;
	if (!films?.length) return 0;

	const withCredits = await Promise.all(
		films.map(async (film: any) => {
			try {
				const credits = await fetchtTMDB(`/${mediaType}/${film.id}/credits`);
				return { film, credits };
			} catch {
				return { film, credits: null };
			}
		})
	);

	const texts = withCredits.map(({ film, credits }) => buildFilmText(film, credits));
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

async function run() {

	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_SECRET!
	);


	for (const mediaType of ["movie", "tv"] as const) {

		console.log(`Processing ${mediaType}s...`);

		for (let page = 1; page <= 200; page++) {

			try {

				const count = await processPage(supabase, page, mediaType);
				console.log(`${mediaType} page ${page}: ${count} films`);
				await new Promise(r => setTimeout(r, 200));

			} catch (err) {
				console.error(`Error on page ${page}:`, err);
			}

		};

	};

};

run();