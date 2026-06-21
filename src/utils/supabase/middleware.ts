import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

async function check2FAStatus(access_token: string | undefined, request: NextRequest) {

	if (!access_token) return true;

	if (request.cookies.get("2fa_verified")?.value === "true") {
		return false;
	};

	try {

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/status`, {
			headers: {
				"Authorization": `Bearer ${access_token}`,
			},
			signal: AbortSignal.timeout(2000),
		});

		if (!res.ok) return true;

		const data = await res.json();
		return data.required ?? true;

	} catch (err) {
		return true;
	};

};

export async function updateSession(request: NextRequest) {

	let pathname = request.nextUrl.pathname;

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
					cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set({ name, value, ...options, path: "/" }));

				},
			},

		}
	);

	const { data, error } = await supabase.auth.getClaims();
	const user = data?.claims;

	const isPublic = pathname.startsWith('/login') || pathname.startsWith('/register')

	if ((!user || error) && !isPublic) {
		return NextResponse.redirect(new URL("/login", request.url));
	};

	if (user && !isPublic && !pathname.startsWith("/2fa")) {

		const { data: { session } } = await supabase.auth.getSession();
		const access_token = session?.access_token;

		const is2FARequired = await check2FAStatus(access_token, request);

		if (is2FARequired) {
			return NextResponse.redirect(new URL("/2fa", request.url));
		} else {

			supabaseResponse.cookies.set("2fa_verified", "true", {
				maxAge: 3600,
				path: "/",
				httpOnly: true,
				sameSite: "lax"
			});

		};


	};

	if (user && !isPublic && !pathname.startsWith("/2fa")) {
		
		const profileId = request.cookies.get("active_profile")?.value;
		const isOnProfilePage = pathname.startsWith("/profiles");

		if (!profileId && !isOnProfilePage) {
			return NextResponse.redirect(new URL("/profiles", request.url));
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