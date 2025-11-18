import { RefObject, useEffect, useRef, useState } from "react";

export function useVideoControls(
	videoRef: RefObject<HTMLVideoElement | null>,
	isPlaying: boolean
) {

	const mouseMoveTimeout = useRef<NodeJS.Timeout | null>(null);
	const [controls, setControls] = useState(true);

 	useEffect(() => {

		const handleMouseMove = () => {

			setControls(true);

			if (mouseMoveTimeout.current) {
				clearTimeout(mouseMoveTimeout.current);
			};

			if (isPlaying) {

				mouseMoveTimeout.current = setTimeout(() => {
					setControls(false);
				}, 3000);

			};

		};

		if (isPlaying) {

			document.addEventListener("mousemove", handleMouseMove);
			mouseMoveTimeout.current = setTimeout(() => {
				setControls(false);
			}, 3000);

		} else {
			setControls(true);
		};

		return () => {

			document.removeEventListener("mousemove", handleMouseMove);
			if (mouseMoveTimeout.current) {
				clearTimeout(mouseMoveTimeout.current);
			};

		};

	}, [isPlaying]);

	return { controls, setControls }; 

};