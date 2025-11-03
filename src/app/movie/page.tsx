import Player from "@/components/Player"

export default function Page() {

	return (

		<div className="h-screen w-full">

			{/* <video
				className="h-screen w-screen"
				controls 
				// preload="none"
			>

				<source src="/vid/movie.mp4" type="video/mp4" />
				{/* <track
					src="/path/to/captions.vtt"
					kind="subtitles"
					srcLang="en"
					label="English"
				/>
				Your browser does not support the video tag. */}
			{/* </video> */}

			<Player
				videoUrl="/vid/movie.mp4"
				subtitleUrl="/vid/subtitles.vtt"
				// onTimeUpdate={() => console.log("time updated")}
			/>

		</div>

	);

};