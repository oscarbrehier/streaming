import { fetchTMDB } from "./fetchTMDB";

export async function getMovie<T = MovieDetailsWithImages>(
    movieId: string,
    options?: { credits?: boolean }
): Promise<T> {

    const append = ["images", options?.credits && "credits"]
        .filter(Boolean)
        .join(",");

    const data = await fetchTMDB(
        `/movie/${movieId}?language=en-US&append_to_response=${append}&include_image_language=en,null`,
        { next: { revalidate: 43200 } }
    );

    return { ...data, mediaType: "movie" } as T;

};

export async function getMovieVideos(movieId: string): Promise<VideoResult[]> {
    const data = await fetchTMDB<VideosResponse>(`/movie/${movieId}/videos?language=en-US`, { next: { revalidate: 43200 } });
    return data.results.filter(v => v.site == "YouTube");
};

export async function getMovieCredits(movieId: string): Promise<CreditsResponse | null> {

    try {

        const data = await fetchTMDB<CreditsResponse>(`/movie/${movieId}/credits?language=en-US`, { next: { revalidate: 86400 } });
        if (data.cast.length === 0) return null;

        return data;

    } catch (err) {
        return null;
    };

};

const PRIORITY_JOBS = [
    "Director",
    "Screenplay",
    "Producer",
    "Director of Photography",
    "Original Music Composer",
];

export function getTopCredits(credits: CreditsResponse | undefined, limit = 10): CreditEntry[] {

    const castEntries: CreditEntry[] = (credits?.cast ?? [])
        .slice(0, limit)
        .map(c => ({
            id: c.id,
            name: c.name,
            profile_path: c.profile_path,
            role: c.character,
            department: "Cast",
        }));

    const crewEntries: CreditEntry[] = PRIORITY_JOBS
        .flatMap(job =>
            (credits?.crew ?? [])
                .filter(c => c.job === job)
                .slice(0, 1)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    profile_path: c.profile_path,
                    role: c.job,
                    department: c.department,
                }))
        );

    const allIds = new Set([
        ...castEntries.map(c => c.id),
        ...crewEntries.map(c => c.id),
    ]);

    const fallbackCrew: CreditEntry[] = (credits?.crew ?? [])
        .filter(c => !PRIORITY_JOBS.includes(c.job) && !allIds.has(c.id))
        .map(c => ({
            id: c.id,
            name: c.name,
            profile_path: c.profile_path,
            role: c.job,
            department: c.department,
        }));

    const merged = mergeCredits([...crewEntries, ...castEntries, ...fallbackCrew]);

    if (merged.length < limit) {

        const usedIds = new Set(merged.map(p => p.id));
        const moreCast = (credits?.cast ?? [])
            .filter(c => !usedIds.has(c.id))
            .slice(0, limit - merged.length)
            .map(c => ({
                id: c.id,
                name: c.name,
                profile_path: c.profile_path,
                role: c.character,
                department: "Cast",
            }));

        return [...merged, ...moreCast].slice(0, limit);

    };

    return merged.slice(0, limit);

};

export function mergeCredits(entries: CreditEntry[], limit = 10): CreditEntry[] {

    const merged = new Map<number, CreditEntry>();

    for (const person of entries) {

        if (merged.has(person.id)) {

            const existing = merged.get(person.id)!;
            existing.role = `${existing.role} / ${person.role}`;

        } else {
            merged.set(person.id, { ...person });
        };

    };

    return Array.from(merged.values()).slice(0, limit);

};

export function getAllCredits(credits: CreditsResponse | undefined): CreditEntry[] {

    const cast: CreditEntry[] = (credits?.cast ?? []).map(c => ({
        id: c.id,
        name: c.name,
        profile_path: c.profile_path,
        role: c.character,
        department: "Cast",
    }));

    const crew: CreditEntry[] = (credits?.crew ?? []).map(c => ({
        id: c.id,
        name: c.name,
        profile_path: c.profile_path,
        role: c.job,
        department: c.department,
    }));

    return mergeCredits([...crew, ...cast], Infinity);

};