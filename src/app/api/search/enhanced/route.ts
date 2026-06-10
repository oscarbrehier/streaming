import { getCache, setCache } from "@/lib/api/cache";
import { filterCurated } from "@/lib/tmdb/curated";
import { parseSearchIntent, searchByKeyword, searchByPerson, searchByTitle } from "@/lib/tmdb/search";
import { semanticSearchWithDetails } from "@/lib/tmdb/semanticSearch";
import { NextRequest, NextResponse } from "next/server";

function tagSource(results: any[], source: string): any[] {
	return results.map(r => ({ ...r, _source: source }));
}

export async function GET(req: NextRequest) {

	const { searchParams } = req.nextUrl;
	const query = searchParams.get("query") ?? "";
	const type = (searchParams.get("type") ?? "all") as "all" | "movie" | "tv";
	const strict = searchParams.get("strict") !== "false";

	if (!query) return NextResponse.json({ results: [] });

	const cacheKey = `search:${query.toLowerCase().trim()}:${type}:${strict}`;
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			let closed = false;

			const send = (data: any) => {
				try {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
				} catch { }
			};

			const close = () => {
				if (!closed) {
					closed = true;
					controller.close();
				}
			};

			try {

				const titleResults = await searchByTitle(query, type);
				const filteredTitle = strict ? await filterCurated(titleResults) : titleResults;
				send({ type: "results", results: tagSource(filteredTitle, "title") });

				const intent = await parseSearchIntent(query);
				send({ type: "intent", intent });

				console.log('[intent]', JSON.stringify(intent, null, 2));

				const semanticResults = await semanticSearchWithDetails(query, type, strict, intent);
				const batches: { results: any[]; label: string }[] = [];

				if (semanticResults.length > 0) {
					const tagged = tagSource(semanticResults, "semantic");
					batches.push({ results: tagged, label: "semantic" });
					send({ type: "append", results: tagged, label: "semantic" });
				}

				const isMovementQuery = intent.movements.length > 0 && intent.directors.length > 0;

				const OVERBROAD_KEYWORDS = new Set([
					"historical drama",
					"mourning",
					"period drama",
					"epic",
					"biography",
					"loss",
					"war",
				]);

				const filteredKeywords = intent.keywords.filter(
					(k: string) => !OVERBROAD_KEYWORDS.has(k.toLowerCase())
				);

				const allSearches = [
					...intent.directors.slice(0, 4).map(d =>
						searchByPerson(d, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								const tagged = tagSource(filtered, `director:${d}`);
								batches.push({ results: tagged, label: d });
								send({ type: "append", results: tagged, label: d });
							}
						})
					),
					...intent.actors.slice(0, 2).map(a =>
						searchByPerson(a, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								const tagged = tagSource(filtered, `actor:${a}`);
								batches.push({ results: tagged, label: a });
								send({ type: "append", results: tagged, label: a });
							}
						})
					),
					...(isMovementQuery ? [] : filteredKeywords.slice(0, 3).map(k =>
						searchByKeyword(k, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								const tagged = tagSource(filtered, `keyword:${k}`);
								batches.push({ results: tagged, label: k });
								send({ type: "append", results: tagged, label: k });
							}
						})
					)),
					...(isMovementQuery ? [] : intent.movements.slice(0, 2).map(m =>
						searchByKeyword(m, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								const tagged = tagSource(filtered, `movement:${m}`);
								batches.push({ results: tagged, label: m });
								send({ type: "append", results: tagged, label: m });
							}
						})
					)),
				];

				await Promise.allSettled(allSearches);

				send({ type: "done" });

			} catch (err) {

				console.error(err);
				send({ type: "error" });

			} finally {
				close();
			}

		}
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
		}
	});

};