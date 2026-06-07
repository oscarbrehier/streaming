"use client"

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { buildGradient, HEX_COLORS, OrbColor, orbColors, orbGradients } from "@/utils/colors";
import { createViewingProfile } from "@/utils/profiles";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {

	const router = useRouter();

	const [profile, setProfile] = useState({
		name: "",
		color: Object.keys(orbGradients)[0],
		pin: "" as string
	});

	const [pinSetting, setPinSetting] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isValid = profile.name.trim().length > 0 && (!pinSetting || profile.pin.length === 4);

	async function handleCreate() {

		if (!isValid || loading) return;

		setLoading(true);
		setError(null);

		const { error } = await createViewingProfile({
			name: profile.name.trim(),
			color: profile.color,
			pin: pinSetting ? profile.pin : null,
		});

		setLoading(false);

		if (error) {
			setError(error);
			return;
		};

		router.push("/profiles");

	};

	return (

		<div className="h-screen w-full justify-center space-y-10 p-40">

			<button
				onClick={() => router.back()}
				className="h-12 px-6 rounded-full flex items-center space-x-2 border border-ink/20 text-ink/50 hover:border-ink/30 hover:text-ink/70 transition-all ease-in-out"
			>
				<ChevronLeft size={18} />
				<span className="font-medium">Back</span>
			</button>

			<p className="uppercase font-jet-mono text-sm tracking-wider text-lavender">new profile</p>

			<p className="text-5xl font-bold text-ink">Create a profile</p>

			<div className="w-full pt-10 flex space-x-20">

				<div className="flex flex-col items-center space-y-4 select-none">

					<div
						className="size-60 rounded-3xl flex items-center justify-center"
						style={{ background: buildGradient(profile.color) }}
					>
						<p className="text-7xl font-bold text-ink uppercase">
							{profile.name ? profile.name.slice(0, 1) : "?"}
						</p>
					</div>

					<p className="text-ink/50 uppercase font-jet-mono text-xs">live preview</p>

				</div>

				<div className="w-full space-y-8">

					<div className="space-y-4">
						<p className="text-ink/50 uppercase font-jet-mono text-xs">profile name</p>
						<Input
							value={profile.name}
							onChange={(v) => setProfile(prev => ({ ...prev, name: v }))}
							className="w-full max-w-lg"
						/>
					</div>

					<div className="space-y-4">

						<p className="text-ink/50 uppercase font-jet-mono text-xs">avatar color</p>

						<div className="flex space-x-4">

							{Object.entries(orbGradients).map(([key, hex]) => (
								<button
									key={key}
									className={cn(
										"size-12 rounded-xl transition-all",
										profile.color === key && "outline-3 outline-ink outline-offset-2"
									)}
									style={{ background: buildGradient(key as OrbColor) }}
									onClick={() => setProfile(prev => ({ ...prev, color: key }))}
								/>
							))}
						</div>

					</div>

					<div className="w-full max-w-lg border border-ink/10 rounded-2xl p-6">

						<div className="w-full flex flex-col space-y-6">

							<div className="w-full flex items-center justify-between">
								<div className="">
									<p className="font-medium text-sm">Lock with a PIN</p>
									<p className="text-ink/50 text-xs">Require a 4-digit code to open this profile.</p>
								</div>

								<Switch
									color="var(--color-mint)"
									checked={pinSetting}
									onCheckedChange={(val) => {
										setPinSetting(val);
										if (!val) setProfile(prev => ({ ...prev, pin: "" }));
									}}
								/>
							</div>

							{pinSetting && (
								<div className="w-full border-t border-ink4/38 pt-4 flex flex-col space-y-4">

									<p className="text-ink/50 uppercase font-jet-mono text-xs">Set a 4-digit PIN</p>

									<InputOTP
										id="profile-pin"
										name="pin"
										maxLength={4}
										pattern={REGEXP_ONLY_DIGITS}
										value={profile.pin}
										onChange={(val) => setProfile(prev => ({ ...prev, pin: val }))}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
										</InputOTPGroup>
									</InputOTP>

								</div>

							)}

						</div>

					</div>

					{error && (
						<p className="text-rose text-sm">{error}</p>
					)}

					<div className="flex space-x-4">

						<Button
							disabled={!isValid || loading}
							label="create profile"
							onClick={handleCreate}
							icon={loading ? <Loader2 size={16} className="animate-spin" /> : undefined}
						/>

						<Button label="cancel" variant="secondary" onClick={() => router.back()} />

					</div>

				</div>

			</div>

		</div>

	);

};