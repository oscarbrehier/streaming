import { BackdropCard } from "@/components/cards/Backdrop";
import { EmptyState } from "@/components/EmptyState";
import { getClassics, getCollection } from "@/lib/tmdb/editorial";
import { notFound } from "next/navigation";

export default async function Page({
	params
}: {
	params: Promise<{ slug: string }>
}) {

	const { slug } = await params;

	let label: string;
	let items: MovieDetails[];

	if (slug === "classics") {

		label = "Classics";
		items = await getClassics(40);

	} else {

		const collection = await getCollection(slug, 40);
		if (!collection) notFound();

		label = collection.label;
		items = collection.items;

	};

	return (

		<div className="w-full xl:p-20 lg:p-10 p-6 space-y-10">

			<div>
				<p className="text-5xl font-bold uppercase">{label}</p>
			</div>

			{items.length > 0 ? (

				<div className="w-full grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-1">
					{items.map(item => (
						<BackdropCard key={item.id} media={item as any} />
					))}
				</div>

			) : (

				<EmptyState
					title="Nothing here yet"
					description="Check back later."
				/>

			)}

		</div>

	);

};