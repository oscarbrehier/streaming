"use client"

import { useState } from "react";
import { MediaSelector } from "@/components/dashboard/MediaSelector";
import { FeaturedContentForm } from "./FeaturedContentForm";

export default function Page() {

	const [selectedMedia, setSelectedMedia] = useState<null | MovieSummary>(null);

	return (

		<div className="absolute top-0 left-0 h-screen w-full flex border-t border-border pt-14">

			<div className="h-full w-1/2">
				<FeaturedContentForm
					selectedMedia={selectedMedia}
					onSelectMedia={(media) => setSelectedMedia(media)}
				/>
			</div>

			<div className="flex-1 w-1/2">
				<MediaSelector
					selectedMedia={selectedMedia}
					onSelectMedia={(media) => setSelectedMedia(media)}
				/>
			</div>
			
		</div>

	);

};
