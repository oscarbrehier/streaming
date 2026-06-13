import z from "zod";
import { filterCurated } from "./curated";
import { fetchTMDB } from "./fetchTMDB";
import { Mistral } from "@mistralai/mistralai";
import { ResponseFormat } from "@mistralai/mistralai/models/components";
import { getCache, setCache } from "../api/cache";

const PROMPT = `You are an expert film scholar and cinephile with deep knowledge of world cinema history, movements, directors, actors, and film theory.

Your job is to parse natural language search queries into structured data for a film discovery platform.

Guidelines:
- IMPORTANT: For cinema movements, set movements[] and directors[] but leave keywords[] EMPTY — keywords are too broad and return unrelated modern films
- Only populate keywords[] for mood/style queries that have NO associated directors (e.g. "films about grief", "road movies")
- For "films like X director", only put that director in directors[] — do not add thematic keywords
- For directors, extract their full names exactly as they appear in international databases (e.g. "Jean-Luc Godard" not "Godard")
- For vague queries like "70s paranoia thrillers" or "slow cinema", extract relevant keywords AND directors known for that style
- For periods, be generous: "70s" means 1970-1979, "post-war" means 1945-1960, "silent era" means 1895-1930
- For genres, use standard TMDB genre names: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western
- For movements, also add relevant thematic keywords (e.g. French New Wave → ["alienation", "existentialism", "jump cut", "nouvelle vague"])
- If the query is clearly just a title (e.g. "Inception", "The Godfather"), put it in directTitleSearch and leave others empty
- For queries about styles or themes (e.g. "films about loneliness", "surrealist cinema"), extract directors known for that style and relevant keywords
- Always be exhaustive with directors for movements — better to include too many than too few
- For queries that are just a director's name or surname (e.g. "bergman", "tarkovsky", "wong kar-wai", "fassbinder"), put the full name in directors[] and leave directTitleSearch null
- Common director surnames to recognize: Bergman→Ingmar Bergman, Tarkovsky→Andrei Tarkovsky, Kubrick→Stanley Kubrick, Fellini→Federico Fellini, Godard→Jean-Luc Godard, Truffaut→François Truffaut

Examples:
- "french new wave" → directors: [Godard, Truffaut, Rivette, Rohmer, Chabrol, Varda, Malle], keywords: ["nouvelle vague", "alienation", "jump cut"], period: {from: 1958, to: 1973}
- "slow cinema" → directors: [Tarkovsky, Béla Tarr, Chantal Akerman, Apichatpong Weerasethakul, Carlos Reygadas], keywords: ["slow cinema", "contemplative", "long take"]
- "70s american paranoia" → keywords: ["paranoia", "conspiracy", "watergate"], period: {from: 1970, to: 1979}, genres: ["Thriller", "Drama"]
- "films like tarkovsky" → directors: ["Andrei Tarkovsky"], keywords: ["spiritual", "contemplative", "long take", "nature"]
- "japanese new wave" → directors: [Nagisa Oshima, Masahiro Shinoda, Shūji Terayama, Seijun Suzuki, Hiroshi Teshigahara, Yoshishige Yoshida]
`;

interface SearchIntent {
	directors: string[];
	actors: string[];
	genres: string[];
	keywords: string[];
	period: { from: number; to: number } | null;
	movements: string[];
	directTitleSearch: string | null;
};

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const responseFormat: ResponseFormat = {
	type: "json_schema",
	jsonSchema: {
		name: "SearchIntent",
		schemaDefinition: {
			type: "object",
			properties: {
				directors: { type: "array", items: { type: "string" } },
				actors: { type: "array", items: { type: "string" } },
				genres: { type: "array", items: { type: "string" } },
				keywords: { type: "array", items: { type: "string" } },
				period: {
					anyOf: [
						{
							type: "object",
							properties: {
								from: { type: "number" },
								to: { type: "number" },
							},
							required: ["from", "to"]
						},
						{ type: "null" }
					]
				},
				movements: { type: "array", items: { type: "string" } },
				directTitleSearch: { anyOf: [{ type: "string" }, { type: "null" }] },
			},
			required: ["directors", "actors", "genres", "keywords", "period", "movements", "directTitleSearch"]
		}
	} as any
};

