import { createClient } from "@/utils/supabase/server";

const parseIdNumber = (id: string): number => {

	const firstPart = id.split("_")[0];
	const n = Number(firstPart);

	return Number.isFinite(n) ? n : -Infinity;

};

export async function getQueue(): Promise<Queue | null> {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session || !session.access_token) return null;

	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/transcoding/queue`, {
		headers: {
			"Authorization": `Bearer ${session.access_token}`
		}
	});

	if (!res.ok) return null;

	const { result: queueStatus }: { result: Queue } = await res.json();

	const sortedJobs = [...queueStatus.jobs].sort((a, b) =>
		parseIdNumber(b.id) - parseIdNumber(a.id)
	);

	return {
		...queueStatus,
		jobs: sortedJobs
	};

};