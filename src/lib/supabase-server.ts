import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase dùng service_role key — bỏ qua Row Level Security.
 * CHỈ import trong route handlers / server components / server actions.
 * Import "server-only" khiến build lỗi ngay nếu file này lọt vào bundle client.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
  );
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// LƯU Ý: KHÔNG ép cache: "no-store" ở đây — client này dùng chung cho cả data-source.ts
// (các trang public SSG như /[tinh]/[slug], /muc-gia/[tier]... cần fetch cache
// được ở build time) lẫn trang admin (cần dữ liệu luôn tươi). Ép no-store toàn cục làm
// vỡ prerender tĩnh của các route SSG. Trang admin cần fetch tươi tự khai báo
// `export const dynamic = "force-dynamic"` ở chính page.tsx đó thay vì sửa client dùng chung.
