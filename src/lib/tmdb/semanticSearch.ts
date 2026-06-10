import { Mistral } from "@mistralai/mistralai";
import { createClient } from "@supabase/supabase-js";
import { fetchTMDB } from "./fetchTMDB";
import { filterCurated } from "./curated";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function expandQuery(query: string, intent?: any): Promise<string> {

	const context = intent ? [
		intent.directors?.length && `Directors: ${intent.directors.join(", ")}`,
		intent.movements?.length && `Movement: ${intent.movements.join(", ")}`,
		intent.genres?.length && `Genres: ${intent.genres.join(", ")}`,
		intent.keywords?.length && `Keywords: ${intent.keywords.join(", ")}`,
		intent.period && `Period: ${intent.period.from}–${intent.period.to}`,
	].filter(Boolean).join(". ") : "";

	const res = await mistral.chat.complete({
		model: "mistral-small-latest",
		maxTokens: 150,
		messages: [{
			role: "user",
			content: `You are helping match a film search query to a database of films. Each film in the database is described like this:
				"[Title]. [Plot overview]. Directed by [directors]. Starring [cast]. Genres: [genres]. Language: [language code]. Released: [year]."

				Your job: rewrite the user's search query as a fake film description that would be similar to what they're looking for. Use the same format. Be specific about filmmaking style, themes, aesthetics. 2-3 sentences max.

				Query: "${query}"
				${context ? `Additional context: ${context}` : ""}

				Respond with only the fake film description, nothing else.`
		}]
	});

	const expanded = (res.choices?.[0]?.message?.content as string ?? "").trim();
	console.log(`[semantic] expanded: "${expanded}"`);

	return expanded || query;

};

export async function semanticSearch(
	query: string,
	type: "all" | "movie" | "tv",
	limit: number = 40,
	intent?: any
): Promise<{ tmdb_id: number; media_type: string; similarity: number }[]> {

	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_SECRET!
	);

	const queryText = await expandQuery(query, intent);

	const res = await mistral.embeddings.create({
		model: "mistral-embed",
		inputs: [queryText]
	});

	const embedding = res.data[0].embedding;

	const { data, error } = await supabase.rpc("search_films", {
		query_embedding: embedding,
		match_count: limit,
		...(type !== "all" && { filter_media_type: type }),
	});

	if (error) throw error;

	return (data as any[])
		.filter((r: any) => r.similarity >= 0.68)
		.map((r: any) => ({
			tmdb_id: r.tmdb_id,
			media_type: r.media_type,
			similarity: r.similarity
		}));

};

export async function semanticSearchWithDetails(
	query: string,
	type: "all" | "movie" | "tv",
	strict: boolean = true,
	intent?: any
): Promise<any[]> {

	const hasStrongDirectorSignal =
		(intent?.directors?.length ?? 0) >= 3 ||
		(intent?.movements?.length ?? 0) > 0 ||
		((intent?.directors?.length ?? 0) === 1 &&
			intent?.keywords?.length === 0 &&
			intent?.genres?.length === 0);

	const hasFactualKeywords = intent?.keywords?.some((k: string) => {
		const lower = k.toLowerCase();
		return lower.includes("revolution") ||
			lower.includes("war") ||
			lower.includes("historical") ||
			lower.includes("period");
	});

	const hasHistoricalPeriod = intent?.period !== null &&
		intent?.genres?.some((g: string) =>
			["History", "War"].includes(g)
		);

	const hasSpecificKeywords = intent?.keywords?.some((k: string) => {
		const lower = k.toLowerCase();
		return lower.includes("grief") ||
			lower.includes("bereavement") ||
			lower.includes("loss") ||
			lower.includes("mourning");
	});

	if (hasStrongDirectorSignal || hasFactualKeywords || hasHistoricalPeriod || hasSpecificKeywords) {
		return [];
	};

	const tmdbIds = await semanticSearch(query, type, 40, intent);

	const results = await Promise.all(
		tmdbIds.map(async ({ tmdb_id, media_type, similarity }) => {
			try {
				const data = await fetchTMDB(
					`/${media_type}/${tmdb_id}?language=en-US`,
					{ next: { revalidate: 86400 } }
				);
				return { ...data, mediaType: media_type, _similarity: similarity };
			} catch {
				return null;
			}
		})
	);

	const valid = results.filter(Boolean);
	const languageHints: Record<string, string> = {
		japanese: "ja", korean: "ko", french: "fr",
		italian: "it", spanish: "es", german: "de",
	};

	const queryLower = query.toLowerCase();
	const requiredLanguage = Object.entries(languageHints)
		.find(([word]) => queryLower.includes(word))?.[1];

	const languageFiltered = requiredLanguage
		? valid.filter(r => r.original_language === requiredLanguage)
		: valid;

	return strict ? filterCurated(languageFiltered) : languageFiltered;
	
};