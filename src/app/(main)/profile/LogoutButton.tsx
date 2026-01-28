"use client"

import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

export function LogoutButton() {

	const [isPending, startTransition] = useTransition();

	return (

		<Button
			variant="secondary"
			onClick={() => startTransition(() => logout())}
		>
			{isPending ? <Loader2 className="animate-spin" /> : "Log Out"}
		</Button>

	);

};