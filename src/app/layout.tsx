import { Open_Sans, Bodoni_Moda, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Suspense } from "react";
import { BridgeProvider } from "@/context/BridgeContext";

export const bodoni = Bodoni_Moda({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	variable: "--font-jetbrains-mono",
});

const openSans = Open_Sans({ subsets: ['latin'] });
const hankenGrotesk = Hanken_Grotesk({ subsets: ['latin'] });

export default function RootLayout({
	children
}: {
	children: React.ReactNode
}) {

	return (

		<html lang="en" suppressHydrationWarning>

			<body
				className={`${hankenGrotesk.className} ${jetbrainsMono.variable} antialiased`}
			>

				<ThemeProvider
					attribute="class"
					forcedTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>

					<BridgeProvider>
						<Suspense>
							{children}
						</Suspense>
					</BridgeProvider>

				</ThemeProvider>

			</body>
		</html>

	);

};