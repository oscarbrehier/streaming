import { getUserViewingProfiles } from "@/utils/profiles";
import { ManageProfileForm } from "./ManageProfileForm";

export default async function Page() {

	const profiles = await getUserViewingProfiles();
	return <ManageProfileForm profiles={profiles} />

};