export const formatTime = (time: number): string => {

	const seconds = Math.floor(time);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const parts = [];
	if (hours > 0) parts.push(hours);
	parts.push(minutes.toString().padStart(hours > 0 ? 2 : 1, '0'));
	parts.push(remainingSeconds.toString().padStart(2, '0'));

	return parts.join(':');

};