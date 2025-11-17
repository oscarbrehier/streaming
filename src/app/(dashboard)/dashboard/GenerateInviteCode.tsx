"use client"

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { generateInviteCode } from "@/actions/generateInviteCode";
import { useState } from "react";
import { testRateLimit } from "@/actions/testRateLimit";

export function GenerateInviteCode() {

	const [inviteCode, setInviteCode] = useState("");
	const [error, setError] = useState("");

	async function handleGenerateInviteCode() {

		const result = await testRateLimit();

		console.log(result);

		// setError("");
		// setInviteCode("");

		// const { code, error: generationError } = await generateInviteCode();
		
		// if (generationError || !code) {

		// 	setError(generationError ?? "An error occurred.");
		// 	return ;

		// };

		// setInviteCode(code);

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
					{error}
				</FieldError>

			</Field>

			<Button onClick={handleGenerateInviteCode} className="w-full">
				Generate Invite Code
			</Button>

		</div>

	);

};