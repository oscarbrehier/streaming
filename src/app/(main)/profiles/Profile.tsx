"use client"

import { buildGradient, orbGradients } from "@/utils/colors";
import { setActiveProfile } from "@/utils/profiles";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function Profile({
	profile,
	onSelect
}: {
	profile: ViewingProfile;
	onSelect?: (profile: ViewingProfile) => void;
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

	async function handleClick() {
		onSelect ? onSelect(profile) : select()
	};

	return (

		<button
			onClick={handleClick}
			className="flex flex-col items-center space-y-4 select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 relative"
		>

			{profile.pin_hash && (

				<div className="absolute top-2 right-2 bg-panel/40 rounded-full p-2">
					<Lock size={12} className="text-ink/90" />
				</div>

			)}

			<div
				className="size-40 rounded-3xl flex items-center justify-center"
				style={{
					background: buildGradient(profile.avatar_url)
				}}
			>
				<p className="text-7xl font-bold text-ink uppercase">{profile.name.slice(0, 1)}</p>
			</div>

			<p className="text-ink/70">{profile.name}</p>

		</button>

	);

};