"use server"

import { useRateLimit } from "@/lib/rateLimit"

export const testRateLimit = await useRateLimit(async () => {

	return { success: true };

});