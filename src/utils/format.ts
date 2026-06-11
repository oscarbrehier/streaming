export function getCountryName(code: string): string {
	try {
		return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
	} catch {
		return code;
	};
};