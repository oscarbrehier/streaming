import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const names = [
	"Norman", "Lisa", "Madeleine", "Mackie",
	"Vito", "Terry", "Stanley",
	"Jake", "Travis", "Jimmy", "Sammy",
	"Michel", "Patricia",
	"Roy", "Joseph", "Bill", "Johnny", "NoHo", "Abby",
];

function shuffle(array: string[]) {
	
	const arr = [...array];
	
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	};

	return arr;

};

export function MediaSourceSelector({
	sources,
	currentSource,
	onSourceChange,
}: {
	sources: MediaSourceFile[];
	currentSource: MediaSourceFile;
	onSourceChange: (source: MediaSourceFile) => void;
}) {
	const [serverNames, setServerNames] = useState<string[]>([]);

	useEffect(() => {

		let serverQueue = shuffle(names);
		const assigned = sources.map(() => serverQueue.pop() ?? "Server");

		setServerNames(assigned);

	}, [sources]);

	if (serverNames.length === 0) return null; 

	return (

		<div className="h-full w-full space-y-2">

			{sources.map((source, idx) => (

				<button
					key={source.file}
					onClick={() => onSourceChange(source)}
					className={cn(
						"w-full py-3 px-4 rounded-md text-sm capitalize text-start border",
						"transition-all ease-in-out duration-300",
						currentSource.id === source.id
								? "bg-neutral-800/50 text-neutral-200 border-neutral-700/80"
								: "bg-neutral-800/30 text-neutral-400 hover:text-neutral-200 border-transparent hover:border-neutral-700/80"
					)}
				>
					<p>
						{serverNames[idx]} (<span className="uppercase">{source.lang}</span>)
					</p>
				</button>

			))}

		</div>

	);

};
