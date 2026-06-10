import { config } from "dotenv";
config({ path: ".env.local" });

import OpenAI from "openai";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { fetchtTMDB } from "@/lib/tmdb/fetchTMDB";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function enrichFilmText(film: any, credits?: any, keywords?: any): Promise<string> {

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

	const base = [
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

	const res = await mistral.chat.complete({
		model: "mistral-small-latest",
		maxTokens: 250,
		messages: [{
			role: "user",
			content: `You are a film critic and scholar with deep knowledge of cinema history, movements, and aesthetics.

Given this film's basic information, write a rich 3-4 sentence description capturing:
- Its cinematic movement or era (e.g. French New Wave, Italian Neorealism, New Hollywood, Slow Cinema)
- Filmmaking style and aesthetics (camera work, editing, pacing, visual tone)
- Core themes and emotional register
- Films and directors it resembles

Be specific and use film criticism vocabulary. Do not summarize the plot.

Film info: ${base}

Respond with only the enriched description, nothing else.`
		}]
	});

	const enriched = (res.choices?.[0]?.message?.content as string ?? "").trim();

	return enriched ? `${base}. ${enriched}` : base;

}

async function enrichWithRetry(film: any, credits: any, keywords: any, retries = 3): Promise<string> {

	for (let i = 0; i < retries; i++) {

		try {
			return await enrichFilmText(film, credits, keywords);
		} catch (err: any) {
			if (err?.statusCode === 429 && i < retries - 1) {
				console.log(`Rate limited, waiting 60s...`);
				await new Promise(r => setTimeout(r, 60000));
			} else {
				throw err;
			}
		}

	}

	return "";

}

async function embedBatch(texts: string[]): Promise<number[][]> {

	const res = await openai.embeddings.create({
		model: "text-embedding-3-large",
		input: texts,
	});

	return res.data
		.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
		.map((d: { embedding: number[] }) => d.embedding);

}

async function processPage(
	supabase: any,
	page: number,
	mediaType: "movie" | "tv",
	queryParams: string = `sort_by=vote_count.desc&vote_count.gte=50`
) {

	const data = await fetchtTMDB(
		`/discover/${mediaType}?${queryParams}&page=${page}&language=en-US`
	);

	const films = data.results;
	if (!films?.length) return 0;

	const withData = await Promise.all(
		films.map(async (film: any) => {
			try {
				const [credits, keywords] = await Promise.all([
					fetchtTMDB(`/${mediaType}/${film.id}/credits`),
					fetchtTMDB(`/${mediaType}/${film.id}/keywords`),
				]);
				return { film, credits, keywords };
			} catch {
				return { film, credits: null, keywords: null };
			}
		})
	);

	const texts: string[] = [];

	for (const { film, credits, keywords } of withData) {
		const text = await enrichWithRetry(film, credits, keywords);
		texts.push(text);
		await new Promise(r => setTimeout(r, 1500));
	}

	const embeddings = await embedBatch(texts);

	const rows = withData.map(({ film }, i) => ({
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

}

async function runPass(
	supabase: any,
	queryParams: string,
	limits: { movie: number; tv: number },
	startPages: { movie: number; tv: number } = { movie: 1, tv: 1 }
) {

	for (const mediaType of ["movie", "tv"] as const) {

		const startPage = startPages[mediaType];

		console.log(`Processing ${mediaType}s from page ${startPage} — ${queryParams}`);

		for (let page = startPage; page <= limits[mediaType]; page++) {

			try {

				const count = await processPage(supabase, page, mediaType, queryParams);

				console.log(`${mediaType} page ${page}: ${count} films`);

				if (count === 0) {
					console.log(`No more results at page ${page}, stopping.`);
					break;
				}

				await new Promise(r => setTimeout(r, 300));

			} catch (err) {
				console.error(`Error on ${mediaType} page ${page}:`, err);
			}

		}

	}

}

async function run() {

	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_SECRET!
	);

	await runPass(
		supabase,
		`sort_by=vote_count.desc&vote_count.gte=50`,
		{ movie: 500, tv: 200 },
		{ movie: 70, tv: 1 }
	);

	await runPass(
		supabase,
		`sort_by=vote_average.desc&vote_count.gte=200`,
		{ movie: 500, tv: 200 }
	);

}

run();