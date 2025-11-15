export function GenreTags({
	genres
}: {
	genres: { id: number, name: string }[]
}) {

	return (

		<div className="flex space-x-2">

			{genres.map((genre) => (

				<div
					className="bg-neutral-800/60 w py-1 px-3 rounded-full"
					key={genre.id}
				>
					<p className="text-sm text-muted-background">{genre.name}</p>
				</div>

			))}

		</div>

	);

};