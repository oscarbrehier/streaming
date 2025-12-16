import { constructImg } from "@/lib/tmdb/constructImg";
import { getWatchlist } from "@/utils/db/watchlist";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session?.access_token) redirect("/login");

	const watchlist = await getWatchlist();

	return (

		<div className="h-auto w-full sm:p-8 p-4">

			<h1 className="text-neutral-100 text-5xl font-bold tracking-tight text-balance mb-20">Watchlist</h1>

			<div className="flex flex-col space-y-4">

				{
					watchlist.map((movie) => (

						<Link
							key={movie.id}
							href={`/movie/${movie.id}`}
							className="relative h-96 w-full bg-foreground rounded-3xl bg-cover bg-center p-4 overflow-hidden"
							style={{ backgroundImage: `url(${constructImg(movie.backdrop_path)})` }}
						>

							<div className="absolute inset-0 backdrop-blur-md bg-black/15"></div>

							<div className="relative h-full flex space-x-10">

								<img className="h-full rounded-2xl" src={constructImg(movie.poster_path)} alt={`poster_${movie.id}`} />

								<div className="w-full max-w-3xl mt-10">

									<p className="text-neutral-100 text-2xl font-semibold tracking-tight text-balance mb-4">{movie.title}</p>
									<p>{movie.overview}</p>

								</div>

							</div>

						</Link>

					))
				}

			</div>

		</div>

	);

};