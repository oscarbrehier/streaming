import Link from "next/link";
import { cn } from "@/lib/utils";
import { glass } from "@/styles";

interface ButtonProps {
    label?: string;
    icon?: React.ReactNode;
    variant?: "solid" | "glass" | "secondary" | "outline" | "destructive";
    size?: "sm" | "md" | "lg";
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    disabled?: boolean;
}

export function Button({ label, icon, variant = "solid", size = "lg", href, onClick, className, disabled }: ButtonProps) {
    const base = cn(
        "capitalize flex items-center justify-center transition-all ease-in-out",
        size === "lg" && "text-md h-12 px-6 rounded-full sm:space-x-4",
        size === "md" && "text-sm h-10 px-6 rounded-full sm:space-x-4",
        size === "sm" && "text-sm h-8 px-4 rounded-full sm:space-x-2",
        variant === "solid" && "bg-neutral-200 text-black",
        variant === "glass" && glass("active"),
        variant === "secondary" && "bg-panel2",
        variant === "destructive" && "border border-destructive/10 text-destructive hover:bg-destructive/10",
        variant === "outline" && "bg-panel border border-ink/10",
        disabled
            ? "opacity-40 cursor-not-allowed pointer-events-none"
            : "cursor-pointer",
        className
    );

	const content = (
		<>
			{icon && <span className="mb-0.5">{icon}</span>}
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