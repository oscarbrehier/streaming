import { cn } from "./lib/utils";

export const glass = (active: boolean = true) => cn(
	"focus-within:ring-neutral-300/30",
	"bg-neutral-300/10 backdrop-blur-md ring-1 shadow-xl ",
	active ? "ring-neutral-300/30" : "ring-neutral-300/0 hover:ring-neutral-300/30",
);