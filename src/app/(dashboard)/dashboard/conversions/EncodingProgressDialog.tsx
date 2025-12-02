"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatTimeHuman } from "@/utils/timeFormat";
import { useEffect, useState } from "react";

export function EncodingProgressDialog({
	mediaId,
	disabled,
}: {
	mediaId: string;
	disabled: boolean;
}) {

	const [isOpen, setIsOpen] = useState(false);
	const [progress, setProgress] = useState({
		durationSeconds: null,
		elapsedSeconds: null,
		percent: null,
		resolution: null,
	});

	useEffect(() => {

		if (!isOpen) return ;

		const source = new EventSource(`http://localhost:3000/api/media/${mediaId}/progress`);

		source.onmessage = (e) => {
			const data = JSON.parse(e.data);
			setProgress(data);
		};

		source.onerror = (err) => {
			console.error("SSE error", err);
			source.close();
		};

		return () => source.close();

	}, [mediaId, isOpen]);

	return (

		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>

			<DialogTrigger asChild disabled={disabled}>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					Live Progress
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Encoding Progress</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-4 gap-4 mt-4">

					<div>

						<p className="text-muted-foreground text-sm text-center">Media ID</p>

						<h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">
							{mediaId}
						</h1>

					</div>

					<div>

						<p className="text-muted-foreground text-sm text-center">Media ID</p>

						<h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">
							{progress.resolution ?? "-"}
						</h1>

					</div>

					<div>

						<p className="text-muted-foreground text-sm text-center">Progress</p>

						<h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">
							{progress.percent != null ? `${progress.percent}%` : "-"}
						</h1>

					</div>

					<div>

						<p className="text-muted-foreground text-sm text-center">Duration</p>

						<h1 className="text-center text-4xl font-extrabold tracking-tight text-balance">
							{formatTimeHuman(progress.elapsedSeconds)}
						</h1>

					</div>

				</div>

				<div className="w-full h-1 bg-muted rounded-full overflow-hidden">
					<div
						className="bg-yellow-400 h-full rounded-full"
						style={{ width: `${progress.percent ?? 0}%` }}
					/>
				</div>

			</DialogContent>
		</Dialog>

	);

};