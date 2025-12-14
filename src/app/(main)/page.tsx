import { Carousel } from "@/components/Carousel";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieCardItem, MoviePosterCard } from "@/components/movie-cards/Poster";
import { getRecentlyWatched } from "@/utils/supabase/queries/userMedia";
import { createClient } from "@/utils/supabase/server";
import { fetchtTMDB } from "@/lib/tmdb/fetchTMDB";
import { redirect } from "next/navigation";
import { getWatchlist } from "@/utils/db/watchlist";

type CarouselItem<T extends { id: number }> = {
	data: T[],
	card: (props: { movie: T }) => React.ReactNode,
	title: string
}

export default async function Page() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const topToday = await fetchtTMDB<MovieSearchResponse>("/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc");
	const recentlyWatched = await getRecentlyWatched(supabase, user.id);
	const watchlist = await getWatchlist();

	const carousels: CarouselItem<MovieCardItem>[] = [
		{ data: topToday.results.slice(0, 12), card: MoviePosterCard, title: "Top Today" },
		{ data: recentlyWatched, card: MoviePosterCard, title: "Continue Watching" },
		{ data: watchlist, card: MoviePosterCard, title: "Watchlist" },
	];

	return (

		<div className="h-auto w-full pb-8 dark flex flex-col items-center">

			<HeroBanner />

			<div className="w-full flex flex-col items-center space-y-10 mt-10">

				{carousels.map((item, idx) => (
					item.data.length > 0 && <Carousel
						key={idx}
						data={item.data}
						card={item.card}
						title={item.title}
					/>
				))}

			</div>

		</div>

	);

};
