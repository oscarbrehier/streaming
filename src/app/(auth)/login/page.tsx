"use client"

import { login, LoginFormState } from "@/actions/login";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";

const initialState: LoginFormState = {};

export default function Page() {

	const [state, formAction, pending] = useActionState(login, initialState);

	return (

		<div className="h-screen w-full flex items-center justify-center">

			<div className="w-full max-w-md">

				<form
					action={formAction}
				>

					<FieldGroup>

						<FieldSet>

							<FieldLegend>Login</FieldLegend>
							<FieldDescription>Sign in to continue enjoying your collection</FieldDescription>

							<FieldGroup>
								<Field>

									<FieldLabel htmlFor="email">
										Email
									</FieldLabel>

									<Input
										id="email"
										name="email"
										placeholder="you@example.com"
										defaultValue={state.values?.email}
										required
										aria-invalid={!!state.errors?.email}
									/>

									<FieldError>
										{state.errors?.email[0]}
									</FieldError>

								</Field>

								<Field>

									<FieldLabel htmlFor="password">Password</FieldLabel>

									<Input
										id="password"
										name="password"
										type="password"
										placeholder="Enter password"
										defaultValue={state.values?.password}
										required
										aria-invalid={!!state.errors?.password}
									/>

									<FieldError>
										{state.errors?.password[0]}
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
												<p>Log In</p>
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
