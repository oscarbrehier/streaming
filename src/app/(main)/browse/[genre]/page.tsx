import { constructImg } from "@/lib/tmdb/constructImg";
import { GENRES, getMoviesByGenre } from "@/lib/tmdb/genres";
import { orbColorKeys, orbColors } from "@/utils/colors";
import Image from "next/image";

export default async function Page({
	params
}: {
	params: Promise<{ genre: string }>
}) {

	const { genre: genreName } = await params;
	const genre = GENRES[genreName];

	const items = await getMoviesByGenre(genre.id, 1);

	const resolvedColor = orbColorKeys[genre.id! % orbColorKeys.length];
	const hue = `color-mix(in srgb, ${orbColors[resolvedColor]} 25%, transparent)`;

	return (

		<div>

			<div className="h-[33vh] w-full" style={{
				backgroundImage: [
					`repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1.5px, transparent 1.5px, transparent 13px)`,
					`radial-gradient(130% 120% at 25% 18%, color-mix(in srgb, ${hue} 25%, transparent) 0%, transparent 60%)`,
					`linear-gradient(165deg, color-mix(in srgb, ${hue} 25%, transparent) 0%, rgba(10,10,13,0.08) 40%, rgba(10,10,13,0.85) 100%)`,
				].join(', ')
			}} />

			<div className="p-20 space-y-6">


				<div className="space-y-2">
					<p className={`uppercase font-jet-mono text-sm tracking-wider`} style={{ color: orbColors[resolvedColor] }}>genre</p>
					<p className="text-7xl font-bold capitalize">{genreName}</p>
				</div>

				<p className="text-ink/70 w-full max-w-2xl tracking-wide">
					{genre.description}
				</p>


				<div className="flex items-center space-x-4 text-ink/70 font-jet-mono text-xs">

					<p className="uppercase">{items.total_results} titles</p>

					{/* <div className="size-1 rounded-full bg-ink/38" /> */}

				</div>

				<div className="w-full mt-20 px-10 overflow-y-auto grid lg:grid-cols-8 md:grid-cols-4 sm:grid-cols-2 gap-12 auto-rows-min">

					{items.results.map((item) => {

						const posterUrl = item.poster_path ? constructImg(item.poster_path) : null;
						const date = item.release_date || item.first_air_date;
						const releaseYear = date && new Date(date).getFullYear().toString();

						return (


							<div
								key={item.id}
								className="flex flex-col"
							>

								<a href={`/watch/${item.id}`} className="relative w-full rounded-2xl overflow-hidden grid grid-cols-1 grid-rows-1">

									<div className="relative w-full col-start-1 row-start-1" style={{ paddingBottom: '150%' }}>

										{posterUrl ? (
											<Image
												src={posterUrl}
												alt={item.title || item.name || "Poster"}
												fill
												className="object-cover"
												sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
											/>

										) : (

											<div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-white text-sm">
												{item.title || item.name}
											</div>

										)}
									</div>

								</a>

								<div className="mt-2">
									<p className="font-semibold">{item.title ?? item.name}</p>
									<p className="uppercase text-ink3 font-jet-mono text-sm">{releaseYear}</p>
								</div>

							</div>

						)

					})}

				</div>

			</div>

		</div>

	);

};