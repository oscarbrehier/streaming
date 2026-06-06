"use client"

import { setActiveProfile } from "@/utils/profiles";
import { useRouter } from "next/navigation";

export function Profile({
	profile
}: {
	profile: ViewingProfile;
}) {

	const router = useRouter();

	async function select() {

		try {
			await setActiveProfile(profile.id);
			router.push("/");
		} catch (err) {
			console.log("TODO_profile_id");
		};

	};

	return (

		<button
			onClick={select}
			className="flex flex-col items-center space-y-4 select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
		>

			<div className="size-40 rounded-2xl bg-olive flex items-center justify-center">
				<p className="text-7xl font-bold text-ink">{profile.name.slice(0, 1)}</p>
			</div>

			<p className="text-ink/70">{profile.name}</p>

		</button>

	);

};