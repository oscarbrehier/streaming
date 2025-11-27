"use client"

import { updateProfile } from "@/actions/updateProfile";
import { CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Check, Pen } from "lucide-react";
import { useState } from "react";

export function ProfileForm({
	user
}: {
	user: Pick<User, "email" | "user_metadata">
}) {

	const [editMode, setEditMode] = useState(false);
	const [name, setName] = useState(user.user_metadata.display_name ?? "");

	async function handleSubmit(e: React.FormEvent) {

		e.preventDefault();

		if (name !== (user.user_metadata.display_name ?? "")) {
			await updateProfile({ display_name: name });
		};

		setEditMode(false);

	};

	return (

		<form onSubmit={handleSubmit} className="flex-1 flex">

			<div className="flex-1 w-full flex flex-col justify-center">

				{
					editMode ? (

						<input
							className="outline-none leading-none font-semibold placeholder:font-normal border-b border-border mb-1 pb-2"
							placeholder="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>

					) : (

						<CardTitle className="mb-1">{user.user_metadata.display_name}</CardTitle>

					)
				}

				<p className="text-muted-foreground">{user.email}</p>

			</div>

			<div>

				{editMode ? (

					<button
						type="submit"
					>
						<Check size={18} className="text-foreground" />
					</button>

				) : (

					<button
						onClick={(e) => {
							e.preventDefault();
							setEditMode(prev => !prev)
						}}
					>
						<Pen size={14} className="text-foreground" />
					</button>

				)}

			</div>

		</form>

	);

};