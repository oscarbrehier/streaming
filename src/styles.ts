type Interaction = "active" | "on-focus" | "on-hover" | "disabled";

export const glass = (interaction: Interaction = "active", text?: boolean) => {

	const bgColor = text ? "bg-neutral-600/50" : "bg-panel2";

	const base = `ring-1 ring-ink/24 backdrop-blur-md shadow-xl`;

	const variants: Record<Interaction, string> = {
		"active": `${bgColor}`,
		"disabled": `${bgColor} opacity-50 cursor-not-allowed`,
		"on-focus": `
			${bgColor}
			focus-within:ring-ink/24
			ring-transparent
		`,
		"on-hover": `
			hover:${bgColor}
			hover:ring-ink/24
			hover:backdrop-blur-md
			hover:shadow-xl
			transition-all duration-150 ease-in-out
		`
	};

	return `${base} ${variants[interaction]}`;
	
};
