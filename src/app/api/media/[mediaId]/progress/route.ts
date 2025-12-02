import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, 
	{ params }: { params: Promise<{ mediaId: string }> }
) {

	const { mediaId } = await params;

	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/media/${mediaId}/progress`,
		{ headers: { Authorization: `Bearer ${session.access_token}` } }
	);


	return new Response(response.body, {
		headers: { 'Content-Type': 'text/event-stream' }
	});

};