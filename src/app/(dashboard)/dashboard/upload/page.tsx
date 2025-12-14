"use client"

import { MediaSelector } from "@/components/dashboard/MediaSelector";
import FileUploadSection from "@/app/(dashboard)/dashboard/upload/FileUpload";
import { useState } from "react";

export default function Page() {

	const [file, setFile] = useState<File | null>(null);
	const [selectedMedia, setSelectedMedia] = useState<null | MovieSummary>(null);

	return (

		<div className="absolute top-0 left-0 h-screen w-full flex border-t border-border pt-14">

			<div className="h-full w-1/2">
				<FileUploadSection
					file={file}
					onFileSelect={setFile}
					selectedMedia={selectedMedia}
					uploadedFile={file}
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