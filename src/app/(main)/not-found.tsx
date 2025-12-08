export default function NotFound() {

	const bgImage = `https://image.tmdb.org/t/p/original/hMIShlnRKxsLN5PVHhMTIUZqgdl.jpg`;

	return (

		<div
			className="absolute top-0 left-0 h-screen w-screen bg-cover bg-center flex flex-col items-end justify-end p-8"
			style={{
				backgroundImage: `
					linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgb(23, 23, 23) 100%),
					url(${bgImage})
					`
			}}
		>

			<div className="space-y-4 text-end">
				<p className="text-5xl font-medium">404 — Page Not Found</p>
				<p>The page you’re looking for doesn’t exist.</p>
			</div>

		</div>

	);

};