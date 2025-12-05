import { avatar } from "@/utils/getAvatar";
import { createClient } from "@/utils/supabase/server"
import Image from "next/image";
import { redirect } from "next/navigation";

export async function DashboardUser() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) redirect("/login");

	return (

		<div className="flex items-center space-x-4">

			<p className="text-sm font-semibold">{user.user_metadata.display_name}</p>

			<div className="size-8 bg-red-400 rounded-full overflow-hidden">
				<Image
					src={avatar(user.user_metadata.display_name)}
					width={60}
					height={60}
					unoptimized
					alt="user_avatar"
				/>
			</div>

		</div>

	)

};