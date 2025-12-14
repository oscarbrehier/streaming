"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FormEvent, useState } from "react"
import { addFeaturedContent } from "@/utils/db/featuredContent"

type FeaturedContentFormState = {
	headline: string;
	subheadline: string;
	featureType: FeatureType;
	isActive: boolean;
	activeFrom: string;
	activeTo: string;
	priority: string;
};

export function FeaturedContentForm({
	selectedMedia,
	onSelectMedia
}: {
	selectedMedia: MovieSummary | null;
	onSelectMedia: (media: MovieSummary | null) => void;
}) {

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, setForm] = useState<FeaturedContentFormState>({
		headline: "",
		subheadline: "",
		featureType: "hero",
		isActive: true,
		activeFrom: "",
		activeTo: "",
		priority: "1",
	});

	function resetForm() {

		setForm({
			headline: "",
			subheadline: "",
			featureType: "hero",
			isActive: true,
			activeFrom: "",
			activeTo: "",
			priority: "1",
		})

	};

	function updateForm<K extends keyof FeaturedContentFormState>(key: K, value: FeaturedContentFormState[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	async function handleSubmit(e: FormEvent) {
		
		e.preventDefault()

		if (!selectedMedia) {
			setError("Please select a movie or TV show first");
			return ;
		};

		setSubmitting(true)

		try {

			const payload = {
				movie_id: selectedMedia.id.toString(),
				headline: form.headline || undefined,
				subheadling: form.subheadline || undefined,
				feature_type: form.featureType,
				is_active: form.isActive,
				active_from: form.activeFrom ? new Date(form.activeFrom) : undefined,
				active_to: form.activeTo ? new Date(form.activeTo) : undefined,
				priority: Number.parseInt(form.priority),
			}

			const result = await addFeaturedContent(payload);

			if (result.success) {
				resetForm();
				onSelectMedia(null);

			} else {
				setError(result.error || "Failed to add featured content");
			};

		} catch (error) {
			setError("An unexpected error occurred");
		} finally {
			setSubmitting(false);
		};

	};

	return (

		<div className="w-full h-full p-8 bg-background border-r border-border flex flex-col justify-between overflow-y-auto">

			<div>

				<h1 className="text-3xl font-bold text-foreground mb-2">Add Featured Content</h1>

				<form onSubmit={handleSubmit} className="space-y-6 mt-8">

					<div className="space-y-2">
						<Label htmlFor="headline">Headline</Label>
						<Input
							id="headline"
							value={form.headline}
							onChange={(e) => updateForm("headline", e.target.value)}
							placeholder="Enter headline (optional)"
						/>
					</div>

					<div className="space-y-2">

						<Label htmlFor="subheadline">Subheadline</Label>

						<Textarea
							id="subheadline"
							value={form.subheadline}
							onChange={(e) => updateForm("subheadline", e.target.value)}
							placeholder="Enter subheadline (optional)"
							rows={3}
						/>

					</div>

					<div className="space-y-2">

						<Label htmlFor="featureType">Feature Type</Label>

						<Select value={form.featureType} onValueChange={(v) => updateForm("featureType", v as FeatureType)}>

							<SelectTrigger id="featureType">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>

								{["hero" , "banner" , "spotlight" , "trending"].map((type) => (
									<SelectItem key={type} value={type}>
										{type[0].toUpperCase() + type.slice(1)}
									</SelectItem>
								))}

							</SelectContent>

						</Select>

					</div>

					<div className="space-y-2">

						<Label htmlFor="priority">Priority</Label>

						<Input
							id="priority"
							type="number"
							min="1"
							value={form.priority}
							onChange={(e) => updateForm("priority", e.target.value)}
							placeholder="Enter priority"
						/>

						<p className="text-xs text-muted-foreground">Lower numbers appear first</p>

					</div>

					<div className="flex items-center justify-between space-x-2 p-4 border border-border rounded-lg">

						<div className="space-y-0.5">
							<Label htmlFor="isActive">Active Status</Label>
							<p className="text-sm text-muted-foreground">Enable to show this content</p>
						</div>

						<Switch id="isActive" checked={form.isActive} onCheckedChange={(v) => updateForm("isActive", v)} />

					</div>

					<div className="grid grid-cols-2 gap-4">

						<div className="space-y-2">
							<Label htmlFor="activeFrom">Active From</Label>
							<Input
								id="activeFrom"
								type="datetime-local"
								value={form.activeFrom}
								onChange={(e) => updateForm("activeFrom", e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="activeTo">Active To</Label>
							<Input
								id="activeTo"
								type="datetime-local"
								value={form.activeTo}
								onChange={(e) => updateForm("activeTo", e.target.value)}
							/>
						</div>

					</div>

					{error && (
						<p className="text-xs text-destructive text-center mt-4">
							{error}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={submitting || !selectedMedia}>
						{submitting ? "Adding..." : "Add Featured Content"}
					</Button>


				</form>

			</div>

		</div>

	);

};