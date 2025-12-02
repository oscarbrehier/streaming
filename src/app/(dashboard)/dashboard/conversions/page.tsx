import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./DataTable";
import { Job } from "./columns";

const parseIdNumber = (id: string): number => {

	const firstPart = id.split("_")[0];
	const n = Number(firstPart);

	return Number.isFinite(n) ? n : -Infinity;

};


export default async function Page() {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session || !session.access_token) return null;

	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/queue/status`, {
		headers: {
			"Authorization": `Bearer ${session.access_token}`
		}
	});

	if (!res.ok) return null;

	const { result: queueStatus }: { result: Job[] } = await res.json();
	const sortedQueue = [...queueStatus].sort((a, b) =>
		parseIdNumber(b.id) - parseIdNumber(a.id)
	);

	return (

		<div className="pt-24 flex justify-center">
			<DataTable data={sortedQueue} />
		</div>

	);

};