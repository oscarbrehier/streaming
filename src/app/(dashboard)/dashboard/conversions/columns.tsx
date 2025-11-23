import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type Job = {
	id: string;
	name: string;
	data: Record<string, any> | string;
	opts: { attempts: number; delay: number; timestamp: number };
	progress: number;
	delay: number;
	timestamp: number;
	attemptsMade: number;
	failedReason: string;
	stacktrace: string[];
	returnvalue: string;
	debounceId: string;
	finishedOn: number;
	processedOn: number;
	status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
};

export const columns: ColumnDef<Job>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "attemptsMade",
		header: "Attemps",
	},
	{
		accessorFn: row => {
			const start = row.processedOn;
			const end = row.finishedOn;

			if (!start || !end) return null;

			const durationMs = end - start;
			return durationMs;
		},
		header: "Duration",
		cell: info => {
			const durationMs = info.getValue<number>();
			return durationMs != null ? `${(durationMs / 1000).toFixed(2)}s` : "—";
		}
	},
	{
		id: "actions",
		cell: ({ row }) => {

			const job = row.original;

			return (

				<div className="flex justify-end">
					<DropdownMenu>

						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="size-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-56" align="end">

							<DropdownMenuLabel>Actions</DropdownMenuLabel>


							<Dialog>

								<DialogTrigger asChild disabled={!job.stacktrace || job.stacktrace.length === 0}>
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										View stack trace
									</DropdownMenuItem>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Stack Trace</DialogTitle>
									</DialogHeader>
									{job.stacktrace ?? ""}
								</DialogContent>

							</Dialog>

						</DropdownMenuContent>


					</DropdownMenu >
				</div>

			)

		}
	},
];