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
import { cn } from "@/lib/utils";
import { MediaRow } from "@/components/MediaRow";

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

	// const carousels: CarouselItem<any>[] = [
	// 	{ data: directorsEssential?.items ?? [], Card: BackdropCard, title: `Essential ${directorsEssential?.director ?? director}` },
	// 	{ data: classics, Card: BackdropCard, title: "Classics" },
	// 	{ data: fromCountry, Card: BackdropCard, title: label },
	// 	...(collection ? [{ data: collection.items, Card: BackdropCard, title: collection.label }] : []),
	// 	{ data: watchlist, Card: BackdropCard, title: "Watchlist" },
	// 	{ data: recentlyWatched, Card: BackdropCard, title: "Continue Watching" },
	// ];

	const rows = [
		{ data: directorsEssential?.items ?? [], title: `Essential ${directorsEssential?.director ?? director}`, href: directorsEssential?.directorId ? `/person/${directorsEssential.directorId}` : undefined },
		{ data: classics, title: "Classics", href: "/collection/classics" },
		{ data: fromCountry, title: label, href: `/country/${country}?decade=${decade}` },
		...(collection ? [{ data: collection.items, title: collection.label, href: `/collection/french_new_wave` }] : []),
		{ data: watchlist, title: "Watchlist", href: "/list" },
		{ data: recentlyWatched, title: "Continue Watching", href: "/history" },
	];

	return (

		<div className="h-auto w-full pb-8 dark flex flex-col items-center">

			<HeroBanner items={heroBannerItems} />

			{/* <CategorySelector /> */}

			<div className={cn(
				"w-full flex flex-col items-center mt-20 pb-20 space-y-12",
				"xl:px-40 lg:px-10 px-4",
			)}>

				{/* {carousels.map((item, idx) => (
					item.data.length > 0 && (
						<Carousel
							key={idx}
							data={item.data}
							Card={item.Card}
							title={item.title}
							ranked={item.ranked}
						/>
					)
				))} */}

				{rows.map((row, idx) => (
					<MediaRow key={idx} {...row} Card={BackdropCard} />
				))}

			</div>

		</div>

	);

};
