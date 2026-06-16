import { getAllFeaturedContent } from "@/utils/db/featuredContent";
import { FeaturedContentManager } from "./FeaturedContentManager";

export default async function Page() {
	const items = await getAllFeaturedContent();
	return <FeaturedContentManager initialData={items} />;
}
