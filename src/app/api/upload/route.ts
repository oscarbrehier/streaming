import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from "fs/promises";

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
			return NextResponse.json({ error: 'Missing chunk or filename' }, { status: 400 });
		};

		const uploadDir = path.join(process.cwd(), 'media', 'temp');
		await mkdir(uploadDir, { recursive: true });

		const chunkPath = path.join(uploadDir, `${filename}.part${chunkIndex}`);
		const finalPath = path.join(process.cwd(), 'media', filename);

		const bytes = await chunk.arrayBuffer();
		await writeFile(chunkPath, Buffer.from(bytes));

		if (chunkIndex === totalChunks - 1) {

			await mkdir(path.join(process.cwd(), 'media'), { recursive: true });

			const writeStream = await fs.open(finalPath, "w");

			for (let i = 0; i < totalChunks; i++) {

				const partPath = path.join(uploadDir, `${filename}.part${i}`);
				const part = await fs.readFile(partPath);
				await writeStream.write(part);
				await fs.unlink(partPath);

			};

			await writeStream.close();

			return NextResponse.json({
				success: true,
				complete: true,
				filename,
				finalPath: `/media/${filename}`,
			});

		};

		return NextResponse.json({ success: true, complete: false, chunkIndex });

	} catch (error) {

		console.error('Upload error:', error);
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 });

	};
	
};
