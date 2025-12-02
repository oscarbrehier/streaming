import { requestOTPCodeHandler } from '@/actions/requestOTPCode';
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

async function check2FAStatus(access_token: string | undefined) {

	if (!access_token) return true;

	const res = await fetch(`${process.env.NEXT_PUBLIC_STREAMING_API_URL}/api/2fa/status`, {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	});

	if (!res.ok) return true;

	const data = await res.json();
	return data.required ?? true;

};

export async function updateSession(request: NextRequest) {

	const pathname = request.nextUrl.pathname;

	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{

			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {

					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value));

				},
			},

		}
	);

	const { data, error } = await supabase.auth.getClaims();
	const user = data?.claims;

	if (
		(!user || error) &&
		!pathname.startsWith('/login') &&
		!pathname.startsWith('/register')
	) {

		const url = request.nextUrl.clone();

		url.pathname = '/login';
		return NextResponse.redirect(url);

	};

	if (user) {

		const { data: { session } } = await supabase.auth.getSession();
		const access_token = session?.access_token;

		const is2FARequired = await check2FAStatus(access_token);

		if (is2FARequired && !pathname.startsWith("/2fa")) {

			await requestOTPCodeHandler(supabase);
			return NextResponse.redirect(new URL("/2fa", request.url));

		};


	};

	const isAdminRoute = pathname.startsWith("/dashboard");

	if (isAdminRoute && user) {

		const supabaseAdmin = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_SECRET!,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll()
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value }) =>
							supabaseResponse.cookies.set(name, value)
						);
					},
				},
			}
		);

		const { data: profile, error } = await supabaseAdmin
			.from("profiles")
			.select("role")
			.eq("id", user.sub)
			.single();

		if (error || !profile || profile.role !== "admin") {
			return NextResponse.redirect(new URL("/", request.url));
		};

	};

	return supabaseResponse;

};