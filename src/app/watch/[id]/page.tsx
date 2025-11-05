import VideoPlayer from "@/components/Player";
import { MediaNotFound } from "./NotFound";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {

	const { id } = await params;
	const mediaPath = `/api/media/${id}/index.m3u8`;

	const res = await fetch(`http://localhost:3000${mediaPath}`);

	if (res.status !== 200) {

		return (
			<MediaNotFound />
		);

	};

	return (

		<VideoPlayer
			videoUrl={mediaPath}
		/>

	);

};