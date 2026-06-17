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

	const activePanel = panels.find(p => p.title === view);

	return (

		<div
			ref={panelRef}
			onPointerDown={(e) => e.stopPropagation()}
			className={cn(
				open ? "flex" : "hidden",
				// glass("active"),
				"absolute w-72 h-auto bg-bg border border-ink3/30 rounded-2xl bottom-14 right-0 flex-col overflow-hidden"
			)}
		>

			<div className={cn(
				"px-6 py-3",
				"border-b border-ink/10"
			)}>

				<p className="font-jet-mono text-xs text-ink2 uppercase">{activePanel?.title}</p>

			</div>

			<div className="h-96 w-full p-2">
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
				"w-full py-3 px-4 rounded-lg",
				"flex items-center space-x-4",
				active && "bg-panel2",
				className
			)}
			{...props}
		>
			{children}
		</button>

	);

};