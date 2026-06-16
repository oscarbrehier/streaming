"use client"

import { cn } from "@/lib/utils";
import { Bookmark, Home, LayoutGrid, Lock, Pencil, Search, Settings, SunMedium, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { buildGradient } from "@/utils/colors";
import { setActiveProfile } from "@/utils/profiles";
import { ProfilePinDialog } from "../profiles/ProfilePinDialog";
import { ProfileChip } from "../profiles/ProfileChip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface NavbarProps {
	user: Pick<User, "user_metadata" | "email"> | null;
	activeProfile: ViewingProfile | null;
	profiles: ViewingProfile[];
};

const links = [
	{ icon: Home, path: "/", label: "home" },
	{ icon: Search, path: "/search", label: "search" },
	{ icon: LayoutGrid, path: "/browse", label: "browse" },
	{ icon: Bookmark, path: "/list", label: "my list" },
];


export function Navbar({ user, activeProfile, profiles }: NavbarProps) {

	const pathname = usePathname();
	const router = useRouter();

	const [pinDialog, setPinDialog] = useState<ViewingProfile | null>(null);
	const [profileOpen, setProfileOpen] = useState(false);

	const ref = useRef<HTMLDivElement>(null);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	async function handleProfileClick(profile: ViewingProfile) {

		if (profile.pin_hash) {
			setPinDialog(profile);
		} else {
			await switchProfile(profile.id);
		};

	};

	function handleMouseEnter() {
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		setProfileOpen(true);
	};

	function handleMouseLeave() {
		hoverTimer.current = setTimeout(() => setProfileOpen(false), 300);
	};

	const otherProfiles = profiles.filter(p => p.id !== activeProfile?.id);

	return (

		<div className="fixed bottom-6 right-6 h-auto w-16 z-40 bg-bg-warm border border-ink3/20 rounded-full flex flex-col items-center justify-between p-4 space-y-14">

			<div className="flex flex-col space-y-4">

				{links.map((link, idx) => (

					<Tooltip key={idx}>

						<TooltipTrigger asChild>

							<Link
								href={link.path}
								className={cn(
									"size-10 rounded-full flex items-center justify-center text-ink",
									"hover:bg-neutral-800",
									link.path !== pathname && "text-ink3 hover:text-ink"
								)}
							>
								<link.icon />
							</Link>

						</TooltipTrigger>

						<TooltipContent side="left" className="dark">
							<p className="capitalize">{link.label}</p>
						</TooltipContent>

					</Tooltip>

				))}

			</div>

			<div className="flex flex-col items-center space-y-6">

				{
					user && (

						<div
							ref={ref}
							className="relative"
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
						>

							<div
								onClick={() => setProfileOpen(prev => !prev)}
								className="size-10 rounded-full overflow-hidden bg-cover bg-center flex items-center justify-center select-none cursor-pointer"

							>
								{activeProfile && (
									<ProfileChip
										profile={activeProfile}
										className="rounded-none h-full w-full"
									/>
								)}
							</div>

							{profileOpen && (

								<div
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
									className="absolute bottom-0 right-16 w-76 bg-bg-warm backdrop-blur-xl border border-ink3/20 rounded-3xl p-2.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)]"
								>

									{activeProfile && (

										<div className="flex items-center gap-3 px-2.5 pt-2 pb-3">

											<ProfileChip profile={activeProfile} size="size-10" text="text-base" className="rounded-xl" />

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
														onClick={() => handleProfileClick(p)}
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

			<ProfilePinDialog
				profile={pinDialog}
				open={!!pinDialog}
				onClose={() => setPinDialog(null)}
				onSuccess={(id) => { switchProfile(id); setPinDialog(null); }}
			/>

		</div>

	);

};