import { Button } from "@/components/Button";
import { BackdropCard } from "@/components/cards/Backdrop";
import { EmptyState } from "@/components/EmptyState";
import { getWatchHistory } from "@/utils/supabase/queries/userMedia";

export default async function Page() {

	const history = await getWatchHistory();

	return (

		<div className="w-full xl:p-20 lg:p-10 p-6 space-y-20 relative flex flex-col">

			<div>
				<p className="text-5xl font-bold uppercase">History</p>
				<p className="text-ink2">Everything you've watched — pick up where you left off.</p>
			</div>

			{history.length > 0 ? (

				<div className="w-full grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-1">
					{history.map((item) => (
						<BackdropCard
							key={item.id}
							media={item}
							progress={item.mediaStatus}
							director={item.credits?.crew?.find(c => c.job === "Director")?.name}
						/>
					))}
				</div>

			) : (

				<EmptyState
					title="Nothing watched yet"
					description="Start watching something to see it here."
				>
					<Button href="/search" label="Explore titles" />
				</EmptyState>

			)}

		</div>

	);

};