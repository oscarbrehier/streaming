declare global {

	interface Genre {
		id: number;
		name: string;
	};

	interface ProductionCompany {
		id: number;
		logo_path: string | null;
		name: string;
		origin_country: string;
	};

	interface ProductionCountry {
		iso_3166_1: string;
		name: string;
	};

	interface SpokenLanguage {
		iso_639_1: string;
		name: string;
	};

	interface PaginatedResponse<T> {
		page: number;
		results: T[];
		total_results: number;
		total_pages: number;
	};

	interface MovieSummary {
		id: number;
		title: string;
		original_title: string;
		overview: string;
		poster_path: string | null;
		backdrop_path: string | null;
		release_date: string;
		genre_ids: number[];
		popularity: number;
		vote_average: number;
		vote_count: number;
		adult: boolean;
		video: boolean;
		original_language: string;
	};

	interface MovieDetails {
		adult: boolean;
		backdrop_path: string | null;
		belongs_to_collection: null | {
			id: number;
			name: string;
			poster_path: string;
			backdrop_path: string;
		};
		budget: number;
		genres: Genre[];
		homepage: string | null;
		id: number;
		imdb_id: string | null;
		original_language: string;
		original_title: string;
		overview: string | null;
		popularity: number;
		poster_path: string | null;
		production_companies: ProductionCompany[];
		production_countries: ProductionCountry[];
		release_date: string;
		revenue: number;
		runtime: number | null;
		spoken_languages: SpokenLanguage[];
		status: string;
		tagline: string | null;
		title: string;
		video: boolean;
		vote_average: number;
		vote_count: number;
	};

	interface VideoResult {
		id: string;
		iso_639_1: string;
		iso_3166_1: string;
		key: string;
		name: string;
		site: string;
		size: number;
		type: string;
		official: boolean;
		published_at: string;
	};

	interface VideosResponse {
		id: number;
		results: VideoResult[];
	};

	interface CastMember {
		cast_id?: number;
		character: string;
		credit_id: string;
		gender: number | null;
		id: number;
		name: string;
		order: number;
		profile_path: string | null;
	};

	interface CrewMember {
		credit_id: string;
		department: string;
		gender: number | null;
		id: number;
		job: string;
		name: string;
		profile_path: string | null;
	};

	interface CreditsResponse {
		id: number;
		cast: CastMember[];
		crew: CrewMember[];
	};

	interface TvSummary {
		id: number;
		name: string;
		original_name: string;
		overview: string;
		poster_path: string | null;
		backdrop_path: string | null;
		first_air_date: string;
		genre_ids: number[];
		vote_average: number;
		vote_count: number;
		popularity: number;
		original_language: string;
	};

	interface Season {
		air_date: string | null;
		episode_count: number;
		id: number;
		name: string;
		overview: string;
		poster_path: string | null;
		season_number: number;
	};

	interface TvDetails {
		id: number;
		name: string;
		original_name: string;
		overview: string;
		poster_path: string | null;
		backdrop_path: string | null;
		first_air_date: string;
		last_air_date: string;
		number_of_seasons: number;
		number_of_episodes: number;
		seasons: Season[];
		genres: Genre[];
		vote_average: number;
		vote_count: number;
		popularity: number;
		original_language: string;
		origin_country: string[];
	};

	interface PersonSummary {
		id: number;
		name: string;
		profile_path: string | null;
		adult: boolean;
		known_for: Array<MovieSummary | TvSummary>;
		popularity: number;
	};

	interface PersonDetails {
		id: number;
		name: string;
		biography: string;
		birthday: string | null;
		deathday: string | null;
		gender: number;
		place_of_birth: string | null;
		profile_path: string | null;
		also_known_as: string[];
		popularity: number;
	};

	interface Images {
		backdrops: Record<string, any>[];
		logos: Record<string, any>[];
		posters: Record<string, any>[];
	}

	interface MovieDetailsWithImages extends MovieDetails {
		images: Images
	};

	type MovieSearchResponse = PaginatedResponse<MovieSummary>;

	interface InviteCode {
		id: string;
		code_hash: string;
		code_hint: string;
		role: string;
		max_uses: number;
		uses: number;
		created_by: string;
		created_at: Date;
		expires_at: Date;
		metadata: Record<string, any>;
	};

	interface AuditLogs {
		id: string;
		user_id: string;
		action: string;
		resource: string;
		details?: Record<string, any>;
		created_at: Date;
	};

	interface UserProfile {
		id: string;
		email: string;
		display_name: string;
		role: string;
		additional?: Record<string, any>;
		created_at: Date;
	};

};

export { };