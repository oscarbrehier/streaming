import { ProfileForm } from "@/app/(main)/profile/ProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { avatar } from "@/utils/avatar";
import { UserMetadata } from "@supabase/supabase-js";

export function ProfileCard({
	display_name,
	email,
	metadata,
	editable,
}: {
	display_name: string;
	email?: string;
	metadata?: UserMetadata;
	editable?: boolean;
}) {

	return (

		<Card className="w-full">

			<CardContent className="flex justify-between space-x-8">

				<div className="overflow-hidden size-44 rounded-full">

					<img
						className="size-full"
						src={avatar(display_name)}
					/>

				</div>

				{editable && metadata && email && (

					<ProfileForm
						user={{
							email: email,
							user_metadata: metadata
						}}
					/>

				)}

			</CardContent>

		</Card>

	);

};