import { Open_Sans, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Suspense } from "react";

export const bodoni = Bodoni_Moda({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	display: "swap",
});

const openSans = Open_Sans({ subsets: ['latin'] })

export default function RootLayout({
	children
}: {
	children: React.ReactNode
}) {

	return (

		<html lang="en" suppressHydrationWarning>

			<body
				className={`${openSans.className} antialiased`}
			>

				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>

					<Suspense>
						{children}
					</Suspense>

				</ThemeProvider>

			</body>
		</html>

	);

};