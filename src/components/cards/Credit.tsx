import { constructImg } from "@/lib/tmdb/constructImg";
import Link from "next/link";

export function CreditCard({
	person
}: {
	person: CreditEntry;
}) {

	return (

		<Link href={`/person/${person.id}`}>

			<div className="overflow-hidden aspect-2/3">
				{person.profile_path ? (
					<img
						className="h-full w-full object-cover"
						src={constructImg(person.profile_path)}
					/>
				) : (
					<div className="h-full w-full bg-panel2" />
				)}
			</div>

			<div className="bg-bg-warm p-2.5">
				<p className="text-sm font-medium truncate">{person.name}</p>
				<p className="text-xs text-ink/70 uppercase font-jet-mono truncate">{person.role}</p>
			</div>

		</Link>

	);

};