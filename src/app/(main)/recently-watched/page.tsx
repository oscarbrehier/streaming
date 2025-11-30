import { MoviePosterCard } from "@/components/movie-cards/Poster";
import { getRecentlyWatched } from "@/utils/supabase/queries/userMedia";
import { createClient } from "@/utils/supabase/server"

export default async function Page() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const recentlyWatched = await getRecentlyWatched(supabase, user!.id);

	return (

		<div className="h-auto w-full sm:p-8 p-4">

			<h1 className="text-neutral-100 text-5xl font-extrabold tracking-tight text-balance mb-20">Recently Watched</h1>

			<div className="w-full h-42 grid gap-4 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1">

				{recentlyWatched?.map((movie) => (

					<MoviePosterCard
						key={movie.id}
						movie={movie}
						action={`/watch/${movie.id}`}
						hoverable
					/>

				))}

			</div>

		</div>

	)

};