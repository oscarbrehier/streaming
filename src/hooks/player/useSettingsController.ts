import { SettingsView } from "@/components/player/SettingsPanel";
import { PointerEvent, useState } from "react";

export function useSettingsController(initial: SettingsView) {

	const [open, setOpen] = useState(false);
	const [view, setView] = useState<SettingsView>(initial);

	const toggleView = (e: PointerEvent<HTMLButtonElement>, nextView: SettingsView) => {

		e.preventDefault();
		e.stopPropagation();

		if (open && view === nextView) {
			setOpen(false);
		} else {
			setView(nextView);
			setOpen(true);
		};

	};

	return {
		open,
		view,
		setView,
		close: () => setOpen(false),
		toggleView,
	};

};