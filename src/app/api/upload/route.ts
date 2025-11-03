import formidable from "formidable";
import { promises as fs } from "fs";

export const config = {
	api: {
		bodyParser: false
	}
};

export async function POST(req: Request) {

	return new Promise((resolve, reject) => {

		const form = formidable({
			uploadDir: "media",
			keepExtensions: true
		});

		form.parse(req, async (err, fields, files) => {

			if (err) {

				reject(new Response("Upload error", { status: 500 }));
				return ;

			};

			const file = files.file[0];
			const originalName = file.originalFilename;
			const newPath = `media/${originalName}`;

			await fs.rename(file.filepath, newPath);

			resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));

		});

	})

};