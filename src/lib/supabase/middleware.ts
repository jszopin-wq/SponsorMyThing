import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
 let supabaseResponse = NextResponse.next({ request });

 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll() {
 return request.cookies.getAll();
 },
 setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
 cookiesToSet.forEach(({ name, value }) =>
 request.cookies.set(name, value)
 );
 supabaseResponse = NextResponse.next({ request });
 cookiesToSet.forEach(({ name, value, options }) =>
 supabaseResponse.cookies.set(name, value, options as CookieOptions)
 );
 },
 },
 }
 );

 // Refresh the session
 const {
 data: { user },
 } = await supabase.auth.getUser();

 // Protect dashboard routes
 if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
 const url = request.nextUrl.clone();
 url.pathname = "/login";
 const redirectResponse = NextResponse.redirect(url);
 // Transfer Supabase session cookies to the redirect response
 supabaseResponse.cookies.getAll().forEach((cookie) => {
 redirectResponse.cookies.set(cookie.name, cookie.value);
 });
 return redirectResponse;
 }

 // Redirect authenticated users away from auth pages
 if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
 const url = request.nextUrl.clone();
 url.pathname = "/dashboard";
 const redirectResponse = NextResponse.redirect(url);
 supabaseResponse.cookies.getAll().forEach((cookie) => {
 redirectResponse.cookies.set(cookie.name, cookie.value);
 });
 return redirectResponse;
 }

 return supabaseResponse;
}
