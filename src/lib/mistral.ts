import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function callMistralWithRetry(prompt: string, retries = 3): Promise<string> {

	for (let i = 0; i < retries; i++) {

		try {

			const res = await mistral.chat.complete({
				model: "mistral-small-latest",
				maxTokens: 100,
				messages: [{ role: "user", content: prompt }]
			});

			return (res.choices?.[0]?.message?.content as string ?? "").trim();

		} catch (err: any) {

			if (err?.statusCode === 503 && i < retries - 1) {
				await new Promise(r => setTimeout(r, 1000 * (i + 1)));
			} else {
				return "";
			};

		};

	};

	return "";

};