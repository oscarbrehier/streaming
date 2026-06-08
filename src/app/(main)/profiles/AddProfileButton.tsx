"use client"

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AddProfileButton({
	onSelect
}: {
	onSelect?: () => void;
}) {

	const router = useRouter();

	function handleClick() {

		if (onSelect) {
			onSelect();
		} else {
			router.push("/profiles/new");
		};

	}

	return (

		<button
			onClick={handleClick}
			className="flex flex-col items-center space-y-4 select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
		>

			<div className="size-40 rounded-2xl flex items-center justify-center border-4 border-panel2 border-dotted">
				<Plus className="text-ink2" size={40} />
			</div>

			<p className="text-ink2">Add profile</p>

		</button>

	);

};