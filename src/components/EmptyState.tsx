import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}) {

	return (

		<div className={cn(
			"flex-1 w-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500",
			className
		)}>

			<div className="flex flex-col items-center space-y-8 text-center">

				<div className="space-y-4">
					<p className="text-3xl font-bold">{title}</p>
					{description && (
						<p className="text-ink/50">{description}</p>
					)}
				</div>

				{children}

			</div>

		</div>

	);

};
