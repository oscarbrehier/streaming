import { fetchtTMDB } from "@/utils/tmdb/fetchTMDB";

import { Info, Play } from "lucide-react";
import Link from "next/link";
import { MovieOverview } from "./MovieDescription";

export async function HeroBanner() {

	const mediaType = "movie";
	const mediaId = `289`;
	const data = await fetchtTMDB(`/${mediaType}/${mediaId}?language=en-US&append_to_response=images`);

	return (

		<div
			className="absolute top-0 left-0 h-[85vh] w-full overflow-hidden bg-cover bg-top"
			style={{
				backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`
			}}
		>


			<div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />

			<MovieOverview movie={data}>

				<div className="flex space-x-4">

					<Link
						href={`/watch/${data.id}`}
						className="capitalize bg-white text-black text-lg py-2 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
					>
						<Play className="text-black mt-0.5" fill="#000" size={16} />
						<span>Watch now</span>
					</Link>

					<Link
						href={`/movie/${data.id}`}
						className="capitalize bg-neutral-300/10 backdrop-blur-md text-neutral-200 text-lg py-2 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
					>
						<Info className="text-neutral-200 mt-0.5" size={16} />
						<span>More Info</span>
					</Link>

				</div>

			</MovieOverview>

		</div>

	);

};