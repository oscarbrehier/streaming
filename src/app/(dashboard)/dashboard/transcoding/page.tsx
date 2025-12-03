import { QueueTable } from "./QueueTable";
import { getQueue } from "@/lib/api/queue";

export default async function Page() {

	const queue = await getQueue();

	if (!queue) return ;

	return (

		<QueueTable
			queueState={queue.state}
			data={queue.jobs}
		/>

	);

};