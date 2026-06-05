import { createClient } from "@/utils/supabase/server";
import { constructImg } from "@/lib/tmdb/constructImg";
import { getMovieCredits, getMovie, getMovieVideos } from "@/lib/tmdb/movie";
import { Play } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isInWatchlist } from "@/utils/db/watchlist";
import { AddToWatchlist } from "./AddToWatchlist";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TYPE_ORDER = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"];

export default async function Page({
	params
}: PageProps) {

	const { id: mediaId } = await params;

	const movie = await getMovie(mediaId);
	const credits = await getMovieCredits(mediaId);
	const isMovieInWatchlist = await isInWatchlist(mediaId);

	const videos = await getMovieVideos(mediaId);

	let userMediaStatus: UserMediaStatus | null = null;

	const supabase = await createClient();

	const { data: { session } } = await supabase.auth.getSession();
	if (!session) redirect("/login");

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

	const match = Math.round(movie.vote_average * 10);

	return (

		<div className="h-auto min-h-screen w-full relative">

			<div
				style={{
					backgroundImage: `
							linear-gradient(to top, var(--color-bg) 0%, transparent 40%),
							linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0)),
							url('${constructImg(movie.backdrop_path!)}')
        `
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:block hidden"
			/>

			<div
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${constructImg(movie.poster_path!)}')`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:hidden block"
			/>

			<div className="h-auto absolute top-[45%] left-0 sm:p-20 p-4 w-full space-y-10 flex flex-col items-start">

				<div>

					{movie.images.logos[0] ? (
						<img
							className="md:h-20 h-12 block"
							src={constructImg(movie.images.logos[0].file_path)}
							alt=""
						/>
					) : (
						<h1 className="text-neutral-100 text-6xl font-extrabold tracking-tight text-balance">
							{movie.title}
						</h1>
					)}

				</div>

				<div className="flex items-center space-x-4 text-ink/70">

					<p className="text-mint font-semibold">{match}% match</p>

					<p>{movie.release_date?.split('-')[0]}</p>

					<div className="size-1 rounded-full bg-ink/38" />

					<p>{movie.genres[0].name}</p>

				</div>

				<div className="flex space-x-4">

					<Button
						href={`/watch/${mediaId}`}
						label="Play"
						icon={<Play className="text-black mt-0.5" fill="#000" size={16} />}
					/>

					<AddToWatchlist mediaId={mediaId} />

				</div>

				<p className="text-ink/70 w-full max-w-2xl mt-20 tracking-wide">
					{movie.overview}
				</p>

				<div className="flex space-x-4">
					{credits?.cast
						.filter((c) => c.known_for_department === "Acting")
						.slice(0, 3)
						.map((m) => (

							<Pill
								key={m.id}
								label={m.name}
							/>

						))}
				</div>

				<div className="w-full">

					<div className="w-full flex items-center border-t border-ink4/38 py-4">
						<div className="w-40">
							<p className="uppercase text-ink3 font-jet-mono text-sm">director</p>
						</div>
						<div className="flex space-x-4 text-ink2">
							{credits?.crew
								.filter((c) => c.job === "Director")
								.map((c, i) => (
									<span key={c.id} className="flex items-center gap-4 text-sm">
										{i !== 0 && <span className="text-ink3">·</span>}
										{c.name}
									</span>
								))}
						</div>
					</div>

					<div className="w-full flex items-center border-t border-ink4/38 py-4">
						<div className="w-40">
							<p className="uppercase text-ink3 font-jet-mono text-sm">screenplay</p>
						</div>
						<div className="flex space-x-4 text-ink2">
							{credits?.crew
								.filter((c) => c.job === "Screenplay")
								.map((c, i) => (
									<span key={c.id} className="flex items-center gap-4 text-sm">
										{i !== 0 && <span className="text-ink3">·</span>}
										{c.name}
									</span>
								))}
						</div>
					</div>

					<div className="w-full flex items-center border-t border-ink4/38 py-4">
						<div className="w-40">
							<p className="uppercase text-ink3 font-jet-mono text-sm">produced by</p>
						</div>
						<div className="flex space-x-4 text-ink2">
							{movie.production_companies
								?.slice(0, 3).map((c, i) => (
									<span key={c.id} className="flex items-center gap-4 text-sm">
										{i !== 0 && <span className="text-ink3">·</span>}
										{c.name}
									</span>
								))}
						</div>
					</div>

					<div className="w-full flex items-center border-t border-ink4/38 py-4">
						<div className="w-40">
							<p className="uppercase text-ink3 font-jet-mono text-sm">genres</p>
						</div>
						<div className="flex space-x-4 text-ink2">
							{movie.genres.map((g, i) => (
								<span key={g.id} className="flex items-center gap-4 text-sm">
									{i !== 0 && <span className="text-ink3">·</span>}
									{g.name}
								</span>
							))}
						</div>
					</div>

				</div>

				<div className="mt-10 space-y-6">

					<p className="text-xl font-semibold">Trailers & extras</p>

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

									<div className="relative h-52 aspect-video rounded-2xl overflow-hidden">
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

			</div>

		</div>

	);

};