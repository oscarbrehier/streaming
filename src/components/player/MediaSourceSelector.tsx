import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { SettingsOptionButton } from "./SettingsPanel";
import SHA256 from "crypto-js/sha256";

const names = [
	"Norman", "Lisa", "Madeleine", "Mackie",
	"Vito", "Terry", "Stanley",
	"Jake", "Travis", "Jimmy", "Sammy",
	"Michel", "Patricia",
	"Roy", "Joseph", "Bill", "Johnny", "NoHo", "Abby",
];

function getServerName(url: string): string {

	const hash = SHA256(url).toString();
	const hashInt = parseInt(hash.slice(0, 8), 16);

	const index = hashInt % names.length;

	return names[index];

};

export default function MediaSourceSelector({
	sources,
	currentSource,
	onSourceChange,
}: {
	sources: MediaSourceFile[];
	currentSource: MediaSourceFile;
	onSourceChange: (sourceIdx: number) => void;
}) {

	const serverNames = useMemo(() => {
		return sources.map((source) => getServerName(source.file));
	}, [sources]);

	return (

		<div className="h-96 w-full space-y-2 overflow-y-scroll">

			{sources.map((source, idx) => (

				<SettingsOptionButton
					key={source.file}
					onClick={() => onSourceChange(idx)}
					active={currentSource.id === source.id}
					className="py-3 px-4 text-start"
				>
					{serverNames[idx]} (<span className="uppercase">{source.lang}</span>)
				</SettingsOptionButton>

			))}

		</div>

	);

};
