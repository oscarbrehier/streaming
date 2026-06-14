import { BackdropCard } from "@/components/cards/Backdrop";
import { constructImg } from "@/lib/tmdb/constructImg";
import { formatDepartment, getPerson, getPersonBio, groupPersonCredits } from "@/lib/tmdb/person";
import { SectionSelector } from "./SectionSelector";
import { BackButton } from "./BackButton";
import { filterCurated } from "@/lib/tmdb/curated";

export default async function Page({
	params
}: {
	params: Promise<{ id: string }>
}) {

	const { id } = await params;

	const person = await getPerson(id);

	const [filteredCast, filteredCrew] = await Promise.all([
		filterCurated(person.combined_credits.cast),
		filterCurated(person.combined_credits.crew),
	]);

	const sections = groupPersonCredits({ cast: filteredCast, crew: filteredCrew });

	const bio = await getPersonBio(person);
	const known_for_department = formatDepartment(person.known_for_department);

	return (

		<div className="min-h-screen w-full">

			{/* <div className="h-screen w-full max-w-xl fixed top-0 left-0 py-20 bg-bg-warm">

				<div className="flex flex-col items-start w-full">

					<div className="flex flex-col w-full items-center space-y-14">

						<div className="h-96 aspect-2/3 overflow-hidden shrink-0">

							{person.profile_path ? (

								<img
									className="w-full h-full object-cover"
									src={constructImg(person.profile_path)}
									alt={person.name}
								/>

							) : (

								<div className="h-full w-full bg-panel2" />

							)}

						</div>

						<div className="space-y-4 w-full flex flex-col items-center">

							<p className="uppercase font-semibold text-6xl text-center">{person.name}</p>

							<div className="flex space-x-2 font-semibold uppercase">
								<p>{known_for_department}</p>
								<p>{person.birthday?.split("-")[0]}</p>
							</div>

							<p className="text-sm w-2/3 text-ink/70 text-center">{bio}</p>

						</div>

					</div>

				</div>

			</div>

			<div className="w-full max-w-xl" />

			<div className="flex-1 h-auto p-20">
				<SectionSelector known_for={known_for_department} sections={sections} />
			</div> */}

			<div className="p-20 h-auto w-full flex flex-col items-start bg-bg-warm space-y-6">

				{/* <BackButton /> */}

				<div
					className="w-full flex items-center"
				>

					<div className="flex items-center space-x-10 w-full">

						<div className="h-60 aspect-2/3 overflow-hidden shrink-0">

							{person.profile_path ? (

								<img
									className="h-full w-full"
									src={constructImg(person.profile_path)}
									alt={person.name}
								/>

							) : (

								<div className="h-full w-full bg-panel2" />

							)}

						</div>

						<div className="space-y-2 w-full">

							<p className="uppercase font-semibold text-4xl">{person.name}</p>

							<div className="flex space-x-2 font-semibold uppercase">
								<p>{known_for_department}</p>
								<p>{person.birthday?.split("-")[0]}</p>
							</div>

							<p className="text-sm w-full max-w-2/3 text-ink/70">{bio}</p>

						</div>

					</div>

				</div>

			</div>

			<SectionSelector known_for={known_for_department} sections={sections} />

		</div>

	);

};