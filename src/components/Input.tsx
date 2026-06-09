"use client";
import { cn } from "@/lib/utils";

interface InputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	type?: string;
}

export function Input({ value, onChange, placeholder, className, type = "text" }: InputProps) {
	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className={cn(
				"h-12 px-6 rounded-2xl",
				"bg-panel/50 border border-ink/10 text-ink",
				"placeholder:text-ink/30",
				"outline-none focus:border-ink/25",
				"transition-colors",
				className
			)}
		/>
	);
};