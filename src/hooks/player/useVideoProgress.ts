import { MediaService } from "@/services/media";
import { createClient } from "@/utils/supabase/client";
import { RefObject, useCallback, useState } from "react";

const supabase = createClient();
const media = new MediaService(supabase);

export function useVideoProgress(
	videoRef: RefObject<HTMLVideoElement | null>,
	mediaId: string,
	userId: string,
	completed: boolean
) {

	const [isMarkedComplete, setIsMarkedComplete] = useState(completed ?? false);

	const handleProgressUpdate = useCallback(async () => {

		if (!videoRef.current) return;

		const timecode = videoRef.current.currentTime;
		const duration = videoRef.current.duration;
		const progressPercentage = (timecode / duration) * 100;

		if (progressPercentage >= 90 && !isMarkedComplete) {

			const { success } = await media.markAsComplete(mediaId, userId);
			setIsMarkedComplete(true);

			return success;

		};

		await media.updateProgress(mediaId, userId, timecode);
		return null;

	}, [mediaId, userId, isMarkedComplete]);

	return { handleProgressUpdate, isMarkedComplete };

};