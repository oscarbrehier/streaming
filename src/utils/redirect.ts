export function getRedirectURL(path: string): string {

	const basePath = process.env.NODE_ENV === "production"
		? "/streaming"
		: "";

	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	return `${basePath}${cleanPath}`;

};