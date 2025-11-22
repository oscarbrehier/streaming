import { DataTable } from "./DataTable";

export default async function Page() {

	const res = await fetch("http://localhost:3001/api/media/queue/status");
	if (!res.ok) return null;

	const { result: queueStatus } = await res.json();

	return (

		<div className="pt-24 flex justify-center">
			<DataTable data={queueStatus} />
		</div>

	);

};