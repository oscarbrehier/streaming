import { getCache, setCache } from "@/lib/api/cache";
import { filterCurated } from "@/lib/tmdb/curated";
import { parseSearchIntent, searchByKeyword, searchByPerson, searchByTitle } from "@/lib/tmdb/search";
import { NextRequest, NextResponse } from "next/server";

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

				const cachedData = await getCache(cacheKey);

				if (cachedData) {

					const parsed = JSON.parse(cachedData);
					send({ type: "results", results: parsed.results });

					if (parsed.intent) send({ type: "intent", intent: parsed.intent });
					for (const batch of parsed.batches ?? []) {
						send({ type: "append", results: batch.results, label: batch.label });
					};

					send({ type: "done" });
					close();

					return;

				};

				const titleResults = await searchByTitle(query, type);
				const filteredTitle = strict ? await filterCurated(titleResults) : titleResults;

				send({ type: "results", results: filteredTitle });

				const intent = await parseSearchIntent(query);
				send({ type: "intent", intent });

				const batches: { results: any[]; label: string }[] = [];

				const allSearches = [
					...intent.directors.slice(0, 4).map(d =>
						searchByPerson(d, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								batches.push({ results: filtered, label: d });
								send({ type: "append", results: filtered, label: d });
							}
						})
					),
					...intent.actors.slice(0, 2).map(a =>
						searchByPerson(a, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								batches.push({ results: filtered, label: a });
								send({ type: "append", results: filtered, label: a });
							}
						})
					),
					...intent.keywords.slice(0, 3).map(k =>
						searchByKeyword(k, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								batches.push({ results: filtered, label: k });
								send({ type: "append", results: filtered, label: k });
							}
						})
					),
					...intent.movements.slice(0, 2).map(m =>
						searchByKeyword(m, type).then(async results => {
							const filtered = strict ? await filterCurated(results) : results;
							if (filtered.length > 0) {
								batches.push({ results: filtered, label: m });
								send({ type: "append", results: filtered, label: m });
							}
						})
					),
				];

				await Promise.allSettled(allSearches);

				const cacheResult = await setCache(cacheKey, JSON.stringify({ results: filteredTitle, intent, batches }));
				console.log("cache set result:", cacheResult);

				send({ type: "done" });

			} catch (err) {

				console.error(err);
				send({ type: "error" });

			} finally {
				close();
			};

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