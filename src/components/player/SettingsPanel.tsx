import { cn } from "@/lib/utils";
import { glass } from "@/styles";
import { lchownSync } from "fs";
import React, { useEffect, useRef } from "react";

export type SettingsView = null | "sources" | "subtitles" | "quality";

export function SettingsPanel({
	view,
	onViewChange,
	open,
	panels,
	children,
	onClose,
}: {
	view: SettingsView;
	open: boolean;
	panels: {
		title: SettingsView;
	}[];
	children?: React.ReactNode;
	onViewChange: (view: SettingsView) => void;
	onClose: () => void;
}) {

	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {

		if (!open || !panelRef.current) return;

		function handleOutsideClick(e: MouseEvent) {

			if (panelRef.current && !panelRef.current?.contains(e.target as Node)) {
				onClose();
			};

		};

		const timeoutId = setTimeout(() => {
			window.addEventListener("pointerdown", handleOutsideClick);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("pointerdown", handleOutsideClick);
		};

	}, [open, onClose]);

	return (

		<div
			ref={panelRef}
			onPointerDown={(e) => e.stopPropagation()}
			className={cn(
				open ? "flex" : "hidden",
				glass("active"),
				"absolute w-120 h-140 bg-card/20 rounded-2xl bottom-12 right-0 p-4 flex-col space-y-4"
			)}
		>

			<div className="h-10 w-full flex items-center justify-between gap-2">

				{panels.map((pane, idx) => (
					<SettingsOptionButton
						key={idx}
						onClick={() => onViewChange(pane.title)}
						active={view === pane.title}
					>
						<p className="capitalize">{pane.title}</p>
					</SettingsOptionButton>
				))}

			</div>

			<div className="flex-1">
				{children}
			</div>

		</div>

	);

};

export function SettingsOptionButton({
	active,
	onClick,
	children,
	className,
	...props
}: {
	active?: boolean;
	onClick: () => void;
	children: React.ReactNode;
} & React.ComponentProps<"button">) {

	return (

		<button
			onClick={onClick}
			className={cn(
				"w-full py-2 rounded-md text-sm border transition-all duration-300",
				active
					? "bg-neutral-800/50 text-neutral-200 border-neutral-700/80"
					: "bg-neutral-800/30 text-neutral-400 hover:text-neutral-200 border-transparent hover:border-neutral-700/80",
				className
			)}
			{...props}
		>
			{children}
		</button>

	);

};