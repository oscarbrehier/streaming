import { GenerateInviteCode } from "./GenerateInviteCode";
import { Separator } from "@/components/ui/separator";
import { InviteCodes } from "./InviteCodes";
import { SystemInformation } from "./SystemInformation";

export default async function Page() {

	return (

		<div className="w-full h-full flex mt-16">

			<div className="h-full w-96 border-r border-border p-8 space-y-8">

				<GenerateInviteCode />
				<Separator />
				<InviteCodes />

			</div>

			<div className="p-8">

				<SystemInformation />

			</div>

		</div>

	);

};