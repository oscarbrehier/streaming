import { Carousel, CarouselItem } from "@/components/Carousel";
import { HeroBanner } from "@/components/HeroBanner";
import { PostCardItem, PosterCard } from "@/components/movie-cards/Poster";
import { getRecentlyWatched } from "@/utils/supabase/queries/userMedia";
import { createClient } from "@/utils/supabase/server";
import { fetchtTMDB } from "@/lib/tmdb/fetchTMDB";
import { redirect } from "next/navigation";
import { getWatchlist } from "@/utils/db/watchlist";
import { getHeroBannerItems } from "@/utils/db/featuredContent";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { CategorySelector } from "./CategorySelector";
import { BlobBackground } from "@/components/BlobBackground";
import { getTopToday } from "@/lib/tmdb/api";

export default async function Page({
	searchParams
}: {
	searchParams: Promise<{ category?: string }>
}) {

	const { category = "all" } = await searchParams;
	const mediaType = category === "all" ? undefined : category === "movies" ? "movie" : "tv";

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const heroBannerItems = await getHeroBannerItems();

	const topToday = await getTopToday(mediaType);
	const watchlist = await getWatchlist(mediaType);
	const recentlyWatched = await getRecentlyWatched(user.id);

	const carousels: CarouselItem<PostCardItem>[] = [
		{ data: topToday.slice(0, 10), Card: PosterCard, title: "Top 10 Today", ranked: true },
		{ data: watchlist, Card: PosterCard, title: "Watchlist" },
		{ data: recentlyWatched, Card: PosterCard, title: "Continue Watching" },
	];

	return (

		<div className="h-auto w-full pb-8 dark flex flex-col items-center">

			<HeroBanner items={heroBannerItems} />

			<CategorySelector />

			<div className="w-full flex flex-col items-center space-y-16 mt-20 px-40">

				{carousels.map((item, idx) => (
					item.data.length > 0 && <Carousel
						key={idx}
						data={item.data}
						Card={item.Card}
						title={item.title}
						ranked={item.ranked}
					/>
				))}

			</div>

		</div>

	);

};
