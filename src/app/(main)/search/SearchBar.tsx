"use client";

import { Input } from "@/components/Input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
	return (

		<div className={cn("relative flex items-center w-full max-w-xl", className)}>

			<Search
				size={16}
				className="absolute left-5 text-ink/30 pointer-events-none"
			/>

			<Input
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className="pl-12 w-full"
			/>
		</div>

	);

};