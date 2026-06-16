import { createClient } from "@/utils/supabase/server";
import { SystemInformation } from "./SystemInformation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function fmt(n: number) {
	return n.toLocaleString("en-US");
}

function relativeTime(date: string | Date) {
	const diff = Date.now() - new Date(date).getTime();
	const s = Math.floor(diff / 1000);
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

const ACTION_COLORS: Record<string, string> = {
	invite_generated:         "text-olive",
	add_failed:               "text-coral",
	fetch_failed:             "text-coral",
	add_atlas_failed:         "text-coral",
	invite_generation_failed: "text-coral",
	unauthenticated_access_attempt: "text-coral",
};

const QUEUE_COLORS: Record<string, string> = {
	pending:    "text-apricot",
	processing: "text-lavender",
	completed:  "text-olive",
};

export default async function Page() {

	const supabase = await createClient();

	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

	const [
		totalUsersRes,
		newUsersRes,
		atlasPendingRes,
		activeFeaturedRes,
		totalWatchedRes,
		completedRes,
		recentLogsRes,
		nextExpiringRes,
		queueDataRes,
	] = await Promise.all([
		supabase.from("profiles").select("*", { count: "exact", head: true }),
		supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
		supabase.from("atlas_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
		supabase.from("featured_content").select("*", { count: "exact", head: true }).eq("is_active", true),
		supabase.from("user_media_status").select("*", { count: "exact", head: true }),
		supabase.from("user_media_status").select("*", { count: "exact", head: true }).eq("completed", true),
		supabase.from("audit_logs").select("id, action, resource, user_id, created_at").order("created_at", { ascending: false }).limit(15),
		supabase.from("featured_content").select("id, headline, tmdb_id, feature_type, active_to").eq("is_active", true).not("active_to", "is", null).order("active_to", { ascending: true }).limit(3),
		supabase.from("atlas_queue").select("status").limit(2000),
	]);

	const totalUsers   = totalUsersRes.count   ?? 0;
	const newUsers     = newUsersRes.count      ?? 0;
	const atlasPending = atlasPendingRes.count  ?? 0;
	const activeFeat   = activeFeaturedRes.count ?? 0;
	const totalWatched = totalWatchedRes.count  ?? 0;
	const completed    = completedRes.count     ?? 0;
	const recentLogs   = recentLogsRes.data     ?? [];
	const nextExpiring = nextExpiringRes.data   ?? [];

	const completionRate = totalWatched > 0 ? Math.round((completed / totalWatched) * 100) : 0;

	const queueByStatus = (queueDataRes.data ?? []).reduce<Record<string, number>>((acc, item) => {
		acc[item.status] = (acc[item.status] ?? 0) + 1;
		return acc;
	}, {});

	const metrics = [
		{
			label: "Total Users",
			value: fmt(totalUsers),
			sub:   `+${newUsers} this week`,
			href:  "/dashboard/users",
		},
		{
			label: "Watches",
			value: fmt(totalWatched),
			sub:   `${completionRate}% completion rate`,
			href:  "/dashboard/analytics",
		},
		{
			label: "Queue Pending",
			value: fmt(atlasPending),
			sub:   "awaiting processing",
			href:  "/dashboard/queue",
		},
		{
			label: "Live Features",
			value: fmt(activeFeat),
			sub:   "active featured entries",
			href:  "/dashboard/content",
		},
		{
			label: "New This Week",
			value: fmt(newUsers),
			sub:   "user registrations",
			href:  "/dashboard/users",
		},
	];

	return (

		<div className="min-h-screen bg-bg p-8 space-y-8">

			{/* Header */}
			<div>
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
				<h1 className="text-2xl font-semibold text-ink leading-none">Overview</h1>
			</div>

			{/* Metric tiles */}
			<div className="grid grid-cols-5 gap-3">
				{metrics.map(m => (
					<Link
						key={m.label}
						href={m.href}
						className="bg-panel border border-line rounded-lg p-4 space-y-2 hover:bg-panel2/60 transition-colors group"
					>
						<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink4">{m.label}</p>
						<p className="font-jet-mono text-[1.75rem] font-semibold text-ink leading-none group-hover:text-ink transition-colors">
							{m.value}
						</p>
						<p className="text-ink4 text-[11px]">{m.sub}</p>
					</Link>
				))}
			</div>

			{/* Two-column: activity feed + right panel */}
			<div className="grid grid-cols-[1fr_280px] gap-6 items-start">

				{/* Activity feed */}
				<div className="bg-panel border border-line rounded-lg overflow-hidden">

					<div className="px-4 py-3 border-b border-line flex items-center justify-between">
						<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
							Recent Activity
						</p>
						<Link
							href="/dashboard/logs"
							className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4 hover:text-ink3 transition-colors"
						>
							View all →
						</Link>
					</div>

					<div className="divide-y divide-line">
						{recentLogs.length === 0 ? (
							<div className="px-4 py-8 text-center">
								<p className="font-jet-mono text-[10px] uppercase tracking-widest text-ink4">No activity</p>
							</div>
						) : recentLogs.map(log => (
							<div key={log.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-panel2/30 transition-colors">
								<span className="font-jet-mono text-[10px] text-ink4 shrink-0 w-14 text-right">
									{relativeTime(log.created_at)}
								</span>
								<span className={cn(
									"font-jet-mono text-[10px] uppercase tracking-wide shrink-0 truncate max-w-[160px]",
									ACTION_COLORS[log.action] ?? "text-ink3"
								)}>
									{log.action.replace(/_/g, " ")}
								</span>
								<span className="text-ink4 text-[11px] truncate min-w-0">
									{log.resource?.length > 20 ? `${log.resource.slice(0, 20)}…` : log.resource}
								</span>
							</div>
						))}
					</div>

				</div>

				{/* Right column */}
				<div className="space-y-4">

					{/* Queue status */}
					<div className="bg-panel border border-line rounded-lg overflow-hidden">
						<div className="px-4 py-3 border-b border-line flex items-center justify-between">
							<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Queue</p>
							<Link href="/dashboard/queue" className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4 hover:text-ink3 transition-colors">
								Manage →
							</Link>
						</div>
						<div className="divide-y divide-line">
							{(["pending", "processing", "completed"] as const).map(status => (
								<div key={status} className="px-4 py-2.5 flex items-center justify-between">
									<span className={cn("font-jet-mono text-[10px] uppercase tracking-widest", QUEUE_COLORS[status])}>
										{status}
									</span>
									<span className="font-jet-mono text-sm text-ink">
										{fmt(queueByStatus[status] ?? 0)}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Next expiring featured content */}
					{nextExpiring.length > 0 && (
						<div className="bg-panel border border-line rounded-lg overflow-hidden">
							<div className="px-4 py-3 border-b border-line flex items-center justify-between">
								<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Expiring Soon</p>
								<Link href="/dashboard/content" className="font-jet-mono text-[9px] uppercase tracking-widest text-ink4 hover:text-ink3 transition-colors">
									Edit →
								</Link>
							</div>
							<div className="divide-y divide-line">
								{nextExpiring.map(item => (
									<div key={item.id} className="px-4 py-3">
										<p className="text-ink text-xs truncate">
											{(item as any).headline ?? `TMDB #${(item as any).tmdb_id}`}
										</p>
										<p className="font-jet-mono text-[10px] text-ink4 mt-0.5 uppercase">
											{(item as any).feature_type} · {new Date((item as any).active_to).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

				</div>

			</div>

			{/* System health */}
			<div>
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink3 mb-4">
					System Health
				</p>
				<SystemInformation />
			</div>

		</div>

	);

}
