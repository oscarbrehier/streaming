import { getLogEntries } from "@/lib/api/logs";
import { LogsViewer } from "./LogsViewer";

export default async function Page() {
	const logs = await getLogEntries(1, 50);
	return (
		<LogsViewer
			initialData={logs.data}
			totalEntries={logs.count}
		/>
	);
}
