import { Button } from "@/components/Button";
import { getUserViewingProfiles } from "@/utils/profiles";
import { Plus } from "lucide-react";
import { Profile } from "./Profile";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

				<Link
					href={"/profiles/new"}
					className="flex flex-col items-center space-y-4 select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
				>

					<div className="size-40 rounded-2xl flex items-center justify-center border-4 border-ink/10 border-dotted">
						<Plus className="" size={40} />
					</div>

					<p className="text-ink/70">Add profile</p>

				</Link>

			</div>

			<button className={cn(
				"capitalize text-md h-12 px-6 rounded-full cursor-pointer flex items-center justify-center sm:space-x-4",
				"bg-panel border border-ink/10"
			)}>
				manage profiles
			</button>

		</div>

	);

};