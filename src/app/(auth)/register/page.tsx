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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { avatar } from "@/utils/getAvatar";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

const initialState: RegisterFormState = {};

export default function Page() {

	const [state, formAction, pending] = useActionState(register, initialState);
	const [name, setName] = useState("");

	return (

		<div className={cn(
			"h-screen w-full flex items-center justify-center",
			name ? "space-x-18" : "space-x-0"
		)}>



			<div className={cn(
				"h-full flex items-center justify-center transition-all duration-500 ease-in-out",
				name ? "w-64 opacity-100 scale-100" : "w-0 opacity-0 scale-95"
			)}>
				<div className="size-42 rounded-full overflow-hidden">
					<img
						className="size-full"
						src={avatar(name)}
						alt=""
					/>
				</div>

			</div>



			{/* <Separator orientation="vertical" /> */}

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

									<FieldLabel htmlFor="name">
										Name
									</FieldLabel>

									<Input
										id="name"
										name="name"
										defaultValue={state.values?.name || ""}
										onChange={(e) => setName(e.target.value)}
										placeholder="Jane"
										required
										aria-invalid={!!state.errors?.name}
									/>

									<FieldError>
										{state.errors?.name?.[0] ?? null}
									</FieldError>

								</Field>

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

								<p
									className="text-sm text-muted-foreground"
								>
									Already have an account?
									&nbsp;
									<Link
										href="/login"
										className="text-foreground underline"
									>
										Login
									</Link>
								</p>

							</FieldGroup>

						</FieldSet>


					</FieldGroup>

				</form>

			</div>

		</div>

	);
};
