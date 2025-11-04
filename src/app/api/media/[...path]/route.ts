import { NextResponse } from "next/server";
import path from "path";
import { existsSync, readFileSync } from "fs";

export async function GET(
	request: Request,
	ctx: { params: Promise<{ path: string[] }> }
) {

	try {

		const { path: segments } = await ctx.params;

		if (!segments || segments.length === 0) {
			return new NextResponse("Missing media path", { status: 400 });
		};

		const mediaRoot = path.join(process.cwd(), "media");
		const filePath = path.join(mediaRoot, ...segments);

		if (!existsSync(filePath)) {
			return new NextResponse("File not found", { status: 404 });
		};

		const ext = filePath.split(".").pop()?.toLowerCase();
		let mime = "application/octet-stream";
		if (ext === "m3u8") mime = "application/vnd.apple.mpegurl";
		else if (ext === "ts") mime = "video/mp2t";
		else if (ext === "mp4") mime = "video/mp4";

		const fileBuffer = readFileSync(filePath);

		return new NextResponse(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": mime,
				"Cache-Control": "public, max-age=0, must-revalidate"
			}
		});
		
	} catch (err) {

		console.error("Media route error:", err);
		return new NextResponse("Internal server error", { status: 500 });
		
	};

};