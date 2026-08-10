import { BackdropCard } from "@/components/cards/Backdrop";
import { EmptyState } from "@/components/EmptyState";
import { getFromCountry } from "@/lib/tmdb/editorial";
import { getCountryName } from "@/utils/format";

export default async function Page({
	params,
	searchParams
}: {
	params: Promise<{ code: string }>;
	searchParams: Promise<{ decade?: string }>;
}) {

	const { code } = await params;
	const { decade: decadeParam } = await searchParams;

	const decade = decadeParam ? parseInt(decadeParam) : 1970;
	const countryName = getCountryName(code);

	const items = await getFromCountry(code, decade, 40);


	return (

		<div className="w-full xl:p-20 lg:p-10 p-6 space-y-10">

			<div>
				<p className="text-5xl font-bold uppercase">{countryName}</p>
				<p className="text-ink2">{decade}s</p>
			</div>

			{items.length > 0 ? (

				<div className="w-full grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-1">
					{items.map(item => (
						<BackdropCard key={item.id} media={item as any} />
					))}
				</div>

			) : (

				<EmptyState
					title={`No films found`}
					description={`No results for ${countryName} in the ${decade}s.`}
				/>

			)}

		</div>

	);

};