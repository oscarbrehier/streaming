import { Mistral } from "@mistralai/mistralai";
import { fetchTMDB } from "./fetchTMDB";
import { getCache, setCache } from "../api/cache";
import { createClient } from "@supabase/supabase-js";
import { callMistralWithRetry } from "../mistral";

export async function getPerson(personId: string): Promise<PersonDetailsWithCredits> {

	const data = await fetchTMDB(
		`/person/${personId}?append_to_response=combined_credits`,
		{ next: { revalidate: 86400 } }
	);

	return data;

};

export function groupPersonCredits(credits: CombinedCredits) {

	const globalSeen = new Set<number>();

	const dedup = (items: any[]) => {
		return items.filter(item => {
			if (globalSeen.has(item.id)) return false;
			globalSeen.add(item.id);
			return true;
		});
	};

	const byPopularity = (a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0);

	const directed = dedup(
		credits.crew
			.filter(c => c.job === "Director")
			.sort(byPopularity)
	);

	const wrote = dedup(
		credits.crew
			.filter(c => ["Screenplay", "Writer", "Story", "Novel"].includes(c.job))
			.sort(byPopularity)
	);

	const produced = dedup(
		credits.crew
			.filter(c => ["Producer", "Executive Producer"].includes(c.job))
			.sort(byPopularity)
	);

	const acted = dedup(
		credits.cast.sort(byPopularity)
	);

	return [
		{ label: "Director", items: directed },
		{ label: "Writer", items: wrote },
		{ label: "Producer", items: produced },
		{ label: "Actor", items: acted },
	].filter(s => s.items.length > 0);

};

export async function getPersonBio(person: PersonDetails): Promise<string> {

	if (!person.biography) return "";

	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_SECRET!
	);

	const { data: existing } = await supabase
		.from("person_bios")
		.select("bio")
		.eq("person_id", person.id)
		.single();

	if (existing?.bio) return existing.bio;

	const res = await callMistralWithRetry(`You are writing for a cinephile film platform.

Write a single evocative sentence (max 20 words) capturing this person's artistic identity, obsession, or contribution to cinema. Not a biography — a feeling. Like a caption under a portrait in a film museum.

Do NOT use quotation marks. Do NOT write it as a quote. Write it as a plain statement.

Examples:
- Turned silence into the loudest language in cinema.
- Obsessed with the moment before violence, never the act itself.
- Made the mundane feel like the edge of the universe.

Biography: ${person.biography}

Respond with only the sentence, no quotation marks, nothing else.`);

	const bio = res
		.trim()
		.replace(/^[""]|[""]$/g, "")
		.trim();
	if (!bio) return "";

	await supabase
		.from("person_bios")
		.insert({ person_id: person.id, bio });

	return bio;

};

export function formatDepartment(department: string): string {

	const map: Record<string, string> = {
		"Directing": "Director",
		"Acting": "Actor",
		"Writing": "Writer",
		"Production": "Producer",
		"Camera": "Cinematographer",
		"Editing": "Editor",
		"Sound": "Composer",
		"Art": "Art Director",
		"Crew": "Crew",
		"Visual Effects": "VFX",
	};

	return map[department] ?? department;

};