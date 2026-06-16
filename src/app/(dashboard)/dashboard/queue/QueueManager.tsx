"use client"

import { useState, useMemo, useTransition } from "react";
import { updateAtlasEntry } from "@/lib/api/atlas";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { RefreshCw, Trash2, RotateCcw, ListVideo } from "lucide-react";

type StatusFilter = "all" | "pending" | "processing" | "completed";

const STATUS_STYLES: Record<string, { text: string; bg: string; border: string }> = {
	pending:    { text: "text-apricot",   bg: "bg-apricot/10",   border: "border-apricot/20"   },
	processing: { text: "text-lavender",  bg: "bg-lavender/10",  border: "border-lavender/20"  },
	completed:  { text: "text-olive",     bg: "bg-olive/10",     border: "border-olive/20"     },
	failed:     { text: "text-coral",     bg: "bg-coral/10",     border: "border-coral/20"     },
};

function relativeTime(date: Date | string) {
	const diff = Date.now() - new Date(date).getTime();
	const s = Math.floor(diff / 1000);
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
	const style = STATUS_STYLES[status] ?? { text: "text-ink3", bg: "bg-panel2", border: "border-line" };
	return (
		<span className={cn(
			"inline-flex items-center px-2 py-0.5 rounded-full border font-jet-mono text-[9px] uppercase tracking-widest",
			style.text, style.bg, style.border
		)}>
			{status}
		</span>
	);
}

async function clearCompleted(): Promise<{ success: boolean; error?: string }> {
	const supabase = createClient();
	const { error } = await (supabase as any)
		.from("atlas_queue")
		.delete()
		.eq("status", "completed");
	if (error) return { success: false, error: error.message };
	return { success: true };
}

export function QueueManager({
	initialData,
	totalCount,
}: {
	initialData: AtlasQueueItem[];
	totalCount: number;
}) {

	const [items, setItems] = useState<AtlasQueueItem[]>(initialData);
	const [filter, setFilter] = useState<StatusFilter>("all");
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
	const [clearing, startClearTransition] = useTransition();
	const [refreshing, startRefreshTransition] = useTransition();

	function setPendingId(id: string, on: boolean) {
		setPendingIds(prev => {
			const next = new Set(prev);
			on ? next.add(id) : next.delete(id);
			return next;
		});
	}

	const counts = useMemo(() => {
		const c: Record<string, number> = {};
		for (const item of items) {
			c[item.status] = (c[item.status] ?? 0) + 1;
		}
		return c;
	}, [items]);

	const filtered = useMemo(() =>
		filter === "all" ? items : items.filter(i => i.status === filter),
	[items, filter]);

	async function handleRetry(id: string) {
		setPendingId(id, true);
		const res = await updateAtlasEntry(id, "pending");
		if (!res?.error) {
			setItems(prev => prev.map(i => i.id === id ? { ...i, status: "pending" } : i));
		}
		setPendingId(id, false);
	}

	function handleClearCompleted() {
		startClearTransition(async () => {
			const res = await clearCompleted();
			if (res.success) {
				setItems(prev => prev.filter(i => i.status !== "completed"));
				if (filter === "completed") setFilter("all");
			}
		});
	}

	function handleRefresh() {
		startRefreshTransition(async () => {
			const supabase = createClient();
			const { data } = await supabase
				.from("atlas_queue")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(100);
			if (data) setItems(data as AtlasQueueItem[]);
		});
	}

	const TABS: { key: StatusFilter; label: string }[] = [
		{ key: "all",        label: `All (${items.length})` },
		{ key: "pending",    label: `Pending (${counts.pending    ?? 0})` },
		{ key: "processing", label: `Processing (${counts.processing ?? 0})` },
		{ key: "completed",  label: `Completed (${counts.completed  ?? 0})` },
	];

	return (

		<div className="min-h-screen bg-bg p-8 space-y-6">

			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
					<h1 className="text-2xl font-semibold text-ink leading-none">Atlas Queue</h1>
					<p className="text-ink3 text-xs font-jet-mono mt-2 uppercase tracking-widest">
						{totalCount.toLocaleString()} total entries
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleRefresh}
						disabled={refreshing}
						className="flex items-center gap-1.5 px-3 py-2 bg-panel border border-line rounded text-ink3 text-xs font-jet-mono uppercase tracking-widest hover:text-ink transition-colors disabled:opacity-50"
					>
						<RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
						Refresh
					</button>
					<button
						onClick={handleClearCompleted}
						disabled={clearing || (counts.completed ?? 0) === 0}
						className="flex items-center gap-1.5 px-3 py-2 bg-coral/10 border border-coral/20 rounded text-coral text-xs font-jet-mono uppercase tracking-widest hover:bg-coral/20 transition-colors disabled:opacity-40"
					>
						<Trash2 className="w-3 h-3" />
						Clear Completed
					</button>
				</div>
			</div>

			{/* Status filter tabs */}
			<div className="flex gap-1 bg-panel border border-line rounded-lg p-1 w-fit">
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setFilter(key)}
						className={cn(
							"px-3 py-1.5 rounded font-jet-mono text-[10px] uppercase tracking-widest transition-colors",
							filter === key
								? "bg-panel2 text-ink"
								: "text-ink4 hover:text-ink3"
						)}
					>
						{label}
					</button>
				))}
			</div>

			{/* Table */}
			<div className="bg-panel border border-line rounded-lg overflow-hidden">

				{/* Column headers */}
				<div className="grid grid-cols-[1fr_100px_200px_90px_80px] gap-4 px-4 py-2.5 border-b border-line bg-panel2">
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Media ID</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Status</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">User</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Created</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-right">Action</span>
				</div>

				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-ink4">
						<ListVideo className="w-7 h-7 mb-3 opacity-30" />
						<p className="font-jet-mono text-[10px] uppercase tracking-widest">No items</p>
					</div>
				) : (
					filtered.map(item => {
						const isPending = pendingIds.has(item.id);
						return (
							<div
								key={item.id}
								className={cn(
									"grid grid-cols-[1fr_100px_200px_90px_80px] gap-4 items-center px-4 py-3 border-b border-line last:border-0 hover:bg-panel2/30 transition-colors",
									isPending && "opacity-50 pointer-events-none"
								)}
							>
								<span className="font-jet-mono text-xs text-ink2 truncate">{item.media_id}</span>
								<StatusBadge status={item.status} />
								<span className="font-jet-mono text-[10px] text-ink4 truncate">{item.user_id}</span>
								<span className="font-jet-mono text-[10px] text-ink4">
									{relativeTime(item.created_at)}
								</span>
								<div className="flex justify-end">
									{item.status !== "completed" && (
										<button
											onClick={() => handleRetry(item.id)}
											disabled={isPending}
											className="flex items-center gap-1 text-ink4 hover:text-lavender transition-colors font-jet-mono text-[9px] uppercase tracking-widest"
										>
											<RotateCcw className="w-3 h-3" />
											Retry
										</button>
									)}
								</div>
							</div>
						);
					})
				)}

			</div>

		</div>

	);

}
