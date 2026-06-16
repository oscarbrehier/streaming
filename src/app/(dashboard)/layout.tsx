import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./Navbar";

export default async function DashboardLayout({
	children
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const name: string = user.user_metadata?.display_name ?? user.email ?? "Admin";

	return (
		<div className="flex min-h-screen bg-bg">
			<DashboardSidebar userName={name} />
			<main className="ml-[220px] flex-1 min-h-screen">
				<Suspense>
					{children}
				</Suspense>
			</main>
		</div>
	);
}
