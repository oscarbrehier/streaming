"use client"

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { generateInviteCode, deleteInviteCode, expireInviteCode } from "./actions";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Ticket, Trash2, Clock } from "lucide-react";

function relativeTime(date: Date | string | null | undefined) {
	if (!date) return "—";
	const diff = Date.now() - new Date(date).getTime();
	const s = Math.floor(diff / 1000);
	if (s < 60)  return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60)  return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24)  return `${h}h ago`;
	return new Date(date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function isExpired(expiresAt: Date | string | null | undefined) {
	if (!expiresAt) return false;
	return new Date(expiresAt) < new Date();
}

function UsageBar({ uses, max }: { uses: number; max: number }) {
	const pct = max > 0 ? Math.min((uses / max) * 100, 100) : 0;
	return (
		<div className="flex items-center gap-2">
			<div className="w-16 h-1.5 bg-panel2 rounded-full overflow-hidden border border-line">
				<div
					className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-coral" : "bg-olive")}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="font-jet-mono text-[10px] text-ink4">{uses}/{max}</span>
		</div>
	);
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

function GeneratePanel({ onGenerated }: { onGenerated: (code: InviteCode) => void }) {

	const [role, setRole] = useState<UserRole>("member");
	const [code, setCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [pending, start] = useTransition();

	function generate() {
		setCode(null);
		setError(null);
		start(async () => {
			const res = await generateInviteCode(role);
			if (res.code) {
				setCode(res.code);
			} else {
				setError(res.error ?? "Failed to generate");
			}
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

			<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Generate Invite Code</p>

			<div className="flex gap-2 items-center">
				<Select value={role} onValueChange={v => setRole(v as UserRole)}>
					<SelectTrigger className="bg-panel2 border-line text-ink h-9 text-xs font-jet-mono w-28">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="member" className="font-jet-mono uppercase text-xs">Member</SelectItem>
						<SelectItem value="admin"  className="font-jet-mono uppercase text-xs">Admin</SelectItem>
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
				<div className="flex items-center gap-2 bg-panel2 border border-line rounded px-3 py-2.5">
					<span className="font-jet-mono text-sm text-ink flex-1 tracking-wider select-all">{code}</span>
					<button onClick={copy} className="text-ink4 hover:text-ink transition-colors shrink-0">
						{copied
							? <Check className="w-3.5 h-3.5 text-olive" />
							: <Copy className="w-3.5 h-3.5" />
						}
					</button>
				</div>
			)}

			{error && <p className="text-coral text-xs font-jet-mono">{error}</p>}

			<p className="text-ink4 text-[10px]">
				Codes expire in 4 hours · Single use
			</p>

		</div>
	);
}

export function InviteManager({ initialCodes }: { initialCodes: InviteCode[] }) {

	const [codes, setCodes] = useState<InviteCode[]>(initialCodes);
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

	function setPendingId(id: string, on: boolean) {
		setPendingIds(prev => {
			const next = new Set(prev);
			on ? next.add(id) : next.delete(id);
			return next;
		});
	}

	async function handleDelete(id: string) {
		setPendingId(id, true);
		const res = await deleteInviteCode(id);
		if (res.success) setCodes(prev => prev.filter(c => c.id !== id));
		else setPendingId(id, false);
	}

	async function handleExpire(id: string) {
		setPendingId(id, true);
		const res = await expireInviteCode(id);
		if (res.success) {
			setCodes(prev => prev.map(c => c.id === id ? { ...c, expires_at: new Date() } : c));
		}
		setPendingId(id, false);
	}

	return (

		<div className="min-h-screen bg-bg p-8 space-y-8">

			{/* Header */}
			<div>
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
				<h1 className="text-2xl font-semibold text-ink leading-none">Invite Codes</h1>
				<p className="text-ink3 text-xs font-jet-mono mt-2 uppercase tracking-widest">
					{codes.length} total
				</p>
			</div>

			{/* Generate panel */}
			<GeneratePanel onGenerated={() => {}} />

			{/* Codes table */}
			<div className="bg-panel border border-line rounded-lg overflow-hidden">

				{/* Column headers */}
				<div className="grid grid-cols-[140px_80px_100px_100px_120px_80px] gap-4 px-4 py-2.5 border-b border-line bg-panel2">
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Code Hint</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Role</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Usage</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Created</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4">Expires</span>
					<span className="font-jet-mono text-[9px] uppercase tracking-[0.18em] text-ink4 text-right">Actions</span>
				</div>

				{codes.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-ink4">
						<Ticket className="w-7 h-7 mb-3 opacity-30" />
						<p className="font-jet-mono text-[10px] uppercase tracking-widest">No invite codes</p>
					</div>
				) : (
					codes.map(code => {
						const expired = isExpired(code.expires_at);
						const exhausted = code.uses >= code.max_uses;
						const isPending = pendingIds.has(code.id);

						return (
							<div
								key={code.id}
								className={cn(
									"grid grid-cols-[140px_80px_100px_100px_120px_80px] gap-4 items-center px-4 py-3 border-b border-line last:border-0 hover:bg-panel2/30 transition-colors",
									isPending && "opacity-50 pointer-events-none",
									(expired || exhausted) && "opacity-60"
								)}
							>
								<span className={cn(
									"font-jet-mono text-xs tracking-wider",
									expired || exhausted ? "text-ink4 line-through" : "text-ink2"
								)}>
									{code.code_hint}
								</span>

								<RoleBadge role={code.role} />

								<UsageBar uses={code.uses} max={code.max_uses} />

								<span className="font-jet-mono text-[10px] text-ink4">
									{relativeTime(code.created_at)}
								</span>

								<span className={cn(
									"font-jet-mono text-[10px]",
									expired ? "text-coral" : "text-ink4"
								)}>
									{code.expires_at
										? (expired ? "Expired " : "") + relativeTime(code.expires_at)
										: "Never"
									}
								</span>

								<div className="flex items-center justify-end gap-2">
									{!expired && (
										<button
											onClick={() => handleExpire(code.id)}
											title="Expire now"
											className="text-ink4 hover:text-apricot transition-colors"
										>
											<Clock className="w-3.5 h-3.5" />
										</button>
									)}
									<button
										onClick={() => handleDelete(code.id)}
										title="Delete"
										className="text-ink4 hover:text-coral transition-colors"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						);
					})
				)}

			</div>

		</div>

	);

}
