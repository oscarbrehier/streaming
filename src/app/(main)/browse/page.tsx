import { getGenres } from "@/lib/tmdb/api";
import { constructImg } from "@/lib/tmdb/constructImg";
import { fetchTMDB } from "@/lib/tmdb/fetchTMDB";
import { slugify } from "@/lib/tmdb/genres";

import { cn } from "@/lib/utils";
import { OrbColor, orbColorKeys, orbColors } from "@/utils/colors";
import Link from "next/link";

interface GenreCardProps {
	name: string;
	count?: number;
	color?: OrbColor;
	index?: number;
	className?: string;
	href: string;
};

export function GenreCard({ name, count, color, index, className, href }: GenreCardProps) {

	const resolvedColor = color ?? orbColorKeys[index! % orbColorKeys.length];
	const hue = `color-mix(in srgb, ${orbColors[resolvedColor]} 25%, transparent)`;

	return (

		<Link
			href={href}
			className={cn(
				"group relative h-37.5 overflow-hidden rounded-[18px]",
				"bg-[#16161b] cursor-pointer",
				"transition-transform duration-300 hover:-translate-y-1.5",
				className
			)}

			style={{
				backgroundImage: [
					`repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1.5px, transparent 1.5px, transparent 13px)`,
					`radial-gradient(130% 120% at 25% 18%, ${hue} 0%, transparent 60%)`,
					`linear-gradient(165deg, ${hue} 0%, rgba(10,10,13,0.08) 40%, rgba(10,10,13,0.85) 100%)`,
				].join(', ')
			}}
		>

			<div
				className="absolute inset-0 rounded-[18px] pointer-events-none"
				style={{
					background: 'transparent',
					boxShadow: `inset -1px -1px 0px color-mix(in srgb, ${orbColors[resolvedColor]} 15%, transparent)`,
				}}
			/>

			<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,8,11,0.75),transparent_70%)]" />

			<div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0
                shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)]
                transition-opacity duration-300 group-hover:opacity-100"
			/>

			<div className="absolute left-5.5 top-5 text-[23px] font-bold tracking-[-0.6px] text-ink">
				{name}
			</div>

		</Link>

	);

};

async function getNewReleasesThisWeek() {
	const now = new Date();
	const thirtyDaysAgo = new Date(now);
	thirtyDaysAgo.setDate(now.getDate() - 30);

	const fmt = (d: Date) => d.toISOString().split('T')[0];

	const data = await fetchTMDB<{ results: any[] }>(
		`/discover/movie`
		+ `?sort_by=vote_average.desc`
		+ `&primary_release_date.gte=${fmt(thirtyDaysAgo)}`
		+ `&primary_release_date.lte=${fmt(now)}`
		+ `&vote_count.gte=50`
		+ `&vote_average.gte=7.0`
		+ `&with_original_language=en|fr|it|ja|de|ko`
	);

	return data.results ?? [];

};

export default async function Page() {

	const genres = await getGenres();
	const newReleases = await getNewReleasesThisWeek();

	return (

		<div className="p-20 space-y-20">

			<div>
				<p className="text-5xl font-bold">Browse</p>
				<p className="text-ink2 mt-4">Find something by mood, genre, or format.</p>
			</div>

			<div className="">

				<p className="text-2xl font-semibold mb-8">Genres</p>

				<div className="grid grid-cols-6 gap-4">

					{genres.result?.map((genre, i) => (
						<GenreCard key={genre.id} href={`browse/${slugify(genre.name)}`} name={genre.name} index={i} />
					))}

				</div>

			</div>


			<div className="">

				<div className="flex items-end space-x-4">
					<p className="text-2xl font-semibold mb-8">New this week</p>
				</div>

				<div className="grid grid-cols-8 gap-6">

					{newReleases.map((movie) => (

						<Link
							key={movie.id}
							href={`/movie/${movie.id}`}
							className="group relative w-full h-96 rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
							style={{
								backgroundImage: `url(${constructImg(movie.poster_path)})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							}}
						>

							<div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,13,0.95)_0%,rgba(10,10,13,0.4)_40%,transparent_100%)]" />

							<div
								className="absolute inset-0 rounded-[inherit] pointer-events-none"
								style={{
									boxShadow: `inset -1px -1px 0px rgba(255,255,255,0.06)`,
								}}
							/>

							<div className="absolute bottom-5 left-5 right-5">
								<p className="text-[15px] font-semibold tracking-[-0.3px] text-ink leading-snug">
									{movie.title}
								</p>
								<p className="text-[11px] mt-1 text-ink3 font-mono tracking-[0.4px] uppercase">
									{movie.release_date?.split('-')[0]}
								</p>
							</div>

						</Link>


					))}

				</div>

			</div>

		</div>

	);

};