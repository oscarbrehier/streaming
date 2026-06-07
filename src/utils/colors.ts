export const STATUS_COLORS = {
	pending: {
		text: "text-yellow-400",
		bg: "bg-yellow-950",
	},
	processing: {
		text: "text-blue-400",
		bg: "bg-blue-950",
	},
	completed: {
		text: "text-green-400",
		bg: "bg-green-950",
	},
	error: {
		text: "text-red-400",
		bg: "bg-red-950",
	},
};

export const getLabelColor = (action: string) => {

	const hash = action.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const colors = [
		"text-blue-400",
		"text-green-400",
		"text-purple-400",
		"text-orange-400",
		"text-pink-400",
		"text-cyan-400",
		"text-yellow-400",
	];

	return colors[hash % colors.length];

};

export const getLabelBgColor = (action: string) => {

	const hash = action.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const colors = [
		"bg-blue-950",
		"bg-green-950",
		"bg-purple-950",
		"bg-orange-950",
		"bg-pink-950",
		"bg-cyan-950",
		"bg-yellow-950",
	];

	return colors[hash % colors.length];

};

export const orbColors = {
	coral: 'var(--color-coral)',
	lavender: 'var(--color-lavender)',
	peach: 'var(--color-peach)',
	olive: 'var(--color-olive)',
	periwinkle: 'var(--color-periwinkle)',
	mint: 'var(--color-mint)',
	rose: 'var(--color-rose)',
	apricot: 'var(--color-apricot)',
} as const;

export type OrbColor = keyof typeof orbColors;

export const orbColorKeys = Object.keys(orbColors) as OrbColor[];

export const orbGradients: Record<string, { from: OrbColor; to: OrbColor }> = {
	aurora: { from: 'mint', to: 'periwinkle' },
	sunset: { from: 'coral', to: 'apricot' },
	dusk: { from: 'lavender', to: 'rose' },
	forest: { from: 'olive', to: 'mint' },
	candy: { from: 'rose', to: 'peach' },
	ocean: { from: 'periwinkle', to: 'mint' },
	ember: { from: 'coral', to: 'peach' },
	twilight: { from: 'lavender', to: 'periwinkle' },
	bloom: { from: 'rose', to: 'lavender' },
	meadow: { from: 'olive', to: 'peach' },
};

export const HEX_COLORS: Record<OrbColor, string> = {
	coral: '#ff8f73',
	lavender: '#b9a6ff',
	peach: '#ffcaa0',
	olive: '#c3d27a',
	periwinkle: '#9fb4ff',
	mint: '#93e6c4',
	rose: '#f5a6c6',
	apricot: '#ffb487',
};

export function buildGradient(gradientKey: string | null | undefined): string {
	const key = gradientKey ?? Object.keys(orbGradients)[0];
	const gradient = orbGradients[key] ?? orbGradients[Object.keys(orbGradients)[0]];
	return `linear-gradient(145deg, ${HEX_COLORS[gradient.from]}, ${HEX_COLORS[gradient.to]})`;
};