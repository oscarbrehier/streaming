type Interaction = "active" | "on-focus" | "on-hover";

export const glass = (interaction: Interaction = "active", text?: boolean) => {

	const bgColor = text ? "bg-neutral-600/50" : "bg-neutral-300/10";

	const base = `ring-1 ring-neutral-300/30 backdrop-blur-md shadow-xl`;

	const variants: Record<Interaction, string> = {
		"active": `${bgColor}`,
		"on-focus": `
			${bgColor}
			focus-within:ring-neutral-300/30
			ring-transparent
		`,
		"on-hover": `
			hover:${bgColor}
			hover:ring-neutral-300/30
			hover:backdrop-blur-md
			hover:shadow-xl
			transition-all duration-150 ease-in-out
		`
	};

	return `${base} ${variants[interaction]}`;
	
};
