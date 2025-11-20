"use client"

import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
	status?: "ok" | "error";
	label?: string;
	size?: "sm" | "md" | "lg";
};

const statusColors = {
	ok: "bg-green-500",
	error: "bg-gray-400",
};

const sizeClasses = {
	sm: "w-2 h-2",
	md: "w-3 h-3",
	lg: "w-4 h-4",
}

const labelSizes = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
}

const pingRingStyles = `
  @keyframes ping-ring {
    0% {
      box-shadow: 0 0 0 0 currentColor;
    }
    75% {
      box-shadow: 0 0 0 10px transparent;
    }
    100% {
      box-shadow: 0 0 0 10px transparent;
    }
  }
  .animate-ping-ring {
    animation: ping-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
`

export function StatusIndicator({ status = "ok", label, size = "md" }: StatusIndicatorProps) {

	return (

		<>

			<style>{pingRingStyles}</style>

			<div className="flex items-center gap-2">

				<div className="relative inline-flex items-center justify-center">

					<div
						className={cn("absolute rounded-full", statusColors[status])}
						style={{
							width: size === "sm" ? "8px" : size === "md" ? "12px" : "16px",
							height: size === "sm" ? "8px" : size === "md" ? "12px" : "16px",
							animation: "ping-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
							opacity: 0.75,
						}}
					/>

					<div className={cn("relative rounded-full", statusColors[status], sizeClasses[size])} />
				</div>

				{label && <span className={cn("font-medium text-foreground", labelSizes[size])}>{label}</span>}

			</div>

		</>

	);

};
