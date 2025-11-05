import { HeroBanner } from "@/components/HeroBanner";
import { Navbar } from "@/components/Navbar";

export default function Page() {

	return (

		<div className="h-screen w-full p-8 dark bg-background">

			<Navbar />
			
			<HeroBanner />

		</div>

	);

};
