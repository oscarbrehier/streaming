"use client"

import { createViewingProfile } from "@/utils/profiles";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileForm } from "../ProfileForm";

export default function Page() {

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleCreate(data: { name: string; color: string; pin: string | null }) {

		setLoading(true);
		setError(null);

		const { error } = await createViewingProfile(data);

		setLoading(false);

		if (error) { setError(error); return; }

		router.push("/profiles");

	};

	return (

		<div className="h-screen w-full justify-center space-y-6 p-40">

			<button
				onClick={() => router.back()}
				className="h-12 px-6 rounded-full flex items-center space-x-2 border border-ink/20 text-ink/50 hover:border-ink/30 hover:text-ink/70 transition-all ease-in-out"
			>
				<ChevronLeft size={18} />
				<span className="font-medium">Back</span>
			</button>

			<p className="uppercase font-jet-mono text-sm tracking-wider text-lavender">new profile</p>

			<p className="text-5xl font-bold text-ink">Create a profile</p>

			<div className="w-full pt-10 flex space-x-20">

				<ProfileForm
					onSubmit={handleCreate}
					onCancel={() => router.back()}
					loading={loading}
					error={error}
				/>

			</div>

		</div>

	);

};