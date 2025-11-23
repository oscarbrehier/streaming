import { createClient } from "@/utils/supabase/server";
import { DataTable } from "./DataTable";

export default async function Page() {

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session || !session.access_token) return null;

	const res = await fetch("http://localhost:3001/api/media/queue/status", {
		headers: {
			"Authorization": `Bearer ${session.access_token}`
		}
	});

	if (!res.ok) return null;

	const { result: queueStatus } = await res.json();

	return (

		<div className="pt-24 flex justify-center">
			<DataTable data={queueStatus} />
		</div>

	);

};