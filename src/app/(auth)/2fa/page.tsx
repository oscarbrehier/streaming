"use client"

import { requestOTPCode } from "@/actions/requestOTPCode";
import { validateOTPCode } from "@/actions/validateOTPCode";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";

export default function Page() {

	const router = useRouter();

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [newRequestTimer, setNewRequestTimer] = useState(60);

	async function handleSubmit(formData: FormData) {

		setError("");

		const code = formData.get('pin') as string;
		if (!code) return;

		setLoading(true);

		try {

			const { success, error } = await validateOTPCode(code);

			if (error) {

				setError(error);
				return;

			};

			if (success) router.push("/");

		} catch (err) {

			setError("An unknown error occurred. Please try again later");

		} finally {
			setLoading(false);
		};

	};

	async function requestNewOTPCode(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();
		
		if (newRequestTimer > 0) return ;
		
		setNewRequestTimer(60);

		const { error } = await requestOTPCode();
		if (error) setError(error);

	}

	useEffect(() => {

		const timerInterval = setInterval(() => setNewRequestTimer(prev => prev != 0 ? prev - 1 : 0), 1000);

		return () => {
			clearInterval(timerInterval);
		};

	}, []);

	return (

		<div className="h-screen w-full flex items-center justify-center">

			<div className="w-full max-w-md">

				<form
					action={handleSubmit}
				>

					<FieldGroup>

						<FieldSet>

							<FieldLegend>Two-Step authentication</FieldLegend>
							<FieldDescription>Enter the authentication code you received by email</FieldDescription>

							<FieldGroup>

								<Field>

									<div className="w-full flex space-x-4">

										<InputOTP id="otp-code" name="pin" maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>

										<button
											onClick={requestNewOTPCode}
											className={cn("text-sm", newRequestTimer === 0 ? "text-neutral-200" : "text-muted-foreground")}
										>
											Request a new code {newRequestTimer > 0 && `in: ${newRequestTimer}s`}
										</button>

									</div>

									<FieldError>

									</FieldError>

								</Field>


								<Field>

									<Button type="submit">

										{
											loading ? (
												<div className="animate-spin">
													<LoaderCircle />
												</div>
											) : (
												<p>Verify</p>
											)
										}

									</Button>

								</Field>

							</FieldGroup>

							{error && <p className="text-destructive text-center text-sm">{error}</p>}

						</FieldSet>


					</FieldGroup>

				</form>

			</div>

		</div>

	);

};