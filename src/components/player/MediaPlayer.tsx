export function MediaPlayer({
	mediaId
}: {
	mediaId: string;
}) {

	const source = `https://vidlink.pro/movie/${mediaId}?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&player=jw&title=true&poster=true&autoplay=false&nextbutton=true`;

	return (

		<div className="h-screen w-full">
			<iframe className="h-screen w-full" src={source} allowFullScreen></iframe>
		</div>

	);

};
