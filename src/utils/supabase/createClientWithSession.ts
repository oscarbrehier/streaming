import { createClient, Session, User } from "@supabase/supabase-js";

export function createClientWithSession(session: Session) {

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_SECRET!;

	return createClient(supabaseUrl, supabaseKey, {
		global: {
			headers: {
				Authorization: `Bearer ${session.access_token}`
			}
		}
	});

};