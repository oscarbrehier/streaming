"use client"

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function LogoutButton() {

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (!error) window.location.replace("/login");
	};

	return (

		<Button
			variant="secondary"
			onClick={signOut}
		>
			Log Out
		</Button>

	);

};