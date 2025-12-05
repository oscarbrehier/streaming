"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, Copy, Clock, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePagination } from "@/hooks/usePagination"
import { getLogEntries } from "@/lib/api/logs"
import { getLabelBgColor, getLabelColor } from "@/utils/colors"
import { formatRelativeTime } from "@/utils/timeFormat"

export function AuditLogsViewer({
	initialData,
	totalEntries,
}: {
	initialData: AuditLogs[];
	totalEntries: number;
}) {

	const pagination = usePagination({
		initialData,
		totalEntries,
		fetchDataFn: getLogEntries
	});

	const [search, setSearch] = useState("");
	const [actionFilter, setActionFilter] = useState<string>("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filteredLogs = useMemo(() => {

		return pagination.data.filter((log) => {

			const matchesSearch =
				search.toLowerCase() === "" ||
				log.user_id.toLowerCase().includes(search.toLowerCase()) ||
				log.resource.toLowerCase().includes(search.toLowerCase()) ||
				log.action.toLowerCase().includes(search.toLowerCase())

			const matchesFilter = actionFilter === "all" || log.action === actionFilter;

			return matchesSearch && matchesFilter;

		});

	}, [search, actionFilter, pagination.data]);

	const actions = Array.from(new Set(pagination.data.map((log) => log.action)));

	return (

		<div className="w-full h-auto pt-24 px-8 pb-8 mx-auto space-y-4">

			<div className="space-y-4">

				<div>
					<h2 className="text-xl font-semibold text-foreground">Audit Logs</h2>
					<p className="text-sm text-muted-foreground">
						{filteredLogs.length} on this page - {totalEntries} total
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">

					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search by user, resource, or action..."
							value={search}
							onChange={(e) => setSearch(e.target.value)
							}
							className="pl-9 bg-muted border-border"
						/>
					</div>

					<Select
						value={actionFilter}
						onValueChange={(e) => setActionFilter(e)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Actions</SelectLabel>
								<SelectItem value="all">
									All
								</SelectItem>
								{
									actions.map((action) => (
										<SelectItem key={action} value={action} >
											{action.replace(/_/g, " ")}
										</SelectItem>
									))
								}
							</SelectGroup>
						</SelectContent>
					</Select>


					<div className="flex items-center justify-end space-x-2">

						{/* <div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div> */}

						<Button
							variant="outline"
							size="sm"
							onClick={pagination.previousPage}
							disabled={!pagination.canPreviousPage}
						>
							Previous
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={pagination.nextPage}
							disabled={!pagination.canNextPage}
						>
							Next
						</Button>

					</div>

				</div>

			</div>

			<div className="space-y-1 border border-border rounded-lg bg-card overflow-hidden">

				{
					filteredLogs.length === 0 ? (

						<div className="p-8 text-center" >
							<FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
							<p className="text-muted-foreground">No logs found matching your filters</p>
						</div>

					) : (

						filteredLogs.map((log, idx) => (
							<div
								key={log.id}
								className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/30 ${expandedId === log.id ? "bg-muted/50" : ""
									}`}
							>

								<button
									onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
									className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors"
								>

									<div className="shrink-0 w-24 text-xs text-muted-foreground font-mono flex items-center gap-1">
										<Clock className="w-3 h-3 opacity-50" />
										{formatRelativeTime(new Date(log.created_at))}
									</div>

									<div
										className={`shrink-0 px-2 py-1 rounded font-mono text-xs font-semibold ${getLabelBgColor(log.action)} ${getLabelColor(log.action)}`}
									>
										{log.action}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2" >
											<span className="text-foreground font-medium">{log.resource}</span>
											<span className="text-muted-foreground text-sm">•</span>
											<span className="text-muted-foreground text-sm flex items-center gap-1">
												<User className="w-3 h-3" />
												{log.user_id}
											</span>
										</div>
										{
											log.details && Object.keys(log.details).length > 0 && (
												<div className="text-xs text-muted-foreground mt-1 truncate">
													{
														Object.entries(log.details)
															.map(([key, value]) => `${key}: ${String(value).slice(0, 20)}`)
															.join(" • ")
													}
												</div>
											)
										}
									</div>

									<ChevronDown
										className={
											`shrink-0 w-4 h-4 text-muted-foreground transition-transform ${expandedId === log.id ? "rotate-180" : ""
											}`
										}
									/>
								</button>

								{
									expandedId === log.id && log.details && (
										<div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border space-y-2">
											<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</div>
											<div className="bg-card rounded border border-border p-3 font-mono text-xs space-y-1 text-foreground overflow-auto max-h-64">
												<pre className="whitespace-pre-wrap wrap-break-words">{JSON.stringify(log.details, null, 2)}</pre>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													className="text-xs h-7 bg-transparent"
													onClick={() => {
														navigator.clipboard.writeText(JSON.stringify(log.details, null, 2))
													}
													}
												>
													<Copy className="w-3 h-3 mr-1" />
													Copy JSON
												</Button>
											</div>
										</div>
									)
								}

							</div>

						))

					)}

			</div>

			{/* {
				totalEntries > 0 && (
					<div className="text-xs text-muted-foreground text-center py-8 border-t border-border" >
						Showing {pagination.filteredLogs.length} of {totalEntries} initialData
					</div>
				)
			} */}

		</div>

	);

};