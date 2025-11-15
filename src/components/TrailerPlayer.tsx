"use client"

import { useRef, useState } from "react";
import ReactPlayer from "react-player";


export function TrailerPlayer({ url }: { url: string }) {

	return (

		<div style={{ position: "relative", width: "100%", maxWidth: "640px" }} className="pointer-events-none">
			<ReactPlayer
				src={url}
				playing={true}
				controls={false}
				muted={true}
				loop={true}
				width="100%"
				height="360px"
				config={{
					youtube: {
						rel: 0,
						iv_load_policy: 3,
						disablekb: 1,
					}
				}}
			/>

		</div>

	);

}