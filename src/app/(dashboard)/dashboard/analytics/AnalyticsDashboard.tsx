"use client"

import { cn } from "@/lib/utils";

type RankedItem = {
	media_id: string;
	value: number;
	label: string;
};

type DayEntry = {
	date: string;
	count: number;
};

function RankingList({
	title,
	items,
	suffix,
	color,
}: {
	title: string;
	items: RankedItem[];
	suffix?: string;
	color: string;
}) {
	const max = Math.max(...items.map(i => i.value), 1);

	return (
		<div className="bg-panel border border-line rounded-lg overflow-hidden">
			<div className="px-4 py-3 border-b border-line">
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">{title}</p>
			</div>
			{items.length === 0 ? (
				<div className="px-4 py-8 text-center">
					<p className="font-jet-mono text-[10px] uppercase tracking-widest text-ink4">No data</p>
				</div>
			) : (
				<div className="divide-y divide-line">
					{items.map((item, idx) => (
						<div key={item.media_id} className="px-4 py-2.5 flex items-center gap-3">

							<span className="font-jet-mono text-[10px] text-ink4 w-4 shrink-0 text-right">
								{idx + 1}
							</span>

							<div className="flex-1 min-w-0 space-y-1">
								<p className="font-jet-mono text-xs text-ink2 truncate">{item.media_id}</p>
								<div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
									<div
										className={cn("h-full rounded-full transition-all", color)}
										style={{ width: `${(item.value / max) * 100}%` }}
									/>
								</div>
							</div>

							<div className="shrink-0 text-right">
								<span className="font-jet-mono text-sm text-ink">{item.value}</span>
								{suffix && <span className="font-jet-mono text-[9px] text-ink4 ml-1">{suffix}</span>}
							</div>

						</div>
					))}
				</div>
			)}
		</div>
	);
}

function ActivityChart({ data }: { data: DayEntry[] }) {
	const max = Math.max(...data.map(d => d.count), 1);

	return (
		<div className="bg-panel border border-line rounded-lg overflow-hidden">
			<div className="px-4 py-3 border-b border-line">
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
					Daily Activity — Last 30 Days
				</p>
			</div>
			<div className="px-4 py-4">
				<div className="flex items-end gap-0.5 h-20">
					{data.map(({ date, count }) => (
						<div
							key={date}
							title={`${date}: ${count}`}
							className="flex-1 rounded-sm bg-lavender/60 hover:bg-lavender transition-colors"
							style={{ height: `${Math.max((count / max) * 100, count > 0 ? 4 : 0)}%` }}
						/>
					))}
				</div>
				<div className="flex justify-between mt-2">
					<span className="font-jet-mono text-[9px] text-ink4">{data[0]?.date?.slice(5)}</span>
					<span className="font-jet-mono text-[9px] text-ink4">{data[data.length - 1]?.date?.slice(5)}</span>
				</div>
			</div>
		</div>
	);
}

export function AnalyticsDashboard({
	totalWatched,
	totalCompleted,
	totalFavorited,
	uniqueMedia,
	topWatched,
	topFavorited,
	topCompletion,
	topRated,
	dailyActivity,
}: {
	totalWatched:   number;
	totalCompleted: number;
	totalFavorited: number;
	uniqueMedia:    number;
	topWatched:     RankedItem[];
	topFavorited:   RankedItem[];
	topCompletion:  RankedItem[];
	topRated:       RankedItem[];
	dailyActivity:  DayEntry[];
}) {

	const completionRate = totalWatched > 0
		? Math.round((totalCompleted / totalWatched) * 100)
		: 0;

	const stats = [
		{ label: "Total Watches",    value: totalWatched.toLocaleString()   },
		{ label: "Completions",      value: totalCompleted.toLocaleString()  },
		{ label: "Completion Rate",  value: `${completionRate}%`            },
		{ label: "Favorites",        value: totalFavorited.toLocaleString()  },
		{ label: "Unique Titles",    value: uniqueMedia.toLocaleString()     },
	];

	return (

		<div className="min-h-screen bg-bg p-8 space-y-8">

			{/* Header */}
			<div>
				<p className="font-jet-mono text-[9px] uppercase tracking-[0.25em] text-ink4 mb-1">Admin</p>
				<h1 className="text-2xl font-semibold text-ink leading-none">Analytics</h1>
			</div>

			{/* Summary stats */}
			<div className="grid grid-cols-5 gap-3">
				{stats.map(s => (
					<div key={s.label} className="bg-panel border border-line rounded-lg p-4 space-y-2">
						<p className="font-jet-mono text-[9px] uppercase tracking-[0.2em] text-ink4">{s.label}</p>
						<p className="font-jet-mono text-2xl font-semibold text-ink leading-none">{s.value}</p>
					</div>
				))}
			</div>

			{/* Activity chart */}
			<ActivityChart data={dailyActivity} />

			{/* Rankings grid */}
			<div className="grid grid-cols-2 gap-4">
				<RankingList
					title="Most Watched"
					items={topWatched}
					suffix="plays"
					color="bg-lavender"
				/>
				<RankingList
					title="Most Favorited"
					items={topFavorited}
					suffix="favs"
					color="bg-apricot"
				/>
				<RankingList
					title="Highest Completion Rate"
					items={topCompletion}
					suffix="%"
					color="bg-olive"
				/>
				<RankingList
					title="Top Rated"
					items={topRated}
					suffix="/ 10"
					color="bg-coral"
				/>
			</div>

		</div>

	);

}
