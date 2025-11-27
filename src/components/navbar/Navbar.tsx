"use client"

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { avatar } from "@/utils/getAvatar";

interface NavbarProps {
	user: Pick<User, "user_metadata" | "email"> | null;
};

export function Navbar({ user }: NavbarProps) {

	const pathname = usePathname();
	const router = useRouter();

	const debounceRef = useRef<NodeJS.Timeout | null>(null)

	function handleSearch(e: ChangeEvent<HTMLInputElement>) {

		const query = e.target.value;

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		};

		debounceRef.current = setTimeout(() => {
			if (query.length > 3) {
				router.push(`/search?query=${query}`);
			};
		}, 500);

	};

	return (

		<div className="w-full px-8 h-18 flex items-center justify-between z-10">

			<div className="flex space-x-10 capitalize">

				<Link
					href="/"
					className={cn(
						"rounded-full h-10 px-4 space-x-2 flex items-center justify-center text-neutral-100",
						pathname === "/" ? "bg-neutral-800" : "bg-neutral-800/40 hover:bg-neutral-800"
					)}
				>
					<p>Home</p>
				</Link>

			</div>


			<div className="flex space-x-4">

				{pathname !== "/search" && (

					<div className="rounded-4xl bg-neutral-800 h-10 flex items-center justify-between px-4 space-x-4">

						<input
							type="text"
							placeholder="Search"
							className="outline-none w-72"
							onChange={handleSearch}
						/>

						<Search size={20} className="text-neutral-500" />

					</div>

				)}

				{
					user && (

						<Link
							href="/profile"
							className="size-10 rounded-full overflow-hidden"
						>
							<img
								className="size-10"
								src={avatar(user.user_metadata.display_name)}
							/>
						</Link>

					)
				}

			</div>

		</div>

	);

};