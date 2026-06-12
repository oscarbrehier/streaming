import { Carousel, CarouselItem } from "@/components/Carousel";
import { HeroBanner } from "@/components/HeroBanner";
import { PostCardItem, PosterCard } from "@/components/cards/Poster";
import { getRecentlyWatched } from "@/utils/supabase/queries/userMedia";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getWatchlist } from "@/utils/db/watchlist";
import { getHeroBannerItems } from "@/utils/db/featuredContent";
import { CategorySelector } from "./CategorySelector";
import { getClassics, getCollection, getCurrentCountryDecade, getCurrentDirector, getDirectorsEssential, getFeaturedFilm, getFromCountry, getHiddenGems, getRecentAcclaimed, getWorldCinema } from "@/lib/tmdb/editorial";
import { BackdropCard } from "@/components/cards/Backdrop";

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

	const watchlist = await getWatchlist(mediaType);
	const recentlyWatched = await getRecentlyWatched(user.id);

	const director = getCurrentDirector();
	const directorsEssential = await getDirectorsEssential(director);

	const classics = await getClassics();

	const { country, decade, label } = getCurrentCountryDecade();
	const fromCountry = await getFromCountry(country, decade);

	const collection = await getCollection("french_new_wave");

	const carousels: CarouselItem<any>[] = [
		{ data: directorsEssential?.items ?? [], Card: BackdropCard, title: `Essential ${directorsEssential?.director ?? director}` },
		{ data: classics, Card: BackdropCard, title: "Classics" },
		{ data: fromCountry, Card: BackdropCard, title: label },
		...(collection ? [{ data: collection.items, Card: BackdropCard, title: collection.label }] : []),
		{ data: watchlist, Card: BackdropCard, title: "Watchlist" },
		{ data: recentlyWatched, Card: BackdropCard, title: "Continue Watching" },
	];


	return (

		<div className="h-auto w-full pb-8 dark flex flex-col items-center">

			<HeroBanner items={heroBannerItems} />

			{/* <CategorySelector /> */}

			<div className="w-full flex flex-col items-center mt-20 px-40 pb-20 space-y-12">

				{carousels.map((item, idx) => (
					item.data.length > 0 && (
						<Carousel
							key={idx}
							data={item.data}
							Card={item.Card}
							title={item.title}
							ranked={item.ranked}
						/>
					)
				))}

			</div>

		</div>

	);

};
