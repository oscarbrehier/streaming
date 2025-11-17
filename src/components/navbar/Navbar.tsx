"use client"

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface NavbarProps {
	user: User | null;
};

export function Navbar({
	user
}: NavbarProps) {

	const pathname = usePathname();
	const router = useRouter();

	function handleSearch(e: ChangeEvent<HTMLInputElement>) {

		const query = e.target.value;

		if (query.length > 3) {
			router.push(`/search?query=${query}`);
		};

	};

	async function signOut() {

		const supabase = createClient();
		await supabase.auth.signOut();
		redirect("/login");

	}

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

						<button
							onClick={signOut}
							className="bg-red-500 size-10 rounded-full">

						</button>

					)
				}

			</div>

		</div>

	);

};