"use client"

import { Separator } from "@radix-ui/react-separator";
import { useState } from "react";

export function InviteCollapsible({
	invite
}: {
	invite: InviteCode
}) {

	const [collapsed, setCollapsed] = useState(true);

	return (

		<div
			className="bg-neutral-900 p-4 rounded-md"
		>

			<button
				onClick={() => setCollapsed(prev => !prev)}
				className="text-neutral-100 cursor-pointer">
				{invite.code_hint}
			</button>

			{!collapsed && (

				<>

					<Separator className="my-4" />

					<div className="space-y-1 text-sm">

						<p>
							<span className="text-neutral-400">Role:</span>
							&nbsp;{invite.role}
						</p>
						<p>
							<span className="text-neutral-400">Usage:</span>
							&nbsp;{invite.uses}/{invite.max_uses}
						</p>
						<p className="flex flex-col">
							<span className="text-neutral-400">Created By:</span>
							&nbsp;{invite.created_by}
						</p>
						<p>
							<span className="text-neutral-400">Created At:</span>
							&nbsp;{new Date(invite.created_at).toISOString()}
						</p>

					</div>

				</>

			)}

		</div>

	);

};