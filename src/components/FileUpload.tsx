"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Check, X, RefreshCw } from "lucide-react"
import VideoPlayer from "./Player"
import { HLSPlayer } from "./HLSPlayer"

interface FileUploadSectionProps {
	onFileSelect: (file: File | null) => void
	selectedMovie: string | null
	uploadedFile: File | null
}

export default function FileUploadSection({ onFileSelect, selectedMovie, uploadedFile }: FileUploadSectionProps) {

	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [isConverting, setIsConverting] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	
	const [videoUrl, setVideoUrl] = useState<null | string>(null);

	const handleDragOver = (e: React.DragEvent) => {

		e.preventDefault()
		setIsDragging(true);

	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {

		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;

		if (files.length > 0) {
			processFile(files[0]);
		};

	};

	const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

		const files = e.currentTarget.files;

		if (files && files.length > 0) {
			processFile(files[0]);
		};

	};

	const processFile = async (file: File) => {

		onFileSelect(file);
		await upload(file);

	};

	async function upload(file: File) {

		if (!file) return;

		let filename: string | null = null;

		setIsComplete(false);
		setIsUploading(true);
		setProgress(0);

		const CHUNK_SIZE = 5 * 1024 * 1024;
		const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

		for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {

			const start = chunkIndex * CHUNK_SIZE;
			const end = Math.min(start + CHUNK_SIZE, file.size);
			const chunk = file.slice(start, end);

			const formData = new FormData();
			formData.append("chunk", chunk);
			formData.append("chunkIndex", String(chunkIndex));
			formData.append("totalChunks", String(totalChunks));
			formData.append("filename", file.name);

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				console.error("Chunk upload failed:", await res.text());
				setIsUploading(false);
				return;
			};

			const progress = ((chunkIndex + 1) / totalChunks) * 100;
			setProgress(progress);

			if (chunkIndex == totalChunks - 1) {

				const data = await res.json();
				filename = data.filename;

			};

		};

		setIsUploading(false);
		setProgress(100);

		if (filename) {
			convert(filename);
		};

	};

	async function getConvertProgress(filename: string) {

		const res = await fetch(`/api/convert/progress?dir=media/${filename}_hls`);
		const data = await res.json();

		return data.percent ?? 0;

	};

	async function convert(filename: string) {

		if (!filename) return;

		setIsConverting(true);
		setProgress(0);

		try {

			fetch("/api/convert", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename
				})
			});

			const interval = setInterval(async () => {

				const progress = await getConvertProgress(filename);
				setProgress(progress);

				if (progress >= 100) {
					clearInterval(interval);
					setIsConverting(false);
					setIsComplete(true);
				}

			}, 1000);

			const url = `/api/media/${filename}_hls/index.m3u8`;
			setVideoUrl(url);
			console.log(url);

		} catch (err) {

			console.error("Failed converting:", err);
			setIsConverting(false);

		};

		setProgress(100);

	};

	const handleClearFile = () => {
		onFileSelect(null);
		setProgress(0);
	};

	return (

		<div className="w-full h-full p-8 bg-card border-r border-border flex flex-col justify-between">

			<div>

				<h1 className="text-3xl font-bold text-foreground mb-2">Upload Movie</h1>
				<p className="text-muted-foreground mb-8">Select a file and choose a movie to associate it with</p>

				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
						}`}
				>

					<input
						type="file"
						id="file-input"
						onChange={handleFileInputChange}
						className="hidden"
						accept="video/*,.mkv,.mp4,.avi,.mov,.flv,.wmv"
					/>

					<label htmlFor="file-input" className="cursor-pointer">
						<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
						<h2 className="text-lg font-semibold text-foreground mb-2">Drop your movie file here</h2>
						<p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
						<p className="text-xs text-muted-foreground">Supported: MP4, MKV, AVI, MOV, FLV, WMV</p>
					</label>

				</div>

				{uploadedFile && (

					<div className="mt-8 bg-secondary/10 border border-secondary rounded-lg p-6">

						<div className="flex items-center justify-between mb-4">

							<div className="flex items-center gap-3">

								{progress < 100 && (
									<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
										{isUploading && <Upload className="w-5 h-5 text-primary" />}
										{isConverting && <RefreshCw className="w-5 h-5 text-primary" />}
									</div>
								)}

								{isComplete && (
									<div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
										<Check className="w-5 h-5 text-green-500" />
									</div>
								)}

								<div>
									<p className="font-semibold text-foreground">{uploadedFile.name}</p>
									<p className="text-sm text-muted-foreground">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
								</div>

							</div>

							<button onClick={handleClearFile} className="p-2 hover:bg-destructive/10 rounded-lg transition">
								<X className="w-5 h-5 text-destructive" />
							</button>

						</div>

						{(isUploading || isConverting) && progress < 100 && (

							<div className="w-full">

								<div className="w-full h-2 bg-border rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all duration-300"
										style={{ width: `${progress}%` }}
									/>
								</div>

								<div className="w-full flex justify-between mt-2">

									<p className="text-xs text-muted-foreground">
										{isConverting ? "Converting" : "Uploading"}
									</p>

									<p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>

								</div>

							</div>
						)}

						{progress === 100 && !isUploading && <p className="text-sm text-green-600">Complete</p>}

					</div>

				)}

			</div>

			{isComplete && videoUrl && (

				<div className="w-96">
					<HLSPlayer
						source={videoUrl}
					/>
				</div>

			)}

			<div className="pt-8 border-t border-border">

				<Button
					className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={!uploadedFile || !selectedMovie || isUploading}
				>
					Complete Upload
				</Button>

				<p className="text-xs text-muted-foreground text-center mt-4">
					{!selectedMovie ? "Select a movie/tv show from the right panel to proceed" : "Ready to upload"}
				</p>

			</div>

		</div>

	);


};
