import { MediaService } from "@/services/media";
import { createClient } from "@/utils/supabase/client";
import { RefObject, useCallback, useState } from "react";

const supabase = createClient();

export function useVideoProgress(
	videoRef: RefObject<HTMLVideoElement | null>,
	mediaId: string,
	userId: string,
	completed: boolean
) {

	const media = new MediaService(supabase, mediaId, userId);

	const [isMarkedComplete, setIsMarkedComplete] = useState(completed ?? false);

	const handleProgressUpdate = useCallback(async () => {

		if (!videoRef.current) return;

		const timecode = videoRef.current.currentTime;
		const duration = videoRef.current.duration;
		const progressPercentage = (timecode / duration) * 100;

		if (progressPercentage >= 90 && !isMarkedComplete) {

			const { success } = await media.markAsComplete();
			setIsMarkedComplete(true);

			return success;

		};

		await media.updateProgress(timecode);
		return null;

	}, [mediaId, userId, isMarkedComplete]);

	return { handleProgressUpdate, isMarkedComplete };

};