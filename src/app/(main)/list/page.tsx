import { BackdropCard } from "@/components/cards/Backdrop";
import { getWatchlistWithProgress } from "@/utils/db/watchlist";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session?.access_token) redirect("/login");

	const watchlist = await getWatchlistWithProgress();

	return (

		<div className="w-full p-20 space-y-20 relative">

			<div>
				<p className="text-5xl font-bold uppercase">My List</p>
				<p className="text-ink2">Everything you've saved for later — pick up where you left off.</p>
			</div>

			<div className="w-full grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-1">

				{watchlist.map((item) => (

					<BackdropCard
						key={item.id}
						media={item}
						progress={item.progress}
						director={item.director}
					/>

				))}

			</div>

		</div>

	);

};