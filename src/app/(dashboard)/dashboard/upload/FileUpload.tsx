"use client"

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Check, X } from "lucide-react";
import { v4 as uuid } from "uuid";
import { createClient } from "@/utils/supabase/client";

interface FileUploadSectionProps {
	file: null | File;
	onFileSelect: (file: File | null) => void;
	selectedMedia: MovieSummary | null;
	uploadedFile: File | null;
};

const supabase = createClient();

export default function FileUploadSection({ file, onFileSelect, selectedMedia, uploadedFile }: FileUploadSectionProps) {

	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
	};

	async function uploadChunk(uploadSessionId: string, chunk: Blob, totalChunks: number, chunkIndex: number, accessToken: string, mediaId: string) {

		if (!accessToken) throw new Error("Unauthorized");

		const formData = new FormData();

		formData.append("uploadSessionId", uploadSessionId);
		formData.append("file", chunk);
		formData.append("totalChunks", totalChunks.toString());
		formData.append("currentChunk", chunkIndex.toString());

		if (chunkIndex === 0) formData.append("originalFilename", mediaId );

		const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/media/upload/chunk`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${accessToken}`
			},
			body: formData
		});

		if (!res.ok) {
			throw new Error("Chunk upload failed");
		};

		const data = await res.json();
		setProgress(data.percent);

	};

	async function upload() {

		if (!file || !selectedMedia) return;

		const mediaId = selectedMedia.id.toString()

		setError(null);

		const { data: { session } } = await supabase.auth.getSession();
		if (!session || !session.access_token) {
			setError("You must be logged in to upload");
			return;
		};

		setIsUploading(true);

		const CHUNK_SIZE = 1024 * 1024;
		const totalChunks = Math.ceil(file.size / CHUNK_SIZE) - 1;
		const uploadSessionId = uuid();

		try {

			let startByte = 0;
			for (let chunkIndex = 0; chunkIndex <= totalChunks; chunkIndex++) {

				const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
				const chunk = file.slice(startByte, endByte);

				await uploadChunk(uploadSessionId, chunk, totalChunks, chunkIndex, session.access_token, mediaId);

				startByte = endByte;

			};

			setIsComplete(true);
			handleClearFile();

		} catch (err) {

			console.error("Upload failed:", err);
			setError("Upload failed. Please check your permissions.");

		} finally {

			setIsUploading(false);

		};

	};

	const handleClearFile = () => {
		onFileSelect(null);
		setProgress(0);
	};

	return (

		<div className="w-full h-full p-8 bg-background border-r border-border flex flex-col justify-between">

			<div>

				<h1 className="text-3xl font-bold text-foreground mb-2">Upload Media</h1>
				<p className="text-muted-foreground mb-8">Select a file and choose a movie/tv show to associate it with</p>

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
						<h2 className="text-lg font-semibold text-foreground mb-2">Drop your file here</h2>
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

						{(isUploading) && progress < 100 && (

							<div className="w-full">

								<div className="w-full h-2 bg-border rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all duration-300"
										style={{ width: `${progress}%` }}
									/>
								</div>

								<div className="w-full flex justify-between mt-2">

									<p className="text-xs text-muted-foreground">
										Uploading
									</p>

									<p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>

								</div>

							</div>
						)}

						{progress === 100 && !isUploading && <p className="text-sm text-green-600">Complete</p>}

					</div>

				)}

			</div>

			<div className="pt-8 border-t border-border">

				<Button
					onClick={(e) => upload()}
					className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={!selectedMedia || !file || isUploading}
				>
					{selectedMedia ? `Upload as: ${selectedMedia?.title} (${selectedMedia.id})` : "Complete Upload"}
				</Button>

				{error ? (

					<p className="text-xs text-destructive text-center mt-4">
						{error}
					</p>

				) : (

					<p className="text-xs text-muted-foreground text-center mt-4">
						{!selectedMedia ? "Select a movie/tv show from the right panel to proceed" : !uploadedFile ? "Select or drop a file to upload" : "Ready to upload"}
					</p>

				)}

			</div>

		</div >

	);


};
