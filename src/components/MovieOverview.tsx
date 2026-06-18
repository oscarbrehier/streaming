import { constructImg } from "@/lib/tmdb/constructImg";
import { GenreTags } from "./GenreTags";
import React from "react";
import { getCountryName } from "@/utils/format";
import Link from "next/link";

export function MovieOverview({
	data,
	children,
}: {
	data: MovieDetailsWithImages;
	children?: React.ReactNode;
}) {

	const logo = data.images.logos[0];
	const director = data.credits?.crew?.find(c => c.job === "Director");
	const releaseYear = (data.release_date ?? data.first_air_date)?.split("-")[0];
	const country = getCountryName(data.origin_country?.[0] ?? data.production_countries?.[0]?.iso_3166_1);

	return (

		<div className="absolute left-0 bottom-0 sm:p-20 p-4 w-full space-y-10 flex flex-col items-start">

			{logo ? (
				<img
					className="md:h-20 h-12 block"
					src={constructImg(logo.file_path)}
					alt=""
				/>
			) : (
				<h1 className="text-neutral-100 text-6xl font-extrabold tracking-tight text-balance">{data.title}</h1>
			)}

			<div className="flex space-x-4 mt-2">
				{director && <Link href={`/person/${director.id}`} className="uppercase text-sm font-bold hover:underline">{director.name}</Link>}
				{country && <p className="uppercase text-sm">{country}</p>}
				{releaseYear && <p className="text-sm">{releaseYear}</p>}
			</div>

			<p className="text-ink/70 w-full max-w-2xl text-sm">
				{
					data.overview
				}
			</p>

			<div className="w-full flex flex-col items-start space-y-10">
				{children}
			</div>

		</div>

	);

};