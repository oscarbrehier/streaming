import { Item, ItemContent, ItemHeader, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleDashed, CircleX, Logs, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MouseEvent, useEffect, useState } from "react";
import { formatTimeHuman } from "@/utils/timeFormat";
import { removeTranscodingJob } from "@/actions/transcoding/removeJob";
import { retryTranscodingJob } from "@/actions/transcoding/retryJob";

export function InfoPanel({
	data,
	onClose
}: {
	data: Job;
	onClose: () => void;
}) {

	const [error, setError] = useState("");

	const mediaId = typeof data.data === "object" ? data.data.originalFilename : null;

	const [progress, setProgress] = useState({
		durationSeconds: null,
		elapsedSeconds: null,
		percent: null,
		resolution: null,
	});

	useEffect(() => {

		if (data.status !== "active") return;

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

	}, [data.status, data.name])

	return (

		<div className="w-full max-w-sm h-full">

			<Item className="w-full border border-input">

				<ItemHeader>
					<div className="w-full flex items-center justify-between">

						<ItemTitle>
							Job {data.id}
							<span className="text-muted-foreground">({data.status})</span>
						</ItemTitle>
						<Button
							onClick={onClose}
							variant="secondary"
							size="icon-sm"
						>
							<X />
						</Button>

					</div>
				</ItemHeader>

				<ItemContent
					className="space-y-8"
				>

					<div className="w-full flex items-center justify-between">
						<p className="text-muted-foreground">Media ID</p>
						<p className="">
							{mediaId ?? "—"}
						</p>
					</div>

					{error && <p className="text-destructive">{error}</p>}

					<div className="space-x-2">

						<JobActionButton
							jobId={data.id}
							action="retry"
							onError={(e) => setError(e)}
							disabled={data.status !== "active"}
						/>

						<JobActionButton
							jobId={data.id}
							action="remove"
							onError={(e) => setError(e)}
							disabled={data.status !== "active"}
						/>

					</div>

					{data.status === "active" && (

						<div className="space-y-2">

							<div className="flex items-center ml-2 space-x-2">
								<CircleDashed className="text-muted-foreground" size={14} />
								<p className="">
									Progress
								</p>
							</div>

							<div
								className="divide-y divide-input border border-input rounded-md px-2 py-1"
							>

								<div className="w-full flex justify-between py-1 px-0.5">
									<Button className="w-full flex justify-between" variant="ghost" size="sm">
										<p className="text-muted-foreground">Progress</p>
										<p className="">{progress.percent != null ? `${progress.percent}%` : "-"}</p>
									</Button>
								</div>

								<div className="w-full flex justify-between py-1 px-0.5">
									<Button className="w-full flex justify-between" variant="ghost" size="sm">
										<p className="text-muted-foreground">Resolution</p>
										<p className="">{progress.resolution ?? "-"}</p>
									</Button>
								</div>

								<div className="w-full flex justify-between py-1 px-0.5">
									<Button className="w-full flex justify-between" variant="ghost" size="sm">
										<p className="text-muted-foreground">Elapsed Time</p>
										<p className="">{formatTimeHuman(progress.elapsedSeconds)}</p>
									</Button>
								</div>

							</div>
						</div>

					)}

					{data.status === "failed" && data.stacktrace && (

						<div className="space-y-2">

							<div className="flex items-center ml-2 space-x-2">
								<Logs className="text-muted-foreground" size={14} />
								<p className="">
									Stack Trace
								</p>
							</div>

							<ScrollArea
								className="max-h-52 overflow-y-scroll border border-input rounded-md px-2 py-1 whitespace-normal"
							>

								<p className="break-all whitespace-pre-wrap">
									{"Error: FFmpeg failed with code 234 at ChildProcess.<anonymous> (file:///home/deployer/streaming-api/src/services/media/transcodeVideoToAdaptiveHLS.ts:116:12) at ChildProcess.emit (node:events:518:28) at maybeClose (node:internal/child_process:1101:16) at Process.ChildProcess._handle.onexit (node:internal/child_process:304:5)Error: FFmpeg failed with code 234 at ChildProcess.<anonymous> (file:///home/deployer/streaming-api/src/services/media/transcodeVideoToAdaptiveHLS.ts:155:12) at ChildProcess.emit (node:events:518:28) at maybeClose (node:internal/child_process:1101:16) at Process.ChildProcess._handle.onexit (node:internal/child_process:304:5)Error: FFmpeg failed with code 234 at ChildProcess.<anonymous> (file:///home/deployer/streaming-api/src/services/media/transcodeVideoToAdaptiveHLS.ts:124:16) at ChildProcess.emit (node:events:518:28) at maybeClose (node:internal/child_process:1101:16) at Process.ChildProcess._handle.onexit (node:internal/child_process:304:5)"}
								</p>

							</ScrollArea>

						</div>

					)}

				</ItemContent>
			</Item>

		</div>

	);

};

function JobActionButton({
	jobId,
	action,
	disabled,
	onError
}: {
	jobId: string;
	action: "retry" | "remove";
	disabled: boolean;
	onError: (error: string) => void;
}) {

	const [success, setSuccess] = useState<boolean | null>(null);

	async function handleRemoveJob(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();
		setSuccess(null);

		try {

			const fn = action === "remove" ? removeTranscodingJob : retryTranscodingJob;

			const res = await fn(jobId);
			setSuccess(res.success);

		} catch (err) {
			onError((err as Error).message);
		};

	};

	return (

		<Button
			onClick={handleRemoveJob}
			disabled={disabled}
			variant="secondary"
		>
			{success !== null && (
				success ? <CircleCheck /> : <CircleX />
			)}
			{action === "remove" ? "Remove Job" : "Retry Job"}
		</Button>

	);

};