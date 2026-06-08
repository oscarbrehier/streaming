"use client"

import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { MAX_USER_PROFILES } from "@/utils/constants";

export function AddProfileButton({
	onSelect,
	profilesNum
}: {
	onSelect?: () => void;
	profilesNum: number;
}) {

	const router = useRouter();

	function handleClick() {

		if (onSelect) {
			onSelect();
		} else {
			router.push("/profiles/new");
		};

	};

	const disabled = profilesNum >= MAX_USER_PROFILES

	return (
		<Tooltip>

			<TooltipTrigger asChild>
				<span>
					<button
						onClick={handleClick}
						disabled={disabled}
						className="flex flex-col items-center space-y-4 select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
					>

						<div className="size-40 rounded-2xl flex items-center justify-center border-4 border-panel2 border-dotted">
							<Plus className="text-ink2" size={40} />
						</div>

						<p className="text-ink2">Add profile</p>

					</button>

				</span>
			</TooltipTrigger>

			{disabled && (
				<TooltipContent>
					<p>Maximum of {MAX_USER_PROFILES} profiles reached</p>
				</TooltipContent>
			)}

		</Tooltip>

	);

};