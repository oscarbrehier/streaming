import { ColumnDef } from "@tanstack/react-table";

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
	}
];