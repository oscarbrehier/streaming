"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";

export function MediaRow({
	data,
	title,
	href,
	Card
}: {
	data: any[];
	title: string;
	href?: string;
	Card: React.ComponentType<{ media: any }>;
}) {

	const [columns, setColumns] = useState(5);

	useEffect(() => {

		function updateColumns() {

			const w = window.innerWidth;

			if (w >= 1280) setColumns(5);
			else if (w >= 1024) setColumns(4);
			else if (w >= 640) setColumns(3);
			else setColumns(2);

		};

		updateColumns();
		window.addEventListener("resize", updateColumns);

		return () => window.removeEventListener("resize", updateColumns);

	}, []);

	if (data.length === 0) return null;

	const visible = data.slice(0, columns);

	return (

		<div
			className="w-full space-y-2"
		>

			<div className="w-full flex items-baseline space-x-4">

				<p className="font-semibold uppercase">{title}</p>

				{href && (
					<Link href={href} className="flex items-center space-x-2">
						<span className="uppercase text-xs text-ink/70">view all</span>
					</Link>
				)}

			</div>

			<div
				className="grid gap-1"
				style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
			>
				{visible.map((item, i) => (
					<Card key={`${item.id}-${i}`} media={item} />
				))}
			</div>

		</div>

	);

};