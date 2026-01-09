import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SettingsOptionButton } from "./SettingsPanel";

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

export default function MediaSourceSelector({
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

		<div className="h-96 w-full space-y-2 overflow-y-scroll">

			{sources.map((source, idx) => (

				<SettingsOptionButton
					key={source.file}
					onClick={() => onSourceChange(source)}
					active={currentSource.id === source.id}
					className="py-3 px-4 text-start"
				>
					{serverNames[idx]} (<span className="uppercase">{source.lang}</span>)
				</SettingsOptionButton>

			))}

		</div>

	);

};
