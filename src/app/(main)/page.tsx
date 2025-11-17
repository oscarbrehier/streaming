import { HeroBanner } from "@/components/HeroBanner";
import { TopToday } from "@/components/TopToday";
import { fetchtTMDB } from "@/utils/tmdb/fetchTMDB";

export default async function Page() {

	const topToday = await fetchtTMDB<MovieSearchResponse>("/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc");

	return (

		<div className="h-auto w-full px-8 pb-8 dark flex flex-col items-center">

			<HeroBanner />

			<div className="h-[85vh] w-full"></div>

			<TopToday data={topToday.results.slice(0,12)} />

		</div>

	);

};
