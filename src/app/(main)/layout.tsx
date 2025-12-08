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

		<div className="min-h-screen flex bg-card">

			<div>
				<Navbar user={{ email: user?.email, user_metadata: user?.user_metadata ?? {} }} />
			</div>
			
			<div className="min-h-screen pl-16 flex-1 overflow-hidden">
				{children}
			</div>

		</div>

	);
};