export async function parseSearchIntent(query: string): Promise<SearchIntent> {

	const cacheKey = `search_intent:${query.toLowerCase().trim()}`;
	const cachedData = await getCache(cacheKey);

	if (cachedData) {
		try {
			return JSON.parse(cachedData) as SearchIntent;
		} catch { };
	};

	const response = await client.chat.complete({
		model: "mistral-small-latest",
		maxTokens: 300,
		messages: [
			{
				role: "system",
				content: PROMPT
			},
			{
				role: "user",
				content: `Parse this search query: "${query}"`
			}
		],
		responseFormat,
	});

	const text = response.choices?.[0]?.message?.content ?? "{}";
	const intent = JSON.parse(text as string) as SearchIntent;

	await setCache(cacheKey, JSON.stringify(intent));

	return JSON.parse(text as string);

};

export async function searchByPerson(name: string, type: "all" | "movie" | "tv") {

	const personRes = await fetchTMDB(
		`/search/person?query=${encodeURIComponent(name)}&language=en-US`,
		{ next: { revalidate: 300 } }
	);

	const person = personRes.results?.[0];
	if (!person) return [];

	const credits = await fetchTMDB(
		`/person/${person.id}/combined_credits`,
		{ next: { revalidate: 300 } }
	);

	const crew = credits.crew ?? [];
	const results = crew.filter((c: any) =>
		c.job === "Director" &&
		(type === "all" || c.media_type === type)
	);

	return results;

};

export async function searchByKeyword(keyword: string, type: "all" | "movie" | "tv") {

	const kwRes = await fetchTMDB(
		`/search/keyword?query=${encodeURIComponent(keyword)}`,
		{ next: { revalidate: 3600 } }
	);

	const kwId = kwRes.results?.[0]?.id;
	if (!kwId) return [];

	const endpoints = [];
	if (type !== "tv") endpoints.push(fetchTMDB(`/discover/movie?with_keywords=${kwId}&sort_by=vote_average.desc&vote_count.gte=100`, { next: { revalidate: 3600 } }));
	if (type !== "movie") endpoints.push(fetchTMDB(`/discover/tv?with_keywords=${kwId}&sort_by=vote_average.desc&vote_count.gte=100`, { next: { revalidate: 3600 } }));

	const results = await Promise.all(endpoints);
	return results.flatMap(r => r.results ?? []);

};

