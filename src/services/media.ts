import { SupabaseClient } from "@supabase/supabase-js";

export class MediaService {
	constructor(
		private supabase: SupabaseClient,
		private mediaId: string,
		private userId: string,
		private profileId: string
	) { }

	setMediaDuration = async (duration: number) => {
		if (!this.mediaId || !this.profileId || duration == null) return;
		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				profile_id: this.profileId,
				duration_sec: duration
			}, {
				onConflict: "profile_id, media_id"
			});
	};

	updateProgress = async (progress: number) => {
		if (!this.mediaId || !this.profileId || progress == null) return;
		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				profile_id: this.profileId,
				progress_sec: progress
			}, {
				onConflict: "profile_id, media_id"
			});
	};

	updateRating = async (rating: number) => {
		if (!this.mediaId || !this.profileId || rating == null) return;
		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				profile_id: this.profileId,
				rating
			}, {
				onConflict: "profile_id, media_id"
			});
	};

	markAsComplete = async (): Promise<{ success: boolean }> => {
		if (!this.mediaId || !this.profileId) return { success: false };
		const maxRetries = 2;
		let retry = 0;
		while (retry <= maxRetries) {
			const { error } = await this.supabase
				.from("user_media_status")
				.upsert({
					user_id: this.userId,
					profile_id: this.profileId,
					media_id: this.mediaId,
					completed: true
				}, {
					onConflict: "profile_id, media_id"
				});
			if (!error) return { success: true };
			await new Promise(r => setTimeout(r, 5000));
			retry++;
		}
		return { success: false };
	};
};