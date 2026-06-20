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

            <div className="p-4 sm:p-10 xl:p-20 h-auto w-full flex flex-col items-start bg-bg-warm space-y-6">

                <BackButton />

                <div className="w-full flex items-center">

                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-10 w-full">

                        <div className="h-40 sm:h-48 lg:h-60 aspect-2/3 overflow-hidden shrink-0">
						
                            {person.profile_path ? (
                                <img
                                    className="h-full w-full object-cover"
                                    src={constructImg(person.profile_path)}
                                    alt={person.name}
                                />
                            ) : (
                                <div className="h-full w-full bg-panel2" />
                            )}

                        </div>

                        <div className="space-y-2 w-full text-center sm:text-left">

                            <p className="uppercase font-semibold text-2xl sm:text-3xl lg:text-4xl">{person.name}</p>

                            <div className="flex justify-center sm:justify-start space-x-2 font-semibold uppercase text-sm sm:text-base">
                                <p>{known_for_department}</p>
                                <p>{person.birthday?.split("-")[0]}</p>
                            </div>

                            <p className="text-sm w-full sm:max-w-2/3 text-ink/70 mx-auto sm:mx-0">{bio}</p>

                        </div>

                    </div>

                </div>

            </div>

            <SectionSelector known_for={known_for_department} sections={sections} />

        </div>

    );

};