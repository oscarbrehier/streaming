import { constructImg } from "@/lib/tmdb/constructImg";
import { formatTimeHuman } from "@/utils/timeFormat";
import Link from "next/link";

export function EpisodeList({
	episodes
}: {
	episodes: Episode[]
}) {

	return (

		<div className="w-full grid grid-cols-1 gap-12">

			{episodes.map((episode) => (

				<div
					key={episode.episode_number}
					className="flex items-center space-x-10"
				>

					<div>
						<p className="text-ink3 font-jet-mono">{episode.episode_number}</p>
					</div>

					<Link
						href={`/watch/${episode.show_id}/${episode.season_number}/${episode.episode_number}`}
						className="h-52 aspect-video rounded-2xl overflow-hidden"
					>
						<img
							className="h-full w-full"
							src={constructImg(episode.still_path)}
						/>
					</Link>

					<div className="space-y-2">
						<p className="text-lg font-semibold">{episode.name}</p>
						<p className="max-w-2xl text-ink3">{episode.overview}</p>
					</div>

				</div>

			))}

		</div>

	);

};