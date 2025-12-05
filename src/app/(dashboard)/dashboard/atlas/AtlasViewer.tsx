"use client"

import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { getAtlasEntries } from "@/lib/api/atlas";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/utils/colors";
import { formatRelativeTime } from "@/utils/timeFormat";
import { Clock, User, FileText } from "lucide-react"

export function AtlasViewer({
	initialData,
	totalEntries,
}: {
	initialData: AtlasQueueItem[];
	totalEntries: number;
}) {

	const pagination = usePagination<AtlasQueueItem>({
		initialData,
		totalEntries,
		fetchDataFn: getAtlasEntries
	});

	return (

		<div className="w-full h-auto pt-24 px-8 pb-8 mx-auto space-y-4">

			<div className="w-full flex justify-between items-end flex-col gap-3 sm:flex-row">

				<div>
					<h2 className="text-xl font-semibold text-foreground">Atlas</h2>
					<p className="text-sm text-muted-foreground">
						{initialData.length} on this page - {totalEntries} total
					</p>
				</div>

				<div className="flex items-center justify-end space-x-2">

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

			<div className="space-y-1 border border-border rounded-lg bg-card overflow-hidden">

				{
					initialData.length === 0 ? (

						<div className="p-8 text-center" >
							<FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
							<p className="text-muted-foreground">No logs found matching your filters</p>
						</div>

					) : (

						initialData.map((item, idx) => (
							<div
								key={item.id}
								className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/30
									}`}
							>

								<button
									className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/20 transition-colors"
								>

									<div className="shrink-0 w-24 text-xs text-muted-foreground font-mono flex items-center gap-1">
										<Clock className="w-3 h-3 opacity-50" />
										{formatRelativeTime(new Date(item.created_at))}
									</div>

									<div
										className={cn(
											"shrink-0 px-2 py-1 rounded font-mono text-xs font-semibold",
											STATUS_COLORS[item.status].bg,
											STATUS_COLORS[item.status].text
										)}>
										{item.status}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2" >
											<span className="text-foreground font-medium">{item.media_id}</span>
											<span className="text-muted-foreground text-sm">•</span>
											<span className="text-muted-foreground text-sm flex items-center gap-1">
												<User className="w-3 h-3" />
												{item.user_id}
											</span>
										</div>

									</div>

								</button>

							</div>

						))

					)}

			</div>

		</div>

	);

};