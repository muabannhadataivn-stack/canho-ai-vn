import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Bảo vệ mọi route /admin/** trừ /admin/login. Dùng supabase.auth.getUser() (không phải
 * getSession()) vì getUser() xác thực lại token với Supabase Auth server — an toàn hơn để
 * quyết định redirect, thay vì chỉ đọc JWT chưa xác thực từ cookie.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local"
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
