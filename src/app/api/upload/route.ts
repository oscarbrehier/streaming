import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, appendFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {

	try {

		const formData = await req.formData();
		const chunk = formData.get('chunk') as Blob;
		const chunkIndex = parseInt(formData.get('chunkIndex') as string);
		const totalChunks = parseInt(formData.get('totalChunks') as string);
		const filename = formData.get('filename') as string;

		if (!chunk || !filename) {

			return NextResponse.json(
				{ error: 'Missing chunk or filename' },
				{ status: 400 }
			);

		};

		const uploadDir = path.join(process.cwd(), 'media', 'temp');
		await mkdir(uploadDir, { recursive: true });

		const chunkPath = path.join(uploadDir, `${filename}.part${chunkIndex}`);
		const finalPath = path.join(process.cwd(), 'media', filename);

		const bytes = await chunk.arrayBuffer();
		const buffer = Buffer.from(bytes);
		await writeFile(chunkPath, buffer);

		if (chunkIndex === totalChunks - 1) {
			
			await mkdir(path.join(process.cwd(), 'media'), { recursive: true });

			for (let i = 0; i < totalChunks; i++) {

				const partPath = path.join(uploadDir, `${filename}.part${i}`);
				const partBuffer = await import('fs').then(fs =>
					fs.promises.readFile(partPath)
				);

				if (i === 0) {
					await writeFile(finalPath, partBuffer);
				} else {
					await appendFile(finalPath, partBuffer);
				};

				await import('fs').then(fs => fs.promises.unlink(partPath));

			};

			return NextResponse.json({
				success: true,
				complete: true,
				filename,
				path: `/media/${filename}`
			});

		};

		return NextResponse.json({
			success: true,
			complete: false,
			chunkIndex
		});

	} catch (error) {

		console.error('Chunk upload error:', error);
		return NextResponse.json(
			{ error: 'Chunk upload failed' },
			{ status: 500 }
		);

	};
	
};