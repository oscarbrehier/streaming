"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export function Carousel<T extends { id: number }>({
	data,
	card,
	title,
}: {
	data: T[];
	card: (props: { movie: T }) => React.ReactNode;
	title: string;
}) {

	const sliderRef = useRef<HTMLDivElement>(null);

	const [itemsPerSlide, setItemsPerSlide] = useState(6);
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		const handleCarouselResize = () => {
			const width = window.innerWidth;

			if (width < 450) setItemsPerSlide(1);
			else if (width < 640) setItemsPerSlide(2);
			else if (width < 768) setItemsPerSlide(4);
			else setItemsPerSlide(6);
		};

		handleCarouselResize();
		window.addEventListener("resize", handleCarouselResize);

		return () => window.removeEventListener("resize", handleCarouselResize);
	}, []);

	const chunkedData = useMemo(() => {
		const arr = [];
		for (let i = 0; i < data.length; i += itemsPerSlide) {
			arr.push(data.slice(i, i + itemsPerSlide));
		}
		return arr;
	}, [data, itemsPerSlide]);

	const totalSlides = chunkedData.length;

	useEffect(() => {
		setCurrentSlide(0);
	}, [itemsPerSlide]);

	const slideWidth = sliderRef.current?.clientWidth || 0;
	const translateX = -(currentSlide * slideWidth);

	const handleTranslateRight = () => {
		setCurrentSlide((prev) =>
			prev === totalSlides - 1 ? 0 : prev + 1
		);
	};

	const handleTranslateLeft = () => {
		setCurrentSlide((prev) =>
			prev === 0 ? totalSlides - 1 : prev - 1
		);
	};

	return (

		<div className="relative w-full max-w-7xl overflow-x-clip flex flex-col space-y-2">

			<div className="flex space-x-2">
				<p className="text-2xl font-medium">{title}</p>
			</div>

			<div
				ref={sliderRef}
				className="w-full relative flex transition-transform duration-500 ease-in-out"
				style={{ transform: `translateX(${translateX}px)` }}
			>

				{chunkedData.map((chunk, index) => (

					<div
						key={index}
						style={{
							gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))`,
						}}
						className="w-full grid gap-4 shrink-0 basis-full"
					>

						{chunk.map((movie) => (

							<React.Fragment key={movie.id}>
								{card({ movie })}
							</React.Fragment>

						))}

					</div>
				))}

			</div>

			{(data.length > itemsPerSlide) && (

				<>

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

				</>

			)}

		</div>

	);

};
