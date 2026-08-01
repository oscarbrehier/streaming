"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useSubtitleStyles } from "@/hooks/player/useSubtitlesStyle";

const TEXT_COLORS = ["#ffffff", "#f5e050", "#4dd0e1", "#81c784", "#ff8a80"];

const BG_COLORS: { value: string; label: string }[] = [
	{ value: "#000000", label: "Black" },
	{ value: "#ffffff", label: "White" },
	{ value: "#1a237e", label: "Blue" },
	{ value: "transparent", label: "None" },
];

const OFFSET_STEP = 250; // ms

function formatOffset(ms: number) {
	const s = ms / 1000;
	return `${s > 0 ? "+" : ""}${s.toFixed(2)}s`;
}

function hexToRgba(hex: string, alpha: number) {
	const h = hex.replace("#", "");
	const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
	const int = parseInt(full, 16);
	return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}

export function SubtitleCustomizer() {

	const {
		textColor,
		backgroundColor,
		backgroundOpacity,
		fontSize,
		offsetMs,
		set,
		nudgeOffset,
		reset,
	} = useSubtitleStyles();

	const bgTransparent = backgroundColor === "transparent";

	return (

		<div className="h-full w-full space-y-5 overflow-y-scroll pb-4">

			<div className="flex items-center justify-center rounded-md bg-black/40 py-6">
				<span
					className="rounded px-2 py-0.5 leading-tight"
					style={{
						color: textColor,
						backgroundColor: bgTransparent
							? "transparent"
							: hexToRgba(backgroundColor, backgroundOpacity),
						fontSize: `${fontSize}rem`,
					}}
				>
					The quick brown fox
				</span>
			</div>

			<Section label="Text color">
				<div className="flex gap-2">
					{TEXT_COLORS.map((c) => (
						<Swatch
							key={c}
							color={c}
							active={textColor === c}
							onClick={() => set("textColor", c)}
						/>
					))}
				</div>
			</Section>

			<Section label="Background">
				<div className="flex gap-2">
					{BG_COLORS.map(({ value, label }) => (
						<Swatch
							key={value}
							color={value}
							title={label}
							active={backgroundColor === value}
							onClick={() => set("backgroundColor", value)}
						/>
					))}
				</div>
			</Section>

			<Section label={`Background opacity — ${Math.round(backgroundOpacity * 100)}%`}>
				<input
					type="range"
					min={0}
					max={1}
					step={0.05}
					value={backgroundOpacity}
					disabled={bgTransparent}
					onChange={(e) => set("backgroundOpacity", Number(e.target.value))}
					className="w-full accent-olive disabled:opacity-40"
				/>
			</Section>

			<Section label={`Text size — ${Math.round(fontSize * 100)}%`}>
				<input
					type="range"
					min={0.6}
					max={2}
					step={0.1}
					value={fontSize}
					onChange={(e) => set("fontSize", Number(e.target.value))}
					className="w-full accent-olive"
				/>
			</Section>

			<Section label="Timing offset">
				<div className="flex items-center gap-2">

					<StepButton onClick={() => nudgeOffset(-OFFSET_STEP)}>
						<Minus size={16} strokeWidth={3} />
					</StepButton>

					<div className="flex-1 text-center">
						<span className="text-sm font-semibold tabular-nums text-ink/90">
							{formatOffset(offsetMs)}
						</span>
						<p className="text-[11px] text-ink3">
							{offsetMs === 0
								? "In sync"
								: offsetMs > 0
									? "Subtitles appear later"
									: "Subtitles appear earlier"}
						</p>
					</div>

					<StepButton onClick={() => nudgeOffset(OFFSET_STEP)}>
						<Plus size={16} strokeWidth={3} />
					</StepButton>

				</div>
			</Section>

			<button
				onClick={reset}
				className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold text-ink/70 transition-all duration-200 ease-in-out hover:bg-neutral-700"
			>
				<RotateCcw size={14} strokeWidth={2.5} />
				Reset to defaults
			</button>

		</div>

	);

};

function Section({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {

	return (
		<div className="space-y-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-ink3">{label}</p>
			{children}
		</div>
	);

};

function Swatch({
	color,
	active,
	title,
	onClick,
}: {
	color: string;
	active: boolean;
	title?: string;
	onClick: () => void;
}) {

	const transparent = color === "transparent";

	return (
		<button
			title={title}
			onClick={onClick}
			style={{
				backgroundColor: transparent ? undefined : color,
				backgroundImage: transparent
					? "repeating-conic-gradient(#555 0% 25%, #333 0% 50%)"
					: undefined,
				backgroundSize: "10px 10px",
			}}
			className={cn(
				"h-8 w-8 rounded-full border transition-all duration-200",
				active ? "border-olive ring-2 ring-olive/50" : "border-white/20"
			)}
		/>
	);

};

function StepButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: React.ReactNode;
}) {

	return (
		<button
			onClick={onClick}
			className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink/75 transition-all duration-200 ease-in-out hover:bg-neutral-700"
		>
			{children}
		</button>
	);

};