"use client";

import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Trang login chưa có phiên đăng nhập — không hiện nút Đăng xuất.
  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5">
      <span className="font-display text-[15px] font-bold text-ink">canho.ai.vn — Quản trị</span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite transition-colors hover:bg-paper-dim"
      >
        Đăng xuất
      </button>
    </header>
  );
}
