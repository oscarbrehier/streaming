import VideoPlayer from "@/components/player/Player";
import { MediaNotFound } from "./NotFound";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function updateUserMediaStatus(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string,
	mediaId: string
): Promise<UserMediaStatus | null> {

	let { data, error } = await supabase
		.from("user_media_status")
		.select(`*`)
		.single();

	if (error) return null;

	if (!data) {

		let { data, error } = await supabase
			.from("user_media_status")
			.upsert({
				user_id: userId,
				media_id: mediaId,
				progress_sec: 0,
				duration_sec: 0,
				completed: false,
				last_watched: new Date()
			}, {
				onConflict: "user_id, media_id"
			})
			.select()
			.single();

		if (error || !data) return null;
		return data;

	};

	return data;

};

export default async function Page({ params }: PageProps) {

	const { id } = await params;
	const mediaPath = `/api/media/${id}/index.m3u8`;

	const res = await fetch(`http://localhost:3000${mediaPath}`);

	if (res.status !== 200) {
		return <MediaNotFound />;
	};

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return <MediaNotFound />;

	const mediaStatus = await updateUserMediaStatus(supabase, user.id, id);
	if (!mediaStatus) {
		return <MediaNotFound />;
	};

	return (

		<VideoPlayer
			mediaId={id}
			userId={user.id}
			mediaStatus={mediaStatus}
			videoUrl={mediaPath}
		/>

	);

};