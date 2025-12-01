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

export const formatTimeHuman = (time: number | null): string => {

	if (time == null || isNaN(time)) return "-";

	const totalSeconds = Math.floor(time);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h${minutes.toString().padStart(2, '0')}`;
	} else if (minutes > 0) {
		return `${minutes}m${seconds.toString().padStart(2,'0')}s`;
	} else {
		return `${seconds}s`;
	};

};