export const BRIDGE_UI_CONFIG = {
	STATUS: {
		"CONNECTED": {
			color: "bg-green-500",
			message: "All systems good! Ready to stream."
		},
		"DISCONNECTED": {
			color: "bg-red-500",
			message: "Connection lost. Please open your local client."
		},
		"CHECKING": {
			color: "bg-amber-400",
			message: "Searching for your local connection..."
		},
	},
	TOOLTIPS: {
		STREAMING: "Open your local client to start streaming.",
		PRELOADING: "Local client required to manage media files.",
		GENERAL: "This feature requires the local client to be active."
	}
} as const;