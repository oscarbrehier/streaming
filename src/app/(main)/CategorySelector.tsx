"use client"

import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
	{ label: "all", value: "all" },
	{ label: "movies", value: "movies" },
	{ label: "series", value: "series" },
];

export function CategorySelector() {

	const searchParams = useSearchParams();
	const router = useRouter();
	const active = searchParams.get("category") ?? "all";

	return (

		<div className="w-full flex justify-between px-40 mt-6">

			<div className="flex items-center space-x-2 w-1/2 overflow-scroll p-1">

				{categories.map((cat) => (
					<button
						key={cat.value}
						onClick={() => router.replace(`?category=${cat.value}`, { scroll: false })}
						className={cn(
							"h-12 px-6 flex items-center rounded-full transition-all ease-in-out",
							active === cat.value
								? glass("active")
								: "bg-panel border border-ink/10 text-ink/70 hover:bg-panel2 hover:border-ink/20"
						)}
					>
						<p className="capitalize">{cat.label}</p>
					</button>
				))}

				<Link
					href="/search"
					className={cn(
						"rounded-full size-12 flex items-center justify-center bg-panel border border-ink/10",
						"hover:border-ink/30",
						"transition-all ease-in-out"
					)}
				>
					<Search className="text-ink/70" size={16} />
				</Link>

			</div>


		</div>

	);

};