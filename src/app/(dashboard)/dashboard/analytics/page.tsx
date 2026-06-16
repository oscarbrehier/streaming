import { createClient } from "@/utils/supabase/server";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

type RawRow = {
	media_id: string;
	completed: boolean | null;
	favorited: boolean | null;
	rating: number | null;
	last_watched: string | null;
};

type MediaStats = {
	media_id: string;
	plays: number;
	favorites: number;
	completions: number;
	totalRating: number;
	ratingCount: number;
};

export default async function Page() {

	const supabase = await createClient();

	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

	const [allStatusRes, recentActivityRes] = await Promise.all([
		supabase
			.from("user_media_status")
			.select("media_id, completed, favorited, rating")
			.limit(10000),
		supabase
			.from("user_media_status")
			.select("last_watched")
			.gte("last_watched", thirtyDaysAgo)
			.not("last_watched", "is", null),
	]);

	const rows = (allStatusRes.data ?? []) as RawRow[];

	// Build per-media stats
	const statsMap: Record<string, MediaStats> = {};
	for (const row of rows) {
		if (!statsMap[row.media_id]) {
			statsMap[row.media_id] = {
				media_id:    row.media_id,
				plays:       0,
				favorites:   0,
				completions: 0,
				totalRating: 0,
				ratingCount: 0,
			};
		}
		const s = statsMap[row.media_id];
		s.plays++;
		if (row.favorited)       s.favorites++;
		if (row.completed)       s.completions++;
		if (row.rating !== null) { s.totalRating += row.rating; s.ratingCount++; }
	}

	const statsArr = Object.values(statsMap);

	const topWatched = [...statsArr]
		.sort((a, b) => b.plays - a.plays)
		.slice(0, 10)
		.map(s => ({ media_id: s.media_id, value: s.plays, label: "plays" }));

	const topFavorited = [...statsArr]
		.filter(s => s.favorites > 0)
		.sort((a, b) => b.favorites - a.favorites)
		.slice(0, 10)
		.map(s => ({ media_id: s.media_id, value: s.favorites, label: "favorites" }));

	const topCompletion = [...statsArr]
		.filter(s => s.plays >= 3)
		.sort((a, b) => b.completions / b.plays - a.completions / a.plays)
		.slice(0, 10)
		.map(s => ({
			media_id: s.media_id,
			value: Math.round((s.completions / s.plays) * 100),
			label: `% (${s.plays} plays)`,
		}));

	const topRated = [...statsArr]
		.filter(s => s.ratingCount >= 2)
		.sort((a, b) => (b.totalRating / b.ratingCount) - (a.totalRating / a.ratingCount))
		.slice(0, 10)
		.map(s => ({
			media_id: s.media_id,
			value: parseFloat((s.totalRating / s.ratingCount).toFixed(1)),
			label: `avg (${s.ratingCount} ratings)`,
		}));

	// Daily activity — last 30 days
	const activityByDay: Record<string, number> = {};
	for (const row of (recentActivityRes.data ?? [])) {
		if (!row.last_watched) continue;
		const day = row.last_watched.slice(0, 10);
		activityByDay[day] = (activityByDay[day] ?? 0) + 1;
	}

	// Build 30-day array (all days, fill gaps with 0)
	const dailyActivity: { date: string; count: number }[] = [];
	for (let i = 29; i >= 0; i--) {
		const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
		const key = d.toISOString().slice(0, 10);
		dailyActivity.push({ date: key, count: activityByDay[key] ?? 0 });
	}

	const totalWatched    = rows.length;
	const totalCompleted  = rows.filter(r => r.completed).length;
	const totalFavorited  = rows.filter(r => r.favorited).length;
	const uniqueMedia     = statsArr.length;

	return (
		<AnalyticsDashboard
			totalWatched={totalWatched}
			totalCompleted={totalCompleted}
			totalFavorited={totalFavorited}
			uniqueMedia={uniqueMedia}
			topWatched={topWatched}
			topFavorited={topFavorited}
			topCompletion={topCompletion}
			topRated={topRated}
			dailyActivity={dailyActivity}
		/>
	);

}
