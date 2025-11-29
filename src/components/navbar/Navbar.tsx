"use client"

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { avatar } from "@/utils/getAvatar";
import { glass } from "@/styles";

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

		<div className="w-full sm:px-8 px-4 h-18 flex items-center justify-between z-10">

			<div className="flex space-x-4 capitalize">

				<Link
					href="/"
					className={cn(
						"rounded-full h-10 px-4 flex items-center justify-center text-neutral-100",
						pathname === "/" ? cn(glass("active"), "bg-neutral-800/30") : `hover:${glass("on-hover")}`
					)}
				>
					<p>Home</p>
				</Link>

				<Link
					href="/recently-watched"
					className={cn(
						"rounded-full h-10 px-4 flex items-center justify-center text-neutral-100",
						pathname === "/recently-watched" ? cn(glass("active"), "bg-neutral-800/30") : `${glass("on-hover")}`
					)}
				>
					<p>Recently Watched</p>
				</Link>

			</div>


			<div className="flex space-x-4">

				{pathname !== "/search" && (

					<>

						<div className={cn(
							"md:flex hidden rounded-4xl bg-neutral-800 h-10 items-center justify-between px-4 space-x-4 group",
							glass("on-focus")
						)}>

							<input
								type="text"
								placeholder="Search"
								className="outline-none"
								onChange={handleSearch}
							/>

							<Search size={20} className="text-neutral-500" />

						</div>

						<Link
							href="/search"
							className="md:hidden flex rounded-full md:bg-neutral-800 bg-neutral-800/30 size-10 items-center justify-center"
						>
							<Search size={20} className="md:text-neutral-500 text-neutral-100" />
						</Link>

					</>

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