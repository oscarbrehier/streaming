import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

	const searchParams = request.nextUrl.searchParams;
	const endpoint = searchParams.get("endpoint");

	if (!endpoint) {
		return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
	};

	const url = `https://api.themoviedb.org/3${endpoint}`;

	try {

		const res = await fetch(url, {
			headers: {
				'Content-Type': "application/json",
				'Authorization': `Bearer ${process.env.TMDB_READ_TOKEN}`
			},
			next: { revalidate: 3600 }
		});

		if (!res.ok) {
			throw new Error(`TMDB API Error: ${res.status}`);
		};

		const data = await res.json();
		return NextResponse.json(data);

	} catch (err) {

		return NextResponse.json({
			error: "Failed to fetch from TMDB"
		}, {
			status: 500
		});

	};

};