"use client";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DropdownOption {
	label: string;
	value: string;
}

interface DropdownProps {
	options: DropdownOption[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function Dropdown({ options, value, onChange, className }: DropdownProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const selected = options.find(o => o.value === value);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={ref} className={cn("relative", className)}>
			<button
				onClick={() => setOpen(prev => !prev)}
				className={cn(
					"capitalize text-md h-12 px-6 rounded-full flex items-center justify-center gap-3",
					"bg-panel/50 border border-ink/10 text-ink/70",
					"transition-colors hover:border-ink/30",
					open && "border-ink/30"
				)}
			>
				{selected?.label}
				<ChevronDown
					size={16}
					className={cn("transition-transform duration-200", open && "rotate-180")}
				/>
			</button>

			{open && (
				<div className={cn(
					"absolute top-full mt-2 left-0 min-w-full z-50",
					"bg-panel border border-ink/10 rounded-2xl overflow-hidden",
					"shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
				)}>
					{options.map((option) => (
						<button
							key={option.value}
							onClick={() => { onChange(option.value); setOpen(false); }}
							className={cn(
								"w-full px-6 h-11 flex items-center text-left capitalize",
								"transition-colors hover:bg-ink/5",
								option.value === value ? "text-ink" : "text-ink/60"
							)}
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};