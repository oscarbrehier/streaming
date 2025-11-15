import { fetchtTMDB } from "@/utils/tmdb/fetchTMDB";
import { getImages } from "@/utils/tmdb/getImages";
import { Play } from "lucide-react";
import Link from "next/link";
import { GenreTags } from "./GenreTags";

export async function HeroBanner() {

	const mediaType = "tv";
	const mediaId = `73586`;
	const data = await fetchtTMDB(`/${mediaType}/${mediaId}?language=en-US`);

	const images = await getImages(mediaId, true);

	const logo = images.logos?.length
		? images.logos.find((l: any) => l.iso_639_1 === "en") || images.logos[0]
		: null;

	console.log(data)

	return (

		<div
			className="relative h-[70vh] w-full rounded-4xl overflow-hidden bg-cover bg-top"
			style={{
				backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`
			}}
		>


			<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

			<div className="absolute bottom-10 left-10 space-y-6 flex flex-col items-start">

				<GenreTags genres={data.genres} />

				{logo && (
					<img
						className="h-12"
						src={`https://image.tmdb.org/t/p/original${logo.file_path}`}
						alt=""
					/>
				)}

				<p className="text-stone-100 w-1/3">
					{
						data.overview
					}
				</p>

				<Link
					href={`/watch/${mediaId}`}
					className="capitalize bg-white text-black text-lg py-2 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
				>
					<Play className="text-black mt-0.5" fill="#000" size={16} />
					<span>Watch now</span>
				</Link>

			</div>

		</div>

	);

};