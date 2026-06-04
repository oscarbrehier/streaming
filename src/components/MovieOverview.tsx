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

		<div className="absolute left-0 bottom-0 sm:p-20 p-4 w-full space-y-6 flex flex-col items-start">

			{/* <GenreTags genres={movie.genres} /> */}

			{logo ? (
				<img
					className="md:h-20 h-12 block"
					src={constructImg(logo.file_path)}
					alt=""
				/>
			) : (
				<h1 className="text-neutral-100 text-6xl font-extrabold tracking-tight text-balance">{movie.title}</h1>
			)}

			<div className="flex items-center space-x-4 text-ink/70">

				<p>{movie.release_date?.split('-')[0]}</p>

				<div className="size-1 rounded-full bg-ink/38" />

				<p>{movie.genres[0].name}</p>

			</div>

			<p className="text-ink/70 w-full max-w-2xl">
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