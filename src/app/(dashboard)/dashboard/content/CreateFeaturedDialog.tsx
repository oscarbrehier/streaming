"use client"

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { addFeaturedContent } from "@/utils/db/featuredContent";
import { constructImg } from "@/lib/tmdb/constructImg";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const FEATURE_TYPES: FeatureType[] = ["hero", "banner", "spotlight", "trending"];

type FormState = {
	headline: string;
	subheadline: string;
	feature_type: FeatureType;
	content_type: string;
	priority: number;
	is_active: boolean;
	active_from: string;
	active_to: string;
};

const INITIAL_FORM: FormState = {
	headline: "",
	subheadline: "",
	feature_type: "hero",
	content_type: "movie",
	priority: 1,
	is_active: true,
	active_from: "",
	active_to: "",
};

type AnyMedia = MovieSummary & Partial<TvSummary>;

export function CreateFeaturedDialog({
	open,
	onClose,
	onCreate,
}: {
	open: boolean;
	onClose: () => void;
	onCreate: (item: FeaturedContent) => void;
}) {

	const [query, setQuery] = useState("");
	const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
	const [results, setResults] = useState<AnyMedia[]>([]);
	const [selected, setSelected] = useState<AnyMedia | null>(null);
	const [form, setForm] = useState<FormState>(INITIAL_FORM);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!query.trim()) { setResults([]); return; }
		const t = setTimeout(() => search(query.trim()), 420);
		return () => clearTimeout(t);
	}, [query, mediaType]);

	async function search(q: string) {
		try {
			const endpoint = `/search/${mediaType}?query=${encodeURIComponent(q)}&language=en-US&page=1`;
			const res = await fetch(`/api/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
			const data = await res.json();
			setResults(data.results ?? []);
		} catch {
			setResults([]);
		}
	}

	function selectMedia(media: AnyMedia) {
		setSelected(media);
		const title = media.title ?? media.name ?? "";
		setForm(prev => ({
			...prev,
			headline: prev.headline || title,
			content_type: mediaType,
		}));
	}

	function update<K extends keyof FormState>(k: K, v: FormState[K]) {
		setForm(prev => ({ ...prev, [k]: v }));
	}

	async function handleSubmit(e: React.FormEvent) {

		e.preventDefault();
		if (!selected) { setError("Select a title first"); return; }

		setSubmitting(true);
		setError(null);

		try {

			const payload: Partial<FeaturedContent> = {
				tmdb_id: selected.id,
				headline: form.headline || null,
				subheadline: form.subheadline || null,
				feature_type: form.feature_type,
				content_type: form.content_type,
				is_active: form.is_active,
				priority: form.priority,
				active_from: form.active_from ? new Date(form.active_from) : null,
				active_to: form.active_to ? new Date(form.active_to) : null,
				poster_path: selected.poster_path ?? null,
				backdrop_path: selected.backdrop_path ?? null,
			};

			const res = await addFeaturedContent(payload);

			if (res.success) {
				onCreate({
					...payload,
					id: crypto.randomUUID(),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				} as FeaturedContent);
				reset();
			} else {
				setError(res.error ?? "Failed to create entry");
			}

		} catch {
			setError("An unexpected error occurred");
		} finally {
			setSubmitting(false);
		}

	}

	function reset() {
		setQuery("");
		setResults([]);
		setSelected(null);
		setForm(INITIAL_FORM);
		setError(null);
	}

	function handleClose() {
		reset();
		onClose();
	}

	const selectedTitle = selected?.title ?? selected?.name ?? "";
	const selectedYear = (selected?.release_date ?? (selected as any)?.first_air_date ?? "")?.slice(0, 4);

	return (

		<Dialog open={open} onOpenChange={o => !o && handleClose()}>

			<DialogContent className="max-w-5xl h-[84vh] flex flex-col gap-0 p-0 overflow-hidden !bg-panel border-line">

				<DialogHeader className="px-6 py-4 border-b border-line shrink-0">
					<DialogTitle className="font-jet-mono text-[10px] uppercase tracking-[0.2em] text-ink3">
						New Featured Entry
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 flex overflow-hidden">

					{/* ── Left: TMDB search ───────────────────────────────────── */}
					<div className="w-[45%] shrink-0 border-r border-line flex flex-col gap-3 p-4 overflow-hidden">

						{/* Search bar + type toggle */}
						<div className="flex items-center gap-2 shrink-0">

							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink3 pointer-events-none" />
								<input
									value={query}
									onChange={e => setQuery(e.target.value)}
									placeholder="Search TMDB..."
									className="w-full pl-9 pr-3 py-2 bg-panel2 border border-line rounded text-sm text-ink placeholder:text-ink4 focus:outline-none focus:border-ink3 font-jet-mono transition-colors"
								/>
							</div>

							<div className="flex gap-1 shrink-0">
								{(["movie", "tv"] as const).map(t => (
									<button
										key={t}
										type="button"
										onClick={() => setMediaType(t)}
										className={cn(
											"px-3 py-1.5 text-[9px] font-jet-mono uppercase tracking-widest rounded transition-colors",
											mediaType === t
												? "bg-ink text-bg"
												: "bg-panel2 text-ink3 hover:text-ink2 border border-line"
										)}
									>
										{t}
									</button>
								))}
							</div>

						</div>

						{/* Results grid */}
						<div className="flex-1 overflow-y-auto">
							{results.length === 0 ? (
								<div className="flex h-full items-center justify-center">
									<p className="font-jet-mono text-[10px] uppercase tracking-[0.2em] text-ink4 text-center">
										{query ? "No results found" : "Search for a title above"}
									</p>
								</div>
							) : (
								<div className="grid grid-cols-3 gap-2 pb-1">
									{results.map(item => {
										const title = item.title ?? item.name ?? "";
										const isActive = selected?.id === item.id;
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => selectMedia(item)}
												className={cn(
													"relative aspect-[2/3] rounded overflow-hidden bg-panel2 text-left transition-all focus:outline-none",
													isActive
														? "ring-2 ring-lavender ring-offset-1 ring-offset-panel"
														: "hover:opacity-85"
												)}
											>
												{item.poster_path ? (
													<img
														src={constructImg(item.poster_path)}
														className="w-full h-full object-cover"
														alt={title}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center p-2">
														<span className="text-[9px] text-ink3 font-jet-mono text-center leading-tight">{title}</span>
													</div>
												)}
												<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 pt-8">
													<p className="text-[9px] text-ink leading-snug font-jet-mono">{title}</p>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>

					</div>

					{/* ── Right: Form ───────────────────────────────────────── */}
					<div className="flex-1 flex flex-col overflow-hidden">

						{/* Selected media preview strip */}
						{selected && (
							<div className="shrink-0 flex gap-3 items-center px-5 py-3 border-b border-line bg-panel2/40">
								{(selected.backdrop_path ?? selected.poster_path) && (
									<img
										src={constructImg(selected.backdrop_path ?? selected.poster_path ?? "")}
										className="h-11 w-20 object-cover rounded-sm shrink-0"
										alt=""
									/>
								)}
								<div className="min-w-0">
									<p className="text-ink text-sm font-medium leading-snug truncate">{selectedTitle}</p>
									<p className="text-ink3 text-[10px] font-jet-mono mt-0.5">
										TMDB #{selected.id}
										{selectedYear && ` · ${selectedYear}`}
									</p>
								</div>
							</div>
						)}

						{/* Form fields */}
						<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">

							{/* Headline */}
							<div className="space-y-1.5">
								<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
									Headline
								</label>
								<input
									value={form.headline}
									onChange={e => update("headline", e.target.value)}
									placeholder="Display headline — defaults to title"
									className="w-full px-3 py-2 bg-panel2 border border-line rounded text-sm text-ink placeholder:text-ink4 focus:outline-none focus:border-ink3 transition-colors"
								/>
							</div>

							{/* Subheadline */}
							<div className="space-y-1.5">
								<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
									Subheadline
								</label>
								<textarea
									value={form.subheadline}
									onChange={e => update("subheadline", e.target.value)}
									placeholder="Tagline or editorial blurb"
									rows={2}
									className="w-full px-3 py-2 bg-panel2 border border-line rounded text-sm text-ink placeholder:text-ink4 focus:outline-none focus:border-ink3 transition-colors resize-none"
								/>
							</div>

							{/* Feature type + Content type */}
							<div className="grid grid-cols-2 gap-3">

								<div className="space-y-1.5">
									<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
										Feature Type
									</label>
									<Select
										value={form.feature_type}
										onValueChange={v => update("feature_type", v as FeatureType)}
									>
										<SelectTrigger className="bg-panel2 border-line text-ink h-9 text-sm font-jet-mono">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FEATURE_TYPES.map(t => (
												<SelectItem key={t} value={t} className="font-jet-mono uppercase text-xs">
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
										Content Type
									</label>
									<Select
										value={form.content_type}
										onValueChange={v => update("content_type", v)}
									>
										<SelectTrigger className="bg-panel2 border-line text-ink h-9 text-sm font-jet-mono">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="movie" className="font-jet-mono uppercase text-xs">Movie</SelectItem>
											<SelectItem value="tv" className="font-jet-mono uppercase text-xs">TV Series</SelectItem>
										</SelectContent>
									</Select>
								</div>

							</div>

							{/* Priority */}
							<div className="space-y-1.5">
								<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
									Priority
								</label>
								<input
									type="number"
									min={1}
									value={form.priority}
									onChange={e => update("priority", parseInt(e.target.value) || 1)}
									className="w-full px-3 py-2 bg-panel2 border border-line rounded text-sm text-ink font-jet-mono focus:outline-none focus:border-ink3 transition-colors"
								/>
								<p className="text-ink4 text-[10px] font-jet-mono">Lower numbers surface first</p>
							</div>

							{/* Active toggle */}
							<div className="flex items-center justify-between px-4 py-3 bg-panel2 border border-line rounded">
								<div>
									<p className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink2">Active</p>
									<p className="text-ink3 text-xs mt-0.5">Show immediately on save</p>
								</div>
								<Switch
									checked={form.is_active}
									onCheckedChange={v => update("is_active", v)}
								/>
							</div>

							{/* Date range */}
							<div className="grid grid-cols-2 gap-3">

								<div className="space-y-1.5">
									<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
										Active From
									</label>
									<input
										type="datetime-local"
										value={form.active_from}
										onChange={e => update("active_from", e.target.value)}
										className="w-full px-3 py-2 bg-panel2 border border-line rounded text-sm text-ink font-jet-mono focus:outline-none focus:border-ink3 transition-colors"
									/>
								</div>

								<div className="space-y-1.5">
									<label className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
										Active To
									</label>
									<input
										type="datetime-local"
										value={form.active_to}
										onChange={e => update("active_to", e.target.value)}
										className="w-full px-3 py-2 bg-panel2 border border-line rounded text-sm text-ink font-jet-mono focus:outline-none focus:border-ink3 transition-colors"
									/>
								</div>

							</div>

							{error && (
								<p className="text-xs text-destructive font-jet-mono">{error}</p>
							)}

							<button
								type="submit"
								disabled={submitting || !selected}
								className="w-full py-2.5 bg-ink text-bg text-xs font-jet-mono uppercase tracking-[0.2em] rounded hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
							>
								{submitting ? "Saving…" : "Create Entry"}
							</button>

						</form>

					</div>

				</div>

			</DialogContent>

		</Dialog>

	);

}
