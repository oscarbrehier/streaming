import { MovieOverview } from "@/components/MovieDescription";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { createClient } from "@/utils/supabase/server";
import { formatTimeHuman } from "@/utils/timeFormat";
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

	const { id: mediaId } = await params;

	const movie = await getMovie(mediaId);
	const isAvailable = await checkAvailability(mediaId);

	let userMediaStatus: UserMediaStatus | null = null;

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (user) {

		const { data, error } = await supabase
			.from("user_media_status")
			.select("*")
			.eq("media_id", mediaId)
			.eq("user_id", user.id)
			.single();

		if (!error && data) userMediaStatus = data;

	};

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

				{userMediaStatus && (

					<div className="flex items-center space-x-4">

						<div className="w-72 h-1 relative">

							<div className="w-full h-full rounded-full bg-neutral-800 absolute" />
							<div 
								style={{
									width: `${(userMediaStatus.progress_sec / userMediaStatus.duration_sec) * 100}%`
								}}
								className="h-full rounded-full bg-yellow-400 absolute" 
							/>

						</div>

						<p className="text-sm text-neutral-300 w">
							<span>{formatTimeHuman(userMediaStatus.progress_sec)} watched</span>
							&nbsp;of&nbsp;
							<span>{formatTimeHuman(userMediaStatus.duration_sec)}</span>
						</p>

					</div>

				)}

				{isAvailable && (

					<Link
						href={`/watch/${movie.id}`}
						className="capitalize bg-white text-black text-lg py-2 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
					>
						<Play className="text-black mt-0.5" fill="#000" size={16} />
						<span>{userMediaStatus ? "Resume" : "Watch Now"}</span>
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