import { cn } from "@/lib/utils";
import { glass } from "@/styles";

export type SettingsView = null | "sources" | "subtitles" | "quality";

export function SettingsPanel({
	view,
	open,
	panels,
	children
}: {
	view: SettingsView;
	open: boolean;
	panels: {
		title: string;
	}[];
	children?: React.ReactNode;
}) {

	return (

		<div
			className={cn(
				glass("active"),
				"absolute w-120 h-140 bg-card/20 rounded-2xl bottom-12 right-0 p-4 flex flex-col space-y-4"
			)}
		>

			<div className="h-10 w-full flex items-center justify-between gap-2">

				{panels.map((pane, idx) => (
					<button
						key={idx}
						className={cn(
							"flex-1 py-2 rounded-md text-sm capitalize border",
							"transition-all ease-in-out duration-300",
							view === pane.title
								? "bg-neutral-800/50 text-neutral-200 border-neutral-700/80"
								: "bg-neutral-800/30 text-neutral-400 hover:text-neutral-200 border-transparent hover:border-neutral-700/80"
						)}
					>
						{pane.title}
					</button>
				))}

			</div>

			<div className="flex-1">
				{children}
			</div>

		</div>

	);

};