import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

	const url = req.nextUrl.searchParams.get("url");
	if (!url) return new Response("Missing url", { status: 400 });

	const res = await fetch(url, {
		headers: {
			"User-Agent": req.headers.get("User-Agent") ?? "",
		}
	});

	if (!res.ok) return new Response("Failed to fetch segment", { status: 502 });

	return new Response(res.body, {
		headers: {
			"Content-Type": res.headers.get("Content-Type") ?? "video/MP2T",
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
		}
	});

};