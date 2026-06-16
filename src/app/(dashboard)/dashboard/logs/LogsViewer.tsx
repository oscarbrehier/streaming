"use client"

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getLogEntries } from "@/lib/api/logs";
import { ChevronDown, ChevronUp, Copy, ScrollText } from "lucide-react";

function relativeTime(date: Date | string) {
	const diff = Date.now() - new Date(date).getTime();
	const s = Math.floor(diff / 1000);
	if (s < 60)   return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60)   return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24)   return `${h}h ago`;
	return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ACTION_PALETTE: Record<string, string> = {
	invite_generated:                "text-olive   bg-olive/10   border-olive/20",
	role_updated:                    "text-lavender bg-lavender/10 border-lavender/20",
	add_failed:                      "text-coral   bg-coral/10   border-coral/20",
	fetch_failed:                    "text-coral   bg-coral/10   border-coral/20",
	add_atlas_failed:                "text-coral   bg-coral/10   border-coral/20",
	invite_generation_failed:        "text-coral   bg-coral/10   border-coral/20",
	role_update_failed:              "text-coral   bg-coral/10   border-coral/20",
	unauthenticated_access_attempt:  "text-coral   bg-coral/10   border-coral/20",
};

function ActionBadge({ action }: { action: string }) {
	const palette = ACTION_PALETTE[action] ?? "text-ink3 bg-panel2 border-line";
	return (
		<span className={cn(
			"inline-flex items-center font-jet-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
			palette
		)}>
			{action.replace(/_/g, " ")}
		</span>
	);
}

export function LogsViewer({
	initialData,
	totalEntries,
}: {
	initialData: AuditLogs[];
	totalEntries: number;
}) {

	const [data, setData] = useState<AuditLogs[]>(initialData);
	const [total, setTotal] = useState(totalEntries);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [actionFilter, setActionFilter] = useState("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const actions = useMemo(() => Array.from(new Set(data.map(l => l.action))), [data]);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return data.filter(log => {
			const matchSearch = !q ||
				log.action.includes(q) ||
				log.resource.toLowerCase().includes(q) ||
				log.user_id?.toLowerCase().includes(q);
			const matchAction = actionFilter === "all" || log.action === actionFilter;
			return matchSearch && matchAction;
		});
	}, [data, search, actionFilter]);

	const PAGE_SIZE = 50;
	const canNext = page * PAGE_SIZE < total;
	const canPrev = page > 1;

	async function fetchPage(p: number) {
		setLoading(true);
		try {
			const res = await getLogEntries(p, PAGE_SIZE);
			setData(res.data);
			setTotal(res.count);
			setPage(p);
			setExpandedId(null);
		} finally {
			setLoading(false);
		}
	}

	return (

		<div className="min-h-screen bg-bg p-8 space-y-6">

			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
					<h1 className="text-2xl font-semibold text-ink leading-none">Audit Logs</h1>
					<p className="text-ink3 text-xs font-jet-mono mt-2 uppercase tracking-widest">
						{filtered.length} shown · {total.toLocaleString()} total
					</p>
				</div>

				{/* Pagination */}
				<div className="flex items-center gap-2">
					<span className="font-jet-mono text-[10px] text-ink4">
						Page {page} of {Math.ceil(total / PAGE_SIZE)}
					</span>
					<button
						onClick={() => fetchPage(page - 1)}
						disabled={!canPrev || loading}
						className="px-3 py-1.5 bg-panel border border-line rounded font-jet-mono text-[10px] uppercase tracking-widest text-ink3 hover:text-ink disabled:opacity-40 transition-colors"
					>
						Prev
					</button>
					<button
						onClick={() => fetchPage(page + 1)}
						disabled={!canNext || loading}
						className="px-3 py-1.5 bg-panel border border-line rounded font-jet-mono text-[10px] uppercase tracking-widest text-ink3 hover:text-ink disabled:opacity-40 transition-colors"
					>
						Next
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-3">
				<input
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder="Search action, resource, user ID…"
					className="flex-1 max-w-sm px-3 py-2 bg-panel border border-line rounded text-sm text-ink placeholder:text-ink4 focus:outline-none focus:border-ink3 font-jet-mono transition-colors"
				/>
				<select
					value={actionFilter}
					onChange={e => setActionFilter(e.target.value)}
					className="px-3 py-2 bg-panel border border-line rounded text-xs text-ink font-jet-mono uppercase tracking-widest focus:outline-none focus:border-ink3 transition-colors"
				>
					<option value="all">All Actions</option>
					{actions.map(a => (
						<option key={a} value={a}>{a.replace(/_/g, " ")}</option>
					))}
				</select>
			</div>

			{/* Log list */}
			<div className="bg-panel border border-line rounded-lg overflow-hidden">

				{/* Column headers */}
				<div className="grid grid-cols-[90px_1fr_220px_120px_20px] gap-4 px-4 py-2.5 border-b border-line bg-panel2">
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Time</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Action</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Resource</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">User</span>
					<span />
				</div>

				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-ink4">
						<ScrollText className="w-7 h-7 mb-3 opacity-30" />
						<p className="font-jet-mono text-[10px] uppercase tracking-widest">No logs found</p>
					</div>
				) : (
					filtered.map(log => {
						const expanded = expandedId === log.id;
						const hasDetails = log.details && Object.keys(log.details).length > 0;
						return (
							<div key={log.id} className={cn(
								"border-b border-line last:border-0",
								expanded && "bg-panel2/30"
							)}>

								<button
									onClick={() => hasDetails && setExpandedId(expanded ? null : log.id)}
									className="w-full grid grid-cols-[90px_1fr_220px_120px_20px] gap-4 items-center px-4 py-3 text-left hover:bg-panel2/30 transition-colors"
								>
									<span className="font-jet-mono text-[10px] text-ink4 shrink-0">
										{relativeTime(log.created_at)}
									</span>

									<div className="min-w-0">
										<ActionBadge action={log.action} />
									</div>

									<span className="font-jet-mono text-[10px] text-ink3 truncate">
										{log.resource?.length > 28 ? `${log.resource.slice(0, 28)}…` : log.resource}
									</span>

									<span className="font-jet-mono text-[10px] text-ink4 truncate">
										{log.user_id ? `${log.user_id.slice(0, 8)}…` : "—"}
									</span>

									{hasDetails ? (
										expanded
											? <ChevronUp className="w-3 h-3 text-ink4 shrink-0" />
											: <ChevronDown className="w-3 h-3 text-ink4 shrink-0" />
									) : <span />}
								</button>

								{expanded && hasDetails && (
									<div className="px-4 pb-4 pt-1 border-t border-line">
										<div className="flex items-start justify-between gap-3 mt-2">
											<pre className="text-[11px] text-ink2 font-jet-mono bg-panel2 rounded p-3 overflow-auto max-h-48 flex-1 whitespace-pre-wrap break-all">
												{JSON.stringify(log.details, null, 2)}
											</pre>
											<button
												onClick={() => navigator.clipboard.writeText(JSON.stringify(log.details, null, 2))}
												className="text-ink4 hover:text-ink transition-colors shrink-0 mt-1"
											>
												<Copy className="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								)}

							</div>
						);
					})
				)}

			</div>

		</div>

	);

}
