import { cn } from "@/lib/utils";
import { avatar } from "@/utils/getAvatar";
import { createClient } from "@/utils/supabase/server";

async function getPublicProfiles() {

	const supabase = await createClient();
	const { data, error } = await supabase
		.from("profiles_public")
		.select("*");

	if (error || !data || data.length === 0) return null;

	return data;

};

export default async function Page() {

	const profiles = await getPublicProfiles();
	console.log(profiles)

	return (

		<>

			<div
				className="h-[50vh] w-full absolute top-0 left-0 bg-center bg-cover rounded-b-4xl"
				style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/k86QfbIyMNEEuZ9t20TmEnVkcbq.jpg)` }}
			>

				<div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />

			</div>

			<div className="w-full h-auto sm:px-8 px-4 pt-[50vh] grid grid-cols-6 gap-4">

				{
					profiles && [...profiles, ...profiles, ...profiles, ...profiles].map(({ display_name }, idx) => (

						<div
							key={idx}
							className="aspect-square border border-input w-full rounded-4xl p-6 z-10 flex flex-col items-center justify-center space-y-4"
						>

							<img
								className="h-2/3 rounded-full"
								src={avatar(display_name + idx)}
								alt={`${display_name}'avatar`}
							/>

							<p className="text-lg font-semibold">{display_name}</p>

						</div>

					))
				}

			</div>

		</>


	);

};