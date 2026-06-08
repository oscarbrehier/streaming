"use client"

import { ProfilePinDialog } from "@/components/profiles/ProfilePinDialog";
import { buildGradient, orbGradients } from "@/utils/colors";
import { setActiveProfile } from "@/utils/profiles";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Profile({
	profile,
	onSelect
}: {
	profile: ViewingProfile;
	onSelect?: (profile: ViewingProfile) => void;
}) {

	const router = useRouter();

	const [pinDialog, setPinDialog] = useState(false);

	async function select() {

		try {

			await setActiveProfile(profile.id);
			router.push("/");

		} catch (err) {
			console.log("TODO_profile_id");

		};

	};

	async function handleClick() {

		if (onSelect) {
			onSelect(profile);
			return;
		};

		if (profile.pin_hash) {
			setPinDialog(true);
			return;
		};

		select();

	};

	return (

		<>
			<ProfilePinDialog
				profile={profile}
				open={pinDialog}
				onClose={() => setPinDialog(false)}
				onSuccess={() => {
					setPinDialog(false);
					select();
				}}
			/>

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
		</>

	);

};