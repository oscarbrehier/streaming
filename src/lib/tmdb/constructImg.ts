import { getImages } from "./getImages";

export function constructImg(path: string) {

	return `https://image.tmdb.org/t/p/original${path}`;

};

export async function getBackdrop(id: string) {

	const images = await getImages(id);

	if (images.backdrops.length != 0) {

		return images.backdrops[images.backdrops.length - 1].file_path;


	};

};