export async function searchByTitle(query: string, type: "all" | "movie" | "tv"): Promise<SearchResult[]> {

	if (type === "all") {

		const [movies, tv] = await Promise.all([
			fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}&language=en-US`, { next: { revalidate: 120 } }),
			fetchTMDB(`/search/tv?query=${encodeURIComponent(query)}&language=en-US`, { next: { revalidate: 120 } }),
		]);

		const results: any[] = [
			...movies.results.map((r: any) => ({ ...r, mediaType: "movie" })),
			...tv.results.map((r: any) => ({ ...r, mediaType: "tv" })),
		];

		return Promise.all(
			results.map(async r => {

				try {

					const detail = await fetchTMDB(
						`/${r.mediaType}/${r.id}?language=en-US&append_to_response=credits`,
						{ next: { revalidate: 604800 } }
					);

					return { ...r, ...detail, mediaType: r.mediaType };

				} catch {
					return r;
				};

			})
		);

	};

	const data = await fetchTMDB(
		`/search/${type}?query=${encodeURIComponent(query)}&language=en-US`,
		{ next: { revalidate: 120 } }
	);

	const results = (data.results ?? []).map((r: any) => ({ ...r, mediaType: type }));

	return Promise.all(
		results.map(async (r: any) => {

			try {
				const detail = await fetchTMDB(
					`/${type}/${r.id}?language=en-US&append_to_response=credits`,
					{ next: { revalidate: 604800 } }
				);

				return { ...r, ...detail, mediaType: type };

			} catch {
				return r;
			};

		})
	);

};

const SOURCE_PRIORITY: Record<string, number> = {
	semantic: 0,
};

function sourcePriority(source: string | undefined): number {
	if (!source) return 99;
	if (source === "semantic") return 0;
	if (source.startsWith("director:")) return 1;
	if (source.startsWith("actor:")) return 2;
	if (source.startsWith("keyword:")) return 3;
	if (source.startsWith("movement:")) return 4;
	if (source === "title") return 5;
	return 99;
};

const SOURCE_WEIGHT: Record<number, number> = {
	0: 1.5,
	1: 1.6,
	2: 1.4,
	3: 1.2,
	4: 0.7,
	5: 0.5,
};

export function deduplicateAndSort(results: any[]): any[] {

	const seen = new Map<number, any>();

	for (const item of results) {
		const existing = seen.get(item.id);
		if (!existing) {
			seen.set(item.id, item);
		} else {
			if (sourcePriority(item._source) < sourcePriority(existing._source)) {
				seen.set(item.id, { ...existing, _source: item._source });
			}
		}
	}

	return Array.from(seen.values()).sort((a, b) => {

		const priorityA = sourcePriority(a._source);
		const priorityB = sourcePriority(b._source);

		if (a._source === "title" && b._source !== "title") return -1;
		if (b._source === "title" && a._source !== "title") return 1;

		const weightA = SOURCE_WEIGHT[priorityA] ?? 1.0;
		const weightB = SOURCE_WEIGHT[priorityB] ?? 1.0;

		const scoreA = (a.vote_average ?? 0) * Math.log10(Math.max(a.vote_count ?? 1, 1)) * weightA;
		const scoreB = (b.vote_average ?? 0) * Math.log10(Math.max(b.vote_count ?? 1, 1)) * weightB;

		return scoreB - scoreA;

	});

};

export async function searchTMDBFast(query: string, type: "all" | "movie" | "tv") {
	return searchByTitle(query, type);
};

export async function searchTMDB(
	query: string,
	type: "all" | "movie" | "tv" | null,
	page: number = 1,
	strict: boolean = true
) {

	if (!type) type = "all";

	const applyFilter = async (results: any[]) => strict ? filterCurated(results) : results;

	const [intent, titleResults] = await Promise.all([
		parseSearchIntent(query),
		searchByTitle(query, type),
	]);

	const MAX_DIRECTORS = 4;
	const MAX_KEYWORDS = 3;

	const personSearches = [
		...intent.directors.slice(0, MAX_DIRECTORS).map(d => searchByPerson(d, type!)),
		...intent.actors.slice(0, 2).map(a => searchByPerson(a, type!)),
	];

	const keywordSearches = [
		...intent.keywords.slice(0, MAX_KEYWORDS).map(k => searchByKeyword(k, type!)),
		...intent.movements.slice(0, 2).map(m => searchByKeyword(m, type!)),
		...intent.genres.slice(0, 2).map(g => searchByKeyword(g, type!)),
	];

	const [personResults, keywordResults] = await Promise.all([
		Promise.all(personSearches).then(r => r.flat()),
		Promise.all(keywordSearches).then(r => r.flat()),
	]);

	let merged = deduplicateAndSort([
		...titleResults,
		...personResults,
		...keywordResults,
	]);

	if (intent.period) {
		merged = merged.filter(item => {
			const date = item.release_date || item.first_air_date;
			const year = Number(date?.split('-')[0]);
			return year >= intent.period!.from && year <= intent.period!.to;
		});
	};


	return {
		results: await applyFilter(merged),
		total_results: merged.length,
		total_pages: 1,
	};

};