"use client"

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "lucide-react";

export function ErrorDisplay() {

	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<MediaHealth[]>([]);
	const [activeError, setActiveError] = useState<MediaHealth | null>(null);

	useEffect(() => {

		async function fetchData() {

			const res = await fetch("http://localhost:3001/api/health/media", { cache: "no-store", next: { revalidate: 0 } });
			if (!res.ok) return null;

			const reader = res.body!.getReader();
			const decoder = new TextDecoder();

			while (true) {

				const { value, done } = await reader.read();
				if (done) break;

				const text = decoder.decode(value, { stream: true });
				for (const line of text.split("\n")) {
					if (!line.trim()) continue;

					const res = JSON.parse(line);
					if (res.code === 0) continue;

					setData(prev => ([...prev, JSON.parse(line)]));
				}
				
			};
			
			setLoading(false);

		};

		fetchData()

	}, []);

	return (

		<>

			<div className={cn(
				"h-full w-auto max-w-[28rem] space-y-2 overflow-y-scroll",
				data.length === 0 ? "hidden" : "block"
			)}>

				{data.map((report, idx) => (

					<Item
						key={idx}
						variant="muted"
						className="w-full"
					>

						<ItemContent>
							<ItemTitle>Code: {report?.code}</ItemTitle>
							<ItemDescription>Path: {report?.playlist}</ItemDescription>
						</ItemContent>

						<ItemActions>

							<Button
								variant="outline"
								size="sm"
								onClick={() => setActiveError(report)}
							>
								View error
							</Button>

						</ItemActions>

					</Item>

				))}

			</div>

			<div className={cn(
				"h-full flex-1 rounded-md ml-2 p-8",
				activeError ? "bg-muted/50" : "bg-muted/20"
			)}>

				{activeError
					? (
						<>
							<p className="text-2xl font-medium">{activeError.code}</p>
							<p className="text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance">Path: {activeError.playlist}</p>

							<div className="mt-4">
								{activeError.errors.map((line, idx) => (

									<p
										className="text-sm"
										key={idx}
									>
										{line}
									</p>

								))}
							</div>
						</>
					)
					: (

						<div className="h-full w-full flex items-center justify-center">

							{
								loading ? (

									<div className="animate-spin text-muted-foreground">
										<LoaderCircle />
									</div>

								) : data.length === 0 ? (
									<p className="text-sm text-muted-foreground">No corrupt media found.</p>
								) : (
									<p className="text-sm text-muted-foreground">Click on an error to view it on this panel.</p>
								)
							}

						</div>

					)
				}

			</div>

		</>

	)

}