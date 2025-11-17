import { Navbar } from "@/components/navbar/Navbar";
import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	const supabase = await createClient();

	const { data: { user } } = await supabase
		.auth.getUser();

	return (

		<div className="min-h-screen flex flex-col bg-card">

			<Navbar user={user} />
			{children}

		</div>

	);
};
