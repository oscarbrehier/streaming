"use client"

import { addToAtlas } from "@/lib/api/atlas";
import { Download, LoaderCircle } from "lucide-react";
import { MouseEvent, useState } from "react";

export function SuggestContentButton({
	mediaId
}: {
	mediaId: string;
}) {

	const [btnState, setBtnState] = useState("pending");

	async function handleOnClick(e: MouseEvent<HTMLButtonElement>) {

		e.preventDefault();
		setBtnState("loading");

		const { success } = await addToAtlas(mediaId);

		if (success) {
			setBtnState("success");
			return;
		};

		setBtnState("pending");

	};

	return (

		<button
			onClick={handleOnClick}
			disabled={btnState === "success" || btnState === "loading"}
			className="group capitalize bg-white disabled:bg-muted text-black disabled:text-muted-foreground disabled:cursor-not-allowed text-lg h-10 px-6 rounded-3xl cursor-pointer flex items-center space-x-4"
		>

			{
				btnState === "loading" ? (

					<div className="animate-spin">
						<LoaderCircle className="text-black group-disabled:text-muted-foreground mt-0.5" size={16} />
					</div>

				) : (

					<Download className="text-black group-disabled:text-muted-foreground mt-0.5" size={16} />

				)
			}

			<span>Suggest Content</span>

		</button>

	);

};