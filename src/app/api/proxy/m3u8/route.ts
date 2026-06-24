import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

	const url = req.nextUrl.searchParams.get("url");
	if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

	const res = await fetch(url, {
		headers: {
			"User-Agent": req.headers.get("User-Agent") ?? "",
		}
	});

	if (!res.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 502 });

	const text = await res.text();
	const base = new URL(url);

	const rewritten = text.split("\n").map(line => {

		if (line.startsWith("#") || !line.trim()) return line;

		const absoluteUrl = line.startsWith("http")
			? line
			: new URL(line, base).toString();

		if (line.includes(".m3u8")) {
			return `/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}`;
		};

		return `/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`;

	}).join("\n");

	return new NextResponse(rewritten, {
		headers: {
			"Content-Type": "application/vnd.apple.mpegurl",
			"Access-Control-Allow-Origin": "*",
		}
	});

};