"use client"

import { cn } from "@/lib/utils";
import { Bookmark, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { avatar } from "@/utils/avatar";
import { useBridge } from "@/context/BridgeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { BRIDGE_UI_CONFIG } from "@/utils/constants";

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
	const { status } = useBridge();

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

			<div className="flex flex-col items-center space-y-6">

				{/* <Tooltip>
					<TooltipTrigger>
						<div className={cn(
							"size-3 animate-pulse rounded-full flex items-center justify-center",
							BRIDGE_UI_CONFIG.STATUS[status].color
						)} />
					</TooltipTrigger>
					<TooltipContent>
						{BRIDGE_UI_CONFIG.STATUS[status].message}
					</TooltipContent>
				</Tooltip> */}

				{
					user && (

						<Link
							href="/profile"
							className="size-10 rounded-full overflow-hidden bg-cover bg-center"
							style={{ backgroundImage: `url("${avatar(user.user_metadata.display_name)}")` }}
						/>

					)
				}

			</div>

		</div>

	);

};