"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Users,
	Film,
	ListVideo,
	BarChart3,
	ScrollText,
	Ticket,
} from "lucide-react";
import { DashboardUser } from "./User";

const NAV: { label: string; href: string; icon: React.ElementType; exact?: boolean }[] = [
	{ label: "Overview",   href: "/dashboard",              icon: LayoutDashboard, exact: true },
	{ label: "Users",      href: "/dashboard/users",        icon: Users            },
	{ label: "Content",    href: "/dashboard/content",      icon: Film             },
	{ label: "Queue",      href: "/dashboard/queue",        icon: ListVideo        },
	{ label: "Analytics",  href: "/dashboard/analytics",    icon: BarChart3        },
	{ label: "Logs",       href: "/dashboard/logs",         icon: ScrollText       },
	{ label: "Invites",    href: "/dashboard/invite-codes", icon: Ticket           },
];

export function DashboardSidebar({ userName }: { userName: string }) {

	const path = usePathname();

	return (

		<aside className="fixed left-0 top-0 h-screen w-[220px] bg-panel border-r border-line flex flex-col z-50">

			{/* Brand */}
			<div className="px-5 py-5 border-b border-line shrink-0">
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.35em] text-ink4">Atlas</p>
				<p className="font-jet-mono text-[13px] font-medium text-ink mt-0.5 tracking-tight">Admin</p>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-2 py-3 space-y-px">
				{NAV.map(({ label, href, icon: Icon, exact }) => {
					const active = exact ? path === href : path.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group",
								active
									? "bg-panel2 text-ink"
									: "text-ink3 hover:text-ink2 hover:bg-panel2/60"
							)}
						>
							<Icon
								className={cn(
									"w-[15px] h-[15px] shrink-0 transition-colors",
									active ? "text-ink2" : "text-ink4 group-hover:text-ink3"
								)}
							/>
							<span className="font-jet-mono text-[10px] uppercase tracking-[0.12em]">
								{label}
							</span>
						</Link>
					);
				})}
			</nav>

			{/* User chip */}
			<div className="shrink-0 border-t border-line px-4 py-4">
				<DashboardUser name={userName} />
			</div>

		</aside>

	);

}
