"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const MAX_ITEMS_PER_SLIDE = 8;

export type CarouselCard<T extends { id: number }> = (props: { media: T, loading: "eager" | "lazy" }) => React.ReactNode;

export type CarouselItem<T extends { id: number }> = {
    data: T[],
    Card: CarouselCard<T>,
    title: string,
    ranked?: boolean
};


export function Carousel<T extends { id: number }>({
	data,
	Card,
	title,
	ranked = false,
}: CarouselItem<T>) {

	const sliderRef = useRef<HTMLDivElement>(null);
	const [itemsPerSlide, setItemsPerSlide] = useState(MAX_ITEMS_PER_SLIDE);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const handleCarouselResize = () => {
			const width = window.innerWidth;

			if (width < 450) setItemsPerSlide(1);
			else if (width < 640) setItemsPerSlide(2);
			else if (width < 768) setItemsPerSlide(4);
			else setItemsPerSlide(MAX_ITEMS_PER_SLIDE);

		};
		handleCarouselResize();
		window.addEventListener("resize", handleCarouselResize);
		return () => window.removeEventListener("resize", handleCarouselResize);
	}, [ranked]);

	useEffect(() => {
		setCurrentIndex(0);
	}, [itemsPerSlide]);

	const maxIndex = data.length - itemsPerSlide;
	const itemWidthPercent = 100 / itemsPerSlide;
	const gapPx = 16;
	const translateX = currentIndex * (itemWidthPercent / 100);

	const handleNext = () => setCurrentIndex((prev) => Math.min(prev + itemsPerSlide, maxIndex));
	const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - itemsPerSlide, 0));

	const canGoNext = currentIndex < maxIndex;
	const canGoPrev = currentIndex > 0;

	return (

		<div className="relative w-full overflow-x-clip flex flex-col space-y-2">

			<p className="text-3xl font-semibold">{title}</p>

			<div className="w-full overflow-hidden mt-8">

				<div
					ref={sliderRef}
					className="flex transition-transform duration-500 ease-in-out"
					style={{
						gap: `${gapPx}px`,
						transform: `translateX(calc(-${currentIndex} * (${itemWidthPercent}% + ${gapPx - gapPx / itemsPerSlide}px)))`,
					}}
				>

					{data.map((movie, idx) => (

						<div
							key={movie.id}
							className="shrink-0 relative aspect-2/3"
							style={{ width: `calc(${itemWidthPercent}% - ${gapPx * (itemsPerSlide - 1) / itemsPerSlide}px)` }}
						>
							<Card media={movie} loading={idx < itemsPerSlide ? "eager" : "lazy"} />
						</div>

					))}

				</div>

			</div>

			{data.length > itemsPerSlide && (
				<>

					{canGoPrev && (
						<button
							onClick={handlePrev}
							className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-neutral-300/10 backdrop-blur-md rounded-full ring-neutral-300/30 ring-1 shadow-xl cursor-pointer"
						>
							<ChevronLeft />
						</button>
					)}
					{canGoNext && (
						<button
							onClick={handleNext}
							className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-neutral-300/10 backdrop-blur-md rounded-full ring-neutral-300/30 ring-1 shadow-xl cursor-pointer"
						>
							<ChevronRight />
						</button>
					)}

				</>
			)}

		</div>

	);

};