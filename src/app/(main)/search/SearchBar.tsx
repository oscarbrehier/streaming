"use client";

import { Input } from "@/components/Input";
import { Loader, Search, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	thinking: boolean;
};

export function SearchBar({
	value,
	onChange,
	placeholder = "Search...",
	className,
	thinking = false
}: SearchBarProps) {

	const statusRef = useRef<HTMLParagraphElement>(null);
	const [rightPadding, setRightPadding] = useState(0);

	useEffect(() => {
		if (statusRef.current) {
			const width = statusRef.current.offsetWidth;
			setRightPadding(width + 40);
		};
	}, [thinking]);

	return (

		<div className={cn(
			"relative flex items-center w-full max-w-xl",
			className
		)}>

			{thinking ? (
				<Sparkle size={14} className="absolute left-5 text-mint pointer-events-none" fill="var(--color-mint)" />
			) : (
				<Search
					size={16}
					className="absolute left-5 text-ink/30 pointer-events-none"
				/>
			)}

			<Input
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				style={{ paddingRight: `${rightPadding}px` }}
				className={cn(
					"pl-12 w-full",
					thinking && "border-mint/50"
				)}
			/>

			<div className={cn(
				"absolute bottom-0 left-3 right-3 h-0.5 overflow-hidden rounded-full pointer-events-none transition-opacity duration-300",
				thinking ? "opacity-100" : "opacity-0"
			)}>
				<div className="h-full w-1/3 rounded-full bg-linear-to-r from-transparent via-mint to-transparent animate-infinite-scroll" />
			</div>

			<div className="absolute right-5 flex items-center space-x-4">

				<p
					ref={statusRef}
					className={cn(
						"text-sm font-jet-mono uppercase",
						thinking ? "text-ink3" : "text-mint"
					)}
				>
					{thinking ? "thinking" : "ready"}
				</p>
			</div>

		</div>

	);

};