"use client"

import { useState } from "react";
import { deleteFeaturedContent, updateFeaturedContent } from "@/utils/db/featuredContent";
import { constructImg } from "@/lib/tmdb/constructImg";
import { Switch } from "@/components/ui/switch";
import { CreateFeaturedDialog } from "./CreateFeaturedDialog";
import { cn } from "@/lib/utils";
import { Plus, Star, Trash2 } from "lucide-react";

const TYPE_STYLES: Record<string, string> = {
	hero:      "bg-apricot/10 text-apricot border-apricot/20",
	banner:    "bg-lavender/10 text-lavender border-lavender/20",
	spotlight: "bg-olive/10 text-olive border-olive/20",
	trending:  "bg-coral/10 text-coral border-coral/20",
};

function formatDate(d: string | Date | null | undefined) {
	if (!d) return null;
	return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Row({
	item,
	pending,
	onToggle,
	onPriority,
	onDelete,
}: {
	item: FeaturedContent;
	pending: boolean;
	onToggle:   (id: string, v: boolean) => void;
	onPriority: (id: string, v: number)  => void;
	onDelete:   (id: string)             => void;
}) {
	return (
		<div className={cn(
			"grid items-center gap-4 px-4 py-3 border-b border-line last:border-0 transition-colors hover:bg-panel2/30",
			"grid-cols-[2.25rem,1fr,5rem,4.5rem,2.5rem,1.5rem]",
			pending && "opacity-50 pointer-events-none"
		)}>

			{/* Poster */}
			<div className="w-9 h-12 rounded-sm overflow-hidden bg-panel2 shrink-0">
				{item.poster_path ? (
					<img src={constructImg(item.poster_path)} className="w-full h-full object-cover" alt="" />
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<span className="text-[9px] text-ink4 font-jet-mono">{item.tmdb_id}</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="min-w-0">
				<p className="text-ink text-sm leading-snug truncate">
					{item.headline || `TMDB #${item.tmdb_id}`}
				</p>
				<div className="flex items-center gap-2 mt-0.5 flex-wrap">
					{item.subheadline && (
						<span className="text-ink3 text-xs truncate max-w-xs">{item.subheadline}</span>
					)}
					{(item.active_from || item.active_to) && (
						<span className="text-ink4 text-[10px] font-jet-mono">
							{formatDate(item.active_from) ?? "∞"} → {formatDate(item.active_to) ?? "∞"}
						</span>
					)}
				</div>
			</div>

			{/* Feature type badge */}
			<div className="flex justify-center">
				<span className={cn(
					"px-2 py-0.5 rounded-full border text-[9px] font-jet-mono uppercase tracking-wider",
					TYPE_STYLES[item.feature_type] ?? "bg-panel2 text-ink3 border-line"
				)}>
					{item.feature_type}
				</span>
			</div>

			{/* Priority */}
			<div className="flex justify-center">
				<input
					type="number"
					min={1}
					value={item.priority}
					onChange={e => {
						const v = parseInt(e.target.value);
						if (!isNaN(v) && v >= 1) onPriority(item.id, v);
					}}
					className="w-14 text-center text-sm bg-panel2 border border-line rounded px-1 py-0.5 text-ink font-jet-mono focus:outline-none focus:border-ink3 transition-colors"
				/>
			</div>

			{/* Active toggle */}
			<div className="flex justify-center">
				<Switch
					checked={item.is_active}
					onCheckedChange={v => onToggle(item.id, v)}
					size="sm"
				/>
			</div>

			{/* Delete */}
			<div className="flex justify-center">
				<button
					onClick={() => onDelete(item.id)}
					className="text-ink4 hover:text-coral transition-colors p-0.5"
					aria-label="Delete"
				>
					<Trash2 className="w-3.5 h-3.5" />
				</button>
			</div>

		</div>
	);
}

export function FeaturedContentManager({ initialData }: { initialData: FeaturedContent[] }) {

	const [items, setItems] = useState<FeaturedContent[]>(initialData);
	const [pending, setPending] = useState<Set<string>>(new Set());
	const [createOpen, setCreateOpen] = useState(false);

	function setPendingId(id: string, on: boolean) {
		setPending(prev => {
			const next = new Set(prev);
			on ? next.add(id) : next.delete(id);
			return next;
		});
	}

	async function handleToggle(id: string, value: boolean) {
		setItems(prev => prev.map(i => i.id === id ? { ...i, is_active: value } : i));
		setPendingId(id, true);
		await updateFeaturedContent(id, { is_active: value });
		setPendingId(id, false);
	}

	async function handlePriority(id: string, value: number) {
		setItems(prev =>
			prev.map(i => i.id === id ? { ...i, priority: value } : i)
				.sort((a, b) => a.priority - b.priority)
		);
		setPendingId(id, true);
		await updateFeaturedContent(id, { priority: value });
		setPendingId(id, false);
	}

	async function handleDelete(id: string) {
		setPendingId(id, true);
		const res = await deleteFeaturedContent(id);
		if (res.success) setItems(prev => prev.filter(i => i.id !== id));
		else setPendingId(id, false);
	}

	function handleCreate(item: FeaturedContent) {
		setItems(prev => [...prev, item].sort((a, b) => a.priority - b.priority));
		setCreateOpen(false);
	}

	return (

		<div className="min-h-screen bg-bg p-8 space-y-8">

			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">
						Admin / Editorial
					</p>
					<h1 className="text-2xl font-semibold text-ink leading-none">Featured Content</h1>
					<p className="text-ink3 text-xs font-jet-mono mt-2 uppercase tracking-widest">
						{items.length} {items.length === 1 ? "entry" : "entries"}
					</p>
				</div>
				<button
					onClick={() => setCreateOpen(true)}
					className="flex items-center gap-2 px-4 py-2 bg-panel2 border border-line rounded-full text-ink2 text-xs font-jet-mono uppercase tracking-widest hover:bg-panel hover:text-ink transition-colors"
				>
					<Plus className="w-3.5 h-3.5" />
					Add Entry
				</button>
			</div>

			{/* Table */}
			{items.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-32 text-ink4 border border-line rounded-lg bg-panel">
					<Star className="w-7 h-7 mb-4 opacity-30" />
					<p className="font-jet-mono text-[10px] uppercase tracking-[0.2em]">No featured content</p>
					<p className="text-ink4 text-xs mt-1">Add an entry to get started</p>
				</div>
			) : (
				<div className="border border-line rounded-lg overflow-hidden bg-panel">
					<div className={cn(
						"grid items-center gap-4 px-4 py-2.5 border-b border-line bg-panel2",
						"grid-cols-[2.25rem,1fr,5rem,4.5rem,2.5rem,1.5rem]"
					)}>
						<span />
						<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Title</span>
						<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-center">Type</span>
						<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-center">Priority</span>
						<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-center">Active</span>
						<span />
					</div>
					{items.map(item => (
						<Row
							key={item.id}
							item={item}
							pending={pending.has(item.id)}
							onToggle={handleToggle}
							onPriority={handlePriority}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			<CreateFeaturedDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onCreate={handleCreate}
			/>

		</div>

	);

}
