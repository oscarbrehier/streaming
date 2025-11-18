import { motion } from "framer-motion";

export function RatingOverlay({
	rating,
	onRatingUpdate,
	ratings,
}: {
	rating: number;
	onRatingUpdate: (rating: number) => void;
	ratings: { value: number, emoji: string, title: string }[];
}) {

	return (

		<div className="flex-1 flex justify-center items-center">

			<motion.div
				initial={{ scale: 0.5 }}
				animate={{ scale: 1 }}
				transition={{ type: "spring", stiffness: 260, damping: 20 }}
				className="flex items-center justify-center h-14 px-4 rounded-2xl space-x-2 bg-neutral-800 cursor-pointer">

				{ratings.map(({ value, title, emoji }) => (

					<div
						key={value}
						title={title}
						onClick={() => onRatingUpdate(value)}
						className={`w-8 h-8 flex items-center justify-center transition-opacity ${rating === value ? "opacity-100" : "opacity-50 hover:opacity-70"}`}>
						<span className="text-2xl">{emoji}</span>
					</div>

				))}

			</motion.div>

		</div>

	);

};