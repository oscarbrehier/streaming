declare global {

	interface APIResponse {
		result?: any;
		error?: string;
	};

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
		known_for_department: string;
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

	interface CreditEntry {
		id: number;
		name: string;
		profile_path: string | null;
		role: string;
		department: string;
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

	interface Creator {
		id: number;
		name: string;
		profile_path: string | null;
	};

	interface Network {
		id: number;
		name: string;
		logo_path: string | null;
		origin_country: string;
	};

	interface EpisodeCrew {
		department: string;
		job: string;
		credit_id: string;
		adult: boolean;
		gender: number;
		id: number;
		known_for_department: string;
		name: string;
		original_name: string;
		popularity: number;
		profile_path: string | null;
	};

	interface EpisodeGuestStar {
		character: string;
		credit_id: string;
		order: number;
		adult: boolean;
		gender: number;
		id: number;
		known_for_department: string;
		name: string;
		original_name: string;
		popularity: number;
		profile_path: string | null;
	};

	interface Episode {
		air_date: string;
		episode_number: number;
		episode_type: "standard" | "finale" | "mid_season" | "premiere";
		id: number;
		name: string;
		overview: string;
		production_code: string;
		runtime: number;
		season_number: number;
		show_id: number;
		still_path: string | null;
		vote_average: number;
		vote_count: number;
		crew: EpisodeCrew[];
		guest_stars: EpisodeGuestStar[];
	};

	interface SeasonNetwork {
		id: number;
		logo_path: string | null;
		name: string;
		origin_country: string;
	};

	interface TvSeason {
		_id: string;
		id: number;
		name: string;
		overview: string;
		poster_path: string | null;
		season_number: number;
		vote_average: number;
		air_date: string;
		episodes: Episode[];
		networks: SeasonNetwork[];
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
		known_for_department: string;
		also_known_as: string[];
		popularity: number;
	};

	interface PersonCastCredit extends MovieSummary, Partial<TvSummary> {
		media_type: "movie" | "tv";
		character: string;
		credit_id: string;
		order: number;
	};

	interface PersonCrewCredit extends MovieSummary, Partial<TvSummary> {
		media_type: "movie" | "tv";
		job: string;
		department: string;
		credit_id: string;
	};

	interface CombinedCredits {
		cast: PersonCastCredit[];
		crew: PersonCrewCredit[];
	};

	interface PersonDetailsWithCredits extends PersonDetails {
		combined_credits: CombinedCredits;
	};

	interface Images {
		backdrops: Record<string, any>[];
		logos: Record<string, any>[];
		posters: Record<string, any>[];
	}

	interface MediaBase {
		id: number;
		backdrop_path: string | null;
		poster_path: string | null;
		overview: string;
		vote_average: number;
		vote_count: number;
		popularity: number;
		original_language: string;
		genres: Genre[];
		production_companies: ProductionCompany[];
		production_countries: ProductionCountry[];
		origin_country: string[];
		mediaType?: "movie" | "tv";
		title?: string;
		name?: string;
		release_date?: string;
		first_air_date?: string;
		credits?: CreditsResponse;
	};

	type SearchResult = MediaBase & Partial<MovieDetails> & Partial<TvDetails> & {
		images?: Images;
	};

	interface MovieDetails extends MediaBase {
		adult: boolean;
		belongs_to_collection: null | {
			id: number;
			name: string;
			poster_path: string;
			backdrop_path: string;
		};
		budget: number;
		homepage: string | null;
		imdb_id: string | null;
		original_title: string;
		revenue: number;
		runtime: number | null;
		spoken_languages: SpokenLanguage[];
		status: string;
		tagline: string | null;
		title: string;
		video: boolean;
	}

	interface TvDetails extends MediaBase {
		name: string;
		original_name: string;
		last_air_date: string;
		number_of_seasons: number;
		number_of_episodes: number;
		seasons: Season[];
		created_by: Creator[];
		networks: Network[];
		in_production: boolean;
		origin_country: string[];
	}

	interface MovieDetailsWithImages extends MovieDetails {
		images: Images
	};

	interface TvDetailsWithImages extends TvDetails {
		images: Images
	};

	type MovieSearchResponse = PaginatedResponse<MovieSummary>;
	type TvSearchResponse = PaginatedResponse<TvSummary>;
	type PersonSearchResponse = PaginatedResponse<PersonDetails>;

	type UserRole = "member" | "admin";

	interface InviteCode {
		id: string;
		code_hash: string;
		code_hint: string;
		role: UserRole;
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

	interface UserMediaStatus {
		id: string;
		user_id: string;
		media_id: string;
		progress_sec: number;
		duration_sec: number;
		completed: boolean;
		favorited: boolean;
		rating?: number;
		last_watched: Date;
		metadata?: Record<string, any>;
	};

	interface SysInfo {
		cpu: {
			total: number;
			perCore: number[];
		},
		mem: {
			usedPercent: number;
			total: number;
			used: number;
		},
		network: {
			tx: number;
			rx: number;
			speed: number;
		},
		timestamp: number;
	};

	interface SysMetric {
		metric: number | number[];
		timestamp: number;
	};

	interface SysChartDefiniton {
		title: string;
		description: string;
		chartData: SysMetric[];
		max?: number;
		labels?: string[];
	};

	interface AtlasQueueItem {
		id: string;
		media_id: string;
		status: "pending" | "processing" | "completed";
		user_id: string;
		created_at: Date;
		updated_at: Date;
	};

	type Watchlist = {
		id: string;
		user_id: string;
		media_id: string;
		media_type: MediaType;
		created_at: Date;
	};

	type FeatureType = "hero" | "banner" | "spotlight" | "trending";

	type FeaturedContent = {
		id: string;
		movie_id: string;
		headline?: string;
		subheadling?: string;
		feature_type: FeatureType;
		is_active: boolean;
		active_from?: Date;
		active_to?: Date;
		priority: number;
		created_at: Date;
		updated_at: Date;
	};

	type MediaSourceFile = { id: string, file: string, type: string, lang: string };
	type SubtitleSource = { id: string, url: string, lang: string, type: string };

	type MediaSources = {
		files: MediaSourceFile[];
		subtitles: SubtitleSource[];
	};

	type MediaType = "movie" | "tv";

	interface ViewingProfile {
		id: string;
		user_id: string;
		name: string;
		avatar_url: string;
		is_default: boolean;
		pin_hash: string;
		created_at: Date;
		updated_at: Date;
	};

};

export { };