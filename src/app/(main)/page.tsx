import { Carousel } from "@/components/Carousel";
import { HeroBanner } from "@/components/HeroBanner";
import { MoviePosterCard } from "@/components/movie-cards/Poster";
import { createClient } from "@/utils/supabase/server";
import { fetchtTMDB } from "@/utils/tmdb/fetchTMDB";
import { getMovie } from "@/utils/tmdb/getMovie";
import { redirect } from "next/navigation";

async function getRecentlyWatched(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<MovieSummary[] | null> {

	const { data, error } = await supabase
		.from("user_media_status")
		.select("*")
		.eq("user_id", userId);

	if (error || !data || data.length === 0) return null;

	const movies = [];

	for (const entry of data) {

		try {

			const movie = await getMovie<MovieSummary>(entry.media_id);
			if (movie) movies.push(movie);

		} catch (err) { }

	};

	return movies;

};

export default async function Page() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const topToday = await fetchtTMDB<MovieSearchResponse>("/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc");
	const recentlyWatched = await getRecentlyWatched(supabase, user.id);

	return (

		<div className="h-auto w-full px-8 pb-8 dark flex flex-col items-center">

			<HeroBanner />

			<div className="h-[85vh] w-full"></div>

			<div className="w-full flex flex-col items-center space-y-10">

				<Carousel
					data={topToday.results.slice(0, 12)}
					card={MoviePosterCard}
					title="Top Today"
				/>

				{recentlyWatched && (
					<Carousel
						data={recentlyWatched}
						card={MoviePosterCard}
						title="Continue Watching"
					/>
				)}

			</div>

		</div>

	);

};
