import { Button } from "@/components/Button";
import { getUserViewingProfiles } from "@/utils/profiles";
import { Plus } from "lucide-react";
import { Profile } from "./Profile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AddProfileButton } from "./AddProfileButton";

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

				<AddProfileButton />

			</div>

			<Link
				href="/profiles/manage"
				className={cn(
					"capitalize text-md h-12 px-6 rounded-full cursor-pointer flex items-center justify-center sm:space-x-4",
					"bg-panel border border-ink/10"
				)}>
				manage profiles
			</Link>

		</div>

	);

};