import { Card, CardContent } from "@/components/ui/card";
import { avatar } from "@/utils/getAvatar";
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { LogoutButton } from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/ProfileCard";

export default async function Page() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return null;

	return (

		<div className="flex-1 w-full flex items-start justify-center mt-20">

			<div className="flex flex-col w-full max-w-xl space-y-2">

				<ProfileCard
					display_name={user.user_metadata.display_name}
					email={user.email}
					metadata={user.user_metadata}
					editable
				/>

				<div className="w-full flex justify-end space-x-2">

					<Button variant="secondary" disabled> 
						Change Password
					</Button>

					<LogoutButton />

				</div>

			</div>

		</div>

	);

};