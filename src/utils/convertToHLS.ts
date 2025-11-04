import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function convertToHLS(inputPath: string, outputDir: string): Promise<void> {

	await fs.mkdir(outputDir, { recursive: true });

	return new Promise((resolve, reject) => {

		const ffmpeg = spawn("ffmpeg", [
			"-i",
			inputPath,
			"-preset",
			"veryfast",
			"-profile:v",
			"baseline",
			"-level",
			"3.0",
			"-start_number",
			"0",
			"-hls_time",
			"6",
			"-hls_list_size",
			"0",
			"-f",
			"hls",
			path.join(outputDir, "index.m3u8"),
		]);

		let progressFile = path.join(outputDir, "progress.json");
		let durationSeconds = 0;

		ffmpeg.stderr.on("data", async (data) => {

			const str = data.toString();

			if (!durationSeconds) {

				const durMatch = str.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);

				if (durMatch) {

					const hours = parseInt(durMatch[1]);
					const minutes = parseInt(durMatch[2]);
					const seconds = parseFloat(durMatch[3]);
					durationSeconds = hours * 3600 + minutes * 60 + seconds;

				};

			};

			const timeMatch = str.match(/time=(\d+):(\d+):(\d+\.\d+)/);

			if (timeMatch && durationSeconds) {

				const h = parseInt(timeMatch[1]);
				const m = parseInt(timeMatch[2]);
				const s = parseFloat(timeMatch[3]);
				const currentSeconds = h * 3600 + m * 60 + s;
				const percent = Math.min(100, (currentSeconds / durationSeconds) * 100);

				await fs.writeFile(
					progressFile,
					JSON.stringify({ percent, currentSeconds, durationSeconds })
				);

			};

		});

		ffmpeg.on("close", async (code) => {

			if (code === 0) {

				await fs.writeFile(progressFile, JSON.stringify({ percent: 100 }));
				resolve();

			} else {
				reject(new Error("FFmpeg failed"));
			};

		});

	});

};
