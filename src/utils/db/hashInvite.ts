import { createHash } from "crypto";

export function hashInvite(code: string): string {

	return createHash("sha256")
		.update(code)
		.digest("hex");

};