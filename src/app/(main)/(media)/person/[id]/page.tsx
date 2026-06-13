import { BackdropCard } from "@/components/cards/Backdrop";
import { constructImg } from "@/lib/tmdb/constructImg";
import { formatDepartment, getPerson, getPersonBio, groupPersonCredits } from "@/lib/tmdb/person";
import { SectionSelector } from "./SectionSelector";

export default async function Page({
	params
}: {
	params: Promise<{ id: string }>
}) {

	const { id } = await params;

	const person = await getPerson(id);

	const sections = groupPersonCredits(person.combined_credits);
	const bio = await getPersonBio(person);
	const known_for_department = formatDepartment(person.known_for_department);

	return (

		<div className="min-h-screen w-full p-40">

			<div
				className="w-full flex items-center"
			>

				<div className="flex items-center space-x-10 w-full">

					<div className="h-96 aspect-2/3 overflow-hidden shrink-0">

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

			<SectionSelector known_for={known_for_department} sections={sections} />

		</div>

	);

};