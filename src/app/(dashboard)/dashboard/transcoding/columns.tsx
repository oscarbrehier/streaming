import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Job>[] = [
	{
		accessorKey: "id",
		header: "Id",
		cell: row => {

			return <p className="w-32">{row.getValue<string>()}</p>

		}
	},
	{
		accessorFn: (row) => {

			const name = typeof row.data === "object" && row.data !== null
				? row.data.originalFilename ?? "—"
				: "—";

			return name;

		},
		header: "Name",
		cell: row => {

			const name = row.getValue<string>();
			return <p className="w-60">{name}</p>;

		}
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
		accessorFn: (row) => {
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