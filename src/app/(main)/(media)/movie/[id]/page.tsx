import { createClient } from "@/utils/supabase/server";
import { constructImg } from "@/lib/tmdb/constructImg";
import { getMovieCredits, getMovie, getMovieVideos, getTopCredits } from "@/lib/tmdb/movie";
import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isInWatchlist } from "@/utils/db/watchlist";
import { AddToWatchlist } from "./AddToWatchlist";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { getActiveProfileId } from "@/utils/profiles";
import { getCountryName } from "@/utils/format";
import { MovieOverview } from "@/components/MovieOverview";
import { CreditCard } from "@/components/cards/Credit";
import { getMediaStatus } from "@/utils/supabase/queries/userMedia";
import { formatTimeHuman } from "@/utils/timeFormat";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TYPE_ORDER = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"];

export default async function Page({
	params
}: PageProps) {

	const { id: mediaId } = await params;

	const movie = await getMovie(mediaId, { credits: true });

	const credits = movie.credits;
	const people = getTopCredits(credits);

	const videos = await getMovieVideos(mediaId);

	const mediaStatus = await getMediaStatus(mediaId);
	const watchedPercent = mediaStatus && mediaStatus.duration_sec > 0
		? Math.round((mediaStatus.progress_sec / mediaStatus.duration_sec) * 100)
		: null;

	const match = Math.round(movie.vote_average * 10);

	const playLabel = mediaStatus?.completed
		? "Watch Again"
		: watchedPercent !== null && watchedPercent > 0
			? "Continue"
			: "Play";

	const remainingSec = mediaStatus && mediaStatus.duration_sec > 0 && !mediaStatus.completed
		? mediaStatus.duration_sec - mediaStatus.progress_sec
		: null;

	return (

		<div className="min-h-screen w-full bg-bg relative">

			<div
				style={{
					backgroundImage: `
                linear-gradient(to top, var(--color-bg) 0%, transparent 40%),
                linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0)),
                url('${constructImg(movie.backdrop_path!)}')
            `
				}}
				className="h-screen w-full absolute top-0 left-0 bg-cover bg-center md:block hidden"
			/>

			<div
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${constructImg(movie.poster_path!)}')`
				}}
				className="h-screen w-full absolute top-0 left-0 bg-cover bg-center md:hidden block"
			/>

			<div className="absolute z-10 inset-0 bg-linear-to-t from-bg to-transparent" />

			<div className="relative z-20 w-full flex flex-col">

				<section className="h-screen w-full relative flex flex-col justify-end">

					<MovieOverview data={movie}>

						{watchedPercent !== null && watchedPercent > 0 && (
							<div className="space-y-2 w-full">
								<div className="h-1 w-full max-w-md bg-neutral-700 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full bg-linear-to-r from-periwinkle to-apricot"
										style={{ width: `${watchedPercent}%` }}
									/>
								</div>
								{remainingSec && (
									<p className="text-xs text-ink/50 font-jet-mono uppercase">
										{formatTimeHuman(remainingSec)} left
									</p>
								)}
							</div>
						)}

						<div className="flex space-x-4">

							<Button
								href={`/watch/${mediaId}`}
								label={playLabel}
								size="sm"
								icon={<Play className="text-black mt-0.5" fill="#000" size={16} />}
							/>

							<AddToWatchlist mediaId={mediaId} />

						</div>

					</MovieOverview>

				</section>

				<section className="px-40 pt-10 pb-20 relative space-y-20">

					<div className="space-y-2">

						<div className="w-full flex items-baseline space-x-4"
						>
							<p className="font-semibold uppercase">Cast & Crew</p>

							<Link href={`${mediaId}/credits`} className="flex items-center space-x-2">
								<span className="uppercase text-xs text-ink/70">show all ({(credits?.cast.length ?? 0) + (credits?.crew.length ?? 0)})</span>
							</Link>

						</div>

						<div className="grid grid-cols-10 gap-1">

							{people.map((person, i) => (
								<CreditCard key={`${person.id}-${i}`} person={person} />
							))}

						</div>

					</div>

					<div className="space-y-2">

						<p className="font-semibold uppercase">Trailers & extras</p>

						<div className="flex space-x-4">

							{videos
								.sort((a, b) => {
									const typeOrder = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
									if (typeOrder !== 0) return typeOrder;
									return Number(b.official) - Number(a.official);
								})
								.slice(0, 4)
								.map((v) => (

									<Link
										key={v.id}
										href={`https://www.youtube.com/watch?v=${v.key}`}
										target="blank"
										className=""
									>

										<div className="relative h-52 aspect-video overflow-hidden">
											<img
												src={`https://img.youtube.com/vi/${v.key}/hqdefault.jpg`}
												alt={v.name}
												className="w-full h-full object-cover"
											/>``
										</div>

										<div className="mt-2">
											<p className="text-sm font-medium">{v.name.length > 40 ? v.name.slice(0, 40) + '...' : v.name}</p>
											<p className="uppercase text-ink3 font-jet-mono text-xs">{v.type}</p>
										</div>

									</Link>
								))}

						</div>

					</div>

				</section>

			</div >

		</div >

	);

};