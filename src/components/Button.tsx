import Link from "next/link";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";

interface ButtonProps {
	label?: string;
	icon?: React.ReactNode;
	variant?: "solid" | "glass" | "secondary";
	href?: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	disabled?: boolean;
}

export function Button({ label, icon, variant = "solid", href, onClick, className, disabled }: ButtonProps) {
	const base = cn(
		"capitalize text-md h-12 px-6 rounded-full flex items-center justify-center sm:space-x-4",
		variant === "solid" && "bg-neutral-200 text-black",
		variant === "glass" && glass("active"),
		variant === "secondary" && "bg-panel border border-ink/10",
		disabled
			? "opacity-40 cursor-not-allowed pointer-events-none"
			: "cursor-pointer",
		className
	);

	const content = (
		<>
			{icon}
			{label && <span className="sm:block hidden">{label}</span>}
		</>
	);

	if (href && !disabled) {
		return <Link href={href} className={base}>{content}</Link>;
	}

	return (
		<button onClick={onClick} disabled={disabled} className={base}>
			{content}
		</button>
	);
}