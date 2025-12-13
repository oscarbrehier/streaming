"use client"

import { cn } from "@/lib/utils";
import { Bookmark, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { avatar } from "@/utils/avatar";

interface NavbarProps {
	user: Pick<User, "user_metadata" | "email"> | null;
};

const links = [
	{ icon: Home, path: "/" },
	{ icon: Search, path: "/search" },
	{ icon: Bookmark, path: "/watchlist" }
];

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

		<div className="fixed bottom-4 right-4 h-auto w-16 z-40 bg-card border border-border rounded-full flex flex-col items-center justify-between p-4 space-y-14">

			<div className="flex flex-col space-y-4">

				{links.map((link, idx) => (

					<Link
						href={link.path}
						key={idx}
						className={cn(
							"size-10 rounded-full flex items-center justify-center",
							"hover:bg-neutral-800",
							link.path !== pathname && "text-muted-foreground hover:text-foreground"
						)}
					>
						<link.icon />
					</Link>

				))}

			</div>

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

		// <div className="w-full sm:px-8 px-4 h-18 flex items-center justify-between z-10">

		// 	<div className={cn(
		// 		"rounded-full h-10 px-6 flex items-center space-x-10",
		// 		glass("active"),
		// 		"bg-neutral-800/30"
		// 	)}>

		// 		<Link
		// 			href="/"
		// 			className={cn(pathname === "/" ? "text-neutral-100" : "text-neutral-300 hover:text-neutral-100")}
		// 		>
		// 			Home
		// 		</Link>

		// 		<Link
		// 			href="/recently-watched"
		// 			className={cn(pathname === "/recently-watched" ? "text-neutral-100" : "text-neutral-300 hover:text-neutral-100")}
		// 		>
		// 			Recently Watched
		// 		</Link>

		// 		<Link
		// 			href="/network"
		// 			className={cn(pathname === "/network" ? "text-neutral-100" : "text-neutral-300 hover:text-neutral-100")}
		// 		>
		// 			Network
		// 		</Link>

		// 	</div>


		// 	<div className="flex space-x-4">

		// 		{pathname !== "/search" && (

		// 			<>

		// 				<div className={cn(
		// 					"md:flex hidden rounded-4xl bg-neutral-800 h-10 items-center justify-between px-4 space-x-4 group",
		// 					glass("on-focus")
		// 				)}>

		// 					<input
		// 						type="text"
		// 						placeholder="Search"
		// 						className="outline-none"
		// 						onChange={handleSearch}
		// 					/>

		// 					<Search size={20} className="text-neutral-500" />

		// 				</div>

		// 				<Link
		// 					href="/search"
		// 					className="md:hidden flex rounded-full md:bg-neutral-800 bg-neutral-800/30 size-10 items-center justify-center"
		// 				>
		// 					<Search size={20} className="md:text-neutral-500 text-neutral-100" />
		// 				</Link>

		// 			</>

		// 		)}

		// 		{
		// 	user && (

		// 		<Link
		// 			href="/profile"
		// 			className="size-10 rounded-full overflow-hidden"
		// 		>
		// 			<img
		// 				className="size-10"
		// 				src={avatar(user.user_metadata.display_name)}
		// 			/>
		// 		</Link>

		// 	)
		// }

		// 	</div>

		// </div>

	);

};