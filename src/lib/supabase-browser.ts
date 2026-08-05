import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client dùng anon key — CHỈ dùng trong client component (form đăng nhập admin...).
 * Không có quyền vượt RLS (khác src/lib/supabase-server.ts dùng service_role, chỉ chạy server-side).
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local"
    );
  }

  return createBrowserClient(supabaseUrl, anonKey);
}
