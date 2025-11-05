import { fetchtTMDB } from "./fetchTMDB";

export async function getImages(mediaId: string, tv?: boolean) {

	const endpoint = tv 
		? `/tv/${mediaId}/images`
		: `movie/${mediaId}/images`

	const data = await fetchtTMDB(endpoint);

	return data;

};