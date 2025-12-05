"use client";

import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { constructImg } from "@/lib/tmdb/constructImg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export function MoviePosterCard({
	movie,
	action,
	hoverable
}: {
	movie: MovieSummary;
	action?: string;
	hoverable?: boolean;
}) {

	const [alignRight, setAlignRight] = useState(false);
	const [isCardVisible, setIsCardVisible] = useState(false);
	const hoverTimer = useRef<any>(null);

	const handleMouseEnter = (e: any) => {

		const mouseX = e.clientX;
		const windowWidth = window.innerWidth;

		setAlignRight(mouseX > windowWidth / 2);

		hoverTimer.current = setTimeout(() => {
			setIsCardVisible(true);
		}, 300);

	};

	const handleMouseLeave = () => {
		clearTimeout(hoverTimer.current);
		setIsCardVisible(false);
	};

	return (

		<Link
			href={isCardVisible ? "#" : (action ?? `/movie/${movie.id}`)}
			aria-disabled="true"
			onClick={isCardVisible ? (e) => e.preventDefault() : undefined}
			className={cn("relative aspect-2/3 w-full", isCardVisible && "cursor-auto")}
			onMouseEnter={hoverable ? handleMouseEnter : undefined}
			onMouseLeave={hoverable ? handleMouseLeave : undefined}
		>

			{hoverable && (
				<HoverCard
					movie={movie}
					alignRight={alignRight}
					visible={isCardVisible}
				/>
			)}

			<Image
				src={constructImg(movie.poster_path ?? "")}
				alt={movie.title}
				fill
				className="object-cover rounded-4xl shadow"
			/>

		</Link>

	);

};

function HoverCard({
	movie,
	alignRight,
	visible
}: {
	movie: MovieSummary;
	alignRight: boolean;
	visible: boolean;
}) {

	const router = useRouter();

	return (

		<div
			style={{
				left: alignRight ? "auto" : 0,
				right: alignRight ? 0 : "auto"
			}}
			className={cn(
				"rounded-4xl origin-center z-50 absolute top-0 bg-background p-8 flex flex-col justify-between",
				glass("active", true),
				"transition-all duration-500 ease-in-out",
				"h-full w-40",
				visible
					? "opacity-100 pointer-events-auto w-96"
					: "opacity-0 pointer-events-none"
			)}
		>

			<div
				className={cn(
					"transition-opacity duration-300",
					visible ? "opacity-100 delay-300" : "opacity-0"
				)}
			>

				<p className="text-neutral-50 text-3xl font-semibold tracking-tight mb-10">
					{movie.title}
				</p>

				<p className="text-balance line-clamp-6">
					{movie.overview}
				</p>

			</div>

			<button
				onClick={() => router.push(`/watch/${movie.id}`)}
				className="w-full h-10 bg-neutral-200 text-neutral-800 rounded-3xl cursor-pointer">
				<p>Resume</p>
			</button>

		</div>

	);

};
