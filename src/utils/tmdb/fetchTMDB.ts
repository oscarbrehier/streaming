"use server"

export async function fetchtTMDB<T = any>(endpoint: string, options: RequestInit = {}) {

	const headers: Record<string, string> = {
		...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
		...options.headers as Record<string, string>,
		"Authorization": `Bearer ${process.env.TMDB_READ_TOKEN}`
	};

	const url = `https://api.themoviedb.org/3${endpoint}`;

	console.log(url)

	const res = await fetch(url, {
		...options,
		headers,
	});

	if (!res.ok) {
		console.log(res.status, res.statusText)
		throw new Error(`HTTP Error ${res.status}:${res.statusText}`);
	};

	const data = await res.json();
	return data as T;

};