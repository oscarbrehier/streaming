import { cn } from "@/lib/utils";
import { buildGradient } from "@/utils/colors";

export function ProfileChip({ 
	profile, 
	size = "size-8", 
	text = "text-sm", 
	className 
}: { 
	profile: Pick<ViewingProfile, "avatar_url" | "name">; 
	size?: string; 
	text?: string; 
	className?: string; 
}) {
	return (
		<div
			className={cn("rounded-xl flex items-center justify-center shrink-0", size, className)}
			style={{ background: buildGradient(profile.avatar_url) }}
		>
			<p className={cn("uppercase font-extrabold text-panel2/90", text)}>{profile.name.slice(0, 1)}</p>
		</div>
	);
};