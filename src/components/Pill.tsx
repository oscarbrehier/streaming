import { cn } from "@/lib/utils";

interface PillProps {
	label: string;
	className?: string;
}

export function Pill({ label, className }: PillProps) {

	return (
		<div className={cn(
			"capitalize text-md h-12 px-6 rounded-full flex items-center justify-center",
			"bg-panel/50 border border-ink/10 text-ink/70",
			className
		)}>
			{label}
		</div>

	);

};