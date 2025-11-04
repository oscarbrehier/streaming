import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {

	try {

		const dirName = req.nextUrl.searchParams.get("dir");

		if (!dirName) {
			return NextResponse.json({ error: "Missing directory name" }, { status: 400 });
		};

		const content = await fs.readFile(path.join(process.cwd(), dirName, "progress.json"), { encoding: 'utf-8'});

		return NextResponse.json(JSON.parse(content), { status: 200 });

	} catch (err) {

		console.error("Failed to get progress:", err);
		return NextResponse.json({ error: "Progress not found" }, { status: 500 });

	};

};