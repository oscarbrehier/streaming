import { getPerson } from "./api";
import { fetchTMDB, fetchUntilEnough } from "./fetchTMDB";

const COUNTRY_DECADES = [
	{ country: "FR", decade: 1960, label: "France, 1960s" },
	{ country: "IT", decade: 1950, label: "Italy, 1950s" },
	{ country: "KR", decade: 2000, label: "Korea, 2000s" },
	{ country: "SE", decade: 1960, label: "Sweden, 1960s" },
	{ country: "JP", decade: 1960, label: "Japan, 1960s" },
	{ country: "IR", decade: 1990, label: "Iran, 1990s" },
	{ country: "US", decade: 1970, label: "America, 1970s" },
	{ country: "PL", decade: 1960, label: "Poland, 1960s" },
	{ country: "DK", decade: 1990, label: "Denmark, 1990s" },
	{ country: "BR", decade: 1960, label: "Brazil, 1960s" },
];

const ESSENTIAL_DIRECTORS = [
	"Ingmar Bergman",
	"Andrei Tarkovsky",
	"Jean-Luc Godard",
	"Stanley Kubrick",
	"Agnès Varda",
	"Wong Kar-wai",
	"Akira Kurosawa",
	"Federico Fellini",
	"Yasujirō Ozu",
	"Chantal Akerman",
	"Rainer Werner Fassbinder",
	"Robert Bresson",
	"Michelangelo Antonioni",
	"François Truffaut",
	"Béla Tarr",
	"Abbas Kiarostami",
	"Carl Theodor Dreyer",
	"Luis Buñuel",
	"John Cassavetes",
	"Pier Paolo Pasolini",
];

function getWeekIndex() {
	return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
}

function getDayIndex() {
	return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

export function getCurrentCountryDecade() {
	return COUNTRY_DECADES[getWeekIndex() % COUNTRY_DECADES.length];
}

export function getCurrentDirector() {
	return ESSENTIAL_DIRECTORS[getWeekIndex() % ESSENTIAL_DIRECTORS.length];
};

export async function getDirectorsEssential(directorName: string): Promise<{
	director: string;
	items: MovieDetailsWithImages[];
} | null> {

	const person = await getPerson(directorName);
	if (person.length == 0) return null;

	const director = person[0];

	const data = await fetchUntilEnough<MovieDetailsWithImages>(
		page => `/discover/movie?with_crew=${director.id}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`,
		"movie",
		8,
		3
	);

	return {
		director: director.name,
		items: data
	};

};

export async function getClassics(): Promise<MovieDetails[]> {

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7.5&vote_count.gte=500&primary_release_date.lte=1970-12-31&page=${page}`,
		"movie",
		8,
		3
	);

};

export async function getFromCountry(country: string, decade: number): Promise<MovieDetails[]> {

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${decade}-12-31&primary_release_date.lte=${decade + 9}-12-31&with_origin_country=${country}&page=${page}`,
		"movie",
		8,
		14
	);

};

export async function getHiddenGems(): Promise<MovieDetails[]> {

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7.2&vote_count.gte=200&vote_count.lte=20000&page=${page}`,
		"movie",
		8,
		3
	);

};

export async function getRecentAcclaimed(): Promise<MovieDetails[]> {

	const currentYear = new Date().getFullYear();

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7.0&vote_count.gte=500&primary_release_date.gte=${currentYear - 3}-01-01&page=${page}`,
		"movie",
		8,
		3
	);

};

export async function getWorldCinema(): Promise<MovieDetails[]> {

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7.0&vote_count.gte=300&without_original_language=en&page=${page}`,
		"movie",
		8,
		3
	);

};

export async function getDocumentaries(): Promise<MovieDetails[]> {

	return fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7.0&vote_count.gte=200&with_genres=99&page=${page}`,
		"movie",
		8,
		3
	);

};

export async function getFeaturedFilm(): Promise<MovieDetails | null> {

	const dayOffset = getDayIndex() % 30;

	const data = await fetchUntilEnough<MovieDetails>(
		page => `/discover/movie?sort_by=vote_average.desc&vote_average.gte=7&vote_count.gte=1000&vote_count.lte=50000&without_genres=28,35,10751,16,27,53,10749&without_original_language=en&page=${page + dayOffset}`,
		"movie",
		1,
		3
	);

	return data[0] ?? null;

};

const COLLECTIONS: Record<string, {
	label: string;
	buildUrl: (page: number) => string;
	mediaType: "movie" | "tv";
}> = {


};

export async function getCollection(key: string): Promise<{
	label: string;
	items: MovieDetails[];
} | null> {

	const collection = COLLECTIONS[key];
	if (!collection) return null;

	const items = await fetchUntilEnough<MovieDetails>(
		collection.buildUrl,
		collection.mediaType,
		8,
		3
	);

	return {
		label: collection.label,
		items,
	};

};