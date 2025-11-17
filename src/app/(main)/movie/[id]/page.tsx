import { MovieOverview } from "@/components/MovieDescription";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { constructImg } from "@/utils/tmdb/constructImg";
import { getImages } from "@/utils/tmdb/getImages";
import { getMovie } from "@/utils/tmdb/getMovie";
import { getTrailer } from "@/utils/tmdb/getTrailer";
import { Play } from "lucide-react";
import Link from "next/link";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function checkAvailability(id: string): Promise<boolean> {

	try {

		const res = await fetch(`http://localhost:3000/api/media/${id}/index.m3u8`);
		return !!res.ok;

	} catch (err) {

		return false;

	};

};

export default async function Page({
	params,
	searchParams
}: PageProps) {

	const { id } = await params;

	const movie = await getMovie(id);

	const isAvailable = await checkAvailability(id);

	return (

		<div className="flex-1 w-full flex flex-col justify-end p-8 pb-32 space-y-4">

			<div
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0)), url('${constructImg(movie.backdrop_path!)}')`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0"
			/>

			<MovieOverview
				movie={movie}
			>

				{isAvailable && (

					<Link
						href={`/watch/${movie.id}`}
						className="capitalize bg-white text-black text-lg py-2 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
					>
						<Play className="text-black mt-0.5" fill="#000" size={16} />
						<span>Watch now</span>
					</Link>

				)}

			</MovieOverview>
			{/* 
			{
				logo ? (

					<img
						className="w-120"
						src={constructImg(logo.file_path)}
						alt={movie.title}
					/>

				) : (
					<p className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">{movie.title}</p>
				)
			}

			<div className="w-1/3 space-y-2">

				<GenreTags genres={movie.genres} />

				<p className="text-muted-background">{movie.overview}</p>

				{isAvailable && (

					<Button asChild>
						<Link href={`/watch/${id}`}>
							Watch now
						</Link>
					</Button>

				)}

			</div> */}

		</div>

	);

};