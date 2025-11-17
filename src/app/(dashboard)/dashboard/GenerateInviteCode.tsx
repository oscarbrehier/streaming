"use client"

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { generateInviteCode } from "@/actions/generateInviteCode";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GenerateInviteCode() {

	const [inviteCode, setInviteCode] = useState("");
	const [form, setForm] = useState<{ error: string, role: UserRole }>({
		error: "",
		role: "member"
	});

	async function handleGenerateInviteCode() {

		setForm(prev => ({ ...prev, error: "" }));
		setInviteCode("");

		try {

			const { code, error } = await generateInviteCode(form.role);

			if (error || !code) {

				setForm(prev => ({ ...prev, error: error ?? "An error occurred." }));
				return;

			};

			setInviteCode(code);

		} catch (err) {
			setForm(prev => ({ ...prev, error: (err as Error).message }));
		};

	};

	return (

		<div className="space-y-4">

			<Field className="grid w-full items-center gap-3">

				<FieldLabel htmlFor="invite-code">Invite Code</FieldLabel>

				<Input
					id="invite-code"
					readOnly
					value={inviteCode}
				/>

				<FieldError>
					{form.error}
				</FieldError>

			</Field>

			<div className="flex items-center space-x-2 w-full">

				<Select
					defaultValue="member"
					onValueChange={(v: UserRole) => setForm(prev => ({ ...prev, role: v }))}
				
				>
					<SelectTrigger>
						<SelectValue placeholder="Role" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="member">member</SelectItem>
						<SelectItem value="admin">admin</SelectItem>
					</SelectContent>

				</Select>

				<Button onClick={handleGenerateInviteCode} className="flex-1">
					Generate Invite Code
				</Button>

			</div>

		</div>

	);

};