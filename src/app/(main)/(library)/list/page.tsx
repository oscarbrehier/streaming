import { BackdropCard } from "@/components/cards/Backdrop";
import { getWatchlistWithProgress } from "@/utils/db/watchlist";
import { EmptyList } from "../EmptyList";

export default async function Page() {

	const watchlist = await getWatchlistWithProgress();

	return (

		<div className="w-full xl:p-20 lg:p-10 p-6 space-y-20 relative flex flex-col">

			<div>
				<p className="text-5xl font-bold uppercase">My List</p>
				<p className="text-ink2">Everything you've saved for later — pick up where you left off.</p>
			</div>

			{watchlist.length > 0 ? (
				<div className="w-full grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-1">

					{watchlist.map((item) => (
						<BackdropCard
							key={item.id}
							media={item}
							progress={item.progress}
							director={item.director}
						/>
					))}

				</div>

			) : (

				<EmptyList />

			)}


		</div>

	);

};