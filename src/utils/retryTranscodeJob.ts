export async function retryTranscodeJob(jobId: string) {

	await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/${jobId}/retry`, {
		method: "POST",
		credentials: "include"
	});

};