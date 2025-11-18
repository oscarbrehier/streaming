import { SupabaseClient } from "@supabase/supabase-js";

export class MediaService {

	constructor(private supabase: SupabaseClient) { }

	async updateProgress(mediaId: string, userId: string, progress: number) {

		if (!mediaId || !userId || !progress) return;

		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: mediaId,
				user_id: userId,
				progress_sec: progress
			}, {
				onConflict: "user_id, media_id"
			});

	};

	async updateRating(mediaId: string, userId: string, rating: number) {

		await this.supabase
			.from("user_media_status")
			.upsert({
				media_id: mediaId,
				user_id: userId,
				rating
			}, {
				onConflict: "user_id, media_id"
			});

	};

	async markAsComplete(mediaId: string, userId: string): Promise<{ success: boolean }> {

		if (!mediaId || !userId) return { success: false };

		const maxRetries = 2;
		let retry = 0;

		while (retry <= maxRetries) {

			const { error } = await this.supabase
				.from("user_media_status")
				.upsert({
					user_id: userId,
					media_id: mediaId,
					completed: true
				}, {
					onConflict: "user_id, media_id"
				});

			if (!error) return { success: true };

			if (retry <= maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
			};

			retry++;

		};

		return { success: false };

	};

};