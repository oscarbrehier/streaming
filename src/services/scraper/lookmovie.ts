import { MovieInfo, TvInfo } from "./tmdb";
import { v4 as uuid } from "uuid";

async function hashString(str: string) {

	const msgUint8 = new TextEncoder().encode(str.trim().toLowerCase());
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

};

async function search(query: string) {

	const cacheKey = `search-${await hashString(query)}`;

	const res = await fetch(`https://www.lookmovie2.to/api/v1/movies/do-search/?q=${encodeURIComponent(query)}`, {
		headers: {
			'Cache-Control': "max-age=3600",
			'x-cache-key': cacheKey
		}
	});

	if (!res.ok) return null;

	const data = await res.json();
	return data;

};

async function getLibrary(mediaId: string) {

	const cacheKey = `library-${mediaId}`;

	const expiresIn = Date.now() + 2 * 60 * 60 * 1000;
	const res = await fetch(`https://www.lookmovie2.to/api/v1/security/movie-access?id_movie=${mediaId}&hash=B6lmTttWrm5ndieDSwvRrw&expires=${expiresIn}`, {
		headers: {
			'Cache-Control': "max-age=3600",
			'x-cache-key': cacheKey
		}
	});

	if (!res.ok) return null;

	const data = await res.json();
	return data;

};

export async function getLookmovie(media: MovieInfo): Promise<MediaSources> {

	const data: MediaSources = {
		files: [],
		subtitles: []
	};

	const title = media.title;

	if (!title) throw new Error("[Lookmovie] Title not found");

	const searchRes = await search(title);
	if (!searchRes || !searchRes.result || searchRes.result.length === 0) throw new Error("[Lookmovie] No data found for this media");

	const mediaId = searchRes.result[0].id_movie;

	const library = await getLibrary(mediaId);

	if (!library) throw new Error("[Lookmovie] Failed to find sources");

	for (const [_, url] of Object.entries(library.streams)) {

		if (url) {
			data.files.push({
				id: uuid(),
				file: url as string,
				type: "hls",
				lang: "en"
			});
		};

	};

	if (!library.subtitles || library.subtitles.length === 0) return data;

	data.subtitles = library.subtitles.map((track: any) => ({
		id: uuid(),
		url: `https://www.lookmovie2.to/${track.file}`,
		lang: track.language,
		type: "vtt"
	}));

	return data;

};