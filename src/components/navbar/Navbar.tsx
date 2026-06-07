"use client"

import { cn } from "@/lib/utils";
import { Bookmark, Home, LayoutGrid, Lock, Pencil, Search, Settings, SunMedium, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { avatar } from "@/utils/avatar";
import { useBridge } from "@/context/BridgeContext";
import { useEffect, useRef, useState } from "react";
import { buildGradient } from "@/utils/colors";
import { setActiveProfile } from "@/utils/profiles";

interface NavbarProps {
	user: Pick<User, "user_metadata" | "email"> | null;
	activeProfile: ViewingProfile | null;
	profiles: ViewingProfile[];
};

const links = [
	{ icon: Home, path: "/" },
	{ icon: Search, path: "/search" },
	{ icon: LayoutGrid, path: "/browse" },
	{ icon: Bookmark, path: "/watchlist" },
];


function ProfileChip({ profile, size = "size-8", text = "text-sm", className }: { profile: ViewingProfile; size?: string; text?: string; className?: string; }) {
	return (
		<div
			className={cn("rounded-xl flex items-center justify-center shrink-0", size, className)}
			style={{ background: buildGradient(profile.avatar_url) }}
		>
			<p className={cn("uppercase font-bold text-ink", text)}>{profile.name.slice(0, 1)}</p>
		</div>
	);
};

export function Navbar({ user, activeProfile, profiles }: NavbarProps) {

	const pathname = usePathname();
	const router = useRouter();

	const { status } = useBridge();

	const [profileOpen, setProfileOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {

		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setProfileOpen(false);
			};
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);

	}, []);

	async function switchProfile(profileId: string) {
		await setActiveProfile(profileId);
		setProfileOpen(false);
		router.refresh();
	};

	const otherProfiles = profiles.filter(p => p.id !== activeProfile?.id);

	return (

		<div className="fixed bottom-4 right-4 h-auto w-16 z-40 bg-panel border border-ink2/20 rounded-full flex flex-col items-center justify-between p-4 space-y-14">

			<div className="flex flex-col space-y-4">

				{links.map((link, idx) => (

					<Link
						href={link.path}
						key={idx}
						className={cn(
							"size-10 rounded-full flex items-center justify-center text-ink",
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

						<div ref={ref} className="relative">

							<div
								onClick={() => setProfileOpen(prev => !prev)}
								className="size-10 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center"
								style={{ background: buildGradient(activeProfile?.avatar_url) }}
							>
								{activeProfile && (
									<p className={cn("uppercase font-bold text-ink")}>{activeProfile.name.slice(0, 1)}</p>
								)}
							</div>

							{profileOpen && (

								<div className="absolute bottom-0 right-16 w-76	 bg-[rgba(22,22,28,0.92)] backdrop-blur-xl border border-white/10 rounded-[18px] p-2.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)]">

									{activeProfile && (

										<div className="flex items-center gap-3 px-2.5 pt-2 pb-3">

											<ProfileChip profile={activeProfile} size="size-10" text="text-base" />

											<div className="min-w-0">
												<p className="text-[14.5px] font-bold tracking-tight">{activeProfile.name}</p>
												{/* <p className="font-mono text-[9.5px] tracking-[1px] text-mint mt-0.5">● WATCHING NOW</p> */}
											</div>

										</div>

									)}


									{otherProfiles.length > 0 && (
										<>

											<p className="text-ink/50 uppercase font-jet-mono text-xs px-2.5 py-1.5">Switch profile</p>

											<div className="flex flex-col gap-0.5">

												{otherProfiles.map(p => (
													<button
														key={p.id}
														onClick={() => switchProfile(p.id)}
														className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-ink/10 transition-colors text-left"
													>

														<ProfileChip profile={p} className="rounded-lg" />

														<span className="flex-1 text-[13.5px] font-semibold">{p.name}</span>
														{p.pin_hash && <Lock size={13} className="text-ink3" />}

													</button>
												))}

											</div>

										</>
									)}

									<div className="h-px bg-ink4/38 mx-1.5 my-2" />

									<div className="flex flex-col gap-0.5">
										<button
											onClick={() => { router.push("/profiles"); setProfileOpen(false); }}
											className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-ink/10 transition-colors text-ink2 text-[13.5px] font-semibold"
										>
											<span className="w-7.5 flex justify-center text-ink3"><Users size={17} /></span>
											Who's watching
										</button>
										<button
											onClick={() => { router.push("/profiles/manage"); setProfileOpen(false); }}
											className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-ink/10 transition-colors text-ink2 text-[13.5px] font-semibold"
										>
											<span className="w-7.5 flex justify-center text-ink3"><Pencil size={16} /></span>
											Manage profiles
										</button>
										<button
											onClick={() => { router.push("/settings"); setProfileOpen(false); }}
											className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-ink/10 transition-colors text-ink2 text-[13.5px] font-semibold"
										>
											<span className="w-7.5 flex justify-center text-ink3"><SunMedium size={17} /></span>
											Account settings
										</button>
									</div>

								</div>
							)}

						</div>

					)
				}

			</div>

		</div>

	);

};