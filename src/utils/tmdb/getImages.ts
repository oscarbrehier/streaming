import { fetchtTMDB } from "./fetchTMDB";

export async function getImages(mediaId: string, tv?: boolean): Promise<{ backdrops: [], logos: [], posters: [] }> {

	const endpoint = tv 
		? `/tv/${mediaId}/images`
		: `/movie/${mediaId}/images`

	const data = await fetchtTMDB(`${endpoint}?include_image_language=en`);

	return data;

};