import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react"
import { DashboardNavbar } from "./Navbar";

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode
}) {

	return (

		<div className="h-auto min-h-screen w-full flex flex-col">

			{/* <Toaster /> */}

			<DashboardNavbar />

			<Suspense>
				<div className="">
					{children}
				</div>
			</Suspense>

		</div>


	);

};