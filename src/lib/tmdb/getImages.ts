import { fetchtTMDB } from "./fetchTMDB";

export async function getImages(mediaId: string, tv?: boolean): Promise<Images> {

	const endpoint = tv 
		? `/tv/${mediaId}/images`
		: `/movie/${mediaId}/images`

	const data = await fetchtTMDB(`${endpoint}?include_image_language=en`, { next: { revalidate: 86400 } });

	return data;

};