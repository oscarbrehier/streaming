import { Button } from "@/components/ui/button";
import { constructImg } from "@/utils/movies/constructImg";
import { ArrowLeft } from "lucide-react";

export function MediaPreview({
	media,
	onClose
}: {
	media: any,
	onClose: () => void
}) {

	return (

		<div className="w-full flex-1 flex flex-col">

			<div className="w-full mb-2">

				<Button
					onClick={onClose}
					variant="secondary"
				>
					<ArrowLeft />
					Back to search
				</Button>

			</div>

			{
				media.backdrop_path && (
					<div
						style={{ backgroundImage: `url(${constructImg(media.backdrop_path)})` }}
						className="h-84 w-full rounded-md bg-cover"
					/>
				)
			}

			<div className="flex space-x-4 mt-4">

				{
					media.poster_path && (
						<img
							className="h-84 rounded-md"
							src={constructImg(media.poster_path)} alt=""
						/>
					)
				}

				<div className="space-y-2">

					<h3 className="text-2xl font-semibold text-foreground text-balance">{media.title ?? media.name} ({new Date(media.release_date || media.first_air_date).getFullYear()})</h3>
					<p className="text-muted-foreground">{media.overview}</p>

				</div>

			</div>

		</div>

	);

};