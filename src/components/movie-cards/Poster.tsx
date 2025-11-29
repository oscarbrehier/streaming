"use client"

import { constructImg } from "@/utils/tmdb/constructImg";
import Image from "next/image";
import Link from "next/link";

export function MoviePosterCard({
	movie
}: {
	movie: MovieSummary
}) {

	return (

		<Link
			href={`/movie/${movie.id}`}
			key={movie.id}
			className="relative aspect-2/3 w-full overflow-hidden rounded-4xl shadow"
		>
			<Image
				src={constructImg(movie.poster_path ?? "")}
				alt={movie.title}
				fill
				className="object-cover"
			/>
		</Link>

	);

};
