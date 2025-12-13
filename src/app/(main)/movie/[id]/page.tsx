import { MovieOverview } from "@/components/MovieOverview";
import { createClient } from "@/utils/supabase/server";
import { formatTimeHuman } from "@/utils/timeFormat";
import { constructImg } from "@/lib/tmdb/constructImg";
import { getMainCast, getMovie } from "@/lib/tmdb/movie";
import { Play } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SuggestContentButton } from "./SuggestContentButton";
import { isInWatchlist } from "@/utils/db/watchlist";
import { AddToWatchlist } from "./AddToWatchlist";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function checkAvailability(mediaId: string, accessToken: string): Promise<boolean> {

	try {

		const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/${mediaId}/availability`, {
			headers: {
				"Authorization": `Bearer ${accessToken}`
			}
		});

		if (!res.ok) return false;


		const data = await res.json();
		return Boolean(data.available);

	} catch (err) {
		return false;
	};

};

export default async function Page({
	params
}: PageProps) {

	const { id: mediaId } = await params;

	const movieDetails = await getMovie(mediaId);
	const mainCast = await getMainCast(mediaId, 3);
	const isMovieInWatchlist = await isInWatchlist(mediaId);

	let userMediaStatus: UserMediaStatus | null = null;

	const supabase = await createClient();

	const { data: { session } } = await supabase.auth.getSession();
	if (!session) redirect("/login");

	const isStreamAvailable = await checkAvailability(mediaId, session.access_token);

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
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0)), url('${constructImg(movieDetails.backdrop_path!)}')`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:block hidden"
			/>

			<div
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${constructImg(movieDetails.poster_path!)}')`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:hidden block"
			/>

			<MovieOverview
				movie={movieDetails}
			>

				<div className="py-4 text-neutral-300">

					<div>
						<p>
							{movieDetails.vote_average.toFixed(1)} {" "}
							<span className="text-neutral-300 text-sm">/ 10</span>
						</p>
					</div>

					{mainCast && (
						<p>
							<span className="font-medium">Starring:</span> {mainCast.map((member) => member.name).join(", ")}
						</p>
					)}

					<p>
						<span className="font-medium">Release date:</span> {new Date(movieDetails.release_date).toLocaleDateString("en-EN", { year: "numeric", month: "long", day: "numeric" })}
					</p>
				</div>

				{userMediaStatus && (

					<div className="w-full flex sm:flex-row flex-col-reverse sm:items-center space-x-4">

						<div className="sm:w-72 w-full h-1 relative">

							<div className="w-full h-full rounded-full bg-neutral-800 absolute" />
							<div
								style={{
									width: `${(userMediaStatus.progress_sec / userMediaStatus.duration_sec) * 100}%`
								}}
								className="h-full rounded-full bg-yellow-400 absolute"
							/>

						</div>

						<p className="text-sm text-neutral-300 sm:mb-0 mb-1">
							<span>{formatTimeHuman(userMediaStatus.progress_sec)} watched</span>
							&nbsp;of&nbsp;
							<span>{formatTimeHuman(userMediaStatus.duration_sec)}</span>
						</p>

					</div>

				)}

				<div className="flex space-x-4">

					{isStreamAvailable ? (

						<Link
							href={`/watch/${movieDetails.id}`}
							className="capitalize bg-white text-black text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
						>
							<Play className="text-black mt-0.5" fill="#000" size={16} />
							<span>{userMediaStatus ? "Resume" : "Watch Now"}</span>
						</Link>

					) : (

						<SuggestContentButton mediaId={mediaId} />

					)}

					<AddToWatchlist
						isAdded={isMovieInWatchlist}
						mediaId={mediaId}
					/>

				</div>

			</MovieOverview>

		</div>

	);

};