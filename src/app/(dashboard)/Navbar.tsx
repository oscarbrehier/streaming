import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { DashboardUser } from "./User";

const links = [
	{ name: "Overview", path: "" },
	{ name: "Upload Media", path: "/upload" },
	{ name: "Media Health", path: "/media" },
	{ name: "Transcoding Queue", path: "/transcoding" },
	{ name: "Atlas", path: "/atlas" },
	{ name: "Logs", path: "/logs" },
];

export function DashboardNavbar() {

	return (

		<div className="w-full h-16 flex justify-between items-center px-8 z-50 fixed border-b border-border bg-background">

			<NavigationMenu>

				<NavigationMenuList>

					{links.map((link, idx) => (

						<NavigationMenuItem key={idx}>
							<NavigationMenuLink asChild>
								<Link href={`/dashboard${link.path}`}>{link.name}</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>

					))}

				</NavigationMenuList>

			</NavigationMenu>

			<DashboardUser />

		</div>

	);

};