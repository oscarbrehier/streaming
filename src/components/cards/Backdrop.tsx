"use client"

import { constructImg } from "@/lib/tmdb/constructImg";
import { cn } from "@/lib/utils";
import { getCountryName } from "@/utils/format";
import { Play, Check } from "lucide-react";
import Link from "next/link";

export function BackdropCard({
	media,
	loading = "lazy",
	progress,
	director,
}: {
	media: SearchResult;
	loading?: "eager" | "lazy";
	progress?: UserMediaStatus;
	director?: string;
}) {

	const progressPercent = progress
		? Math.round((progress.progress_sec / progress.duration_sec) * 100)
		: null;

	const releaseYear = (media.release_date ?? media.first_air_date)?.split("-")[0];
	const country = getCountryName(media.origin_country?.[0] ?? media.production_countries?.[0]?.iso_3166_1);

	const mediaType = media.mediaType ?? (media as any)?.media_type;
	const href = mediaType ? `/${mediaType}/${media.id}` : undefined;

	const Wrapper = href
		? ({ children }: { children: React.ReactNode }) => (
			<Link href={href} className="flex flex-col group">{children}</Link>
		)
		: ({ children }: { children: React.ReactNode }) => (
			<div className="flex flex-col group">{children}</div>
		);

	return (

		<Wrapper>

			<div
				className={cn(
					"aspect-video overflow-hidden relative bg-panel bg-cover bg-center bg-no-repeat"
				)}
				style={{ backgroundImage: `url(${constructImg(media.backdrop_path)})` }}
			>

				<div className={cn(
					"absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent",
					href && "transition-opacity duration-300 group-hover:opacity-80"
				)} />

				{href && (
					<div className={cn(
						"absolute inset-0 flex items-center justify-center",
						"opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					)}>
						<div className="bg-ink rounded-full p-4">
							<Play size={14} className="text-bg" fill="#0a0a0d" />
						</div>
					</div>
				)}

				{progressPercent !== null && (
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
						<div
							className="h-full bg-olive transition-all duration-300"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
				)}

				{progress?.completed && (
					<div className="absolute top-3 right-3 bg-olive/90 p-1">
						<Check size={12} className="text-white" />
					</div>
				)}

				<div className="absolute left-0 right-0 bottom-4 px-4">

					<p className="text-ink text-xl font-semibold truncate uppercase leading-tight pr-4">{media.title ?? media.name}</p>
					<div className="flex space-x-2">
						{director && <p className="uppercase text-sm font-bold">{director}</p>}
						{country && <p className="uppercase text-sm">{country}</p>}
						{releaseYear && <p className="text-sm">{releaseYear}</p>}
					</div>

				</div>

			</div>

		</Wrapper >

	);

};