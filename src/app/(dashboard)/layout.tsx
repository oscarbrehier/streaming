import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Suspense } from "react"

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode
}) {

	return (

		<div className="h-auto min-h-screen w-full flex flex-col">

			<Toaster />

			<div
				className="w-full h-16 flex justify-between items-center border-b border-border px-8 z-50 bg-background fixed"
			>

				<Link
					href="/dashboard"
					className="text-lg font-semibold"
				>
					Dashboard
				</Link>

				<div className="space-x-8">

					<Link
						href="/dashboard/upload"
						className="text-sm"
					>
						Upload Media
					</Link>

					<Link
						href="/dashboard/media"
						className="text-sm"
					>
						Media Health
					</Link>

					<Link
						href="/dashboard/conversions"
						className="text-sm"
					>
						Video Conversion Queue
					</Link>

				</div>

			</div>

			<Suspense>
				<div className="">
					{children}
				</div>
			</Suspense>

		</div>


	);

};