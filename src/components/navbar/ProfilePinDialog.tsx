"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { buildGradient } from "@/utils/colors";
import { verifyProfilePin } from "@/utils/profiles";

interface ProfilePinDialogProps {
	profile: ViewingProfile | null;
	open: boolean;
	onClose: () => void;
	onSuccess: (profileId: string) => void;
}

export function ProfilePinDialog({ profile, open, onClose, onSuccess }: ProfilePinDialogProps) {

	const [pin, setPin] = useState("");
	const [error, setError] = useState(false);

	async function handlePin(value: string) {

		setPin(value);
		if (value.length !== 4 || !profile) return;

		const valid = await verifyProfilePin(profile.id, value);
		if (!valid) { setError(true); setPin(""); return; }

		onSuccess(profile!.id);

	};

	function handleClose() {
		setPin("");
		setError(false);
		onClose();
	};

	return (
		
		<Dialog open={open} onOpenChange={(val) => !val && handleClose()}>

			<DialogContent className="bg-panel border border-ink/10 rounded-2xl max-w-sm">

				<DialogHeader>
					<DialogTitle className="text-center">Enter PIN</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-center space-y-6 py-4">

					{profile && (
						<div className="flex flex-col items-center space-y-3">
							<div
								className="size-16 rounded-2xl flex items-center justify-center"
								style={{ background: buildGradient(profile.avatar_url) }}
							>
								<p className="text-2xl font-bold text-ink uppercase">{profile.name.slice(0, 1)}</p>
							</div>
							<p className="font-semibold">{profile.name}</p>
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
						<p className="text-rose text-sm">Incorrect PIN, try again</p>
					)}

				</div>

			</DialogContent>

		</Dialog>

	);

};