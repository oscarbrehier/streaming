"use client"

import { useEffect, useState } from "react";
import { CreditCard } from "@/components/cards/Credit";

export function CreditsGrid({ people }: { people: CreditEntry[] }) {

	const [columns, setColumns] = useState(10);

	useEffect(() => {

		function updateColumns() {

			const w = window.innerWidth;

			if (w >= 1280) setColumns(10);
			else if (w >= 1024) setColumns(8);
			else if (w >= 830) setColumns(6);
			else if (w >= 670) setColumns(4);
			else setColumns(2);
		};

		updateColumns();
		window.addEventListener("resize", updateColumns);

		return () => window.removeEventListener("resize", updateColumns);

	}, []);

	const fullRows = Math.floor(people.length / columns);
	const visible = people.slice(0, fullRows * columns);

	return (

		<div
			className="grid gap-1 items-start"
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
		>
			{visible.map((person, i) => (
				<CreditCard key={`${person.id}-${i}`} person={person} />
			))}
		</div>

	);

};