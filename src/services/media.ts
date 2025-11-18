import { SupabaseClient } from "@supabase/supabase-js";

export class MediaService {

	constructor(
		private supabase: SupabaseClient,
		private mediaId: string,
		private userId: string,
	) { }

	setMediaDuration = async (duration: number) => {

		if (!this.mediaId || !this.userId || duration == null) return;

		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				duration_sec: duration
			}, {
				onConflict: "user_id, media_id"
			});

	};

	updateProgress = async (progress: number) => {

		if (!this.mediaId || !this.userId || progress == null) return;

		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				progress_sec: progress
			}, {
				onConflict: "user_id, media_id"
			});

	};

	updateRating = async (rating: number) => {
		
		if (!this.mediaId || !this.userId || rating == null) return;

		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: this.mediaId,
				user_id: this.userId,
				rating
			}, {
				onConflict: "user_id, media_id"
			});

	};

	markAsComplete = async (): Promise<{ success: boolean }> => {

		if (!this.mediaId || !this.userId) return { success: false };

		const maxRetries = 2;
		let retry = 0;

		while (retry <= maxRetries) {
			const { error } = await this.supabase
				.from("user_media_status")
				.upsert({
					user_id: this.userId,
					media_id: this.mediaId,
					completed: true
				}, {
					onConflict: "user_id, media_id"
				});

			if (!error) return { success: true };

			await new Promise(r => setTimeout(r, 5000));
			retry++;
		}

		return { success: false };

	};

};