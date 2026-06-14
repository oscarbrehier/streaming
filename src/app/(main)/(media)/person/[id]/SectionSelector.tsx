"use client"

import { BackdropCard } from "@/components/cards/Backdrop";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SectionSelector({
	sections,
	known_for,
}: {
	sections: {
		label: string;
		items: any[];
	}[];
	known_for?: string;
}) {

	const [active, setActive] = useState<string>(
		known_for
			? (sections.find(s => s.label === known_for)?.label ?? sections[0]?.label)
			: sections[0]?.label
	);
	const current = sections.find(s => s.label === active);

	return (

		<div className="space-y-6 p-20">

			<div className="flex space-x-4">

				{sections.map(s => (
					<button
						key={s.label}
						onClick={() => setActive(s.label)}
						className={cn(
							"cursor-pointer transition-all ease-in-out",
							s.label == active ? "text-ink" : "text-ink2 hover:text-ink"
						)}
					>
						<span className="uppercase text-sm">{s.label}</span>
					</button>
				))}

			</div>

			{current && (
				<div className="space-y-6">
					<div className="grid grid-cols-4 gap-1">
						{current.items.map((m, i) => (
							<BackdropCard key={`${m.id}-${i}`} media={m as any} />
						))}
					</div>
				</div>
			)}

		</div>

	);

};