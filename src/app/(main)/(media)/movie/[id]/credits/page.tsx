import { CreditCard } from "@/components/cards/Credit";
import { constructImg } from "@/lib/tmdb/constructImg";
import { getMovie, getMovieCredits, getAllCredits } from "@/lib/tmdb/movie";
import Link from "next/link";

export default async function Page({
	params
}: {
	params: Promise<{ id: string }>
}) {

	const { id } = await params;

	const movie = await getMovie(id, { credits: true });
	const everyone = getAllCredits(movie.credits);

	return (

		<div className="min-h-screen w-full relative">

			<div
				className="h-[40vh] w-full bg-cover bg-center absolute"
				style={{ backgroundImage: `url(${constructImg(movie.backdrop_path)})` }}
			/>

			<div className="h-[40vh] w-full absolute top-0 left-0 bg-linear-to-t from-bg/50 to-transparent z-10" />

			<div className="absolute top-10 left-40 z-40">
				<Link href={`/movie/${id}`}>
					<span className="uppercase text-xs text-ink/70">{"<"} back to movie page</span>
				</Link>
			</div>

			<div className="h-[40vh] w-full absolute top-0 left-0 z-20 flex items-end px-40 pb-10">
				<div className="flex flex-col">
					<p className="uppercase text-5xl font-semibold">{movie.title}</p>
					<p className="uppercase font-semibold text-xl">cast & crew</p>
				</div>
			</div>

			<div className="relative z-20 pt-[40vh] mt-20 p-40">

				<div
					className="grid grid-cols-10 gap-1"
				>
					{everyone.map((person, i) => (
						<CreditCard key={`${person.id}-${i}`} person={person} />
					))}
				</div>

			</div>

		</div>

	);

};