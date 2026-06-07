"use client"

import { createViewingProfile, deleteViewingProfile, updateViewingProfile } from "@/utils/profiles";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ProfileForm } from "../ProfileForm";
import { Button } from "@/components/Button";
import { Profile } from "../Profile";
import { AddProfileButton } from "../AddProfileButton";
import { cn } from "@/lib/utils";

type PanelMode = "edit" | "create" | null;

export function ManageProfileForm({
	profiles
}: {
	profiles: ViewingProfile[];
}) {

	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editingProfile, setEditingProfile] = useState<ViewingProfile | null>(null);
	const [panelMode, setPanelMode] = useState<PanelMode>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const isOpen = panelMode !== null;

	function openEdit(profile: ViewingProfile) {
		setEditingProfile(profile);
		setPanelMode("edit");
		setError(null);
	};

	function openCreate() {
		setEditingProfile(null);
		setPanelMode("create");
		setError(null);
	};

	function closePanel() {
		setPanelMode(null);
		setEditingProfile(null);
		setError(null);
	};

	function handleBackdropClick(e: React.MouseEvent) {
		if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
			closePanel();
		}
	};

	async function handleSave(data: { name: string; color: string; pin: string | null }) {

		setLoading(true);
		setError(null);

		const { error } = editingProfile
			? await updateViewingProfile(editingProfile.id, data)
			: await createViewingProfile(data);

		setLoading(false);

		if (error) { setError(error); return; }

		setEditingProfile(null);
		closePanel();
		router.refresh();

	};

	async function handleDelete(profile: ViewingProfile | null) {

		if (!profile) return null;

		setLoading(true);
		setError(null);

		const { error } = await deleteViewingProfile(profile.id);

		setLoading(false);

		if (error) {
			setError(error);
			return;
		};

		closePanel();
		router.refresh();

	};

	return (

		<div className="h-screen w-full justify-center space-y-6 p-40 relative">


			<div
				onClick={handleBackdropClick}
				className={cn(
					"absolute inset-0 z-20 bg-panel/60 backdrop-blur-lg transition-all duration-300",
					isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				)}
			>

				<div
					ref={panelRef}
					className={cn(
						"absolute inset-y-20 inset-x-60 bg-panel border border-ink3/10 rounded-2xl p-20 overflow-y-auto transition-all duration-300 space-y-6",
						isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
					)}
				>

					<p className="uppercase font-jet-mono text-sm tracking-wider text-lavender">
						{panelMode === "edit" ? "edit profile" : "new profile"}
					</p>

					<p className="text-5xl font-bold text-ink mt-2">
						{panelMode === "edit" ? `Editing ${editingProfile?.name}` : "Create a profile"}
					</p>

					<div className="pt-10">

						<ProfileForm
							key={editingProfile?.id ?? "new"}
							initialValues={panelMode === "edit" && editingProfile ? {
								name: editingProfile.name,
								color: editingProfile.avatar_url,
								pin: "",
							} : undefined}
							submitLabel={panelMode === "edit" ? "save changes" : "create profile"}
							onSubmit={handleSave}
							onDelete={() => handleDelete(editingProfile)}
							onCancel={closePanel}
							loading={loading}
							error={error}
						/>

					</div>

				</div>

			</div>


			<p className="uppercase font-jet-mono text-sm tracking-wider text-lavender">account</p>
			<p className="text-5xl font-bold text-ink">Manage profiles</p>

			<div className="flex items-center justify-between">

				<p className="text-ink2 w-full max-w-xl">Edit a name or colour, switch on a Kids space, add a PIN, or remove who can watch on this account.</p>

				<Button
					label="done"
					variant="secondary"
					onClick={() => router.push("/")}
				/>

			</div>

			<div className="w-full pt-10 flex space-x-20">

				<div className="w-full flex space-x-8">

					{profiles.map((p) => (

						<Profile
							onSelect={openEdit}
							key={p.id}
							profile={p}
						/>

					))}

					<AddProfileButton onSelect={openCreate} />

				</div>

			</div>

		</div>

	);

};