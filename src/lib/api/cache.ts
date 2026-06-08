"use server"

export async function getCache(key: string): Promise<string | null> {

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cache/${key}`, {
		method: "HEAD",
		headers: {
			'Authorization': `Bearer ${process.env.API_INTERNAL_KEY}`
		}
	});

	if (!res.ok) return null;

	const data = await res.json();
	return data;

};

export async function setCache(key: string, value: string): Promise<string | null> {

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cache`, {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${process.env.API_INTERNAL_KEY}`
		},
		body: JSON.stringify({
			key,
			data: value
		})
	});

	if (!res.ok) return null;

	const data = await res.json();
	return data;

};