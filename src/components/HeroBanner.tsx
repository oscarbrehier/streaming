import { fetchtTMDB } from "@/lib/tmdb/fetchTMDB";

import { Info, Play } from "lucide-react";
import Link from "next/link";
import { MovieOverview } from "./MovieOverview";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";

export async function HeroBanner() {

	const mediaType = "movie";
	const mediaId = process.env.HERO_ID ?? 649;
	const data = await fetchtTMDB(`/${mediaType}/${mediaId}?language=en-US&append_to_response=images`);

	return (

		<div className="absolute top-0 left-0 h-[85vh] w-full overflow-hidden">

			<div
				className="absolute top-0 left-0 h-[85vh] w-full bg-cover bg-center md:block hidden"
				style={{
					backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`
				}}
			/>

			<div
				className="absolute top-0 left-0 h-[85vh] w-full bg-cover bg-top md:hidden block"
				style={{
					backgroundImage: `url(https://image.tmdb.org/t/p/original${data.poster_path})`
				}}
			/>

			<div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />

			<MovieOverview movie={data}>

				<div className="flex space-x-4">

					<Link
						href={`/watch/${data.id}`}
						className="capitalize bg-neutral-200 text-black text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center sm:space-x-4"
					>
						<Play className="text-black mt-0.5" fill="#000" size={16} />
						<span className="sm:block hidden">Watch now</span>
					</Link>

					<Link
						href={`/movie/${data.id}`}
						className={cn(
							"capitalize text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center sm:space-x-4",
							glass("active")
						)}
					>
						<Info className="text-neutral-200 mt-0.5" size={16} />
						<span className="sm:block hidden">More Info</span>
					</Link>

				</div>

			</MovieOverview>

		</div>

	);

};