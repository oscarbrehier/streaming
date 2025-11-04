import { mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertToHLS } from "@/utils/convertToHLS";

export async function POST(req: NextRequest) {

	try {

		const { filename } = await req.json();

		if (!filename) {
			return NextResponse.json({ error: "Missing filename" }, { status: 400 });
		};

		const inputFile = path.join(process.cwd(), "media", filename);
		const outDir = path.join(process.cwd(), "media", filename + "_hls");

		await mkdir(outDir, { recursive: true });
		await convertToHLS(inputFile, outDir);

		return NextResponse.json({
			success: true,
			hlsPath: `/media/${filename}_hls/index.m3u8`
		});

	} catch (err) {

		console.error("HLS conversion error", err);
		return NextResponse.json({ error: "Conversion failed" }, { status: 500 });

	};

};