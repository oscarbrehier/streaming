"use client"

import { useRouter } from "next/navigation";

export function BackButton() {

	const router = useRouter();

	return (
		<button
			onClick={() => router.back()}
			className="cursor-pointer"
		>
			<span className="uppercase text-xs text-ink/50 hover:text-ink">{"<"} Back</span>
		</button>
	);

}