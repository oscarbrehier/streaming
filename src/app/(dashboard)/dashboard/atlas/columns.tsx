import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<AtlasQueueItem>[] = [
	{
		accessorKey: "media_id",
		header: "Media ID",
	},
	{
		accessorKey: "status",
		header: "status"
	}
];