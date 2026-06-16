import { avatar } from "@/utils/avatar";
import Image from "next/image";

export function DashboardUser({ name }: { name: string }) {
	return (
		<div className="flex items-center gap-3 min-w-0">

			<div className="size-7 rounded-full overflow-hidden shrink-0 bg-panel2">
				<Image
					src={avatar(name)}
					width={28}
					height={28}
					unoptimized
					alt="avatar"
				/>
			</div>

			<div className="min-w-0">
				<p className="text-ink text-xs truncate leading-tight">{name}</p>
				<p className="text-ink4 text-[9px] font-jet-mono uppercase tracking-widest mt-0.5">Admin</p>
			</div>

		</div>
	);
}
