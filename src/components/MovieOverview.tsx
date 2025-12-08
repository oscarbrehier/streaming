import { constructImg } from "@/lib/tmdb/constructImg";
import { GenreTags } from "./GenreTags";
import React from "react";

export function MovieOverview({
	movie,
	children,	
}: {
	movie: MovieDetailsWithImages;
	children?: React.ReactNode;
}) {

	const logo = movie.images.logos[0];

	return (

		<div className="absolute left-16 w-[calc(100%-64px)] bottom-0 sm:p-8 p-4 space-y-6 flex flex-col items-start">

			<GenreTags genres={movie.genres} />

			{logo ? (
				<img
					className="md:h-20 h-12 block"
					src={constructImg(logo.file_path)}
					alt=""
				/>
			) : (
				<h1 className="text-neutral-100 text-6xl font-extrabold tracking-tight text-balance">{movie.title}</h1>
			)}

			<p className="text-stone-100 w-full max-w-md">
				{
					movie.overview
				}
			</p>

			<div className="w-full flex flex-col items-start space-y-4">
				{children}
			</div>

		</div>

	);

};