"use client";
import { Dropdown } from "@/components/Dropdown";
import { useRouter } from "next/navigation";

export function SeasonSelector({ seriesId, numberOfSeasons, currentSeason }: {
	seriesId: string;
	numberOfSeasons: number;
	currentSeason: string;
}) {

	const router = useRouter();

	return (

		<Dropdown
			options={Array.from({ length: numberOfSeasons }, (_, i) => ({
				label: `Season ${i + 1}`,
				value: String(i + 1)
			}))}
			value={currentSeason}
			onChange={(val) => router.replace(`/tv/${seriesId}/${val}`, { scroll: false })}
		/>

	);

};