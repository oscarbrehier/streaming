"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Status = 'CONNECTED' | 'DISCONNECTED' | 'CHECKING';

interface BridgeContextProps {
	status: Status;
	isConnected: boolean;
	checkConnection: () => Promise<void>;
}

const BridgeContext = createContext<BridgeContextProps | undefined>(undefined);

export function BridgeProvider({
	children
}: {
	children: React.ReactNode
}) {

	const [status, setStatus] = useState<Status>('CHECKING');

	const isConnected = status === "CONNECTED";

	const checkConnection = useCallback(async () => {

		try {

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 2000);

			await fetch(`http://127.0.0.1:3002/`, {
				mode: "no-cors",
				signal: controller.signal
			});

			setStatus("CONNECTED");
			clearTimeout(timeout);

		} catch (err) {
			setStatus("DISCONNECTED");
		};

	}, [status]);

	useEffect(() => {

		let timerId: NodeJS.Timeout;

		async function poll() {

			await checkConnection();

			const delay = status === "CONNECTED" ? 5000 : 1000;
			timerId = setTimeout(poll, delay);

		};

		poll();

		return () => clearInterval(timerId);

	}, []);

	return (
		<BridgeContext.Provider value={{ status, isConnected, checkConnection }}>
			{children}
		</BridgeContext.Provider>
	);

};

export const useBridge = () => {

	const context = useContext(BridgeContext);
	if (context === undefined) {
		throw new Error("useBridge must be used within a BridgeProvider");
	};

	return context;

}