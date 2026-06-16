"use client"

import { useState, useMemo, useTransition } from "react";
import { cn } from "@/lib/utils";
import { getUserStats, updateUserRole } from "./actions";
import { generateInviteCode } from "@/actions/generateInviteCode";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X, ChevronRight, Copy, Check } from "lucide-react";

type UserRow = {
	id: string;
	email: string | null;
	display_name: string | null;
	role: string;
	created_at: string | null;
	last_active: string | null;
};

type UserStats = Awaited<ReturnType<typeof getUserStats>>;

function relativeTime(date: string | null) {
	if (!date) return "—";
	const diff = Date.now() - new Date(date).getTime();
	const s = Math.floor(diff / 1000);
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d ago`;
	return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function RoleBadge({ role }: { role: string }) {
	return (
		<span className={cn(
			"font-jet-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border",
			role === "admin"
				? "text-lavender bg-lavender/10 border-lavender/20"
				: "text-ink3 bg-panel2 border-line"
		)}>
			{role}
		</span>
	);
}

function DetailPanel({
	user,
	stats,
	loading,
	onClose,
}: {
	user: UserRow;
	stats: UserStats | null;
	loading: boolean;
	onClose: () => void;
}) {
	return (
		<div className="fixed inset-y-0 right-0 w-[340px] bg-panel border-l border-line z-40 flex flex-col shadow-2xl">

			{/* Header */}
			<div className="flex items-start justify-between px-5 py-4 border-b border-line shrink-0">
				<div className="min-w-0">
					<p className="text-ink text-sm font-medium truncate">
						{user.display_name ?? user.email ?? "Unknown"}
					</p>
					<p className="text-ink4 text-[10px] font-jet-mono mt-0.5 truncate">{user.email}</p>
				</div>
				<button
					onClick={onClose}
					className="text-ink4 hover:text-ink transition-colors ml-3 shrink-0 mt-0.5"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<p className="font-jet-mono text-[10px] uppercase tracking-widest text-ink4">Loading…</p>
				</div>
			) : stats ? (
				<div className="flex-1 overflow-y-auto divide-y divide-line">

					{/* Stats grid */}
					<div className="grid grid-cols-2 gap-px bg-line m-4 mt-5 rounded-lg overflow-hidden border border-line">
						{[
							{ label: "Watches",    value: stats.totalEntries },
							{ label: "Completed",  value: stats.completions  },
							{ label: "Favorites",  value: stats.favorites    },
							{ label: "Watchlist",  value: stats.watchlistCount },
						].map(({ label, value }) => (
							<div key={label} className="bg-panel px-4 py-3">
								<p className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 mb-1">{label}</p>
								<p className="font-jet-mono text-xl text-ink font-semibold">{value}</p>
							</div>
						))}
					</div>

					{/* Avg rating */}
					{stats.avgRating !== null && (
						<div className="px-5 py-4">
							<p className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 mb-1">Avg Rating</p>
							<div className="flex items-baseline gap-1">
								<span className="font-jet-mono text-2xl text-ink">{stats.avgRating}</span>
								<span className="text-ink4 text-xs">/ 10</span>
							</div>
						</div>
					)}

					{/* Watch history */}
					{stats.history.length > 0 && (
						<div className="px-5 py-4">
							<p className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 mb-3">
								Recent Watches
							</p>
							<div className="space-y-2">
								{stats.history.map((h, i) => (
									<div key={i} className="flex items-center justify-between gap-2">
										<span className="text-ink2 text-xs font-jet-mono truncate flex-1">
											{h.media_id}
										</span>
										<span className="text-ink4 text-[10px] shrink-0">
											{h.last_watched ? relativeTime(h.last_watched as string) : "—"}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Meta */}
					<div className="px-5 py-4 space-y-2">
						<div className="flex justify-between">
							<span className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4">Joined</span>
							<span className="font-jet-mono text-[10px] text-ink3">
								{user.created_at
									? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4">Last Active</span>
							<span className="font-jet-mono text-[10px] text-ink3">{relativeTime(user.last_active)}</span>
						</div>
						<div className="flex justify-between">
							<span className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4">User ID</span>
							<span className="font-jet-mono text-[9px] text-ink4 truncate max-w-[160px]">{user.id}</span>
						</div>
					</div>

				</div>
			) : null}

		</div>
	);
}

function InviteGenerator() {

	const [role, setRole] = useState<UserRole>("member");
	const [code, setCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const [copied, setCopied] = useState(false);

	function generate() {
		setCode(null);
		setError(null);
		startTransition(async () => {
			const res = await generateInviteCode(role);
			if (res.code) setCode(res.code);
			else setError(res.error ?? "Failed");
		});
	}

	function copy() {
		if (!code) return;
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="bg-panel border border-line rounded-lg p-5 space-y-4">

			<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Generate Invite</p>

			<div className="flex gap-2">
				<Select value={role} onValueChange={v => setRole(v as UserRole)}>
					<SelectTrigger className="bg-panel2 border-line text-ink h-9 text-xs font-jet-mono w-28">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="member" className="font-jet-mono text-xs uppercase">Member</SelectItem>
						<SelectItem value="admin"  className="font-jet-mono text-xs uppercase">Admin</SelectItem>
					</SelectContent>
				</Select>

				<button
					onClick={generate}
					disabled={pending}
					className="flex-1 py-2 bg-panel2 border border-line rounded text-ink2 text-xs font-jet-mono uppercase tracking-widest hover:text-ink hover:bg-panel transition-colors disabled:opacity-50"
				>
					{pending ? "Generating…" : "Generate"}
				</button>
			</div>

			{code && (
				<div className="flex items-center gap-2 bg-panel2 border border-line rounded px-3 py-2">
					<span className="font-jet-mono text-sm text-ink flex-1 tracking-wider">{code}</span>
					<button onClick={copy} className="text-ink4 hover:text-ink transition-colors shrink-0">
						{copied ? <Check className="w-3.5 h-3.5 text-olive" /> : <Copy className="w-3.5 h-3.5" />}
					</button>
				</div>
			)}

			{error && (
				<p className="text-coral text-xs font-jet-mono">{error}</p>
			)}

			<p className="text-ink4 text-[10px]">Codes expire in 4 hours · Single use</p>

		</div>
	);
}

export function UsersTable({ users }: { users: UserRow[] }) {

	const [search, setSearch] = useState("");
	const [sortKey, setSortKey] = useState<"created_at" | "last_active" | "display_name">("created_at");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
	const [detailStats, setDetailStats] = useState<UserStats | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [pendingRole, startRoleTransition] = useTransition();
	const [localRoles, setLocalRoles] = useState<Record<string, string>>({});

	function toggleSort(key: typeof sortKey) {
		if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
		else { setSortKey(key); setSortDir("desc"); }
	}

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return users
			.filter(u =>
				!q ||
				(u.display_name ?? "").toLowerCase().includes(q) ||
				(u.email ?? "").toLowerCase().includes(q) ||
				u.id.includes(q)
			)
			.sort((a, b) => {
				const dir = sortDir === "asc" ? 1 : -1;
				if (sortKey === "display_name") {
					return dir * (a.display_name ?? "").localeCompare(b.display_name ?? "");
				}
				const aDate = a[sortKey] ?? "";
				const bDate = b[sortKey] ?? "";
				return dir * (aDate > bDate ? 1 : aDate < bDate ? -1 : 0);
			});
	}, [users, search, sortKey, sortDir]);

	async function openDetail(user: UserRow) {
		setSelectedUser(user);
		setDetailStats(null);
		setDetailLoading(true);
		try {
			const stats = await getUserStats(user.id);
			setDetailStats(stats);
		} finally {
			setDetailLoading(false);
		}
	}

	function handleRoleChange(userId: string, newRole: string) {
		setLocalRoles(prev => ({ ...prev, [userId]: newRole }));
		startRoleTransition(async () => {
			await updateUserRole(userId, newRole as UserRole);
		});
	}

	function SortIndicator({ col }: { col: typeof sortKey }) {
		if (sortKey !== col) return <span className="text-ink4 ml-1">↕</span>;
		return <span className="text-ink3 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
	}

	return (

		<div className="min-h-screen bg-bg p-8 space-y-6">

			{/* Header */}
			<div className="flex items-end justify-between">
				<div>
					<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
					<h1 className="text-2xl font-semibold text-ink leading-none">Users</h1>
					<p className="text-ink3 text-xs font-jet-mono mt-2 uppercase tracking-widest">
						{filtered.length} of {users.length}
					</p>
				</div>
				<input
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder="Search by name or email…"
					className="w-64 px-3 py-2 bg-panel border border-line rounded text-sm text-ink placeholder:text-ink4 focus:outline-none focus:border-ink3 font-jet-mono transition-colors"
				/>
			</div>

			{/* Invite generator */}
			<InviteGenerator />

			{/* Table */}
			<div className="bg-panel border border-line rounded-lg overflow-hidden">

				{/* Column headers */}
				<div className="grid grid-cols-[1fr_1fr_100px_110px_100px_24px] gap-4 px-4 py-2.5 border-b border-line bg-panel2">
					<button
						onClick={() => toggleSort("display_name")}
						className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-left flex items-center"
					>
						Name<SortIndicator col="display_name" />
					</button>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Email</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Role</span>
					<button
						onClick={() => toggleSort("created_at")}
						className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-left flex items-center"
					>
						Joined<SortIndicator col="created_at" />
					</button>
					<button
						onClick={() => toggleSort("last_active")}
						className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-left flex items-center"
					>
						Last Active<SortIndicator col="last_active" />
					</button>
					<span />
				</div>

				{filtered.length === 0 ? (
					<div className="px-4 py-12 text-center">
						<p className="font-jet-mono text-[10px] uppercase tracking-widest text-ink4">
							{search ? "No results" : "No users"}
						</p>
					</div>
				) : (
					filtered.map(user => {
						const effectiveRole = localRoles[user.id] ?? user.role;
						return (
							<div
								key={user.id}
								className={cn(
									"grid grid-cols-[1fr_1fr_100px_110px_100px_24px] gap-4 items-center px-4 py-3 border-b border-line last:border-0 hover:bg-panel2/40 transition-colors cursor-pointer",
									selectedUser?.id === user.id && "bg-panel2/60"
								)}
								onClick={() => openDetail(user)}
							>
								<span className="text-ink text-sm truncate">
									{user.display_name ?? <span className="text-ink4 italic">unnamed</span>}
								</span>
								<span className="text-ink3 text-xs font-jet-mono truncate">{user.email ?? "—"}</span>

								{/* Role selector — stop propagation so click doesn't open detail */}
								<div onClick={e => e.stopPropagation()}>
									<Select
										value={effectiveRole}
										onValueChange={v => handleRoleChange(user.id, v)}
										disabled={pendingRole}
									>
										<SelectTrigger className="h-7 bg-transparent border-0 p-0 shadow-none focus:ring-0 w-auto gap-1">
											<RoleBadge role={effectiveRole} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member" className="font-jet-mono text-xs uppercase">Member</SelectItem>
											<SelectItem value="admin"  className="font-jet-mono text-xs uppercase">Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<span className="font-jet-mono text-[10px] text-ink4">
									{user.created_at
										? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
										: "—"}
								</span>
								<span className="font-jet-mono text-[10px] text-ink4">
									{relativeTime(user.last_active)}
								</span>
								<ChevronRight className="w-3.5 h-3.5 text-ink4" />
							</div>
						);
					})
				)}

			</div>

			{/* Detail panel */}
			{selectedUser && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-30"
						onClick={() => setSelectedUser(null)}
					/>
					<DetailPanel
						user={selectedUser}
						stats={detailStats}
						loading={detailLoading}
						onClose={() => setSelectedUser(null)}
					/>
				</>
			)}

		</div>

	);

}
