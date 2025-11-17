import { constructImg } from "@/utils/tmdb/constructImg";
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

		<div className="absolute bottom-10 left-10 space-y-6 flex flex-col items-start">

			<GenreTags genres={movie.genres} />

			{logo && (
				<img
					className="h-12"
					src={constructImg(logo.file_path)}
					alt=""
				/>
			)}

			<p className="text-stone-100 w-1/3">
				{
					movie.overview
				}
			</p>

			<div className="flex space-x-4">
				{children}
			</div>

		</div>

	);

};