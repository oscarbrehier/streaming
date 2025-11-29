"use client"

import { constructImg } from "@/utils/tmdb/constructImg";
import Image from "next/image";
import Link from "next/link";

export function MoviePosterCard({
	movie,
	action
}: {
	movie: MovieSummary
	action?: string
}) {

	return (

		<Link
			href={action ?? `/movie/${movie.id}`}
			key={movie.id}
			className="relative aspect-2/3 w-full group"
		>
			
			<Image
				src={constructImg(movie.poster_path ?? "")}
				alt={movie.title}
				fill
				className="object-cover rounded-4xl shadow"
			/>
			
		</Link>

	);

};
