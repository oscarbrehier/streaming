import Link from "next/link";
import { Suspense } from "react"

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode
}) {

	return (

		<div className="h-auto min-h-screen w-full flex flex-col">

			<div
				className="w-full h-16 flex justify-between items-center border-b border-border px-8 z-50 bg-background fixed"
			>

				<p
					className="text-lg font-semibold"
				>Dashboard</p>

				<Link
					href="dashboard/media"
					className="text-sm"
				>
					Media Health
				</Link>

			</div>

			<Suspense>
				<div className="">
					{children}
				</div>
			</Suspense>

		</div>


	);

};