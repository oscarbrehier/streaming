import { Button } from "@/components/Button";
import { getSeason, getSerie, getSeriesCredits } from "@/lib/tmdb/series";
import { AddToWatchlist } from "../../../movie/[id]/AddToWatchlist";
import { Play } from "lucide-react";
import { Pill } from "@/components/Pill";
import { constructImg } from "@/lib/tmdb/constructImg";
import { EpisodeList } from "../EpisodeList";
import { Dropdown } from "@/components/Dropdown";
import { SeasonSelector } from "../SeasonSelector";

export default async function Page({
	params
}: {
	params: Promise<{ id: string, season: string }>
}) {

	const { id, season: seasonNum } = await params;

	const data = await getSerie(id);
	const credits = await getSeriesCredits(id);

	const season = await getSeason(id, seasonNum);

	const match = Math.round(data.vote_average * 10);

	return (

		<div className="h-auto min-h-screen w-full relative">

			<div
				style={{
					backgroundImage: `
							linear-gradient(to top, var(--color-bg) 0%, transparent 40%),
							linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0)),
							url('${constructImg(data.backdrop_path!)}')
		`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:block hidden"
			/>

			<div
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0)), url('${constructImg(data.poster_path!)}')`
				}}
				className="h-screen w-full absolute bg-cover bg-center top-0 left-0 md:hidden block"
			/>

			<div className="h-auto absolute top-[45%] left-0 sm:p-20 p-4 w-full space-y-10 flex flex-col items-start">

				<div>

					{data.images.logos[0] ? (
						<img
							className="md:h-20 h-12 block"
							src={constructImg(data.images.logos[0].file_path)}
							alt=""
						/>
					) : (
						<h1 className="text-neutral-100 text-6xl font-extrabold tracking-tight text-balance">
							{data.name}
						</h1>
					)}

				</div>

				<div className="flex items-center space-x-4 text-ink/70">

					<p className="text-mint font-semibold">{match}% match</p>

					<p>{data.first_air_date?.split('-')[0]}</p>

					<div className="size-1 rounded-full bg-ink/38" />

					<p>{data.genres[0].name}</p>

				</div>

				<div className="flex space-x-4">

					<Button
						href={`/watch/${id}`}
						label="Play"
						icon={<Play className="text-black mt-0.5" fill="#000" size={16} />}
					/>

					<AddToWatchlist mediaId={id} />

				</div>

				<p className="text-ink/70 w-full max-w-2xl mt-20 tracking-wide">
					{data.overview}
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

					{data.created_by?.length > 0 && (
						<div className="w-full flex items-center border-t border-ink4/38 py-4">
							<div className="w-40">
								<p className="uppercase text-ink3 font-jet-mono text-sm">created by</p>
							</div>
							<div className="flex space-x-4 text-ink2">
								{data.created_by.map((c, i) => (
									<span key={c.id} className="flex items-center gap-4 text-sm">
										{i !== 0 && <span className="text-ink3">·</span>}
										{c.name}
									</span>
								))}
							</div>
						</div>
					)}

					<div className="w-full flex items-center border-t border-ink4/38 py-4">
						<div className="w-40">
							<p className="uppercase text-ink3 font-jet-mono text-sm">produced by</p>
						</div>
						<div className="flex space-x-4 text-ink2">
							{data.production_companies
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
							{data.genres.map((g, i) => (
								<span key={g.id} className="flex items-center gap-4 text-sm">
									{i !== 0 && <span className="text-ink3">·</span>}
									{g.name}
								</span>
							))}
						</div>
					</div>

				</div>

				<div className="w-full mt-10 space-y-16">

					<div
						className="w-full flex items-center space-x-6"
					>
						<p className="text-xl font-semibold">Episodes</p>

						<SeasonSelector
							seriesId={id}
							numberOfSeasons={data.number_of_seasons}
							currentSeason={seasonNum}	
						/>

					</div>

					{season?.episodes && (
						<EpisodeList episodes={season.episodes} />
					)}

				</div>

				{/* <div className="mt-10 space-y-6">

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

				</div> */}

			</div>

		</div>

	);

};