import { Navbar } from "@/components/navbar/Navbar";
import { getActiveProfile, getUserViewingProfiles } from "@/utils/profiles";
import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const activeProfile = await getActiveProfile();
	const profiles = await getUserViewingProfiles();

	return (

		<div className="min-h-screen flex flex-col bg-bg">
			<Navbar user={{ email: user?.email, user_metadata: user?.user_metadata ?? {} }} activeProfile={activeProfile} profiles={profiles} />

			{children}
		</div>

	);
};
