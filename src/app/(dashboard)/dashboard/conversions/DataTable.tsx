"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
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
import { columns, Job } from "./columns"
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export function DataTable({
	data
}: {
	data: Job[]
}) {

	const table = useReactTable({
		data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<div className="overflow-hidden rounded-md border w-full max-w-6xl">
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
							>
								{row.getVisibleCells().map((cell, idx) => (
									<TableCell key={cell.id} className={cn("h-10", idx === row.getAllCells().length - 1 ? "px-2" : "px-8")}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
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
	)
}