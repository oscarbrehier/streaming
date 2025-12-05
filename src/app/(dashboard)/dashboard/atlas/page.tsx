import { getAtlasEntries } from "@/lib/api/atlas";
import { AtlasViewer } from "./AtlasViewer";

export default async function Page() {

	const atlas = await getAtlasEntries();

	return (


		<AtlasViewer
			initialData={atlas.data}
			totalEntries={atlas.count}
		/>

	);

};