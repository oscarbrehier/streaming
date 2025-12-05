import { getLogEntries } from "@/lib/api/logs";
import { AuditLogsViewer } from "./LogsViewer";

export default async function Page() {

	const logs = await getLogEntries();

	return (

		<AuditLogsViewer
			initialData={logs.data}
			totalEntries={logs.count}
		/>

	);

};