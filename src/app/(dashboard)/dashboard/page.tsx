import { GenerateInviteCode } from "./GenerateInviteCode";
import { Separator } from "@/components/ui/separator";
import { InviteCodes } from "./InviteCodes";
import { SystemInformation } from "./SystemInformation";

export default async function Page() {

	return (

		<div className="h-screen w-full flex flex-col">

			<div
				className="w-full flex items-center border-b border-border px-8 py-4"
			>

				<p
					className="text-lg font-semibold"
				>Dashboard</p>

			</div>

			<div className="w-full h-full flex">

				<div className="h-full w-96 border-r border-border p-8 space-y-8">

					<GenerateInviteCode />
					<Separator />
					<InviteCodes />

				</div>

				<div className="p-8">

					<SystemInformation />

				</div>

			</div>

		</div>

	);

};