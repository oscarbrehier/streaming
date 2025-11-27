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

		<div className="absolute left-0 bottom-0 sm:p-8 p-4 w-full space-y-6 flex flex-col items-start">

			<GenreTags genres={movie.genres} />

			{logo && (
				<img
					className="h-20 md:block hidden"
					src={constructImg(logo.file_path)}
					alt=""
				/>
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