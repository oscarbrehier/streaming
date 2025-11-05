import { fetchtTMDB } from "@/utils/tmdb/fetchTMDB";
import { getImages } from "@/utils/tmdb/getImages";
import Link from "next/link";

export async function HeroBanner() {

	const mediaType = "tv";
	const mediaId = `73586`;
	const data = await fetchtTMDB(`/${mediaType}/${mediaId}?language=en-US`);

	const images = await getImages(mediaId, true);

	const logo = images.logos?.length
		? images.logos.find((l: any) => l.iso_639_1 === "en") || images.logos[0]
		: null;

	console.log(logo)

	return (

		<div
			className="relative h-[80vh] w-full rounded-xl overflow-hidden bg-cover bg-center"
			style={{
				backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`
			}}
		>


			<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

			<div className="absolute bottom-10 left-10 space-y-6">

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
					className="capitalize bg-white text-black text-lg font-medium py-2 px-6 rounded-lg cursor-pointer"
				>
					play
				</Link>

			</div>

		</div>

	);

};