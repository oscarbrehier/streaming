import { createClient } from "@/utils/supabase/server";
import { QueueManager } from "./QueueManager";

export default async function Page() {

	const supabase = await createClient();

	const { data, count } = await supabase
		.from("atlas_queue")
		.select("*", { count: "exact" })
		.order("created_at", { ascending: false })
		.limit(100);

	return (
		<QueueManager
			initialData={(data ?? []) as AtlasQueueItem[]}
			totalCount={count ?? 0}
		/>
	);

}
