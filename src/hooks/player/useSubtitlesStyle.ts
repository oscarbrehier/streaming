import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SubtitleStyle = {
	textColor: string;
	backgroundColor: string;
	backgroundOpacity: number;
	fontSize: number;
	offsetMs: number;
};

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
	textColor: "#ffffff",
	backgroundColor: "#000000",
	backgroundOpacity: 0.6,
	fontSize: 1,
	offsetMs: 0,
};

type SubtitleStyleStore = SubtitleStyle & {
	set: <K extends keyof SubtitleStyle>(key: K, value: SubtitleStyle[K]) => void;
	nudgeOffset: (deltaMs: number) => void;
	reset: () => void;
};

export const useSubtitleStyles = create<SubtitleStyleStore>()(
	persist(
		(set) => ({
			...DEFAULT_SUBTITLE_STYLE,
			set: (key, value) => set({ [key]: value } as Partial<SubtitleStyle>),
			nudgeOffset: (deltaMs) =>
				set((s) => ({ offsetMs: clamp(s.offsetMs + deltaMs, -60_000, 60_000) })),
			reset: () => set(DEFAULT_SUBTITLE_STYLE),
		}),
		{ name: "subtitle-style" }
	)
);

function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
};