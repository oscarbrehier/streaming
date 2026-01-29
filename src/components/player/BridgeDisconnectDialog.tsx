import { useBridge } from "@/context/BridgeContext";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BridgeDisconnectDialog() {

	const { status, checkConnection } = useBridge();
	const isDisconnected = status === "DISCONNECTED";

	const [isChecking, setIsChecking] = useState(false);

	async function reconnect() {
		setIsChecking(true);
		await checkConnection();
		setIsChecking(false);
	};

	return (

		<div className={cn(
			"h-screen w-full bg-neutral-900/50 absolute z-2147483647",
			isDisconnected ? "block" : "hidden"
		)}>

			<Dialog
				open={isDisconnected}
			>

				<DialogContent
					className="z-2147483647 outline-none"
				>
					<DialogHeader>

						{isChecking
							? null
							: (
								<div className="bg-red-500/10 p-3 rounded-full w-fit mx-auto">
									<AlertCircle className="h-8 w-8 text-red-500" />
								</div>
							)}

						<DialogTitle>
							{isChecking ? "Reconnecting..." : "Connection Lost"}
						</DialogTitle>

						<DialogDescription>
							{isChecking
								? "Trying to reach the local client on port 3002"
								: "We can't detect your local client. Make sure it's running so we can continue the stream."
							}
						</DialogDescription>

					</DialogHeader>

					<div className="grid grid-cols-2 gap-4">

						<Button
							className="w-full"
							onClick={reconnect}
							disabled={isChecking}
						>
							{isChecking ? (
								<Loader2 className="animate-spin" />
							) : (
								<span>Reconnect Now</span>
							)}
						</Button>

						<Button asChild className="w-full" variant="outline">
							<Link href="/">Back to Browse</Link>
						</Button>

					</div>

				</DialogContent>
			</Dialog>

		</div>

	);

};