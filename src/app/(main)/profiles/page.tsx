import { Button } from "@/components/Button";
import { getUserViewingProfiles } from "@/utils/profiles";
import { Plus } from "lucide-react";
import { Profile } from "./Profile";

export default async function Page() {

	const profiles = await getUserViewingProfiles();

	return (

		<div className="h-screen w-full flex flex-col items-center justify-center space-y-20">

			<p className="text-5xl font-bold text-ink">Who's watching?</p>

			<div className="w-full flex justify-center space-x-8">

				{profiles.map((p) => (

					<Profile
						key={p.id}
						profile={p}
					/>

				))}

				<div
					className="flex flex-col items-center space-y-4 select-none"
				>

					<div className="size-40 rounded-2xl flex items-center justify-center border-4 border-ink/10 border-dotted">
						{/* <p className="text-7xl font-bold text-ink">{p.name.slice(0, 1)}</p> */}
						<Plus className="" size={40} />
					</div>

					<p className="text-ink/70">Add profile</p>

				</div>

			</div>

		</div>

	);

};