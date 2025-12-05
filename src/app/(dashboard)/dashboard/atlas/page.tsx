import { getAtlasEntries } from "@/lib/api/atlas";
import { AtlasTable } from "./AtlasTable";

export default async function Page() {

	const atlas = await getAtlasEntries();

	return (

		<div>
			<AtlasTable data={atlas} />
		</div>

	);

};