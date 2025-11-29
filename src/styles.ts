type Interaction = "active" | "on-focus" | "on-hover"

export const glass = (interaction: Interaction = "active") => {

	switch (interaction) {
		case "on-focus":
			return "focus-within:ring-neutral-300/30 ring-transparent bg-neutral-300/10 backdrop-blur-md ring-1 shadow-xl";
		case "on-hover":
			return "ring-neutral-300/30 hover:ring-neutral-300/30 hover:bg-neutral-300/10 hover:backdrop-blur-md hover:shadow-xl transition-all duration-150 ease-in-out";
		default:
			return "ring-neutral-300/30 bg-neutral-300/10 backdrop-blur-md ring-1 shadow-xl";
	};

};