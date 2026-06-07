import { filterCurated } from "./curated";
import { fetchtTMDB } from "./fetchTMDB";

export const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, '-');
export const unslugify = (str: string) => str.toLowerCase().replace(/-/g, ' ');

export const GENRES: Record<string, { id: number; description: string }> = {
	action: { id: 28, description: "Movement, impact, and momentum. Action cinema at its best turns physical spectacle into something visceral — car chases, fight sequences, and set pieces that make your pulse quicken. From classic Hollywood blockbusters to Hong Kong martial arts, the genre spans a remarkable range of styles and sensibilities." },
	adventure: { id: 12, description: "Cinema as a ticket to somewhere else. Adventure films follow characters into the unknown — jungles, oceans, distant planets, ancient ruins. The best ones make you feel the scale of the world and the pull of the horizon, whether the journey is literal or something more internal." },
	animation: { id: 16, description: "A medium, not a genre. Animation has produced some of the most formally inventive and emotionally rich films ever made — from the hand-drawn poetry of Studio Ghibli to the sharp wit of classic Hollywood cartoons. Don't let anyone tell you it's just for kids." },
	comedy: { id: 35, description: "Harder to pull off than it looks. Great comedy requires precise timing, sharp writing, and a deep understanding of human absurdity. From screwball classics to dry European humor, the films here range from quietly funny to genuinely side-splitting." },
	crime: { id: 80, description: "The city at night, money changing hands, and someone always about to make a mistake. Crime cinema explores the edges of society — heists, investigations, corruption, and the moral grey zones where most interesting stories live. One of the richest and most enduring genres in film history." },
	documentary: { id: 99, description: "The world as it actually is — or at least, one filmmaker's attempt to capture it. Documentaries can be journalism, poetry, portraiture, or polemic. The best ones change how you see something you thought you already understood." },
	drama: { id: 18, description: "The broadest and most essential category in cinema. Drama is simply films about people — their relationships, their failures, their quiet moments of grace. If a film makes you feel something real, it's probably here. The genre that contains everything else." },
	family: { id: 10751, description: "Films that work for everyone in the room, without condescending to any of them. The best family films hold multiple layers — something for the children on the surface, something for the adults underneath. Pixar understood this. So did Hayao Miyazaki." },
	fantasy: { id: 14, description: "Cinema's capacity for world-building at its most expansive. Fantasy films construct entirely new rules for reality — magic systems, mythologies, creatures, and cosmologies. When it works, you don't question any of it. You simply believe." },
	history: { id: 36, description: "The past, made present again. Historical films reconstruct events, eras, and figures with varying degrees of fidelity — but the best ones capture something true about how people lived, what they believed, and what was at stake. A window into worlds we can never visit otherwise." },
	horror: { id: 27, description: "Fear as a craft. Horror films work on the body as much as the mind — the sudden jolt, the creeping dread, the thing glimpsed at the edge of the frame. The genre has produced some of cinema's most formally adventurous work, from German Expressionism to modern prestige horror." },
	music: { id: 10402, description: "Films where music isn't just a soundtrack but the subject. Concert films, biopics, musicals, and documentaries about artists and scenes. Some of the most electric moments in cinema history have happened when a camera was pointed at a stage." },
	mystery: { id: 9648, description: "A puzzle with human stakes. Mystery films withhold information deliberately, parceling out clues and misdirections until a final revelation reframes everything that came before. The pleasure is in the texture of not-knowing — the atmosphere of suspicion, the unreliable narrator, the room where something happened." },
	romance: { id: 10749, description: "Love as the subject, in all its stages and complications. Romance films can be euphoric or devastating, comic or tragic — sometimes all at once. The genre is more capacious than its reputation suggests, encompassing everything from classic Hollywood screwball to slow-burn European art cinema." },
	"science-fiction": { id: 878, description: "Ideas in motion. Science fiction uses imagined futures and alternative presents to ask questions about technology, society, consciousness, and what it means to be human. At its best it's the most intellectually ambitious genre in cinema — speculation with emotional weight." },
	"tv-movie": { id: 10770, description: "Films made for television, which over the decades have included some genuinely remarkable work. The format's constraints — budget, runtime, broadcast standards — often pushed filmmakers toward inventive solutions. Worth exploring beyond the obvious." },
	thriller: { id: 53, description: "Suspense as structure. Thrillers are built around the slow accumulation of tension and its eventual release — a mechanism that the best directors in history have used to extraordinary effect. Hitchcock essentially invented the modern grammar of cinema here. The genre rewards close attention." },
	war: { id: 10752, description: "Conflict on film, from the trenches to the home front. War cinema has produced both the most viscerally intense and the most quietly devastating films ever made. The best work in this genre doesn't glorify — it bears witness, to heroism and horror in equal measure." },
	western: { id: 37, description: "America's founding myth, examined and re-examined across a century of filmmaking. The western is deceptively simple on the surface — frontier, justice, landscape — but has always been a vehicle for deeper questions about civilization, violence, and moral order. The genre that Leone, Ford, and Peckinpah made their own." },
};

export async function getMoviesByGenre(genreId: number, page: number = 1) {

	const [movies] = await Promise.all([
		fetchtTMDB<MovieSearchResponse>(
			`/discover/movie?with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=200&language=en-US&page=${page}`,
			{ next: { revalidate: 3600 } }
		),
	]);

	const curated = await filterCurated(movies.results);

	curated.sort((a, b) => b.vote_average - a.vote_average);

	return {
		results: curated,
		total_pages: movies.total_pages,
		total_results: movies.total_results,
	};

};