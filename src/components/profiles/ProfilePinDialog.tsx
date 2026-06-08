"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { buildGradient } from "@/utils/colors";
import { verifyProfilePin } from "@/utils/profiles";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfilePinDialogProps {
	profile: ViewingProfile | null;
	open: boolean;
	onClose: () => void;
	onSuccess: (profileId: string) => void;
}

export function ProfilePinDialog({ profile, open, onClose, onSuccess }: ProfilePinDialogProps) {

	const router = useRouter();

	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handlePin(value: string) {

		setPin(value);

		if (value.length !== 4 || !profile) return;

		const result = await verifyProfilePin(profile.id, value);
		
		if (result.locked) {
			
			setError("Too many attempts. Try again in 15 minutes.");
			setPin("");

			return;

		};

		if (!result.success) {

			setError(result.attemptsLeft
				? `Incorrect PIN. ${result.attemptsLeft} attempts left.`
				: "Incorrect PIN."
			);
			setPin("");

			return;
		};

		onSuccess(profile.id);

	};

	function handleClose() {
		setPin("");
		setError(null);
		onClose();
	};

	useEffect(() => {
		if (!open) {
			setPin("");
			setError(null);
		}
	}, [open]);

	return (

		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>

			<DialogContent className="bg-panel border border-ink/10 rounded-2xl w-full max-w-sm!">

				<DialogHeader>
					<DialogTitle className="text-center"></DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center space-y-6 py-4">

					{profile && (
						<div className="flex flex-col items-center space-y-6">

							<div
								className="size-16 rounded-2xl flex items-center justify-center select-none"
								style={{ background: buildGradient(profile.avatar_url) }}
							>
								<p className="text-2xl font-bold text-panel2 uppercase">{profile.name.slice(0, 1)}</p>
							</div>

							<div className="space-y-3 text-center">
								<p className="uppercase font-jet-mono text-xs tracking-wider text-lavender">profile locked</p>

								<p className="text-2xl font-bold text-ink">Enter {profile.name}'s PIN</p>
							</div>

						</div>
					)}

					<InputOTP
						maxLength={4}
						pattern={REGEXP_ONLY_DIGITS}
						value={pin}
						onChange={handlePin}
					>

						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
						</InputOTPGroup>

					</InputOTP>

					{error && (
						<p className="text-rose text-sm">{error}</p>
					)}

					<button
						onClick={() => {
							handleClose();
							router.push("/profiles")
						}}
						className="text-ink3 hover:text-ink transition-all ease-in-out text-sm mt-2 cursor-pointer"
					>Switch profile</button>

				</div>

			</DialogContent>

		</Dialog>

	);

};