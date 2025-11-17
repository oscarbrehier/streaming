"use client"

import { register, RegisterFormState } from "@/actions/register";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";

const initialState: RegisterFormState = {};

export default function Page() {

	const [state, formAction, pending] = useActionState(register, initialState);

	return (

		<div className="h-screen w-full flex items-center justify-center">

			<div className="w-full max-w-md">

				<form
					action={formAction}
				>

					<FieldGroup>

						<FieldSet>

							<FieldLegend>Sign Up</FieldLegend>
							<FieldDescription>Join using your invite code</FieldDescription>

							<FieldGroup>


								<Field>

									<FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
									<Input
										id="invite-code"
										name="invite-code"
										type="text"
										placeholder="ABCD-1234-EFGH"
										defaultValue={state.values?.inviteCode || ""}
										required
										aria-invalid={!!state.errors?.inviteCode}
									/>

									<FieldError>
										{state.errors?.inviteCode?.[0] ?? null}
									</FieldError>

								</Field>

								<FieldSeparator />

								<Field>

									<FieldLabel htmlFor="email">
										Email
									</FieldLabel>

									<Input
										id="email"
										name="email"
										defaultValue={state.values?.email || ""}
										placeholder="you@example.com"
										required
										aria-invalid={!!state.errors?.email}
									/>

									<FieldError>
										{state.errors?.email?.[0] ?? null}
									</FieldError>

								</Field>

								<Field>

									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Input
										id="password"
										name="password"
										type="password"
										defaultValue={state.values?.password || ""}
										placeholder="Enter password"
										required
										aria-invalid={!!state.errors?.password}
									/>

									<FieldError>
										{state.errors?.password?.[0] ?? null}
									</FieldError>

								</Field>

								<Field>

									<FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
									<Input
										id="confirm-password"
										name="confirm-password"
										type="password"
										defaultValue={state.values?.confirmPassword || ""}
										placeholder="Re-enter password"
										required
										aria-invalid={!!state.errors?.confirmPassword}
									/>

									<FieldError>
										{state.errors?.confirmPassword?.[0] ?? null}
									</FieldError>

								</Field>

								<FieldError>
									{state?.error ?? null}
								</FieldError>

								<Field>

									<Button type="submit">

										{
											pending ? (
												<div className="animate-spin">
													<LoaderCircle />
												</div>
											) : (
												<p>Sign Up</p>
											)
										}

									</Button>

								</Field>

							</FieldGroup>

						</FieldSet>


					</FieldGroup>

				</form>

			</div>

		</div>

	);
};
