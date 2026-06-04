"use client";

import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { constructImg } from "@/lib/tmdb/constructImg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export type PostCardItem = {
	id: number;
	title?: string;
	name?: string;
	poster_path: string | null;
	overview: string;
	mediaType?: MediaType;
};

export function PosterCard({
	media,
	loading = "lazy",
	action,
	hoverable
}: {
	media: PostCardItem;
	loading?: "eager" | "lazy",
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

	const displayTitle = media.title ?? media.name ?? "Unknown";
	const path = action ?? `/${media.mediaType === "tv" ? "tv" : "movie"}/${media.id}`;

	return (

		<Link
			href={isCardVisible ? "#" : (action ?? path)}
			aria-disabled="true"
			onClick={isCardVisible ? (e) => e.preventDefault() : undefined}
			className={cn("absolute aspect-2/3 w-full", isCardVisible && "cursor-auto")}
			onMouseEnter={hoverable ? handleMouseEnter : undefined}
			onMouseLeave={hoverable ? handleMouseLeave : undefined}
		>

			{hoverable && (
				<HoverCard
					media={media}
					alignRight={alignRight}
					visible={isCardVisible}
				/>
			)}

			<Image
				src={constructImg(media.poster_path ?? "")}
				alt={displayTitle}
				fill
				className="object-cover rounded-4xl shadow"
				loading={loading}
			/>

		</Link>

	);

};

function HoverCard({
	media,
	alignRight,
	visible
}: {
	media: PostCardItem;
	alignRight: boolean;
	visible: boolean;
}) {

	const router = useRouter();
	const displayTitle = media.title ?? media.name ?? "Unknown";

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
					{displayTitle}
				</p>

				<p className="text-balance line-clamp-6">
					{media.overview}
				</p>

			</div>

			<button
				onClick={() => router.push(`/${media.mediaType === "tv" ? "tv" : "movie"}/${media.id}`)}	
				className="w-full h-10 bg-neutral-200 text-neutral-800 rounded-3xl cursor-pointer">
				<p>Resume</p>
			</button>

		</div>

	);

};
