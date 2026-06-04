import Link from "next/link";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";

interface ButtonProps {
	label?: string;
	icon: React.ReactNode;
	variant?: "solid" | "glass";
	href?: string;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	className?: string;
	disabled?: boolean;
}''

export function Button({ label, icon, variant = "solid", href, onClick, className }: ButtonProps) {

	const base = cn(
		"capitalize text-md h-12 px-6 rounded-full cursor-pointer flex items-center justify-center sm:space-x-4",
		variant === "solid" ? "bg-neutral-200 text-black" : glass("active"),
		className
	);

	const content = (
		<>
			{icon}
			{label && (<span className="sm:block hidden">{label}</span>)}
		</>
	);

	if (href) {
		return <Link href={href} className={base}>{content}</Link>;
	};

	return (
		<button onClick={onClick} className={base}>
			{content}
		</button>
	);

} ''