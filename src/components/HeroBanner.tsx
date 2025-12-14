"use client"

import { Info, Play } from "lucide-react";
import Link from "next/link";
import { MovieOverview } from "./MovieOverview";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { useEffect, useState } from "react";

export function HeroBanner({
	items
}: {
	items: MovieDetailsWithImages[];
}) {

	const [visibleIdx, setVisibleIdx] = useState(0);

	useEffect(() => {

		if (items.length <= 1) return;

		const interval = setInterval(() => {
			setVisibleIdx((prev) => (prev + 1) % items.length);
		}, 5000);

		return () => clearInterval(interval);

	}, []);

	const renderIndices = items.length > 1
		? [visibleIdx, (visibleIdx + 1) % items.length]
		: [visibleIdx];

	return (

		<div className="relative h-[85vh] w-full overflow-hidden">

			{renderIndices.map((idx) => {

				const item = items[idx];
				if (!item) return null;

				const isVisible = idx === visibleIdx;

				return (

					<div
						key={item.id}
						className={`absolute top-0 left-0 h-full w-full transition-opacity duration-1000 ${isVisible ? "opacity-100 z-0" : "opacity-0 z-0"
							}`}
					>
						<div
							className="hidden md:block h-full w-full bg-cover bg-center"
							style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})` }}
						/>
						<div
							className="md:hidden block h-full w-full bg-cover bg-top"
							style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${item.poster_path})` }}
						/>
					</div>

				);

			})}

			<div className="absolute inset-0 bg-linear-to-t from-card to-transparent z-10" />

			{items[visibleIdx] && (

				<div
					className={cn("absolute inset-0 z-20 flex flex-col justify-end p-8 transition-all duration-1000 ease-in-out",
						items[visibleIdx] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					)}
					key={items[visibleIdx]!.id}
				>

					<MovieOverview movie={items[visibleIdx]}>

						<div className="flex space-x-4">

							<Link
								href={`/watch/${items[visibleIdx]!.id}`}
								className="capitalize bg-neutral-200 text-black text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center sm:space-x-4"
							>
								<Play className="text-black mt-0.5" fill="#000" size={16} />
								<span className="sm:block hidden">Watch now</span>
							</Link>

							<Link
								href={`/movie/${items[visibleIdx]!.id}`}
								className={cn(
									"capitalize text-md h-10 px-6 rounded-3xl cursor-pointer flex items-center sm:space-x-4",
									glass("active")
								)}
							>
								<Info className="text-neutral-200 mt-0.5" size={16} />
								<span className="sm:block hidden">More Info</span>
							</Link>

						</div>

					</MovieOverview>

				</div>

			)}

		</div>

	);

};