"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { columns } from "./columns"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InfoPanel } from "./InfoPanel";
import { MouseEvent, useState } from "react";
import { ArrowRight, CircleAlert, Pause, Play, X } from "lucide-react";
import { updateTranscodingQueue } from "@/actions/transcoding/updateQueue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function QueueTable({
	queueState,
	data
}: {
	queueState: QueueState;
	data: Job[]
}) {

	const [infoPanel, setInfoPanel] = useState(false);
	const [infoPanelData, setInfoPanelData] = useState<Job | null>(null);
	const [error, setError] = useState("");

	const table = useReactTable({
		data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	})

	return (

		<div className="w-full h-screen pt-24 px-8 pb-8 flex justify-end space-x-4">

			<div className="flex-1 w-full flex flex-col items-end space-y-2">

				<div className="flex space-x-2">

					{error && (

						<Dialog>

							<DialogTrigger asChild>
								<Button
									variant="destructive"
									size="icon-sm"
								>
									<CircleAlert />
								</Button>
							</DialogTrigger>

							<DialogContent>

								<DialogHeader>
									<DialogTitle>Queue Error</DialogTitle>
								</DialogHeader>

								<p>{error}</p>

								<div className="w-full flex items-end">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setError("")}
									>
										<X />
										Clear
									</Button>
								</div>

							</DialogContent>

						</Dialog>

					)}

					<PauseResumeJobsButton
						currentState={queueState}
						onError={(e) => setError(e)}
					/>

				</div>

				<div className="w-full overflow-hidden rounded-md border">

					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} className="h-14 px-8">
												{header.isPlaceholder
													? null
													: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
											</TableHead>
										)
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className="**:data-[slot=table-cell]:first:w-8">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className=""
									>
										{row.getVisibleCells().map((cell, idx) => (
											<TableCell key={cell.id} className={cn("h-10", idx === row.getAllCells().length - 1 ? "px-2" : "px-8")}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}

										<td className="h-12 flex items-center">
											<Button
												onClick={() => {

													setInfoPanelData(row.original);
													setInfoPanel(true);

												}}
												variant="secondary"
												size="icon-sm"
											>
												<ArrowRight />
											</Button>
										</td>

									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 px-8 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

				</div>

				<div className="flex items-center justify-end space-x-2 py-4">

					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>

				</div>

			</div>

			{infoPanel && infoPanelData && (
				<InfoPanel
					data={infoPanelData}
					onClose={() => setInfoPanel(false)}
				/>
			)}

		</div>


	);

};

function PauseResumeJobsButton({
	currentState,
	onError,
}: {
	currentState: QueueState;
	onError: (e: string) => void;
}) {

	const [queueState, setQueueState] = useState<QueueState>(currentState);

	async function handleQueueUpdate(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();

		try {

			const action = queueState === "active" ? "pause" : "resume";
			const res = await updateTranscodingQueue(action);

			setQueueState(res.state);

		} catch (err) {
			onError((err as Error).message);
		};

	}

	return (

		<div>
			<Button
				variant="outline"
				size="sm"
				onClick={handleQueueUpdate}
			>
				{queueState === "active" ? (
					<>
						<Pause />
						Pause
					</>
				) : (
					<>
						<Play />
						Resume
					</>
				)}
			</Button>
		</div>

	);

};