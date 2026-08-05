import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client dùng anon key + cookie phiên đăng nhập — dùng trong Server Component /
 * Route Handler để đọc user hiện tại (vd hiển thị email ở dashboard admin).
 * Khác src/lib/supabase-server.ts (service_role, bỏ qua RLS, không gắn phiên đăng nhập cụ thể).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local"
    );
  }

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component không được phép set cookie — bỏ qua, middleware đã lo refresh session.
        }
      },
    },
  });
}
