"use client"

import { constructImg } from "@/utils/tmdb/constructImg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function TopToday({
	data
}: {
	data: MovieSummary[]
}) {

	const [itemsPerSlide, setItemsPerSlide] = useState(6);

	const chunkedData = [];
	for (let i = 0; i < data.length; i += itemsPerSlide) {
		chunkedData.push(data.slice(i, i + itemsPerSlide));
	};

	const [translateOffset, setTranslateOffset] = useState(0);
	const totalSlides = chunkedData.length;
	const maxOffset = (totalSlides - 1) * -100;

	const handleTranslateLeft = () => {
		setTranslateOffset(prev =>
			prev === maxOffset ? 0 : prev - 100
		);
	};

	const handleTranslateRight = () => {
		setTranslateOffset(prev =>
			prev === 0 ? maxOffset : prev + 100
		);
	};

	return (

		<div className="relative w-full max-w-7xl w overflow-x-clip mt-20 h-auto flex flex-col space-y-2">

			<div className="flex space-x-2">

				<p
					className="text-2xl font-medium"
				>
					Top Today
				</p>

			</div>

			<div
				className="w-full relative flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(${translateOffset}%)` }}
			>

				{chunkedData.map((chunk, index) => (

					<div
						key={index}
						style={{ gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))`, }}
						className="w-full grid grid-cols-5 gap-4 shrink-0"
					>

						{chunk.map(movie => (
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
						))}

					</div>

				))}

			</div>

			<button
				onClick={handleTranslateLeft}
				className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-neutral-300/10 backdrop-blur-md rounded-full ring-neutral-300/30 ring-1 shadow-xl cursor-pointer"
			>
				<ChevronLeft />
			</button>

			<button
				onClick={handleTranslateRight}
				className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-neutral-300/10 backdrop-blur-md rounded-full ring-neutral-300/30 ring-1 shadow-xl cursor-pointer"
			>
				<ChevronRight />
			</button>

		</div>

	);

};