import VideoPlayer from "@/components/player/Player";
import { MediaNotFound } from "./NotFound";
import { createClient } from "@/utils/supabase/server";
import { getMovie } from "@/lib/tmdb/movie";
import { connection } from "next/server";
import { getStreamingSources } from "@/lib/api/streaming";
import { getActiveProfileId, requireActiveProfileId } from "@/utils/profiles";

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function updateUserMediaStatus(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string,
	mediaId: string
): Promise<UserMediaStatus | null> {

	await connection();

	const profileId = await requireActiveProfileId();

	let { data, error } = await supabase
		.from("user_media_status")
		.select(`*`)
		.limit(1)
		.eq("profile_id", profileId)
		.eq("media_id", mediaId)
		.maybeSingle();

	if (error) return null;

	if (!data) {

		let { data: newData, error: newError } = await supabase
			.from("user_media_status")
			.upsert({
				user_id: userId,
				profile_id: profileId,
				media_id: mediaId,
				progress_sec: 0,
				duration_sec: 0,
				completed: false,
				last_watched: new Date()
			}, {
				onConflict: "profile_id, media_id"
			})
			.select()
			.single();

		if (newError || !newData) return null;
		return newData;

	};

	return data;

};

export default async function Page({ params }: PageProps) {

	const { id } = await params;

	const { sources } = await getStreamingSources(id, "movie");

	console.log("SOURCES", sources);
	
	if (!sources?.files || sources?.files.length === 0) return <MediaNotFound />
	
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const profileId = await getActiveProfileId();

	if (!user || !profileId) return <MediaNotFound />;

	const mediaStatus = await updateUserMediaStatus(supabase, user.id, id);
	if (!mediaStatus) {
		return <MediaNotFound />;
	};

	let movie: MovieDetailsWithImages;

	try {
		movie = await getMovie(id);
	} catch (err) {
		return <MediaNotFound />
	};

	const proxiedSources = sources.files.map((s) => {

		const proxied = `/api/proxy/m3u8?url=${encodeURIComponent(s.file)}`;
		return {
			...s,
			file: proxied,
		};

	});

	return (

		<VideoPlayer
			title={movie.title}
			mediaId={id}
			userId={user.id}
			profileId={profileId}
			mediaStatus={mediaStatus}
			sources={sources}
		/>

	);

};