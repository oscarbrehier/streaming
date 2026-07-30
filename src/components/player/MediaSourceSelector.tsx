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

function hashIndex(url: string): number {
	const hash = SHA256(url).toString();
	return parseInt(hash.slice(0, 8), 16) % names.length;
}

function assignNames(sources: MediaSourceFile[]): string[] {

	const used = new Set<number>();

	return sources.map((source) => {

		const start = hashIndex(source.file);

		for (let i = 0; i < names.length; i++) {

			const idx = (start + i) % names.length;

			if (!used.has(idx)) {
				used.add(idx);
				return names[idx];
			};

		};

		const idx = start;
		return `${names[idx]} ${sources.length}`;

	});

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
	
		const order = [...sources].sort((a, b) => a.file.localeCompare(b.file));
		const nameByFile = new Map(
			assignNames(order).map((name, i) => [order[i].file, name])
		);
	
		return sources.map((s) => nameByFile.get(s.file)!);
	
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
